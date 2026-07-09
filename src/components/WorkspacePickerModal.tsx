import { Organization } from '../types';
import { ChevronRight, Plus, X } from 'lucide-react';
import {
  workspaceAvatarClass,
  workspaceInitial,
  workspaceLabel,
} from './WorkspaceSwitcher';

interface WorkspacePickerModalProps {
  workspaceOptions: Organization[];
  activeOrgId: string;
  userDisplayName: string;
  onSelect: (orgId: string) => void;
  onCreateOrg?: () => void;
  onClose: () => void;
}

/**
 * 全屏工作区选择弹窗 —— 从头像下拉「切换 >」打开，云效/飞书式组织列表。
 */
export default function WorkspacePickerModal({
  workspaceOptions,
  activeOrgId,
  userDisplayName,
  onSelect,
  onCreateOrg,
  onClose,
}: WorkspacePickerModalProps) {
  return (
    <div className="fixed inset-0 bg-white z-[80] flex flex-col animate-in fade-in duration-200 select-none">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer z-10"
        aria-label="关闭"
      >
        <X size={16} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-black text-slate-900 text-center">切换工作区</h1>
          <p className="text-sm text-slate-400 text-center mt-2 mb-8">
            选择个人或组织工作区，管理项目与 Studio 运维资源
          </p>

          <div className="border-t border-slate-100 pt-6 space-y-1">
            {workspaceOptions.map(org => {
              const label = workspaceLabel(org);
              const isActive = org.id === activeOrgId;
              return (
                <button
                  key={org.id}
                  onClick={() => onSelect(org.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-100 hover:border-blue-200'
                      : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center text-white text-base font-black shrink-0 shadow-sm ${workspaceAvatarClass(org.id)}`}
                  >
                    {workspaceInitial(org, userDisplayName, label)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-base font-bold text-slate-800 group-hover:text-slate-900 truncate">
                      {label}
                    </div>
                    {isActive && (
                      <div className="text-xs text-blue-600 font-semibold mt-0.5">当前工作区</div>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
                </button>
              );
            })}

            {onCreateOrg && (
              <button
                onClick={onCreateOrg}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <Plus size={20} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-base font-bold text-slate-800">创建新的组织</div>
                  <div className="text-xs text-slate-400 mt-0.5">可用于企业、组织或团队</div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none overflow-hidden opacity-[0.07]">
        <svg viewBox="0 0 1200 120" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,80 L80,60 L160,75 L240,50 L320,70 L400,45 L480,65 L560,40 L640,60 L720,35 L800,55 L880,30 L960,50 L1040,25 L1120,45 L1200,20 L1200,120 L0,120 Z" fill="#64748b" />
          <rect x="100" y="55" width="30" height="50" fill="#64748b" />
          <rect x="300" y="40" width="40" height="65" fill="#64748b" />
          <rect x="500" y="50" width="35" height="55" fill="#64748b" />
          <rect x="700" y="35" width="45" height="70" fill="#64748b" />
          <rect x="900" y="45" width="38" height="60" fill="#64748b" />
        </svg>
      </div>
    </div>
  );
}
