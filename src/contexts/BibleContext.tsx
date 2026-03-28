import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export type AnnotationType = 'highlight' | 'underline' | 'circle' | 'none';

export interface BibleAnnotation {
  id: string;
  userId: string;
  verseId: string; // Format: version_bookId_chapter_verse
  type: AnnotationType;
  color: string;
  note?: string;
  isFavorite: boolean;
  updatedAt: string;
}

interface BibleContextType {
  annotations: Record<string, BibleAnnotation>;
  setAnnotation: (verseId: string, updates: Partial<BibleAnnotation>) => Promise<void>;
  removeAnnotation: (verseId: string) => Promise<void>;
  toggleFavorite: (verseId: string, verseText: string, reference: string) => Promise<void>;
  isLoading: boolean;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export const BibleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [annotations, setAnnotations] = useState<Record<string, BibleAnnotation>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setAnnotations({});
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, 'bibleAnnotations'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAnnotations: Record<string, BibleAnnotation> = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as BibleAnnotation;
        newAnnotations[data.verseId] = { ...data, id: doc.id };
      });
      setAnnotations(newAnnotations);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching bible annotations:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const setAnnotation = async (verseId: string, updates: Partial<BibleAnnotation>) => {
    if (!user || !db) return;

    const annotationId = `${user.id}_${verseId}`;
    const docRef = doc(db, 'bibleAnnotations', annotationId);
    
    const existing = annotations[verseId];
    const newAnnotation: BibleAnnotation = {
      id: annotationId,
      userId: user.id,
      verseId,
      type: updates.type || existing?.type || 'none',
      color: updates.color || existing?.color || '#fbbf24', // Default yellow
      note: updates.note !== undefined ? updates.note : (existing?.note || null),
      isFavorite: updates.isFavorite !== undefined ? updates.isFavorite : (existing?.isFavorite || false),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, newAnnotation, { merge: true });
    } catch (error) {
      console.error("Error setting bible annotation:", error);
    }
  };

  const removeAnnotation = async (verseId: string) => {
    if (!user || !db) return;
    const annotationId = `${user.id}_${verseId}`;
    try {
      await deleteDoc(doc(db, 'bibleAnnotations', annotationId));
    } catch (error) {
      console.error("Error removing bible annotation:", error);
    }
  };

  const toggleFavorite = async (verseId: string, verseText: string, reference: string) => {
    const existing = annotations[verseId];
    await setAnnotation(verseId, { isFavorite: !existing?.isFavorite });
  };

  return (
    <BibleContext.Provider value={{ annotations, setAnnotation, removeAnnotation, toggleFavorite, isLoading }}>
      {children}
    </BibleContext.Provider>
  );
};

export const useBible = () => {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error('useBible must be used within a BibleProvider');
  }
  return context;
};
