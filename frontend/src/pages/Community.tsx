import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'citizen' | 'officer' | 'admin';
  isOfficial?: boolean;
  title: string;
  description: string;
  image?: string;
  upvotes: number;
  hasUpvoted: boolean;
  commentsCount: number;
  createdAt: string;
  comments: {
    id: string;
    userName: string;
    text: string;
    createdAt: string;
  }[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: 'p-1',
    authorName: 'Department of Parks & Recreation',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    authorRole: 'admin',
    isOfficial: true,
    title: 'Downtown Park Revitalization Completed',
    description: 'We are thrilled to announce that the playground equipment replacement and landscaping at Sector 3 Downtown Park has been finalized. Thank you to everyone who provided feedback on this design! Enjoy the new green space.',
    image: 'https://images.unsplash.com/photo-1548625361-155de6c7f54d?auto=format&fit=crop&q=80&w=800',
    upvotes: 112,
    hasUpvoted: false,
    commentsCount: 2,
    createdAt: '2026-07-02T10:00:00Z',
    comments: [
      { id: 'c-1', userName: 'Arthur Dent', text: 'This looks fantastic! The kids are going to love the new swings.', createdAt: '2026-07-02T11:00:00Z' },
      { id: 'c-2', userName: 'Sarah Connor', text: 'Great work! Thanks for addressing the safety netting request.', createdAt: '2026-07-02T12:30:00Z' }
    ]
  },
  {
    id: 'p-2',
    authorName: 'Arthur Dent',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    authorRole: 'citizen',
    title: 'Community Cleanup Drive - Join Us!',
    description: 'Looking for volunteers this Saturday morning at 9:00 AM. We will be clearing garbage along the West Park walkway. Garbage bags and picker tools will be provided by the local Sanitation office. Let us clean up our neighborhood!',
    upvotes: 45,
    hasUpvoted: false,
    commentsCount: 1,
    createdAt: '2026-07-03T08:00:00Z',
    comments: [
      { id: 'c-3', userName: 'Ford Prefect', text: 'Count me in. Bringing a couple of friends along.', createdAt: '2026-07-03T09:15:00Z' }
    ]
  }
];

export const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  const { user } = useAuth();
  const { showToast } = useNotification();

  const handleUpvote = (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const upvoted = !post.hasUpvoted;
          return {
            ...post,
            hasUpvoted: upvoted,
            upvotes: post.upvotes + (upvoted ? 1 : -1)
          };
        }
        return post;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !user) return;

    const newPost: Post = {
      id: `p-${Date.now()}`,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.role,
      isOfficial: user.role !== 'citizen',
      title: newTitle,
      description: newDesc,
      upvotes: 1,
      hasUpvoted: true,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewDesc('');
    setShowForm(false);
    showToast('Community post published!', 'success');
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim() || !user) return;

    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [
              ...post.comments,
              {
                id: `c-${Date.now()}`,
                userName: user.name,
                text: newCommentText,
                createdAt: new Date().toISOString()
              }
            ]
          };
        }
        return post;
      })
    );

    setNewCommentText('');
    showToast('Comment posted', 'success');
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
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="primary-btn rounded-xl py-3 px-5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">rate_review</span>
          {showForm ? 'Close Editor' : 'Publish Notice'}
        </button>
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
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer transition-colors ${
                    post.hasUpvoted ? 'text-primary-container' : 'text-white/50 hover:text-white'
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
