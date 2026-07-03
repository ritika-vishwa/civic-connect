import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Dummy fallback profiles for auto-creation
const FALLBACK_PROFILES: Record<UserRole, Partial<User>> = {
  citizen: {
    name: 'Citizen User',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  },
  officer: {
    name: 'Officer User',
    department: 'Public Works',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'
  },
  admin: {
    name: 'Admin User',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user document from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            // Document doesn't exist, fallback to citizen
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: 'citizen',
              name: 'Unknown User',
              avatar: FALLBACK_PROFILES.citizen.avatar!
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // 1. Try logging in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Ensure their user document exists and update their role to what they selected
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const profile = FALLBACK_PROFILES[role];
      
      if (!userDocSnap.exists()) {
        const userDoc: User = {
          uid: userCredential.user.uid,
          email: email,
          role: role,
          name: profile.name || 'User',
          avatar: profile.avatar || '',
          ...(profile.department && { department: profile.department })
        };
        await setDoc(userDocRef, userDoc);
        setUser(userDoc);
      } else {
        // Update their role to match their selection (preserves the mock UI flow)
        await setDoc(userDocRef, { role: role }, { merge: true });
        const updatedDoc = await getDoc(userDocRef);
        setUser({ uid: userCredential.user.uid, ...updatedDoc.data() } as User);
      }
      
    } catch (error: any) {
      // 3. If it fails, check if we want to auto-create them. Actually, we now have an explicit signup function.
      // But we keep this for backwards compatibility with Quick Demo Login or other implicit flows.
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;
          
          const profile = FALLBACK_PROFILES[role];
          const userDoc: User = {
            uid: newUser.uid,
            email: email,
            role: role,
            name: profile.name || 'User',
            avatar: profile.avatar || '',
            ...(profile.department && { department: profile.department })
          };
          
          await setDoc(doc(db, 'users', newUser.uid), userDoc);
          setUser(userDoc);
        } catch (signupError) {
          console.error("Signup failed during auto-registration:", signupError);
          throw signupError;
        }
      } else {
        console.error("Login failed:", error);
        throw error;
      }
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      const profile = FALLBACK_PROFILES[role];
      const userDoc: User = {
        uid: newUser.uid,
        email: email,
        role: role,
        name: name.trim() || profile.name || 'User',
        avatar: profile.avatar || '',
        ...(profile.department && { department: profile.department })
      };
      
      await setDoc(doc(db, 'users', newUser.uid), userDoc);
      setUser(userDoc);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (role: UserRole) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const profile = FALLBACK_PROFILES[role];
      
      if (!userDocSnap.exists()) {
        const userDoc: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          role: role,
          name: userCredential.user.displayName || profile.name || 'User',
          avatar: userCredential.user.photoURL || profile.avatar || '',
          ...(profile.department && { department: profile.department })
        };
        await setDoc(userDocRef, userDoc);
        setUser(userDoc);
      } else {
        await setDoc(userDocRef, { role: role }, { merge: true });
        const updatedDoc = await getDoc(userDocRef);
        setUser({ uid: userCredential.user.uid, ...updatedDoc.data() } as User);
      }
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const deleteAccount = async () => {
    if (auth.currentUser && user) {
      try {
        // Delete user doc from firestore
        await deleteDoc(doc(db, 'users', user.uid));
        // Delete user from auth
        await deleteUser(auth.currentUser);
        setUser(null);
      } catch (error) {
        console.error("Delete account failed:", error);
        throw error;
      }
    }
  };

  const switchRole = async (role: UserRole) => {
    // For UI preservation, update the Firestore document directly
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const profile = FALLBACK_PROFILES[role];
        await setDoc(userDocRef, { role, department: profile.department || null }, { merge: true });
        setUser({ ...user, role, department: profile.department });
      } catch (error) {
        console.error("Failed to switch role in DB:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, deleteAccount, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
