import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  deleteUser,
  setPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
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
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole, locality?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
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

    let userDocUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen to Firestore document in real-time
        userDocUnsubscribe = onSnapshot(userDocRef, async (userDocSnap) => {
          if (userDocSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDocSnap.data() } as User);
          } else {
            // Document doesn't exist, create fallback citizen
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
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setUser(null);
          setLoading(false);
        });
      } else {
        if (userDocUnsubscribe) {
          userDocUnsubscribe();
          userDocUnsubscribe = null;
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (userDocUnsubscribe) userDocUnsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Load role from Firestore — do NOT overwrite it
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // Always use the role stored in Firestore — cannot be overridden from UI
        setUser({ uid: userCredential.user.uid, ...userDocSnap.data() } as User);
      } else {
        // Brand-new account with no Firestore doc yet — default to citizen
        const newUser: User = {
          uid: userCredential.user.uid,
          email: email,
          role: 'citizen',
          name: 'New Citizen',
          avatar: generateInitialAvatar('New Citizen')
        };
        await setDoc(userDocRef, newUser);
        setUser(newUser);
      }
      
    } catch (error: any) {
      console.error('Login failed:', error);
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

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const userCredential = await signInWithPopup(auth, provider);
      
      const email = userCredential.user.email || '';
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        let assignedRole: UserRole = 'citizen';

        // If no document exists for this exact UID, check if this email exists elsewhere in the database 
        // (e.g. pre-provisioned by an admin). If so, inherit that role.
        if (email) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const existingUserDoc = querySnapshot.docs[0].data();
            if (existingUserDoc.role) {
              assignedRole = existingUserDoc.role as UserRole;
            }
          }
        }

        // Create the Google user with the resolved role
        const finalName = userCredential.user.displayName || 'Citizen User';
        const userDoc: User = {
          uid: userCredential.user.uid,
          email: email,
          role: assignedRole,
          name: finalName,
          avatar: userCredential.user.photoURL || generateInitialAvatar(finalName),
          locality: 'Unknown Locality'
        };
        await setDoc(userDocRef, userDoc);
        setUser(userDoc);
      } else {
        // Existing account: always load role from Firestore — never overwrite it
        setUser({ uid: userCredential.user.uid, ...userDocSnap.data() } as User);
      }
    } catch (popupError: any) {
      console.warn("signInWithPopup failed, trying redirect fallback:", popupError);
      
      // If it is an unauthorized domain error, throw it so the UI can warn the developer
      if (popupError.code === 'auth/unauthorized-domain') {
        throw popupError;
      }
      
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError: any) {
        console.error("signInWithRedirect failed:", redirectError);
        throw redirectError;
      }
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
