import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { storeAudio, getAudio, deleteAudio } from '../lib/indexedDB';
import { geminiService } from '../services/geminiService';

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
  subject?: string;
  text?: string;
  audioUrl: string;
  style: string;
  emotion: string;
  date: string;
  size?: string;
  duration?: string;
  createdAt: any;
  userId?: string;
}

interface AudioBoxContextType {
  tracks: AudioTrack[];
  generateAudio: (text: string, voice: string, emotion: string) => Promise<string>;
  saveTrack: (title: string, subject: string, audioUrl: string, style: string, emotion: string, text?: string, duration?: string) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AudioBoxContext = createContext<AudioBoxContextType | undefined>(undefined);

import { GoogleGenAI, Modality } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export const AudioBoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const generateAudio = async (text: string, voice: string, emotion: string) => {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API Key is required for audio generation.");
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    // Map user voice choices to prebuilt voices
    let voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore';
    
    if (voice.includes('criança')) voiceName = 'Puck';
    else if (voice.includes('adolescente rapaz')) voiceName = 'Puck';
    else if (voice.includes('adolescente moça')) voiceName = 'Kore';
    else if (voice.includes('jovem')) voiceName = 'Puck';
    else if (voice.includes('homem')) voiceName = 'Charon';
    else if (voice.includes('mulher')) voiceName = 'Kore';
    else if (voice.includes('idoso')) voiceName = 'Fenrir';
    else if (voice.includes('idosa')) voiceName = 'Zephyr';
    else if (voice.includes('ninar')) voiceName = 'Zephyr';
    else if (voice.includes('energético')) voiceName = 'Puck';

    const prompt = `Fale o seguinte texto com um tom ${emotion} e voz de ${voice}: ${text.slice(0, 5000)}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("Failed to generate audio data.");
      }

      return geminiService.pcmToWav(base64Audio, 24000);
    } catch (error) {
      console.error("Error generating audio:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!user) {
      const fetchOfflineTracks = async () => {
        const saved = localStorage.getItem('audio_box_tracks');
        if (saved) {
          const offlineTracks = JSON.parse(saved);
          const tracksWithData = await Promise.all(offlineTracks.map(async (track: any) => {
            if (track.audioUrl.startsWith('local:')) {
              const localId = track.audioUrl.split(':')[1];
              const localData = await getAudio(localId);
              return { ...track, audioUrl: localData || track.audioUrl };
            }
            return track;
          }));
          setTracks(tracksWithData);
        } else {
          setTracks([]);
        }
        setIsLoading(false);
      };
      fetchOfflineTracks();
      return;
    }

    const q = query(
      collection(db, 'audio_box'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('AudioBox: Received snapshot, docs:', snapshot.docs.length);
      const tracksData = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let audioUrl = data.audioUrl;

        // If it's a local reference, try to get it from IndexedDB
        if (audioUrl.startsWith('local:')) {
          const localId = audioUrl.split(':')[1];
          const localData = await getAudio(localId);
          if (localData) {
            audioUrl = localData;
          }
        }

        return {
          id: doc.id,
          ...data,
          audioUrl
        };
      })) as AudioTrack[];
      setTracks(tracksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching audio tracks:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const saveTrack = async (title: string, subject: string, audioUrl: string, style: string, emotion: string, text?: string, duration?: string) => {
    console.log('AudioBox: Saving track:', { title, subject, style, emotion, text });
    let finalAudioUrl = audioUrl;

    // Calculate size
    let sizeStr = "0 KB";
    if (audioUrl.startsWith('data:')) {
      const base64Length = audioUrl.split(',')[1].length;
      const sizeInBytes = base64Length * 0.75;
      sizeStr = sizeInBytes > 1024 * 1024 
        ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB` 
        : `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }

    // If it's a blob URL, we should try to convert it to base64 for persistence
    if (audioUrl.startsWith('blob:')) {
      try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        sizeStr = blob.size > 1024 * 1024 
          ? `${(blob.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${(blob.size / 1024).toFixed(1)} KB`;

        finalAudioUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error converting blob to base64:", error);
      }
    }

    const newTrack = {
      title,
      subject,
      text: text || "",
      audioUrl: finalAudioUrl,
      style,
      emotion,
      size: sizeStr,
      duration: duration || "0:00",
      date: new Date().toLocaleDateString(),
      createdAt: Timestamp.now()
    };

    if (user) {
      try {
        // Check size of finalAudioUrl (base64)
        // Firestore document limit is 1MB. Let's use 800KB as a safe limit.
        const sizeInBytes = finalAudioUrl.length * 0.75; // Approximate base64 to bytes
        const isTooLarge = sizeInBytes > 800 * 1024;

        let firestoreAudioUrl = finalAudioUrl;
        if (isTooLarge) {
          const localId = `audio_${Date.now()}`;
          await storeAudio(localId, finalAudioUrl);
          firestoreAudioUrl = `local:${localId}`;
        }

        await addDoc(collection(db, 'audio_box'), {
          ...newTrack,
          audioUrl: firestoreAudioUrl,
          userId: user.id
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'audio_box'));
      } catch (error) {
        console.error("Error saving track to Firestore:", error);
        throw error;
      }
    } else {
      try {
        const sizeInBytes = finalAudioUrl.length * 0.75;
        const isTooLarge = sizeInBytes > 800 * 1024;
        
        let offlineAudioUrl = finalAudioUrl;
        if (isTooLarge) {
          const localId = `audio_off_${Date.now()}`;
          await storeAudio(localId, finalAudioUrl);
          offlineAudioUrl = `local:${localId}`;
        }

        const saved = localStorage.getItem('audio_box_tracks');
        const currentTracks = saved ? JSON.parse(saved) : [];
        const trackWithId = { 
          ...newTrack, 
          audioUrl: offlineAudioUrl,
          id: Date.now().toString(), 
          createdAt: new Date().toISOString() 
        };
        const updatedTracks = [trackWithId, ...currentTracks];
        localStorage.setItem('audio_box_tracks', JSON.stringify(updatedTracks));
        
        // For the state, we want the full audio data
        setTracks([{ ...trackWithId, audioUrl: finalAudioUrl }, ...tracks]);
      } catch (error) {
        console.error("Error saving offline track:", error);
      }
    }
  };

  const deleteTrack = async (id: string) => {
    if (user) {
      try {
        const trackDoc = await getDoc(doc(db, 'audio_box', id));
        if (trackDoc.exists()) {
          const data = trackDoc.data();
          if (data.audioUrl.startsWith('local:')) {
            const localId = data.audioUrl.split(':')[1];
            await deleteAudio(localId);
          }
        }
        await deleteDoc(doc(db, 'audio_box', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `audio_box/${id}`));
      } catch (error) {
        console.error("Error deleting track from Firestore:", error);
        throw error;
      }
    } else {
      const saved = localStorage.getItem('audio_box_tracks');
      if (saved) {
        const currentTracks = JSON.parse(saved);
        const trackToDelete = currentTracks.find((t: AudioTrack) => t.id === id);
        if (trackToDelete && trackToDelete.audioUrl.startsWith('local:')) {
          const localId = trackToDelete.audioUrl.split(':')[1];
          await deleteAudio(localId);
        }
        const updatedTracks = currentTracks.filter((t: AudioTrack) => t.id !== id);
        localStorage.setItem('audio_box_tracks', JSON.stringify(updatedTracks));
        setTracks(tracks.filter(t => t.id !== id));
      }
    }
  };

  return (
    <AudioBoxContext.Provider value={{ tracks, generateAudio, saveTrack, deleteTrack, isLoading }}>
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
