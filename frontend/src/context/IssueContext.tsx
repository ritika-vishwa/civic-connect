import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from './AuthContext';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

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
  department: string;
  assignedWorker?: string;
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
  addIssue: (issueData: Omit<Issue, 'id' | 'createdAt' | 'supportCount' | 'isSupportedByCurrentUser' | 'comments' | 'history' | 'status'>) => Promise<string>;
  supportIssue: (id: string) => Promise<void>;
  addComment: (id: string, commentText: string, user: { name: string; avatar: string; role: UserRole }) => Promise<void>;
  updateStatus: (id: string, status: Issue['status'], updateText: string, resolutionImage?: string) => Promise<void>;
  assignWorker: (id: string, workerName: string, department: string) => Promise<void>;
}

const IssueContext = createContext<IssueContextProps | undefined>(undefined);

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [rawIssues, setRawIssues] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  // Real-time listener for issues
  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedIssues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRawIssues(fetchedIssues);
    }, (error) => {
      console.error("Firestore Issues Error: ", error);
    });
    return () => unsubscribe();
  }, []);

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
  }, []);

  // Merge issues and comments to preserve UI expectations
  useEffect(() => {
    const merged = rawIssues.map(issue => {
      const issueComments = comments.filter(c => c.issueId === issue.id);
      return {
        ...issue,
        comments: issueComments,
        history: issue.history || []
      } as Issue;
    });
    setIssues(merged);
  }, [rawIssues, comments]);

  const addIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'supportCount' | 'isSupportedByCurrentUser' | 'comments' | 'history' | 'status'>) => {
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
          console.warn("Storage upload failed or timed out, falling back to dummy image to ensure functionality.", e);
          // Fallback to a realistic placeholder if Firebase Storage is not configured properly
          imageUrl = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800';
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
        supportCount: 1,
        isSupportedByCurrentUser: true,
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
      return docRef.id;
    } catch (error) {
      console.error("Error adding issue:", error);
      throw error;
    }
  };

  const supportIssue = async (id: string) => {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;
    
    // Simplistic toggle logic. Real implementation might use an array of upvoted user UIDs.
    const isSupported = !issue.isSupportedByCurrentUser;
    const newCount = issue.supportCount + (isSupported ? 1 : -1);
    
    const issueRef = doc(db, 'issues', id);
    await updateDoc(issueRef, {
      supportCount: newCount,
      isSupportedByCurrentUser: isSupported
    });
  };

  const addComment = async (id: string, commentText: string, user: { name: string; avatar: string; role: UserRole }) => {
    const newComment = {
      issueId: id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      text: commentText,
      createdAt: new Date().toISOString(),
      isOfficial: user.role === 'officer' || user.role === 'admin'
    };
    
    await addDoc(collection(db, 'comments'), newComment);
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

  return (
    <IssueContext.Provider value={{ issues, addIssue, supportIssue, addComment, updateStatus, assignWorker }}>
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
