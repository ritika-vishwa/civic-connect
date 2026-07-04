import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from './AuthContext';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { useAuth } from './AuthContext';

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
  isOfficial?: boolean;
}

export interface HistoryEvent {
  id: string;
  title: string;
  text: string;
  status: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  isAnonymous?: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  image: string;
  resolutionImage?: string;
  citizenName: string;
  citizenAvatar: string;
  createdAt: string;
  supportCount: number;
  isSupportedByCurrentUser: boolean;
  supportedBy: string[];
  department: string;
  assignedWorker?: string;
  authorId?: string;
  aiAnalysis?: {
    category: string;
    severity: string;
    confidence: number;
    duplicateFound: boolean;
    suggestedDepartment: string;
    suggestedTitle: string;
  };
  comments: Comment[];
  history: HistoryEvent[];
}

interface IssueContextProps {
  issues: Issue[];
  loading: boolean;
  addIssue: (issueData: Omit<Issue, 'id' | 'createdAt' | 'supportCount' | 'isSupportedByCurrentUser' | 'comments' | 'history' | 'status' | 'supportedBy'>) => Promise<string>;
  supportIssue: (id: string) => Promise<void>;
  addComment: (id: string, commentText: string, user: { name: string; avatar: string; role: UserRole }) => Promise<void>;
  updateStatus: (id: string, status: Issue['status'], updateText: string, resolutionImage?: string) => Promise<void>;
  assignWorker: (id: string, workerName: string, department: string) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
}

