import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  setPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'citizen' | 'official' | 'moderator' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  locality?: string;
  avatar: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole, locality?: string) => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<void>;
  updateUserAvatar: (url: string) => Promise<void>;
}

export const generateInitialAvatar = (name: string) => {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f0ff" />
        <stop offset="100%" stop-color="#d946ef" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#g)"/>
    <text x="50" y="50" font-family="sans-serif" font-weight="bold" font-size="50" fill="#ffffff" text-anchor="middle" alignment-baseline="central">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Dummy fallback profiles for auto-creation
const FALLBACK_PROFILES: Record<UserRole, Partial<User>> = {
  citizen: {
    name: 'Citizen User',
    locality: 'Downtown District'
  },
  official: {
    name: 'Municipal Official',
    department: 'Public Works',
    locality: 'City Hall'
  },
  moderator: {
    name: 'Community Moderator',
    locality: 'Northside Community'
  },
  admin: {
    name: 'System Administrator',
    department: 'IT Operations'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force session persistence so the user is logged out when they close the browser
    setPersistence(auth, browserSessionPersistence).catch(console.error);

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
          avatar: generateInitialAvatar(profile.name || 'User'),
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
      // 3. If it fails, check if it's the demo account
      if (email === 'citizen@demo.com' && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials')) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;
          
          const profile = FALLBACK_PROFILES[role];
          const userDoc: User = {
            uid: newUser.uid,
            email: email,
            role: role,
            name: profile.name || 'User',
            avatar: generateInitialAvatar(profile.name || 'User'),
            ...(profile.department && { department: profile.department }),
            ...(profile.locality && { locality: profile.locality })
          };
          
          await setDoc(doc(db, 'users', newUser.uid), userDoc);
          setUser(userDoc);
          return;
        } catch (signupError) {
          console.error("Demo signup failed:", signupError);
          throw signupError;
        }
      }
      
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole, locality?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      const profile = FALLBACK_PROFILES[role];
      const userDoc: User = {
        uid: newUser.uid,
        email: email,
        role: role,
        name: name.trim() || profile.name || 'User',
        avatar: generateInitialAvatar(name.trim() || profile.name || 'User'),
        locality: locality?.trim() || profile.locality || 'Unknown Locality',
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
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const userCredential = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const profile = FALLBACK_PROFILES[role];
      
      if (!userDocSnap.exists()) {
        const finalName = userCredential.user.displayName || profile.name || 'User';
        const userDoc: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          role: role,
          name: finalName,
          avatar: userCredential.user.photoURL || generateInitialAvatar(finalName),
          ...(profile.department && { department: profile.department }),
          ...(profile.locality && { locality: profile.locality })
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
        await deleteDoc(doc(db, 'users', user.uid));
        await deleteUser(auth.currentUser);
        setUser(null);
      } catch (error) {
        console.error("Delete account failed:", error);
        throw error;
      }
    }
  };

  const updateUserAvatar = async (url: string) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { avatar: url }, { merge: true });
      setUser({ ...user, avatar: url });
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

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      loginWithGoogle, 
      logout, 
      deleteAccount, 
      switchRole, 
      resetPassword,
      updateUserAvatar 
    }}>
      {!loading && children}
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
