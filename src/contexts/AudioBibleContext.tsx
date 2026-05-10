import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { useToast } from '../components/Toast';

export interface AudioBibleBook {
  pk: number;
  name: string;
  chapters: number;
  testament: 'VT' | 'NT';
}

const BOOK_SLUGS: { [key: number]: string } = {
  1: "Genesis",
  2: "Exodo",
  3: "Levitico",
  4: "Numeros",
  5: "Deuteronomio",
  6: "Josue",
  7: "Juizes",
  8: "Ruth", // Updated from Rute to Ruth
  9: "1Samuel",
  10: "2Samuel",
  11: "1Reis",
  12: "2Reis",
  13: "1Cronicas",
  14: "2Cronicas",
  15: "Esdras",
  16: "Neemias",
  17: "Ester",
  18: "Jó", // Updated from Jo to Job
  19: "Salmos",
  20: "Proverbios",
  21: "Eclesiastes",
  22: "Cantares", // Updated from Canticos to Cantares
  23: "Isaias",
  24: "Jeremias",
  25: "Lamentacoes",
  26: "Ezequiel",
  27: "Daniel",
  28: "Oseas",
  29: "Joel",
  30: "Amos",
  31: "Obadias",
  32: "Jonas",
  33: "Miqueas",
  34: "Naum",
  35: "Habacuc",
  36: "Sofonias",
  37: "Ageu",
  38: "Zacarias",
  39: "Malaquias",
  40: "S_Mateus",
  41: "S_Marcos",
  42: "S_Lucas",
  43: "S_Joao",
  44: "Atos",
  45: "Romanos",
  46: "1Corintios",
  47: "2Corintios",
  48: "Galatas",
  49: "Efesios",
  50: "Filipenses",
  51: "Colossenses",
  52: "1Tess",
  53: "2Tess",
  54: "1Timoteo",
  55: "2Timoteo",
  56: "Tito",
  57: "Filemon",
  58: "Hebreus",
  59: "S_Tiago",
  60: "1Pedro",
  61: "2Pedro",
  62: "1S_Joao",
  63: "2S_Joao",
  64: "3S_Joao",
  65: "S_Judas",
  66: "Apocalipse"
};

const VT_BOOKS = [
  { pk: 1, name: "Gênesis", chapters: 50 },
  { pk: 2, name: "Êxodo", chapters: 40 },
  { pk: 3, name: "Levítico", chapters: 27 },
  { pk: 4, name: "Números", chapters: 36 },
  { pk: 5, name: "Deuteronômio", chapters: 34 },
  { pk: 6, name: "Josué", chapters: 24 },
  { pk: 7, name: "Juízes", chapters: 21 },
  { pk: 8, name: "Ruth", chapters: 4 },
  { pk: 9, name: "1 Samuel", chapters: 31 },
  { pk: 10, name: "2 Samuel", chapters: 24 },
  { pk: 11, name: "1 Reis", chapters: 22 },
  { pk: 12, name: "2 Reis", chapters: 25 },
  { pk: 13, name: "1 Crônicas", chapters: 29 },
  { pk: 14, name: "2 Crônicas", chapters: 36 },
  { pk: 15, name: "Esdras", chapters: 10 },
  { pk: 16, name: "Neemias", chapters: 13 },
  { pk: 17, name: "Ester", chapters: 10 },
  { pk: 18, name: "Jó", chapters: 42 },
  { pk: 19, name: "Salmos", chapters: 150 },
  { pk: 20, name: "Provérbios", chapters: 31 },
  { pk: 21, name: "Eclesiastes", chapters: 12 },
  { pk: 22, name: "Cantares", chapters: 8 },
  { pk: 23, name: "Isaías", chapters: 66 },
  { pk: 24, name: "Jeremias", chapters: 52 },
  { pk: 25, name: "Lamentações", chapters: 5 },
  { pk: 26, name: "Ezequiel", chapters: 48 },
  { pk: 27, name: "Daniel", chapters: 12 },
  { pk: 28, name: "Oseias", chapters: 14 },
  { pk: 29, name: "Joel", chapters: 3 },
  { pk: 30, name: "Amós", chapters: 9 },
  { pk: 31, name: "Obadias", chapters: 1 },
  { pk: 32, name: "Jonas", chapters: 4 },
  { pk: 33, name: "Miqueias", chapters: 7 },
  { pk: 34, name: "Naum", chapters: 3 },
  { pk: 35, name: "Habacuque", chapters: 3 },
  { pk: 36, name: "Sofonias", chapters: 3 },
  { pk: 37, name: "Ageu", chapters: 2 },
  { pk: 38, name: "Zacarias", chapters: 14 },
  { pk: 39, name: "Malaquias", chapters: 4 }
].map(b => ({ ...b, testament: 'VT' as const }));