const IssueContext = createContext<IssueContextProps | undefined>(undefined);

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [rawIssues, setRawIssues] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for issues
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedIssues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRawIssues(fetchedIssues);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Issues Error: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Real-time listener for comments
  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(fetchedComments);
    }, (error) => {
      console.error("Firestore Comments Error: ", error);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Merge issues and comments to preserve UI expectations
  useEffect(() => {
    const merged = rawIssues.map(issue => {
      const issueComments = comments.filter(c => c.issueId === issue.id);

      const supportedByArray = issue.supportedBy || [];
      const isSupported = user ? supportedByArray.includes(user.uid) : false;
      const count = supportedByArray.length;

      return {
        ...issue,
        comments: issueComments,
        history: issue.history || [],
        isSupportedByCurrentUser: isSupported,
        supportCount: count
      } as Issue;
    });
    setIssues(merged);
  }, [rawIssues, comments, user]);

  const addIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'supportCount' | 'isSupportedByCurrentUser' | 'comments' | 'history' | 'status' | 'supportedBy'>) => {
    try {
      let imageUrl = issueData.image;

      // Upload image to Storage if it's a data URL
      if (imageUrl && imageUrl.startsWith('data:image')) {
        try {
          const imageRef = ref(storage, `issues/${Date.now()}`);
          // Add a 4-second timeout to the upload
          const uploadPromise = uploadString(imageRef, imageUrl, 'data_url').then(() => getDownloadURL(imageRef));
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Storage timeout")), 4000));

          imageUrl = await Promise.race([uploadPromise, timeoutPromise]) as string;
        } catch (e) {
          console.warn("Storage upload failed or timed out, attempting backend upload fallback.", e);
          try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            const formData = new FormData();
            formData.append('image', blob, `issue-${Date.now()}.jpg`);
            
            const uploadRes = await fetch('http://localhost:3001/api/upload', {
              method: 'POST',
              body: formData
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              imageUrl = uploadData.url;
            } else {
              throw new Error("Backend upload failed");
            }
          } catch (backendErr) {
            console.warn("Backend upload failed, falling back to default placeholder image.", backendErr);
            imageUrl = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800';
          }
        }
      }

      const finalCitizenName = issueData.isAnonymous ? "Anonymous Citizen" : issueData.citizenName;
      const finalAvatar = issueData.isAnonymous
        ? "https://api.dicebear.com/7.x/bottts/svg?seed=Anonymous&backgroundColor=031427"
        : issueData.citizenAvatar;

      const newIssueDoc = {
        ...issueData,
        citizenName: finalCitizenName,
        citizenAvatar: finalAvatar,
        image: imageUrl,
        status: 'Reported',
        createdAt: new Date().toISOString(),
        supportedBy: auth.currentUser ? [auth.currentUser.uid] : [],
        authorId: auth.currentUser ? auth.currentUser.uid : '',
        history: [
          {
            id: `h-${Date.now()}`,
            title: 'Report Filed',
            text: `Issue submitted by ${finalCitizenName}. Initial status: Reported.`,
            status: 'Reported',
            createdAt: new Date().toISOString()
          }
        ]
      };

      const docRef = await addDoc(collection(db, 'issues'), newIssueDoc);

      // Push global notification
      await addDoc(collection(db, 'notifications'), {
        type: issueData.severity === 'Critical' ? 'critical' : 'alert',
        title: 'New Issue Reported',
        description: `${finalCitizenName} reported a ${issueData.severity.toLowerCase()} severity issue in ${issueData.category}: ${issueData.title}`,
        time: new Date().toISOString(),
        isRead: false
      });

      return docRef.id;
    } catch (error) {
      console.error("Error adding issue:", error);
      throw error;
    }
  };

  const supportIssue = async (id: string) => {
    if (!user) return;
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    const isSupported = issue.isSupportedByCurrentUser;
    const issueRef = doc(db, 'issues', id);

    try {
      if (isSupported) {
        await updateDoc(issueRef, {
          supportedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(issueRef, {
          supportedBy: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error supporting issue:", error);
    }
  };

  const addComment = async (id: string, commentText: string, user: { name: string; avatar: string; role: UserRole }) => {
    const newComment = {
      issueId: id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      text: commentText,
      createdAt: new Date().toISOString(),
      isOfficial: user.role === 'official' || user.role === 'admin'
    };

    await addDoc(collection(db, 'comments'), newComment);

    if (newComment.isOfficial) {
      await addDoc(collection(db, 'notifications'), {
        type: 'system',
        title: 'Official Response',
        description: `An official responded to Ticket ${id}`,
        time: new Date().toISOString(),
        isRead: false
      });
    }
  };

  const updateStatus = async (id: string, status: Issue['status'], updateText: string, resolutionImage?: string) => {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    let resImageUrl = resolutionImage;
    if (resImageUrl && resImageUrl.startsWith('data:image')) {
      const imageRef = ref(storage, `resolutions/${id}-${Date.now()}`);
      await uploadString(imageRef, resImageUrl, 'data_url');
      resImageUrl = await getDownloadURL(imageRef);
    }

    const newEvent: HistoryEvent = {
      id: `h-${Date.now()}`,
      title: `Status Changed to ${status}`,
      text: updateText,
      status,
      createdAt: new Date().toISOString()
    };

    const updateData: any = {
      status,
      history: [...issue.history, newEvent]
    };
    if (resImageUrl) {
      updateData.resolutionImage = resImageUrl;
    }

    await updateDoc(doc(db, 'issues', id), updateData);

    await addDoc(collection(db, 'notifications'), {
      type: status === 'Resolved' || status === 'Closed' ? 'resolve' : 'system',
      title: `Ticket Updated: ${status}`,
      description: `Ticket ${id} status changed to ${status}.`,
      time: new Date().toISOString(),
      isRead: false
    });
  };

  const assignWorker = async (id: string, workerName: string, department: string) => {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    const newEvent: HistoryEvent = {
      id: `h-${Date.now()}`,
      title: 'Worker Assigned',
      text: `Assigned worker ${workerName} from the ${department} department.`,
      status: 'Assigned',
      createdAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'issues', id), {
      status: 'Assigned',
      assignedWorker: workerName,
      department,
      history: [...issue.history, newEvent]
    });
  };

  const deleteIssue = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'issues', id));
      
      // Also delete related comments
      const relatedComments = comments.filter(c => c.issueId === id);
      for (const comment of relatedComments) {
        await deleteDoc(doc(db, 'comments', comment.id));
      }
    } catch (error) {
      console.error("Error deleting issue: ", error);
      throw error;
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    try {
      const issueRef = doc(db, 'issues', id);
      await updateDoc(issueRef, updates);
    } catch (error) {
      console.error("Error updating issue: ", error);
      throw error;
    }
  };

  return (
    <IssueContext.Provider value={{ issues, loading, addIssue, supportIssue, addComment, updateStatus, assignWorker, deleteIssue, updateIssue }}>
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};
export default IssueContext;
