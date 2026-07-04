import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Timeline } from '../components/ui/Timeline';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EditIssueModal } from '../components/ui/EditIssueModal';
import {
  canEditOwnIssue,
  canDeleteOwnIssue,
  canSupportIssue,
  canParticipateInDiscussions,
} from '../context/permissions';

export const IssueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { issues, loading, supportIssue, addComment, deleteIssue, updateIssue } = useIssues();
  const { user } = useAuth();
  const { showToast } = useNotification();


  const [commentText, setCommentText] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const issue = issues.find((i) => i.id === id);

  // Show skeleton while Firestore is still fetching
  if (loading && !issue) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <div className="w-full h-80 rounded-2xl skeleton-shimmer border border-white/5"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-4">
            <div className="h-32 rounded-2xl skeleton-shimmer border border-white/5"></div>
            <div className="h-48 rounded-2xl skeleton-shimmer border border-white/5"></div>
            <div className="h-64 rounded-2xl skeleton-shimmer border border-white/5"></div>
          </div>
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
            <div className="h-48 rounded-2xl skeleton-shimmer border border-white/5"></div>
            <div className="h-32 rounded-2xl skeleton-shimmer border border-white/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-4 animate-fade-in-up">
        <span className="material-symbols-outlined text-[64px] text-error neon-glow-error">report_off</span>
        <h2 className="font-display-lg text-2xl font-black text-white uppercase tracking-wider">Report Not Found</h2>
        <p className="text-white/60 text-xs font-mono uppercase tracking-widest">
          The requested ticket ID: {id} does not exist on our nodes.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-glass mt-6 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSupport = () => {
    supportIssue(issue.id);
    showToast(
      issue.isSupportedByCurrentUser 
        ? 'Removed your endorsement' 
        : 'Endorsed this report! Alert sent to municipal supervisors.',
      issue.isSupportedByCurrentUser ? 'info' : 'success'
    );
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    addComment(issue.id, commentText, {
      name: user.name,
      avatar: user.avatar,
      role: user.role
    });

    setCommentText('');
    showToast('Official comment posted!', 'success');
  };

  const canEdit = canEditOwnIssue(user, issue);
  const canDelete = canDeleteOwnIssue(user, issue);
  const canSupport = canSupportIssue(user);
  const canComment = canParticipateInDiscussions(user);

  const handleDeleteConfirm = async () => {
    try {
      await deleteIssue(issue.id);
      showToast("Report deleted successfully", "success");
      navigate('/');
    } catch (e) {
      showToast("Failed to delete report", "error");
    }
  };

  const handleEditSave = async (updates: Partial<Issue>) => {
    try {
      await updateIssue(issue.id, updates);
      showToast("Report updated successfully", "success");
      setShowEditModal(false);
    } catch (e) {
      showToast("Failed to update report", "error");
    }
  };

  // Nearby issues mock (excluding current issue)
  const nearbyIssues = issues
    .filter((i) => i.id !== issue.id && i.category === issue.category)
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in-up">
      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowConfirmDelete(false)}
        isDestructive={true}
      />
      
      <EditIssueModal
        isOpen={showEditModal}
        issue={issue}
        onSave={handleEditSave}
        onCancel={() => setShowEditModal(false)}
      />

      {/* Hero Image Section */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-surface-container-lowest">
        <img 
          src={issue.image} 
          alt={issue.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031427] via-[#031427]/40 to-transparent" />
        
        {/* Floating Details */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono text-primary-container bg-primary-container/15 border border-primary-container/30 px-3 py-1 rounded-md font-bold uppercase tracking-widest">
                Ticket {issue.id}
              </span>
              <StatusBadge value={issue.severity} type="severity" />
              <StatusBadge value={issue.status} type="status" />
            </div>
            <h1 className="font-display-lg text-2xl md:text-4xl font-black text-white uppercase tracking-tight drop-shadow-md mt-4">
              {issue.title}
            </h1>
            <p className="text-xs font-mono text-white/50 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span>
              {issue.location.address}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border border-error/50 bg-error/10 text-error hover:bg-error hover:text-white transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button
              onClick={handleSupport}
              disabled={!canSupport}
              title={!canSupport ? 'Log in to endorse this report' : ''}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all flex items-center gap-2 shrink-0 ${
                !canSupport
                  ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10 text-white/50'
                  : issue.isSupportedByCurrentUser
                    ? 'bg-primary-container text-black border-primary-container shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer'
                    : 'btn-glass text-white cursor-pointer'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">thumb_up</span>
              <span>{issue.supportCount} Endorsements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Description, Timeline, Comments */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-gutter">
          
          {/* Ticket Description */}
          <GlassCard noHover className="p-6 md:p-8">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight mb-4 border-b border-white/10 pb-3">
              Description
            </h3>
            <p className="text-sm text-white/80 font-light leading-relaxed whitespace-pre-line">
              {issue.description}
            </p>
          </GlassCard>

          {/* Timeline Tracking */}
          <GlassCard noHover className="p-6 md:p-8">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">route</span>
              Resolution History
            </h3>
            <Timeline events={issue.history} />
          </GlassCard>

          {/* Comments Feed */}
          <GlassCard noHover className="p-6 md:p-8">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">forum</span>
              Citizen & Official Updates ({issue.comments.length})
            </h3>
            
            {/* Feed List */}
            <div className="flex flex-col gap-4 mb-6">
              {issue.comments.map((comment) => (
                <div 
                  key={comment.id}
                  className={`p-4 rounded-xl border flex gap-4 ${
                    comment.isOfficial 
                      ? 'bg-primary-container/5 border-primary-container/30 text-white' 
                      : 'bg-black/10 border-white/5 text-white/90'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-surface-container-lowest">
                    <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1.5 uppercase">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{comment.userName}</span>
                        {comment.isOfficial && (
                          <span className="bg-primary-container/20 border border-primary-container/30 text-primary-container text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded leading-none">OFFICIAL</span>
                        )}
                      </div>
                      <span className="text-white/40">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-light leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}

              {issue.comments.length === 0 && (
                <div className="py-6 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
                  No comments or updates yet on this ticket.
                </div>
              )}
            </div>

            {/* Post Comment Input - only for logged-in users who can participate */}
            {canComment && (
              <form onSubmit={handlePostComment} className="flex gap-2 border-t border-white/10 pt-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post comment or official municipal update..."
                  className="input-glass px-4 py-3 rounded-xl text-xs w-full font-mono uppercase tracking-widest"
                  required
                />
                <button 
                  type="submit"
                  className="btn-gradient-cyan px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  Post
                </button>
              </form>
            )}
          </GlassCard>

        </div>

        {/* Right Column: Mini Map, AI Analysis, Nearby Issues */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-gutter">
          
          {/* Mini Map Pin */}
          <GlassCard noHover className="p-2 h-64 overflow-hidden relative">
            <MapContainer
              center={[issue.location.lat, issue.location.lng]}
              zoom={14}
              scrollWheelZoom={false}
              zoomControl={false}
              className="w-full h-full rounded-xl z-10"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              <Marker position={[issue.location.lat, issue.location.lng]} />
            </MapContainer>
            
            {/* Coordinate display */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
              <div className="bg-[#00060d]/80 backdrop-blur-md px-3 py-1.5 rounded border border-primary-container/40 text-[9px] font-mono text-primary-container font-semibold uppercase">
                {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
              </div>
            </div>
          </GlassCard>

          {/* AI insights panel */}
          {issue.aiAnalysis && (
            <GlassCard noHover className="p-5 border border-primary-container/20">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary-container font-bold mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] animate-pulse">psychology</span>
                AI Telemetry Insights
              </h4>
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="text-[10px] text-white/50 font-mono">Confidence Level</span>
                <span className="text-sm font-bold font-mono text-white">{(issue.aiAnalysis.confidence * 100).toFixed(0)}% Match</span>
              </div>
              <div className="flex flex-col gap-2 font-mono text-[9px] uppercase tracking-wider text-white/60">
                <div className="flex justify-between">
                  <span>Suggested Category</span>
                  <span className="text-white font-bold">{issue.aiAnalysis.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Suggested Dept</span>
                  <span className="text-white font-bold">{issue.aiAnalysis.suggestedDepartment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duplicate Heuristics</span>
                  <span className={issue.aiAnalysis.duplicateFound ? 'text-error font-bold' : 'text-green-400 font-bold'}>
                    {issue.aiAnalysis.duplicateFound ? 'Duplicate Found' : 'Verified Unique'}
                  </span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Nearby Similar Issues */}
          <GlassCard noHover className="p-5">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">
              Nearby Similar Issues
            </h4>
            <div className="flex flex-col gap-3">
              {nearbyIssues.map((nearby) => (
                <div 
                  key={nearby.id}
                  onClick={() => navigate(`/issues/${nearby.id}`)}
                  className="p-3 bg-black/10 border border-white/5 rounded-xl hover:border-primary-container/30 cursor-pointer flex gap-3 transition-all"
                >
                  <img src={nearby.image} alt={nearby.title} className="w-12 h-10 object-cover rounded-lg border border-white/10 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-bold text-white uppercase tracking-tight truncate">{nearby.title}</div>
                    <span className="text-[8px] font-mono text-primary-container mt-0.5 block">{nearby.id} • {nearby.status}</span>
                  </div>
                </div>
              ))}
              {nearbyIssues.length === 0 && (
                <div className="text-center text-[10px] font-mono text-white/30 py-2">
                  No other issues in this sector.
                </div>
              )}
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
export default IssueDetails;
