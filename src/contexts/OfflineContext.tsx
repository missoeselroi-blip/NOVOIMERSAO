import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineService, OfflineBibleChapter, OfflineStudyMaterial } from '../services/offlineService';

interface OfflineContextType {
  isOffline: boolean;
  downloadedChapters: OfflineBibleChapter[];
  downloadedMaterials: OfflineStudyMaterial[];
  downloadChapter: (chapter: OfflineBibleChapter) => Promise<void>;
  downloadMaterial: (material: OfflineStudyMaterial) => Promise<void>;
  removeChapter: (id: string) => Promise<void>;
  removeMaterial: (id: string) => Promise<void>;
  refreshOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [downloadedChapters, setDownloadedChapters] = useState<OfflineBibleChapter[]>([]);
  const [downloadedMaterials, setDownloadedMaterials] = useState<OfflineStudyMaterial[]>([]);

  const refreshOfflineData = useCallback(async () => {
    const chapters = await offlineService.getAllChapters();
    const materials = await offlineService.getAllStudyMaterials();
    setDownloadedChapters(chapters);
    setDownloadedMaterials(materials);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshOfflineData]);

  const downloadChapter = async (chapter: OfflineBibleChapter) => {
    await offlineService.saveChapter(chapter);
    await refreshOfflineData();
  };

  const downloadMaterial = async (material: OfflineStudyMaterial) => {
    await offlineService.saveStudyMaterial(material);
    await refreshOfflineData();
  };

  const removeChapter = async (id: string) => {
    await offlineService.deleteChapter(id);
    await refreshOfflineData();
  };

  const removeMaterial = async (id: string) => {
    await offlineService.deleteStudyMaterial(id);
    await refreshOfflineData();
  };

  return (
    <OfflineContext.Provider value={{
      isOffline,
      downloadedChapters,
      downloadedMaterials,
      downloadChapter,
      downloadMaterial,
      removeChapter,
      removeMaterial,
      refreshOfflineData
    }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
