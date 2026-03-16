import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';

interface MusicTrack {
  id: string;
  title: string;
  audioUrl: string;
  style: string;
  emotion: string;
  date: string;
  createdAt: any;
  userId: string;
}

interface MusicBoxContextType {
  tracks: MusicTrack[];
  saveTrack: (title: string, audioUrl: string, style: string, emotion: string) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  isLoading: boolean;
}

const MusicBoxContext = createContext<MusicBoxContextType | undefined>(undefined);

export const MusicBoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTracks([]);
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'music_box'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tracksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MusicTrack[];
      setTracks(tracksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching music tracks:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const saveTrack = async (title: string, audioUrl: string, style: string, emotion: string) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'music_box'), {
        title,
        audioUrl,
        style,
        emotion,
        userId: user.id,
        date: new Date().toLocaleDateString(),
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error saving track:", error);
      throw error;
    }
  };

  const deleteTrack = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'music_box', id));
    } catch (error) {
      console.error("Error deleting track:", error);
      throw error;
    }
  };

  return (
    <MusicBoxContext.Provider value={{ tracks, saveTrack, deleteTrack, isLoading }}>
      {children}
    </MusicBoxContext.Provider>
  );
};

export const useMusicBox = () => {
  const context = useContext(MusicBoxContext);
  if (context === undefined) {
    throw new Error('useMusicBox must be used within a MusicBoxProvider');
  }
  return context;
};
