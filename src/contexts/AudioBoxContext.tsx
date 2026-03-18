import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

interface AudioTrack {
  id: string;
  title: string;
  audioUrl: string;
  style: string;
  emotion: string;
  date: string;
  createdAt: any;
  userId?: string;
}

interface AudioBoxContextType {
  tracks: AudioTrack[];
  saveTrack: (title: string, audioUrl: string, style: string, emotion: string) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AudioBoxContext = createContext<AudioBoxContextType | undefined>(undefined);

export const AudioBoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('audio_box_tracks');
      if (saved) {
        setTracks(JSON.parse(saved));
      } else {
        setTracks([]);
      }
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'audio_box'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tracksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AudioTrack[];
      setTracks(tracksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching audio tracks:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const saveTrack = async (title: string, audioUrl: string, style: string, emotion: string) => {
    let finalAudioUrl = audioUrl;

    // If it's a blob URL, we should try to convert it to base64 for persistence
    // since blob URLs are only valid for the current session.
    if (audioUrl.startsWith('blob:')) {
      try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        finalAudioUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error converting blob to base64:", error);
        // Fallback to original URL if conversion fails
      }
    }

    const newTrack = {
      title,
      audioUrl: finalAudioUrl,
      style,
      emotion,
      date: new Date().toLocaleDateString(),
      createdAt: Timestamp.now()
    };

    if (user) {
      try {
        await addDoc(collection(db, 'audio_box'), {
          ...newTrack,
          userId: user.id
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'audio_box'));
      } catch (error) {
        console.error("Error saving track to Firestore:", error);
        throw error;
      }
    } else {
      const saved = localStorage.getItem('audio_box_tracks');
      const currentTracks = saved ? JSON.parse(saved) : [];
      // For localStorage, convert Timestamp to ISO string
      const trackWithId = { 
        ...newTrack, 
        id: Date.now().toString(), 
        createdAt: new Date().toISOString() 
      };
      const updatedTracks = [trackWithId, ...currentTracks];
      localStorage.setItem('audio_box_tracks', JSON.stringify(updatedTracks));
      setTracks(updatedTracks);
    }
  };

  const deleteTrack = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'audio_box', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `audio_box/${id}`));
      } catch (error) {
        console.error("Error deleting track from Firestore:", error);
        throw error;
      }
    } else {
      const saved = localStorage.getItem('audio_box_tracks');
      if (saved) {
        const currentTracks = JSON.parse(saved);
        const updatedTracks = currentTracks.filter((t: AudioTrack) => t.id !== id);
        localStorage.setItem('audio_box_tracks', JSON.stringify(updatedTracks));
        setTracks(updatedTracks);
      }
    }
  };

  return (
    <AudioBoxContext.Provider value={{ tracks, saveTrack, deleteTrack, isLoading }}>
      {children}
    </AudioBoxContext.Provider>
  );
};

export const useAudioBox = () => {
  const context = useContext(AudioBoxContext);
  if (context === undefined) {
    throw new Error('useAudioBox must be used within a AudioBoxProvider');
  }
  return context;
};
