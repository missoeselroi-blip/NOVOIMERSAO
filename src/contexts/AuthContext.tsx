import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { auth, db, isProjectSuspended } from '../lib/firebase';

interface Favorite {
  verse: string;
  reference: string;
  version?: string;
  date: string;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  preferredBible: string;
  fontSize: string;
  layout?: 'devotional' | string;
}

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  avatar?: string;
  avatarIndex?: number;
  joinDate: string;
  lastActive?: string;
  role: 'admin' | 'user';
  favorites?: Favorite[];
  settings?: UserSettings;
  metrics?: Metrics;
  diaryPassword?: string;
  panoramaMedals?: {
    bronze: number;
    silver: number;
    gold: number;
    trophy: number;
  };
  displayNameSet?: boolean;
}

interface Metrics {
  accesses: number;
  totalTime: number; // in seconds
  totalStudies?: number;
  forumParticipations: number;
  shares: number;
  gamesPlayed: number;
  membershipMonths: number;
  sectionTimes?: Record<string, number>;
}

interface AuthContextType {
  user: User | null;
  metrics: Metrics;
  theologyProgress: any;
  evangelismProgress: any;
  notes: any[];
  certificates: any[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateMetrics: (updates: Partial<Metrics>) => Promise<void>;
  updateSectionTime: (sectionId: string, seconds: number) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  cycleAvatar: () => Promise<void>;
  addPoints: (points: number, activity?: string) => Promise<void>;
  toggleFavorite: (favorite: Omit<Favorite, 'id'>) => Promise<void>;
  addStudy: (study: { title: string; content: string; verseReference?: string; bibleVersion?: string }) => Promise<void>;
  isInitialLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
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
  
  // Only throw the specific JSON error for permission issues as requested by the spec
  if (errorMessage.includes('Missing or insufficient permissions') || errorMessage.includes('permission-denied')) {
    throw new Error(JSON.stringify(errInfo));
  }
  
  // For offline errors or unavailable errors, we don't want to crash the app
  if (errorMessage.includes('client is offline') || 
      errorMessage.includes('offline') || 
      errorMessage.includes('unavailable') ||
      errorMessage.includes('Could not reach Cloud Firestore backend')) {
    console.warn("Firestore is operating in offline mode or is unavailable.");
    if (typeof isProjectSuspended !== 'undefined' && !isProjectSuspended.value) {
      isProjectSuspended.value = true;
    }
    return;
  }
  
  // For other errors, we can throw a normal error or just log
  // throw new Error(errorMessage);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [theologyProgress, setTheologyProgress] = useState<any>(null);
  const [evangelismProgress, setEvangelismProgress] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);

