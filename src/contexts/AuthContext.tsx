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
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  joinDate: string;
  role: 'admin' | 'user';
}

interface Metrics {
  accesses: number;
  totalTime: number; // in seconds
  forumParticipations: number;
  shares: number;
  hasContributed: boolean;
  membershipMonths: number;
}

interface AuthContextType {
  user: User | null;
  metrics: Metrics;
  theologyProgress: any;
  careerProgress: any;
  notes: any[];
  certificates: any[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateMetrics: (updates: Partial<Metrics>) => void;
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  throw new Error(JSON.stringify(errInfo));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [theologyProgress, setTheologyProgress] = useState<any>(null);
  const [careerProgress, setCareerProgress] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    accesses: 0,
    totalTime: 0,
    forumParticipations: 0,
    shares: 0,
    hasContributed: false,
    membershipMonths: 0,
  });

  // Listen for Auth State Changes
  useEffect(() => {
    if (!auth) {
      setIsInitialLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData: User;
        if (userDoc.exists()) {
          userData = userDoc.data() as User;
        } else {
          userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            joinDate: new Date().toISOString(),
            role: 'user'
          };
          await setDoc(userDocRef, userData);
        }
        setUser(userData);
      } else {
        setUser(null);
        setTheologyProgress(null);
        setCareerProgress(null);
        setNotes([]);
        setCertificates([]);
        setMetrics({
          accesses: 0,
          totalTime: 0,
          forumParticipations: 0,
          shares: 0,
          hasContributed: false,
          membershipMonths: 0,
        });
      }
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  // Listen for User Data Changes
  useEffect(() => {
    if (!user || !db) return;

    const theologyUnsub = onSnapshot(doc(db, 'theologyProgress', user.id), (doc) => {
      if (doc.exists()) setTheologyProgress(doc.data());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `theologyProgress/${user.id}`);
    });

    const careerUnsub = onSnapshot(doc(db, 'careerProgress', user.id), (doc) => {
      if (doc.exists()) setCareerProgress(doc.data());
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
          hasContributed: false,
          membershipMonths: 0,
        };
        setDoc(metricsDocRef, initialMetrics).catch(err => handleFirestoreError(err, OperationType.WRITE, `metrics/${user.id}`));
        setMetrics(initialMetrics);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `metrics/${user.id}`);
    });

    return () => {
      theologyUnsub();
      careerUnsub();
      notesUnsub();
      certsUnsub();
      metricsUnsub();
    };
  }, [user?.id, db]);

  // Track time and sync to Firestore periodically
  useEffect(() => {
    if (!user || !db) return;

    const interval = setInterval(async () => {
      setMetrics(prev => {
        const newTime = prev.totalTime + 1;
        if (newTime % 30 === 0 && db) {
          const metricsDocRef = doc(db, 'metrics', user.id);
          updateDoc(metricsDocRef, { totalTime: newTime }).catch(console.error);
        }
        return { ...prev, totalTime: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const loginWithGoogle = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in with Google:", error);
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
        role: 'user'
      };
      await setDoc(userDocRef, userData);
      setUser(userData);
    } catch (error) {
      console.error("Error registering with email:", error);
      throw error;
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
    await updateDoc(metricsDocRef, updates);
  };

  const value = useMemo(() => ({ 
    user, 
    metrics, 
    theologyProgress,
    careerProgress,
    notes,
    certificates,
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    logout, 
    updateMetrics, 
    isInitialLoading 
  }), [
    user, 
    metrics, 
    theologyProgress,
    careerProgress,
    notes,
    certificates,
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
