import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useNotification } from '../context/NotificationContext';

type AdminTab = 'matrix' | 'users' | 'depts' | 'moderation';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'officer' | 'admin';
  department?: string;
  status: 'active' | 'suspended';
}

const INITIAL_USERS: PlatformUser[] = [
  { id: 'u-1', name: 'Jane Doe', email: 'jane@civic.org', role: 'citizen', status: 'active' },
  { id: 'u-2', name: 'Officer Marcus Vance', email: 'marcus.vance@gov.org', role: 'officer', department: 'Public Works', status: 'active' },
  { id: 'u-3', name: 'Director Eleanor Vance', email: 'eleanor@gov.org', role: 'admin', status: 'active' },
  { id: 'u-4', name: 'Arthur Dent', email: 'arthur@civic.org', role: 'citizen', status: 'active' },
  { id: 'u-5', name: 'David Brooks', email: 'david.b@gov.org', role: 'officer', department: 'Sanitation', status: 'active' }
];

export const AdminManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('matrix');
  const [users, setUsers] = useState<PlatformUser[]>(INITIAL_USERS);
  const { showToast } = useNotification();

  // Permission Matrix state
  const [matrix, setMatrix] = useState({
    citizen: { file: true, comment: true, upvote: true, editUsers: false, closeTickets: false },
    officer: { file: true, comment: true, upvote: true, editUsers: false, closeTickets: true },
    admin: { file: true, comment: true, upvote: true, editUsers: true, closeTickets: true }
  });

  const handleMatrixToggle = (role: 'citizen' | 'officer' | 'admin', key: string) => {
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role][key as keyof typeof prev['citizen']]
      }
    }));
    showToast('Permission matrix updated successfully!', 'success');
  };

  const handleRoleChange = (userId: string, newRole: 'citizen' | 'officer' | 'admin') => {
    setUsers(prev => 
      prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
    );
    showToast('User security level modified', 'info');
  };

  const handleUserStatusToggle = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const isSuspended = u.status === 'suspended';
          showToast(
            isSuspended ? `Re-activated user node` : `Suspended user node`,
            isSuspended ? 'success' : 'warning'
          );
          return { ...u, status: isSuspended ? 'active' : 'suspended' as any };
        }
        return u;
      })
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Admin Management
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Configure security matrix systems, moderate nodes, and audit platform parameters.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="overflow-x-auto -mx-1 pb-1 animate-fade-in-up">
        <div className="flex items-center gap-2 bg-[#00060d]/80 backdrop-blur-md rounded-xl p-1.5 border border-primary-container/20 shadow-md min-w-max">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'matrix' ? 'bg-primary-container/20 text-primary-container border border-primary-container/30' : 'text-white/60 hover:text-white'
            }`}
          >
            Permission Matrix
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'users' ? 'bg-primary-container/20 text-primary-container border border-primary-container/30' : 'text-white/60 hover:text-white'
            }`}
          >
            Users & Security
          </button>
          <button
            onClick={() => setActiveTab('depts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'depts' ? 'bg-primary-container/20 text-primary-container border border-primary-container/30' : 'text-white/60 hover:text-white'
            }`}
          >
            Municipal Sectors
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'moderation' ? 'bg-primary-container/20 text-primary-container border border-primary-container/30' : 'text-white/60 hover:text-white'
            }`}
          >
            Flagged Notices
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        
        {activeTab === 'matrix' && (
          <GlassCard noHover className="p-6 md:p-8 border-white/10 overflow-x-auto">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight mb-4">Role Permission Settings</h3>
            <p className="text-xs text-white/60 font-light mb-6">Assign operational capability flags across platform terminal authorization tiers.</p>
            
            <table className="w-full text-left font-mono text-xs text-white/80 border-collapse">
              <thead>
                <tr className="border-b border-white/10 uppercase text-white/50 text-[10px] tracking-widest">
                  <th className="py-4">Security Level</th>
                  <th className="py-4">File Tickets</th>
                  <th className="py-4">Post Comments</th>
                  <th className="py-4">Upvote Notices</th>
                  <th className="py-4">Modify Roles</th>
                  <th className="py-4">Resolve Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 uppercase">
                {(['citizen', 'officer', 'admin'] as const).map(role => (
                  <tr key={role} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold text-white tracking-wider">{role}</td>
                    <td className="py-4">
                      <input 
                        type="checkbox" 
                        checked={matrix[role].file} 
                        onChange={() => handleMatrixToggle(role, 'file')}
                        className="rounded bg-black/40 border-outline text-primary-container focus:ring-primary-container"
                      />
                    </td>
                    <td className="py-4">
                      <input 
                        type="checkbox" 
                        checked={matrix[role].comment} 
                        onChange={() => handleMatrixToggle(role, 'comment')}
                        className="rounded bg-black/40 border-outline text-primary-container focus:ring-primary-container"
                      />
                    </td>
                    <td className="py-4">
                      <input 
                        type="checkbox" 
                        checked={matrix[role].upvote} 
                        onChange={() => handleMatrixToggle(role, 'upvote')}
                        className="rounded bg-black/40 border-outline text-primary-container focus:ring-primary-container"
                      />
                    </td>
                    <td className="py-4">
                      <input 
                        type="checkbox" 
                        checked={matrix[role].editUsers} 
                        onChange={() => handleMatrixToggle(role, 'editUsers')}
                        className="rounded bg-black/40 border-outline text-primary-container focus:ring-primary-container"
                      />
                    </td>
                    <td className="py-4">
                      <input 
                        type="checkbox" 
                        checked={matrix[role].closeTickets} 
                        onChange={() => handleMatrixToggle(role, 'closeTickets')}
                        className="rounded bg-black/40 border-outline text-primary-container focus:ring-primary-container"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        )}

        {activeTab === 'users' && (
          <GlassCard noHover overflowVisible className="relative z-50 p-6 md:p-8">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight mb-6">Security Node Accounts</h3>
            <div className="flex flex-col gap-4">
              {users.map(u => (
                <div key={u.id} className="p-4 bg-black/10 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">{u.name}</h4>
                    <p className="text-[10px] font-mono text-white/50 mt-0.5">{u.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <CustomSelect
                      value={u.role}
                      onChange={(val) => handleRoleChange(u.id, val as any)}
                      options={[
                        { label: 'Citizen', value: 'citizen' },
                        { label: 'Officer', value: 'officer' },
                        { label: 'Admin', value: 'admin' }
                      ]}
                    />

                    <button
                      onClick={() => handleUserStatusToggle(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase font-bold tracking-widest border transition-all ${
                        u.status === 'active'
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-error/15 border-error/30 text-error'
                      }`}
                    >
                      {u.status}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {activeTab === 'depts' && (
          <GlassCard noHover className="p-6 md:p-8">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight mb-6">Municipal Operatives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/10 border border-white/5">
                <h5 className="font-bold text-xs text-white uppercase">Public Works</h5>
                <p className="text-[10px] font-mono text-primary-container mt-1">Supervisor: Officer Marcus Vance</p>
                <p className="text-xs text-white/70 mt-2 font-light">Responsible for street paving, pothole restorations, and public masonry maintenance.</p>
              </div>
              <div className="p-4 rounded-xl bg-black/10 border border-white/5">
                <h5 className="font-bold text-xs text-white uppercase">Sanitation Dept</h5>
                <p className="text-[10px] font-mono text-primary-container mt-1">Supervisor: Director Eleanor Vance</p>
                <p className="text-xs text-white/70 mt-2 font-light">Manages illegal refuse dumping, park trash collections, waste sorting, and toxic spills.</p>
              </div>
            </div>
          </GlassCard>
        )}

        {activeTab === 'moderation' && (
          <GlassCard noHover className="p-12 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined text-4xl block mb-2 text-green-400 drop-shadow-[0_0_5px_#4ade80]">verified</span>
            No pending community moderation flags found.
          </GlassCard>
        )}

      </div>
    </div>
  );
};
export default AdminManagement;