  const getWeekId = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day; 
    const sunday = new Date(date.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday.toISOString().split('T')[0];
  };
  const [certificates, setCertificates] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    accesses: 0,
    totalTime: 0,
    forumParticipations: 0,
    shares: 0,
    gamesPlayed: 0,
    membershipMonths: 0,
    sectionTimes: {},
  });

  // Listen for Auth State Changes
  useEffect(() => {
    if (!auth) {
      setIsInitialLoading(false);
      return;
    }

    let unsubscribeUser: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // Clean up previous user listener if it exists
        if (unsubscribeUser) {
          unsubscribeUser();
          unsubscribeUser = null;
        }

        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          try {
            const userDoc = await getDoc(userDocRef);
            
            let userData: User;
            if (userDoc.exists()) {
              userData = userDoc.data() as User;
              
              // Sync to SQLite
              fetch('/api/sync-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  avatar_url: userData.avatar || userData.photoURL
                })
              }).catch(e => console.error(e));

              // Auto-assign admin role to specific email
              if (firebaseUser.email === 'missoeselroi@gmail.com' && userData.role !== 'admin') {
                userData.role = 'admin';
                await updateDoc(userDocRef, { role: 'admin' });
              }
              
              // Update lastActive and increment accesses (once per session)
              // We use a sessionStorage flag to only increment once per tab/session
              const sessionChecked = sessionStorage.getItem(`session_started_${firebaseUser.uid}`);
              if (!sessionChecked) {
                const metricsDocRef = doc(db, 'metrics', firebaseUser.uid);
                const metricsDoc = await getDoc(metricsDocRef);
                if (metricsDoc.exists()) {
                  const mData = metricsDoc.data();
                  await updateDoc(metricsDocRef, { 
                    accesses: (mData.accesses || 0) + 1 
                  });
                  
                  // Award daily access points (once per day)
                  const lastAccessDate = mData.lastAccess ? (mData.lastAccess as any).toDate().toDateString() : '';
                  const todayStr = new Date().toDateString();
                  if (lastAccessDate !== todayStr) {
                    await addPoints(10, 'daily_access');
                  }
                } else {
                  await setDoc(metricsDocRef, {
                    accesses: 1,
                    totalTime: 0,
                    forumParticipations: 0,
                    shares: 0,
                    gamesPlayed: 0,
                    membershipMonths: 0,
                    sectionTimes: {},
                    lastAccess: serverTimestamp()
                  });
                  await addPoints(10, 'daily_access');
                }
                sessionStorage.setItem(`session_started_${firebaseUser.uid}`, 'true');
              }

              await updateDoc(userDocRef, {
                lastActive: new Date().toISOString()
              });
            } else {
              const isAdmin = firebaseUser.email === 'missoeselroi@gmail.com';
              userData = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
                joinDate: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                role: isAdmin ? 'admin' : 'user'
              };
              await setDoc(userDocRef, userData);
            }
          } catch (error: any) {
            console.warn("Could not sync user data (possibly offline):", error);
            // We continue to set up the onSnapshot listener which will use cached data
          }
          
          unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setUser(doc.data() as User);
            }
            setIsInitialLoading(false);
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
            setIsInitialLoading(false);
          });
        } else {
          setUser(null);
          setTheologyProgress(null);
          setEvangelismProgress(null);
          setNotes([]);
          setCertificates([]);
          setMetrics({
            accesses: 0,
            totalTime: 0,
            forumParticipations: 0,
            shares: 0,
            gamesPlayed: 0,
            membershipMonths: 0,
            sectionTimes: {},
          });
          setIsInitialLoading(false);
        }
      } catch (error) {
        console.error('Error in onAuthStateChanged:', error);
        setIsInitialLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [auth, db]);

  // Listen for User Data Changes
  useEffect(() => {
    if (!user || !db) return;

    const theologyUnsub = onSnapshot(doc(db, 'theologyProgress', user.id), (doc) => {
      if (doc.exists()) setTheologyProgress(doc.data());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `theologyProgress/${user.id}`);
    });

    const evangelismUnsub = onSnapshot(doc(db, 'evangelismProgress', user.id), (doc) => {
      if (doc.exists()) setEvangelismProgress(doc.data());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `evangelismProgress/${user.id}`);
    });

    const notesQuery = query(collection(db, 'notes'), where('userId', '==', user.id));
    const notesUnsub = onSnapshot(notesQuery, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      notesData.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setNotes(notesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    const certsQuery = query(collection(db, 'theologyCertificates'), where('userId', '==', user.id));
    const certsUnsub = onSnapshot(certsQuery, (snapshot) => {
      const certsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCertificates(certsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'theologyCertificates');
    });

    const metricsDocRef = doc(db, 'metrics', user.id);
    const metricsUnsub = onSnapshot(metricsDocRef, (doc) => {
      if (doc.exists()) {
        setMetrics(doc.data() as Metrics);
      } else {
        const initialMetrics: Metrics = {
          accesses: 1,
          totalTime: 0,
          forumParticipations: 0,
          shares: 0,
          gamesPlayed: 0,
          membershipMonths: 0,
          sectionTimes: {},
        };
        setDoc(metricsDocRef, initialMetrics).catch(err => handleFirestoreError(err, OperationType.WRITE, `metrics/${user.id}`));
        setMetrics(initialMetrics);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `metrics/${user.id}`);
    });

    return () => {
      theologyUnsub();
      evangelismUnsub();
      notesUnsub();
      certsUnsub();
      metricsUnsub();
    };
  }, [user?.id, db]);

  // Track time and sync to Firestore periodically
  useEffect(() => {
    if (!user || !db) return;

    let localTotalTime = metrics.totalTime;
    const interval = setInterval(() => {
      localTotalTime += 1;
      
      // Sync to Firestore every 5 minutes (300 seconds) to reduce write operations
      if (localTotalTime % 300 === 0 && db) {
        const metricsDocRef = doc(db, 'metrics', user.id);
        updateDoc(metricsDocRef, { totalTime: localTotalTime }).catch(err => {
          if (err.message.includes('resource-exhausted')) {
            console.error("Firestore quota exceeded. Slowing down metrics updates.");
          } else {
            console.error("Error updating metrics:", err);
          }
        });
        
        // Only update state when syncing to Firestore to avoid per-second re-renders
        setMetrics(prev => ({ ...prev, totalTime: localTotalTime }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.id, db]);

  const loginWithGoogle = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Error logging in with Google:", error);
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in with email:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    if (!auth || !db) return;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      await updateProfile(firebaseUser, { displayName: name });
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userData: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        joinDate: new Date().toISOString(),
        role: 'user',
        settings: {
          theme: 'light',
          preferredBible: 'almeida',
          fontSize: '18',
          layout: 'devotional'
        }
      };
      await setDoc(userDocRef, userData);
      setUser(userData);
    } catch (error) {
      console.error("Error registering with email:", error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user || !db) return;
    const userDocRef = doc(db, 'users', user.id);
    try {
      await updateDoc(userDocRef, updates);
      
      // Sync to SQLite locally
      fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: updates.name || user.name,
          email: user.email,
          avatar_url: updates.avatar || updates.photoURL || user.avatar || user.photoURL
        })
      }).catch(e => console.error(e));

      // Sync avatar if it's being updated
      const newAvatar = updates.avatar || updates.photoURL;
      if (newAvatar) {
        // Sync with bibleRaceProgress
        const raceProgressRef = doc(db, 'bibleRaceProgress', user.id);
        await updateDoc(raceProgressRef, { 
          userPhoto: newAvatar,
          userName: updates.name || user.name
        }).catch(() => {});
        
        // Sync with bibleRaceChampions
        const championsRef = collection(db, 'bibleRaceChampions');
        const q = query(championsRef, where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);
        const updatePromises = querySnapshot.docs.map(doc => 
          updateDoc(doc.ref, { 
            userPhoto: newAvatar,
            userName: updates.name || user.name
          })
        );
        await Promise.all(updatePromises);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const toggleFavorite = async (favorite: Omit<Favorite, 'id'>) => {
    if (!user || !db) return;
    const userDocRef = doc(db, 'users', user.id);
    const currentFavorites = user.favorites || [];
    const exists = currentFavorites.find(f => f.reference === favorite.reference);
    
    let newFavorites;
    if (exists) {
      newFavorites = currentFavorites.filter(f => f.reference !== favorite.reference);
    } else {
      newFavorites = [...currentFavorites, favorite];
    }
    
    try {
      await updateDoc(userDocRef, { favorites: newFavorites });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const addStudy = async (study: { title: string; content: string; verseReference?: string; bibleVersion?: string }) => {
    if (!user || !db) return;
    const noteDocRef = doc(collection(db, 'notes'));
    try {
      await setDoc(noteDocRef, {
        userId: user.id,
        title: study.title,
        content: `### ${study.verseReference} (${study.bibleVersion})\n\n${study.content}`,
        category: 'Estudos',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  };

  const updateMetrics = async (updates: Partial<Metrics>) => {
    if (!user || !db) return;
    const metricsDocRef = doc(db, 'metrics', user.id);
    try {
      await updateDoc(metricsDocRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `metrics/${user.id}`);
    }
  };

  const updateSectionTime = async (sectionId: string, seconds: number) => {
    if (!user || !db) return;
    const metricsDocRef = doc(db, 'metrics', user.id);
    const currentSectionTimes = metrics.sectionTimes || {};
    const newSectionTimes = {
      ...currentSectionTimes,
      [sectionId]: (currentSectionTimes[sectionId] || 0) + seconds
    };
    
    try {
      await updateDoc(metricsDocRef, { sectionTimes: newSectionTimes });
      setMetrics(prev => ({ ...prev, sectionTimes: newSectionTimes }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `metrics/${user.id}`);
    }
  };

  const cycleAvatar = async () => {
    if (!user || !db) return;
    const nextIndex = ((user.avatarIndex || 0) + 1) % 3;
    let avatarUrl = '';
    if (nextIndex === 0) {
      avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=man-${Math.random()}`;
    } else if (nextIndex === 1) {
      avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=woman-${Math.random()}`;
    } else {
      avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=animal-${Math.random()}`;
    }
    
    await updateUser({ avatar: avatarUrl, avatarIndex: nextIndex });
  };

  const addPoints = async (points: number, activity?: string) => {
    // Career logic removed
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const value = useMemo(() => ({ 
    user, 
    metrics, 
    theologyProgress,
    evangelismProgress,
    notes,
    certificates,
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    logout, 
    updateMetrics, 
    updateSectionTime,
    updateUser,
    cycleAvatar,
    addPoints,
    toggleFavorite,
    addStudy,
    isInitialLoading 
  }), [
    user, 
    metrics, 
    theologyProgress,
    evangelismProgress,
    notes,
    certificates,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    updateMetrics,
    updateSectionTime,
    updateUser,
    cycleAvatar,
    addPoints,
    toggleFavorite,
    addStudy,
    isInitialLoading
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