const NT_BOOKS = [
  { pk: 40, name: "Mateus", chapters: 28 },
  { pk: 41, name: "Marcos", chapters: 16 },
  { pk: 42, name: "Lucas", chapters: 24 },
  { pk: 43, name: "João", chapters: 21 },
  { pk: 44, name: "Atos", chapters: 28 },
  { pk: 45, name: "Romanos", chapters: 16 },
  { pk: 46, name: "1 Coríntios", chapters: 16 },
  { pk: 47, name: "2 Coríntios", chapters: 13 },
  { pk: 48, name: "Gálatas", chapters: 6 },
  { pk: 49, name: "Efésios", chapters: 6 },
  { pk: 50, name: "Filipenses", chapters: 4 },
  { pk: 51, name: "Colossenses", chapters: 4 },
  { pk: 52, name: "1 Tessalonicenses", chapters: 5 },
  { pk: 53, name: "2 Tessalonicenses", chapters: 3 },
  { pk: 54, name: "1 Timóteo", chapters: 6 },
  { pk: 55, name: "2 Timóteo", chapters: 4 },
  { pk: 56, name: "Tito", chapters: 3 },
  { pk: 57, name: "Filemom", chapters: 1 },
  { pk: 58, name: "Hebreus", chapters: 13 },
  { pk: 59, name: "Tiago", chapters: 5 },
  { pk: 60, name: "1 Pedro", chapters: 5 },
  { pk: 61, name: "2 Pedro", chapters: 3 },
  { pk: 62, name: "1 João", chapters: 5 },
  { pk: 63, name: "2 João", chapters: 1 },
  { pk: 64, name: "3 João", chapters: 1 },
  { pk: 65, name: "Judas", chapters: 1 },
  { pk: 66, name: "Apocalipse", chapters: 22 }
].map(b => ({ ...b, testament: 'NT' as const }));

export const ALL_BOOKS: AudioBibleBook[] = [...VT_BOOKS, ...NT_BOOKS];

interface AudioBibleContextType {
  selectedBook: AudioBibleBook | null;
  selectedChapter: number | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  isLoadingAudio: boolean;
  audioUrl: string | null;
  playbackRate: number;
  playChapter: (book: AudioBibleBook, chapter: number) => Promise<void>;
  togglePlayPause: () => void;
  setPlaybackRate: (rate: number) => void;
  skipSeconds: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  closePlayer: () => void;
}

const AudioBibleContext = createContext<AudioBibleContextType | undefined>(undefined);

