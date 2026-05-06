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
import { auth, db } from '../lib/firebase';

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
  careerProgress: any;
  notes: any[];
  certificates: any[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateMetrics: (updates: Partial<Metrics>) => Promise<void>;
  updateSectionTime: (sectionId: string, seconds: number) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
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
  
  // For offline errors, we don't want to crash the app
  if (errorMessage.includes('client is offline') || errorMessage.includes('offline')) {
    console.warn("Firestore is operating in offline mode.");
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
  const [careerProgress, setCareerProgress] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
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
          setCareerProgress(null);
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

    const checkAndResetMonthly = async () => {
      const now = new Date();
      const monthId = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const careerDocRef = doc(db, 'careerProgress', user.id);
      const careerDoc = await getDoc(careerDocRef);
      
      if (careerDoc.exists()) {
        const data = careerDoc.data();
        const lastReset = data.lastReset || '0000-00';
        
        if (lastReset !== monthId) {
          // Save current stats to history
          const historyDocRef = doc(db, 'careerProgress', user.id, 'monthlyHistory', lastReset);
          await setDoc(historyDocRef, {
            points: data.points || 0,
            rankId: data.rankId || 1,
            stars: data.stars || 0,
            savedAt: new Date().toISOString()
          });
          
          // Reset current stats
          await updateDoc(careerDocRef, {
            points: 0,
            lastReset: monthId
          });
        }
      }
    };
    
    checkAndResetMonthly();

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

    const careerUnsub = onSnapshot(doc(db, 'careerProgress', user.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        let rankId = data.rankId || 1;
        const points = data.points || 0;
        
        // Comprehensive Promotion Logic (Point-based for all 12 ranks)
        // This ensures users are promoted as they earn points from any source
        let newRankId = 1;
        if (points >= 20000) newRankId = 12;
        else if (points >= 15000) newRankId = 11;
        else if (points >= 10000) newRankId = 10;
        else if (points >= 7500) newRankId = 9;
        else if (points >= 5000) newRankId = 8;
        else if (points >= 4000) newRankId = 7;
        else if (points >= 3000) newRankId = 6;
        else if (points >= 2000) newRankId = 5;
        else if (points >= 1500) newRankId = 4;
        else if (points >= 1000) newRankId = 3;
        else if (points >= 500) newRankId = 2;
        
        // Only update if it's a promotion (newRankId > current rankId)
        if (newRankId > rankId) {
          updateDoc(doc.ref, { 
            rankId: newRankId,
            updatedAt: new Date().toISOString()
          });
          rankId = newRankId;
        }
        
        setCareerProgress({ ...data, rankId });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `careerProgress/${user.id}`);
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
      careerUnsub();
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
      
      // Sync avatar if it's being updated
      const newAvatar = updates.avatar || updates.photoURL;
      if (newAvatar) {
        // Sync with careerProgress
        const careerDocRef = doc(db, 'careerProgress', user.id);
        await updateDoc(careerDocRef, { 
          avatar: newAvatar,
          name: updates.name || user.name 
        }).catch(() => {});
        
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

  const addPoints = async (points: number, activity?: string) => {
    if (!user || !db) return;
    const careerDocRef = doc(db, 'careerProgress', user.id);
    try {
      const careerDoc = await getDoc(careerDocRef);
      if (careerDoc.exists()) {
        await updateDoc(careerDocRef, { 
          points: increment(points),
          activityPoints: increment(points),
          lastActivity: activity || 'general',
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(careerDocRef, {
          userId: user.id,
          name: user.name || 'Membro',
          avatar: user.avatar || user.photoURL || '',
          points: points,
          activityPoints: points,
          rankId: 1,
          stars: 0,
          authorized: false,
          lastActivity: activity || 'general',
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `careerProgress/${user.id}`);
    }
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

  const value = useMemo(() => ({ 
    user, 
    metrics, 
    theologyProgress,
    evangelismProgress,
    careerProgress,
    notes,
    certificates,
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    logout, 
    updateMetrics, 
    updateSectionTime,
    updateUser,
    addPoints,
    toggleFavorite,
    addStudy,
    isInitialLoading 
  }), [
    user, 
    metrics, 
    theologyProgress,
    evangelismProgress,
    careerProgress,
    notes,
    certificates,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    updateMetrics,
    updateSectionTime,
    updateUser,
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
