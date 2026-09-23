import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Copy, 
  Check, 
  Trash2, 
  Mail, 
  Shield, 
  Link, 
  ExternalLink 
} from 'lucide-react';
import { Collaborator, CustomList } from '../types.ts';

interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: CustomList | null;
  workspaceMembers: Collaborator[];
  currentUserEmail?: string;
  onUpdateListMembers: (listId: string, members: Collaborator[], isShared: boolean) => void;
}

export const ShareListModal: React.FC<ShareListModalProps> = ({
  isOpen,
  onClose,
  list,
  workspaceMembers,
  currentUserEmail = 'AyaHamdan7789@gmail.com',
  onUpdateListMembers,
}) => {
  if (!isOpen || !list) return null;

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentMembers: Collaborator[] = list.members && list.members.length > 0
    ? list.members
    : [
        {
          id: 'owner',
          email: list.owner_email || currentUserEmail,
          name: currentUserEmail.split('@')[0],
          role: 'owner',
          joined_at: list.created_at,
        },
      ];

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}?join_list=${encodeURIComponent(list.id)}&name=${encodeURIComponent(list.name)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (currentMembers.some((m) => m.email.toLowerCase() === email)) {
      setErrorMsg('This person is already a member of this list.');
      return;
    }

    const newMember: Collaborator = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email,
      name: nameInput.trim() || email.split('@')[0],
      role: 'member',
      joined_at: new Date().toISOString(),
    };

    const updatedMembers = [...currentMembers, newMember];
    onUpdateListMembers(list.id, updatedMembers, true);
    setEmailInput('');
    setNameInput('');
  };

  const handleAddWorkspaceTeammate = (member: Collaborator) => {
    if (currentMembers.some((m) => m.email.toLowerCase() === member.email.toLowerCase())) {
      return;
    }
    const teammate: Collaborator = { 
      ...member, 
      role: 'member', 
      joined_at: new Date().toISOString() 
    };
    const updatedMembers: Collaborator[] = [...currentMembers, teammate];
    onUpdateListMembers(list.id, updatedMembers, true);
  };

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = currentMembers.filter((m) => m.id !== memberId && m.role !== 'owner');
    const stillShared = updatedMembers.length > 1;
    onUpdateListMembers(list.id, updatedMembers, stillShared);
  };

  const handleStopSharing = () => {
    const ownerOnly = currentMembers.filter((m) => m.role === 'owner');
    onUpdateListMembers(list.id, ownerOnly, false);
    onClose();
  };

  // Teammates not yet in this list
  const availableTeammates = workspaceMembers.filter(
    (wm) => !currentMembers.some((cm) => cm.email.toLowerCase() === wm.email.toLowerCase())
  );

  return (
    <div 
      id="share-list-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="share-list-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#111318] text-slate-900 dark:text-zinc-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Share "{list.name}"</span>
                {list.is_shared && (
                  <span className="text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    Active Share
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Invite people to view, check off, and collaborate on this list.
              </p>
            </div>
          </div>
          <button
            id="share-modal-close-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* 1. Quick Copy Invitation Link */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-600" />
              <span>Shareable Invitation Link</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 truncate font-mono select-all">
                {`${window.location.origin}?join_list=${list.id}`}
              </div>
              <button
                type="button"
                id="share-modal-copy-link-btn"
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                  copiedLink
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* 2. Invite via Email Form */}
          <form onSubmit={handleInviteSubmit} className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Invite by Email</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="email"
                required
                id="share-modal-email-input"
                placeholder="colleague@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  id="share-modal-name-input"
                  placeholder="Name (optional)"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
                />
                <button
                  type="submit"
                  id="share-modal-invite-btn"
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition flex-shrink-0"
                >
                  Invite
                </button>
              </div>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
            )}
          </form>

          {/* 3. Quick-Add from Workspace Team */}
          {availableTeammates.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Quick-Add Workspace Teammates
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTeammates.map((teammate) => (
                  <button
                    key={teammate.id}
                    type="button"
                    onClick={() => handleAddWorkspaceTeammate(teammate)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition group"
                  >
                    <div className="w-4 h-4 rounded-full bg-slate-300 group-hover:bg-blue-200 text-[9px] flex items-center justify-center font-bold text-slate-700 group-hover:text-blue-700">
                      {teammate.name?.slice(0, 1) || teammate.email.slice(0, 1).toUpperCase()}
                    </div>
                    <span>{teammate.name || teammate.email}</span>
                    <UserPlus className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. List of Current Members */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                List Members ({currentMembers.length})
              </label>
              {list.is_shared && (
                <button
                  type="button"
                  onClick={handleStopSharing}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
                >
                  Stop sharing list
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {currentMembers.map((member) => {
                const isOwner = member.role === 'owner';
                const initials = member.name
                  ? member.name.slice(0, 2).toUpperCase()
                  : member.email.slice(0, 2).toUpperCase();

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 hover:bg-white transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isOwner
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-tr from-teal-500 to-emerald-600 text-white'
                      }`}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                          <span>{member.name || member.email}</span>
                          {isOwner && (
                            <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-md">
                              Owner
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-300" />
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </div>

                    {!isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
