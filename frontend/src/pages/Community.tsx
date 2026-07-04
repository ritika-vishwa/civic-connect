import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import {
  canParticipateInDiscussions,
  canSupportIssue,
  canModerateContent,
  canDeleteAnyPost,
} from '../context/permissions';

interface Comment {
  id: string;
  postId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'citizen' | 'officer' | 'admin' | 'moderator';
  isOfficial?: boolean;
  title: string;
  description: string;
  image?: string;
  upvotes: number;
  hasUpvoted: boolean;
  upvotedBy: string[];
  commentsCount: number;
  createdAt: string;
  comments: Comment[];
}

export const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [rawPosts, setRawPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { showToast } = useNotification();

  const canPost = canParticipateInDiscussions(user);
  const canUpvote = canSupportIssue(user);
  const canModerate = canModerateContent(user);
  const canDeletePost = canDeleteAnyPost(user);

  // Firestore Listeners
  React.useEffect(() => {
    const q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRawPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const q = query(collection(db, 'community_comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });
    return () => unsubscribe();
  }, []);

  // Merge Data
  React.useEffect(() => {
    const merged = rawPosts.map(post => {
      const postComments = comments.filter(c => c.postId === post.id);
      const upvotedByArray = post.upvotedBy || [];
      return {
        ...post,
        comments: postComments,
        commentsCount: postComments.length,
        hasUpvoted: user ? upvotedByArray.includes(user.uid) : false,
        upvotes: upvotedByArray.length > 0 ? upvotedByArray.length : (post.upvotes || 0)
      } as Post;
    });
    setPosts(merged);
  }, [rawPosts, comments, user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!user || !canUpvote) {
      showToast('Please log in to upvote posts', 'warning');
      return;
    }
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const postRef = doc(db, 'community_posts', postId);
    try {
      if (post.hasUpvoted) {
        await updateDoc(postRef, { upvotedBy: arrayRemove(user.uid) });
      } else {
        await updateDoc(postRef, { upvotedBy: arrayUnion(user.uid) });
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to upvote post', 'error');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !user || !canPost) return;

    try {
      let finalImageUrl = null;
      if (imagePreview) {
        const imageRef = ref(storage, `community/${Date.now()}`);
        const uploadPromise = uploadString(imageRef, imagePreview, 'data_url').then(() => getDownloadURL(imageRef));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Storage timeout")), 4000));
        try {
          finalImageUrl = await Promise.race([uploadPromise, timeoutPromise]) as string;
        } catch (storageErr) {
          console.warn("Storage upload failed, falling back to dummy image.", storageErr);
          finalImageUrl = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800';
        }
      }

      await addDoc(collection(db, 'community_posts'), {
        authorName: user.name,
        authorAvatar: user.avatar,
        authorRole: user.role,
        isOfficial: user.role !== 'citizen',
        title: newTitle,
        description: newDesc,
        image: finalImageUrl,
        upvotedBy: [user.uid], // Author auto-upvotes
        createdAt: new Date().toISOString()
      });

      setNewTitle('');
      setNewDesc('');
      setImagePreview(null);
      setShowForm(false);
      showToast('Community post published!', 'success');
    } catch (error) {
      console.error("Post creation failed", error);
      showToast('Failed to publish post', 'error');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim() || !user || !canPost) {
      if (!canPost) showToast('You must be logged in to comment', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'community_comments'), {
        postId,
        userName: user.name,
        text: newCommentText,
        createdAt: new Date().toISOString()
      });
      setNewCommentText('');
      showToast('Comment posted', 'success');
    } catch (error) {
      console.error("Comment failed", error);
      showToast('Failed to post comment', 'error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!canDeletePost) return;
    try {
      await deleteDoc(doc(db, 'community_posts', postId));
      showToast('Post removed by moderator', 'success');
    } catch (error) {
      showToast('Failed to remove post', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Community Feed
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Citizen noticeboard and municipal announcements.
          </p>
        </div>
        
        {/* Publish post CTA - only for users who can post */}
        {canPost && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="primary-btn rounded-xl py-3 px-5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">rate_review</span>
            {showForm ? 'Close Editor' : 'Publish Notice'}
          </button>
        )}
      </div>

      {/* Write Post Box */}
      {showForm && (
        <div className="animate-fade-in-up">
          <GlassCard noHover className="p-6 border border-primary-container/40">
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight">Create Community Post</h3>
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Post Title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-glass px-4 py-2.5 rounded-xl font-semibold text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <textarea
                  placeholder="Share details, updates, or organize events..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-glass px-4 py-2.5 rounded-xl text-xs h-28 leading-relaxed"
                  required
                />
              </div>

              {/* Image Upload for Post */}
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl bg-black/20">
                  <span className="material-symbols-outlined text-[18px]">image</span>
                  {imagePreview ? 'Change Image' : 'Attach Image'}
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="relative w-16 h-12 rounded overflow-hidden border border-primary-container/30">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-0 right-0 bg-black/50 text-white p-0.5"
                    >
                      <span className="material-symbols-outlined text-[10px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="btn-gradient-cyan self-end px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Post Notice
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Feed List */}
      <div className="flex flex-col gap-6">
        {posts.map((post, idx) => (
          <div key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
            <GlassCard noHover className={`border ${post.isOfficial ? 'border-primary-container/40' : 'border-white/10'}`}>
              
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                  <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white uppercase tracking-wide">{post.authorName}</span>
                    {post.isOfficial && (
                      <span className="bg-primary-container/10 border border-primary-container/30 text-primary-container text-[8px] font-bold font-mono uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">verified</span> Official
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-white/40">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Title & Desc */}
              <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-2">{post.title}</h4>
              <p className="text-sm text-white/70 font-light leading-relaxed mb-4">{post.description}</p>

              {/* Image if any */}
              {post.image && (
                <div className="w-full max-h-96 overflow-hidden rounded-xl border border-white/10 mb-4 bg-surface-container-lowest">
                  <img src={post.image} alt={post.title} className="w-full object-cover" />
                </div>
              )}

              {/* Interactions bar */}
              <div className="flex items-center gap-6 border-t border-white/10 pt-4 mt-2">
                <button
                  onClick={() => handleUpvote(post.id)}
                  disabled={!canUpvote}
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold transition-colors ${
                    !canUpvote
                      ? 'text-white/30 cursor-not-allowed'
                      : post.hasUpvoted
                        ? 'text-primary-container cursor-pointer'
                        : 'text-white/50 hover:text-white cursor-pointer'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post.hasUpvoted ? "'FILL' 1" : "'FILL' 0" }}>
                    thumb_up
                  </span>
                  <span>{post.upvotes} UPVOTES</span>
                </button>

                <button
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-white/50 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                  <span>{post.commentsCount} COMMENTS</span>
                </button>

                {/* Moderator delete button */}
                {canDeletePost && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="ml-auto flex items-center gap-1.5 text-xs font-mono font-bold text-error/60 hover:text-error cursor-pointer transition-colors"
                    title="Remove post (Moderator action)"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove_moderator</span>
                    Remove
                  </button>
                )}
              </div>

              {/* Comments Section */}
              {activeCommentPostId === post.id && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-4 bg-black/10 p-4 rounded-xl">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col text-xs leading-relaxed">
                      <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-1">
                        <span className="font-bold text-white/60">{comment.userName}</span>
                        <span>
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-white/80 font-light">{comment.text}</p>
                    </div>
                  ))}

                  {/* Comment input - only for users who can participate */}
                  {canPost ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="input-glass px-3 py-2 rounded-xl text-xs w-full font-mono uppercase tracking-wider"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="btn-gradient-cyan px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Post
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest text-center py-2">
                      Log in to participate in discussions
                    </p>
                  )}
                </div>
              )}

            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Community;
