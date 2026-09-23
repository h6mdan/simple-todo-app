import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  ShieldCheck, 
  Check, 
  User, 
  Briefcase 
} from 'lucide-react';
import { Collaborator, Task } from '../types.ts';

interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Collaborator[];
  tasks: Task[];
  currentUserEmail?: string;
  onAddMember: (member: Collaborator) => void;
  onRemoveMember: (memberId: string) => void;
}

export const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  tasks,
  currentUserEmail = 'AyaHamdan7789@gmail.com',
  onAddMember,
  onRemoveMember,
}) => {
  if (!isOpen) return null;

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === email)) {
      setErrorMsg('This member is already in your workspace team.');
      return;
    }

    const newMember: Collaborator = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email,
      name: nameInput.trim() || email.split('@')[0],
      role: 'member',
      joined_at: new Date().toISOString(),
    };

    onAddMember(newMember);
    setEmailInput('');
    setNameInput('');
    setSuccessMsg(`Added ${newMember.name || newMember.email} to workspace team.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div 
      id="workspace-members-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="workspace-members-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Workspace Team Members
              </h2>
              <p className="text-xs text-slate-500">
                Manage people in your workspace to assign tasks and share lists.
              </p>
            </div>
          </div>
          <button
            id="workspace-modal-close-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Add Member Form */}
          <form onSubmit={handleAddSubmit} className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 uppercase tracking-wider">
              <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add Teammate to Workspace</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="email"
                required
                id="workspace-member-email-input"
                placeholder="teammate@company.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  id="workspace-member-name-input"
                  placeholder="Full Name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
                />
                <button
                  type="submit"
                  id="workspace-add-member-btn"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex-shrink-0 shadow-sm"
                >
                  Add
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </p>
            )}
          </form>

          {/* Members List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Teammates ({members.length})
              </label>
              <span className="text-xs text-slate-400">
                Can be assigned tasks & added to lists
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {members.map((member) => {
                const isOwner = member.role === 'owner' || member.email.toLowerCase() === currentUserEmail.toLowerCase();
                const initials = member.name
                  ? member.name.slice(0, 2).toUpperCase()
                  : member.email.slice(0, 2).toUpperCase();

                // Count tasks assigned to this teammate
                const assignedCount = tasks.filter(
                  (t) => (t.assigned_to === member.id || t.assigned_to === member.email || t.assigned_to_email === member.email) && !t.completed
                ).length;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        isOwner
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                      }`}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                          <span>{member.name || member.email}</span>
                          {isOwner ? (
                            <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-md">
                              Workspace Owner
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                              Member
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-300" />
                            <span>{member.email}</span>
                          </span>
                          <span>•</span>
                          <span className="text-indigo-600 font-medium">
                            {assignedCount} active task{assignedCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isOwner && (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove teammate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Invite anyone worldwide to collaborate on your tasks and lists.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
