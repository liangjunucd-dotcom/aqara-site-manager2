import { useState } from 'react';
import { Building2, Check, ChevronRight, Plus } from 'lucide-react';
import { Organization, isPersonalOrg } from '../types';

/**
 * Workspace vs Organization naming (UI copy convention):
 * - User-facing switcher context: **Workspace / 工作区** (Personal Workspace + each joined enterprise).
 * - Internal data model: `Organization` entity remains for enterprise tenants; do NOT rename types.
 * - **组织管理后台** is reserved for enterprise admin backoffice (members, departments, billing).
 * - Industry alignment: Notion / Slack / UniFi use "Workspace" for the top-level context switcher.
 */

export interface WorkspaceSwitcherSharedProps {
  activeOrgId: string;
  workspaceOptions: Organization[];
  currentWorkspaceName: string;
  userDisplayName: string;
  adminOrgs: Organization[];
  onOrgChange: (orgId: string) => void;
  onEnterOrgModal: () => void;
  onCreateOrg?: () => void;
}

interface WorkspaceSwitcherProps extends WorkspaceSwitcherSharedProps {
  variant: 'compact' | 'lab-ai-sidebar';
}

export function workspaceLabel(org: Organization) {
  return isPersonalOrg(org.id) ? 'Personal Workspace' : org.name;
}

export function workspaceInitial(org: Organization, userDisplayName: string, workspaceName: string) {
  if (isPersonalOrg(org.id)) return userDisplayName.charAt(0).toUpperCase();
  return workspaceName.charAt(0).toUpperCase();
}

export function workspaceAvatarClass(orgId: string) {
  return isPersonalOrg(orgId)
    ? 'bg-gradient-to-br from-slate-500 to-slate-700'
    : 'bg-gradient-to-br from-indigo-400 to-purple-500';
}

interface WorkspacePickerListProps {
  activeOrgId: string;
  workspaceOptions: Organization[];
  userDisplayName: string;
  adminOrgs: Organization[];
  onOrgChange: (orgId: string) => void;
  onEnterOrgModal: () => void;
  onCreateOrg?: () => void;
  compact?: boolean;
}

/** Reusable workspace list for avatar dropdown and other inline pickers. */
export function WorkspacePickerList({
  activeOrgId,
  workspaceOptions,
  userDisplayName,
  adminOrgs,
  onOrgChange,
  onEnterOrgModal,
  onCreateOrg,
  compact,
}: WorkspacePickerListProps) {
  return (
    <div className={compact ? 'px-1' : 'px-1.5'}>
      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {workspaceOptions.map(org => (
          <button
            key={org.id}
            onClick={() => onOrgChange(org.id)}
            className={`w-full px-2.5 py-2 rounded-lg text-left text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeOrgId === org.id
                ? 'bg-blue-50 text-slate-900 border border-blue-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 border border-transparent'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-black shrink-0 ${workspaceAvatarClass(org.id)}`}
            >
              {workspaceInitial(org, userDisplayName, workspaceLabel(org))}
            </div>
            <span className="flex-1 truncate">{workspaceLabel(org)}</span>
            {activeOrgId === org.id && <Check size={12} className="text-emerald-500 shrink-0" />}
          </button>
        ))}
      </div>

      {(adminOrgs.length > 0 || onCreateOrg) && (
        <>
          <div className="h-px bg-slate-100 my-1.5" />
          <div className="space-y-0.5">
            {adminOrgs.length > 0 && (
              <button
                onClick={onEnterOrgModal}
                className="w-full px-2.5 py-2 rounded-lg text-left text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Building2 size={14} className="text-slate-400 shrink-0" />
                <span>管理后台</span>
                <ChevronRight size={12} className="ml-auto text-slate-300" />
              </button>
            )}
            {onCreateOrg && (
              <button
                onClick={onCreateOrg}
                className="w-full px-2.5 py-2 rounded-lg text-left text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} className="text-slate-400 shrink-0" />
                <span>创建工作区</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function WorkspaceSwitcher({
  activeOrgId,
  workspaceOptions,
  currentWorkspaceName,
  userDisplayName,
  adminOrgs,
  variant,
  onOrgChange,
  onEnterOrgModal,
  onCreateOrg,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeOrg = workspaceOptions.find(o => o.id === activeOrgId);

  const close = () => setIsOpen(false);

  const handleOrgSelect = (orgId: string) => {
    onOrgChange(orgId);
    close();
  };

  const avatarClass = workspaceAvatarClass(activeOrgId);

  const dropdownPosition =
    variant === 'compact'
      ? 'left-12 top-0 w-64 slide-in-from-left-1'
      : 'left-0 right-0 top-full mt-1';

  const dropdown = (
    <>
      <div className="fixed inset-0 z-40" onClick={close} />
      <div
        className={`absolute bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in duration-150 ${dropdownPosition}`}
      >
        <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
            最近使用
          </span>
        </div>
        <WorkspacePickerList
          activeOrgId={activeOrgId}
          workspaceOptions={workspaceOptions}
          userDisplayName={userDisplayName}
          adminOrgs={adminOrgs}
          onOrgChange={handleOrgSelect}
          onEnterOrgModal={() => {
            onEnterOrgModal();
            close();
          }}
          onCreateOrg={onCreateOrg ? () => { onCreateOrg(); close(); } : undefined}
        />
      </div>
    </>
  );

  if (variant === 'compact') {
    return (
      <div className="relative mb-3 pb-3 border-b border-slate-100 flex flex-col items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm cursor-pointer transition-all shadow-xs hover:scale-105 active:scale-95 text-white ${avatarClass}`}
          title={`工作区: ${currentWorkspaceName}`}
        >
          {activeOrg
            ? workspaceInitial(activeOrg, userDisplayName, currentWorkspaceName)
            : userDisplayName.charAt(0).toUpperCase()}
        </button>
        {isOpen && dropdown}
      </div>
    );
  }

  if (variant === 'lab-ai-sidebar') {
    return (
      <div className="relative mb-3 pb-3 border-b border-slate-100">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer text-left"
          title="切换工作区"
        >
          <span className="flex-1 text-xs font-bold text-slate-800 truncate">
            {currentWorkspaceName}
          </span>
          <ChevronRight
            size={14}
            className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        </button>
        {isOpen && dropdown}
      </div>
    );
  }

  return null;
}
