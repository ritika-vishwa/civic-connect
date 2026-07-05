import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { GlassCard } from '../components/ui/GlassCard';
import { IssueCard } from '../components/ui/IssueCard';
import { ImageCropModal } from '../components/ui/ImageCropModal';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNotification } from '../context/NotificationContext';
import { CitizenProfileStats } from '../components/profile/CitizenProfileStats';
import { OfficialProfileStats } from '../components/profile/OfficialProfileStats';
import { AdminProfileStats } from '../components/profile/AdminProfileStats';
import { ModeratorProfileStats } from '../components/profile/ModeratorProfileStats';

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 2000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const Profile: React.FC = () => {
  const { user, logout, deleteAccount, updateUserAvatar } = useAuth();
  const { issues } = useIssues();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'events'), where('registeredBy', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMyEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setShowDeleteModal(false);
      showToast("Failed to delete account. Please try again.", "error");
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
      };
      reader.onerror = () => {
        showToast('Failed to read file.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!user) return;
    setCropImageSrc(null);
    setIsUploading(true);

    try {
      let avatarUrl = '';
      try {
        const formData = new FormData();
        formData.append('image', croppedFile);
        
        const response = await fetchWithTimeout(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
          method: 'POST',
          body: formData,
        }, 15000);

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        avatarUrl = data.url;
      } catch (uploadErr) {
        throw uploadErr;
      }

      await updateUserAvatar(avatarUrl);
      showToast('Avatar updated successfully!', 'success');
    } catch (error) {
      console.error("Avatar upload failed:", error);
      showToast('Failed to upload avatar. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteProfileImage = async () => {
    if (!user) return;
    setIsUploading(true);
    try {
      const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
      await updateUserAvatar(defaultAvatar);
      showToast('Profile image deleted successfully!', 'success');
    } catch (error) {
      console.error("Failed to delete profile image:", error);
      showToast('Failed to delete profile image. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  // Filter to just the user's issues securely by UID
  const myIssues = issues.filter(
    (issue) => issue.authorId === user.uid
  );

  // Statistics
  const reportsCount = myIssues.length;
  const totalEndorsements = myIssues.reduce((acc, curr) => acc + curr.supportCount, 0);
  const resolvedCount = myIssues.filter((i) => i.status === 'Resolved').length;
  
  // Basic heuristic for community participation points
  const participationScore = reportsCount * 15 + totalEndorsements * 5 + resolvedCount * 25;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            My Profile
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            {user.role === 'admin' && 'Manage your global network and permissions.'}
            {user.role === 'official' && 'Review your assigned queue and dispatch log.'}
            {user.role === 'moderator' && 'Manage community health and verify reports.'}
            {user.role === 'citizen' && 'Manage your network node and engagement history.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-primary-container/10 hover:bg-primary-container/20 text-primary-container border border-primary-container/30 px-4 py-2 rounded-xl font-label-caps text-xs tracking-widest uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Log Out
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-error/10 hover:bg-error/20 text-error border border-error/30 px-4 py-2 rounded-xl font-label-caps text-xs tracking-widest uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(255,180,171,0.1)]"
          >
            <span className="material-symbols-outlined text-lg">delete_forever</span>
            Delete Account
          </button>
        </div>
      </div>

      {/* User Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* User Card */}
        <div className="col-span-1 lg:col-span-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <GlassCard noHover className="flex flex-col items-center text-center p-8 border border-white/10">
            
            {/* Avatar Upload Container */}
            <div className="relative group w-24 h-24 mb-4">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-primary-container shadow-[0_0_20px_rgba(0,240,255,0.3)] bg-surface-container-lowest">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all rounded-2xl flex flex-col items-center justify-center border border-primary-container border-dashed overflow-hidden">
                {isUploading ? (
                  <span className="material-symbols-outlined text-primary-container text-2xl animate-spin">progress_activity</span>
                ) : (
                  <div className="flex w-full h-full">
                    {/* View Button */}
                    <button 
                      onClick={() => setLightboxOpen(true)}
                      className="flex-1 flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
                      title="View Avatar"
                    >
                      <span className="material-symbols-outlined text-primary-container text-lg">visibility</span>
                      <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-primary-container mt-0.5">View</span>
                    </button>
                    <div className="w-[1px] bg-white/20 h-full"></div>
                    {/* Upload Button */}
                    <label className="flex-1 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer" title="Upload Avatar">
                      <span className="material-symbols-outlined text-primary-container text-lg">add_a_photo</span>
                      <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-primary-container mt-0.5">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} disabled={isUploading} />
                    </label>
                    {/* Only show delete if current avatar is not a default Dicebear initials one */}
                    {!user.avatar.includes('dicebear.com') && (
                      <>
                        <div className="w-[1px] bg-white/20 h-full"></div>
                        <button 
                          onClick={deleteProfileImage}
                          className="flex-1 flex flex-col items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Avatar"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                          <span className="text-[7px] font-mono font-bold uppercase tracking-wider mt-0.5">Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">{user.name}</h3>
            <p className="text-xs font-mono text-primary-container uppercase tracking-widest mt-1">
              Terminal: {user.role.toUpperCase()}
            </p>
            {user.department && (
              <p className="text-[10px] font-mono text-purple-300 uppercase mt-0.5">
                Dept: {user.department}
              </p>
            )}
            {user.locality && (
              <p className="text-[10px] font-mono text-blue-300 uppercase mt-0.5 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                {user.locality}
              </p>
            )}

            <div className="w-full border-t border-white/10 my-6 pt-6 flex flex-col gap-3 font-mono text-[10px] uppercase text-white/50 tracking-wider">
              <div className="flex justify-between">
                <span>Node ID</span>
                <span className="text-white font-bold">{user.uid}</span>
              </div>
              <div className="flex justify-between">
                <span>Email Address</span>
                <span className="text-white font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Access Status</span>
                <span className="text-green-400 font-bold">Verified (Active)</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Dynamic Engagement Statistics / Profile View based on Role */}
        {user.role === 'admin' ? (
          <AdminProfileStats />
        ) : user.role === 'official' ? (
          <OfficialProfileStats issues={issues} user={user} />
        ) : user.role === 'moderator' ? (
          <ModeratorProfileStats issues={issues} />
        ) : (
          <CitizenProfileStats 
            reportsCount={reportsCount} 
            totalEndorsements={totalEndorsements}
            resolvedCount={resolvedCount}
            participationScore={participationScore}
            myIssues={myIssues}
            myEvents={myEvents}
          />
        )}

      </div>

      {/* Custom Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00060d]/80 backdrop-blur-sm px-4 animate-fade-in-up">
          <div className="bg-[#031427] border border-error/30 p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(255,180,171,0.15)] flex flex-col gap-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center border border-error/20 text-error">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h3 className="font-display-lg text-2xl font-black text-white uppercase tracking-tight">Delete Account?</h3>
              <p className="text-on-surface-variant font-body-sm leading-relaxed text-sm">
                This action is irreversible. All your civic endorsements, active reports, and personal data will be permanently scrubbed from the network.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 relative z-10 mt-2">
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-error hover:bg-error/90 text-[#410002] font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                Confirm Deletion
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all border border-white/10"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}

      {cropImageSrc && (
        <ImageCropModal 
          imageSrc={cropImageSrc} 
          onClose={() => setCropImageSrc(null)} 
          onCropComplete={handleCropComplete} 
        />
      )}
      
      {lightboxOpen && (
        <ImageLightbox 
          imageSrc={user.avatar} 
          onClose={() => setLightboxOpen(false)} 
        />
      )}
    </div>
  );
};
export default Profile;
