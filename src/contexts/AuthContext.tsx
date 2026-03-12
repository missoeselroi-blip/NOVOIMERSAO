import React, { createContext, useContext, useState, useEffect } from 'react';
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
    if (!auth || !db) {
      console.warn("Firebase services not initialized. Auth functionality will be limited.");
      setIsInitialLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData: User;
        
        if (userDoc.exists()) {
          userData = userDoc.data() as User;
        } else {
          // Create new user doc if it doesn't exist (e.g. Google login first time)
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

        // Listen for theology progress
        const theologyUnsub = onSnapshot(doc(db, 'theologyProgress', firebaseUser.uid), (doc) => {
          if (doc.exists()) setTheologyProgress(doc.data());
        });

        // Listen for career progress
        const careerUnsub = onSnapshot(doc(db, 'careerProgress', firebaseUser.uid), (doc) => {
          if (doc.exists()) setCareerProgress(doc.data());
        });

        // Listen for notes
        const notesQuery = query(collection(db, 'notes'), where('userId', '==', firebaseUser.uid));
        const notesUnsub = onSnapshot(notesQuery, (snapshot) => {
          const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setNotes(notesData);
        });

        // Listen for certificates
        const certsQuery = query(collection(db, 'theologyCertificates'), where('userId', '==', firebaseUser.uid));
        const certsUnsub = onSnapshot(certsQuery, (snapshot) => {
          const certsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCertificates(certsData);
        });

        // Listen for metrics changes
        const metricsDocRef = doc(db, 'metrics', firebaseUser.uid);
        const unsubscribeMetrics = onSnapshot(metricsDocRef, (doc) => {
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
            setDoc(metricsDocRef, initialMetrics);
            setMetrics(initialMetrics);
          }
        });

        setIsInitialLoading(false);

        return () => {
          theologyUnsub();
          careerUnsub();
          notesUnsub();
          certsUnsub();
          unsubscribeMetrics();
        };
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
        setIsInitialLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <AuthContext.Provider value={{ 
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
    }}>
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
