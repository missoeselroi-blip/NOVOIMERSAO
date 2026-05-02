import React, { createContext, useContext, useState } from 'react';
import { SaveToNotebookModal } from '../components/SaveToNotebookModal';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { compressImage } from '../utils/imageUtils';

interface NotebookContextType {
  saveToNotebook: (title: string, content: string) => void;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contentToSave, setContentToSave] = useState<{ title: string; content: string } | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const saveToNotebook = async (title: string, content: string) => {
    let finalContent = content;
    
    // Auto-compress images if they are in base64
    if (content.startsWith('data:image')) {
      showToast("Otimizando imagem para o caderno... ⏳", 'info');
      try {
        finalContent = await compressImage(content, 800, 800, 0.6);
      } catch (e) {
        console.error("Error compressing image:", e);
      }
    }

    setContentToSave({ title, content: finalContent });
    setIsOpen(true);
  };

  const handleConfirm = async (category: string) => {
    if (!contentToSave) return;
    
    setIsLoading(true);
    try {
      if (user) {
        // Authenticated user: Firestore with overwrite logic
        const q = query(
          collection(db, 'notes'),
          where('userId', '==', user.id),
          where('title', '==', contentToSave.title),
          where('category', '==', category)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Overwrite
          const docRef = doc(db, 'notes', querySnapshot.docs[0].id);
          await updateDoc(docRef, {
            content: contentToSave.content,
            updatedAt: new Date().toISOString()
          });
          showToast(`Anotação atualizada em ${category}! 🗒️✨`, 'success');
        } else {
          // Create new
          await addDoc(collection(db, 'notes'), {
            userId: user.id,
            title: contentToSave.title,
            content: contentToSave.content,
            category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          showToast(`Salvo com sucesso em ${category}! 🗒️✨`, 'success');
        }
      } else {
        // Guest user: LocalStorage with overwrite logic
        const saved = localStorage.getItem('preacher_notes');
        let entries = saved ? JSON.parse(saved) : [];
        
        const existingIndex = entries.findIndex((e: any) => e.title === contentToSave.title && e.category === category);
        
        if (existingIndex !== -1) {
          // Overwrite
          entries[existingIndex] = {
            ...entries[existingIndex],
            content: contentToSave.content,
            updatedAt: new Date().toISOString()
          };
          showToast(`Anotação atualizada em ${category} (Offline)! 🗒️✨`, 'success');
        } else {
          // Create new
          const newEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: contentToSave.title,
            content: contentToSave.content,
            category,
            date: new Date().toLocaleDateString('pt-BR'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          entries = [newEntry, ...entries];
          showToast(`Salvo em ${category} (Offline)! 🗒️✨`, 'success');
        }
        localStorage.setItem('preacher_notes', JSON.stringify(entries));
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving note:", error);
      showToast("Erro ao salvar no caderno.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotebookContext.Provider value={{ saveToNotebook }}>
      {children}
      <SaveToNotebookModal
        isOpen={isOpen}
        isLoading={isLoading}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm as any}
      />
    </NotebookContext.Provider>
  );
}

export function useNotebook() {
  const context = useContext(NotebookContext);
  if (context === undefined) {
    throw new Error('useNotebook must be used within a NotebookProvider');
  }
  return context;
}
