import { UserRole } from './AuthContext';

export interface User {
  uid: string;
  role: UserRole;
  department?: string;
  authorId?: string;
}

// ─── Permission Definitions ──────────────────────────────────────────────────

/** Can view public content (issues, map, events, discussions) */
export const canViewPublic = () => true;

/** Must be logged in to perform this action */
export const canPerformAuthenticatedAction = (user: User | null): boolean => {
  return !!user;
};

/** Citizens, moderators, and admins can report issues */
export const canReportIssue = (user: User | null): boolean => {
  if (!user) return false;
  return ['citizen', 'moderator', 'admin'].includes(user.role);
};

/** Can participate in community discussions (comment on posts) */
export const canParticipateInDiscussions = (user: User | null): boolean => {
  if (!user) return false;
  return ['citizen', 'official', 'moderator', 'admin'].includes(user.role);
};

/** Can create top-level community posts / notices / announcements */
export const canCreateCommunityPost = (user: User | null): boolean => {
  if (!user) return false;
  return ['official', 'moderator', 'admin'].includes(user.role);
};

/** Can support/endorse a complaint */
export const canSupportIssue = (user: User | null): boolean => {
  if (!user) return false;
  return ['citizen', 'moderator', 'admin'].includes(user.role);
};

/** Can register for events or volunteer */
export const canRegisterForEvents = (user: User | null): boolean => {
  if (!user) return false;
  return ['citizen', 'moderator', 'admin'].includes(user.role);
};

/** Can create community events */
export const canCreateEvents = (user: User | null): boolean => {
  if (!user) return false;
  return ['official', 'moderator', 'admin'].includes(user.role);
};

/** Can edit their own report ONLY before it's been assigned */
export const canEditOwnIssue = (
  user: User | null,
  issue: { authorId?: string; citizenName?: string; status?: string }
): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true; // Admin can always edit
  const isAuthor =
    (issue.authorId && issue.authorId === user.uid) ||
    (!issue.authorId && issue.citizenName === (user as any).name);
  const isBeforeAssignment = !['Assigned', 'In Progress', 'Resolved', 'Closed'].includes(issue.status || '');
  return isAuthor && isBeforeAssignment && ['citizen', 'moderator'].includes(user.role);
};

/** Can delete their own report (citizens only before assignment; admins always) */
export const canDeleteOwnIssue = (
  user: User | null,
  issue: { authorId?: string; citizenName?: string; status?: string }
): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const isAuthor =
    (issue.authorId && issue.authorId === user.uid) ||
    (!issue.authorId && issue.citizenName === (user as any).name);
  const isBeforeAssignment = !['Assigned', 'In Progress', 'Resolved', 'Closed'].includes(issue.status || '');
  return isAuthor && isBeforeAssignment && user.role === 'citizen';
};

/** Can update official complaint status (officers for their dept, admins always) */
export const canUpdateIssueStatus = (
  user: User | null,
  issue?: { department?: string }
): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'official') {
    if (!issue) return true; // General officer access
    return !issue.department || !user.department || issue.department === user.department;
  }
  return false;
};

/** Can assign field workers */
export const canAssignWorkers = (user: User | null): boolean => {
  if (!user) return false;
  return ['official', 'admin'].includes(user.role);
};

/** Can upload resolution evidence */
export const canUploadResolutionEvidence = (user: User | null): boolean => {
  if (!user) return false;
  return ['official', 'admin'].includes(user.role);
};

/** Can post official updates/comments on issues */
export const canPostOfficialUpdate = (user: User | null): boolean => {
  if (!user) return false;
  return ['official', 'admin'].includes(user.role);
};

/** Can moderate community discussions (remove posts, verify issues) */
export const canModerateContent = (user: User | null): boolean => {
  if (!user) return false;
  return ['moderator', 'admin'].includes(user.role);
};

/** Can remove/delete any community post */
export const canDeleteAnyPost = (user: User | null): boolean => {
  if (!user) return false;
  return ['moderator', 'admin'].includes(user.role);
};

/** Can access Admin Management panel */
export const canAccessAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'admin';
};

/** Can access Officer Workspace */
export const canAccessOfficerWorkspace = (user: User | null): boolean => {
  if (!user) return false;
  return ['official', 'admin'].includes(user.role);
};

/** Can manage user roles and accounts */
export const canManageUsers = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'admin';
};

/** Can view analytics */
export const canViewAnalytics = (user: User | null): boolean => {
  if (!user) return false;
  return ['official', 'moderator', 'admin'].includes(user.role);
};

// ─── Role Labels & Metadata ───────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'Citizen',
  official: 'Municipal Official',
  moderator: 'Community Moderator',
  admin: 'Administrator',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  citizen: 'Report issues, join discussions, attend events, and engage with your community.',
  official: 'Review assigned complaints, update statuses, dispatch field workers, and provide official updates.',
  moderator: 'Moderate discussions, verify reported issues, and manage community interactions.',
  admin: 'Full system access: users, roles, categories, departments, analytics, and settings.',
};

export const ROLE_COLOR: Record<UserRole, string> = {
  citizen: 'text-blue-300 border-blue-400/30 bg-blue-400/10',
  official: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
  moderator: 'text-purple-300 border-purple-400/30 bg-purple-400/10',
  admin: 'text-primary-container border-primary-container/30 bg-primary-container/10',
};

export const ROLE_ICON: Record<UserRole, string> = {
  citizen: 'person',
  official: 'badge',
  moderator: 'shield_person',
  admin: 'admin_panel_settings',
};
