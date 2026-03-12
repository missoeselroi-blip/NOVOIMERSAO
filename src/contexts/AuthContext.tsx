import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  joinDate: string;
  theology_progress?: any;
  preacher_notes?: any;
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
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, name: string) => Promise<void>;
  logout: () => void;
  updateMetrics: (updates: Partial<Metrics>) => void;
  isInitialLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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
          
          // Sync cloud data down to local storage on login
          if (userData.theology_progress) {
            localStorage.setItem('theology_progress', JSON.stringify(userData.theology_progress));
          }
          if (userData.preacher_notes) {
            localStorage.setItem('preacher_notes', JSON.stringify(userData.preacher_notes));
          }
        } else {
          // Create new user doc
          userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            joinDate: new Date().toISOString(),
          };
          
          // If there's existing local data, upload it on first login
          const localProgress = localStorage.getItem('theology_progress');
          const localNotes = localStorage.getItem('preacher_notes');
          if (localProgress) userData.theology_progress = JSON.parse(localProgress);
          if (localNotes) userData.preacher_notes = JSON.parse(localNotes);

          await setDoc(userDocRef, userData);
        }
        
        setUser(userData);

        // Listen for metrics changes
        const metricsDocRef = doc(db, 'metrics', firebaseUser.uid);
        const unsubscribeMetrics = onSnapshot(metricsDocRef, (doc) => {
          if (doc.exists()) {
            setMetrics(doc.data() as Metrics);
          } else {
            // Initialize metrics in Firestore
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

        return () => unsubscribeMetrics();
      } else {
        // User is signed out
        setUser(null);
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
  }, []);

  // Track time and sync to Firestore periodically
  useEffect(() => {
    if (!user || !db) return;

    const interval = setInterval(async () => {
      setMetrics(prev => {
        const newTime = prev.totalTime + 1;
        // Sync to Firestore every 30 seconds
        if (newTime % 30 === 0 && db) {
          const metricsDocRef = doc(db, 'metrics', user.id);
          updateDoc(metricsDocRef, { totalTime: newTime }).catch(console.error);

          // Sync local storage data up to Firestore
          const userDocRef = doc(db, 'users', user.id);
          const localProgress = localStorage.getItem('theology_progress');
          const localNotes = localStorage.getItem('preacher_notes');
          
          const updates: any = {};
          if (localProgress) updates.theology_progress = JSON.parse(localProgress);
          if (localNotes) updates.preacher_notes = JSON.parse(localNotes);
          
          if (Object.keys(updates).length > 0) {
            updateDoc(userDocRef, updates).catch(console.error);
          }
        }
        return { ...prev, totalTime: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const loginWithGoogle = async () => {
    if (!auth) {
      alert("Firebase não configurado. Por favor, adicione as chaves em Settings > Environment Variables.");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in with Google:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, name: string) => {
    if (!auth || !db) {
      alert("Firebase não configurado. Por favor, adicione as chaves em Settings > Environment Variables.");
      return;
    }
    try {
      // For simplicity in this demo/app, we'll use anonymous auth and update profile
      // or you could implement full email/password. 
      // Given the previous mock implementation, let's use anonymous auth for now
      // but store the email and name in Firestore.
      const result = await signInAnonymously(auth);
      const firebaseUser = result.user;
      
      await updateProfile(firebaseUser, { displayName: name });
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userData: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        joinDate: new Date().toISOString(),
      };
      await setDoc(userDocRef, userData);
      
      setUser(userData);
    } catch (error) {
      console.error("Error logging in with email:", error);
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
    <AuthContext.Provider value={{ user, metrics, loginWithGoogle, loginWithEmail, logout, updateMetrics, isInitialLoading }}>
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