export function AudioBibleProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [selectedBook, setSelectedBook] = useState<AudioBibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getPaths = (book: AudioBibleBook, chapter: number): string[] => {
    const isVT = book.testament === 'VT';
    const prefix = isVT ? 'A' : 'B';
    const bookIndex = isVT ? book.pk : book.pk - 39;
    const formattedBookIndex = bookIndex.toString().padStart(2, '0');
    const chap2 = chapter.toString().padStart(2, '0');
    const chap3 = chapter.toString().padStart(3, '0');
    
    const baseSlug = BOOK_SLUGS[book.pk] || book.name;
    const cleanSlug = baseSlug.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "");
    const suffix = isVT ? 'PO1NLHO1DA' : 'PO1NLHN1DA';
    
    const paths: string[] = [];

    // --- Specific Case: Salmos (PK 19) ---
    if (book.pk === 19) {
        const filename = `${prefix}19__${chap3}_Salmos______${suffix}.mp3`;
        paths.push(`audio/${filename}`, `public/audio/${filename}`, `Portuguese_por_NLH_OT_Non-Drama/${filename}`, `public/Portuguese_por_NLH_OT_Non-Drama/${filename}`, filename);
    }

    // --- Specific Case: Cânticos / Cantares (PK 22) ---
    if (book.pk === 22) {
        const filename = `${prefix}22___${chap2}_Cantares____${suffix}.mp3`;
        paths.push(`audio/${filename}`, `public/audio/${filename}`, `Portuguese_por_NLH_OT_Non-Drama/${filename}`, `public/Portuguese_por_NLH_OT_Non-Drama/${filename}`, filename);
    }

    // --- Specific Case: Jó / Job (PK 18) --- handled by BOOK_SLUGS "Job"

    // --- Standard / Fallback Logic ---
    const standardSlug = cleanSlug;
    const separators = ['___', '__'];
    const paddings = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 0];

    for (const sep of separators) {
        for (const len of paddings) {
            const paddedSlug = standardSlug.padEnd(len, '_');
            [chap2, chap3].forEach(c => {
                const filename = `${prefix}${formattedBookIndex}${sep}${c}_${paddedSlug}${suffix}.mp3`;
                paths.push(`audio/${filename}`, `public/audio/${filename}`, `Portuguese_por_NLH_OT_Non-Drama/${filename}`, `Portuguese_por_NLH_NT_Non-Drama/${filename}`, `public/Portuguese_por_NLH_OT_Non-Drama/${filename}`, `public/Portuguese_por_NLH_NT_Non-Drama/${filename}`, filename);
            });
        }
    }
    
    return Array.from(new Set(paths));
  };

  const playChapter = async (book: AudioBibleBook, chapter: number) => {
    setIsLoadingAudio(true);
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setProgress(0);
    setAudioUrl(null);

    const paths = getPaths(book, chapter);
    
    for (const path of paths) {
      try {
        const storageRef = ref(storage, path);
        const url = await getDownloadURL(storageRef);
        setAudioUrl(url);
        setIsLoadingAudio(false);
        setIsPlaying(true);
        return;
      } catch (e) {
        // continue searching
      }
    }
    
    setIsLoadingAudio(false);
    showToast(`Áudio do capítulo ${chapter} não encontrado.`, "error");
  };

  const nextChapter = () => {
    if (!selectedBook || !selectedChapter) return;
    if (selectedChapter < selectedBook.chapters) {
      playChapter(selectedBook, selectedChapter + 1);
    } else {
      // Find next book
      const currentIndex = ALL_BOOKS.findIndex(b => b.pk === selectedBook.pk);
      if (currentIndex < ALL_BOOKS.length - 1) {
        playChapter(ALL_BOOKS[currentIndex + 1], 1);
      } else {
        showToast("Você chegou ao final da Bíblia!", "info");
      }
    }
  };

  const prevChapter = () => {
    if (!selectedBook || !selectedChapter) return;
    if (selectedChapter > 1) {
      playChapter(selectedBook, selectedChapter - 1);
    } else {
      // Find prev book
      const currentIndex = ALL_BOOKS.findIndex(b => b.pk === selectedBook.pk);
      if (currentIndex > 0) {
        const prevBook = ALL_BOOKS[currentIndex - 1];
        playChapter(prevBook, prevBook.chapters);
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        showToast("Erro ao reproduzir áudio.", "error");
      });
    }
    setIsPlaying(!isPlaying);
  };

  const skipSeconds = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const closePlayer = () => {
    if (audioRef.current) audioRef.current.pause();
    setSelectedBook(null);
    setSelectedChapter(null);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackRate; // Apply rate when src changes
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error("Play error:", err));
      }
    }
  }, [audioUrl]);

  return (
    <AudioBibleContext.Provider value={{
      selectedBook,
      selectedChapter,
      isPlaying,
      progress,
      duration,
      isLoadingAudio,
      audioUrl,
      playbackRate,
      playChapter,
      togglePlayPause,
      setPlaybackRate,
      skipSeconds,
      seekTo,
      nextChapter,
      prevChapter,
      closePlayer
    }}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          nextChapter(); // Auto-play next chapter
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </AudioBibleContext.Provider>
  );
}

export function useAudioBible() {
  const context = useContext(AudioBibleContext);
  if (context === undefined) {
    throw new Error('useAudioBible must be used within an AudioBibleProvider');
  }
  return context;
}
