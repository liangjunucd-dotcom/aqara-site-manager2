import { Organization } from '../types';
import { ChevronRight, Plus, X } from 'lucide-react';

interface EnterOrgModalProps {
  /** 用户有管理后台权限的组织（internal 成员） */
  adminOrgs: Organization[];
  onSelect: (orgId: string) => void;
  onCreateOrg?: () => void;
  onClose: () => void;
}

/**
 * 「进入应用」式组织选择弹窗 —— 参考云效/飞书组织入口。
 * 从头像下拉点击「切换」后打开，选择企业后进入该组织管理后台。
 */
export default function EnterOrgModal({
  adminOrgs,
  onSelect,
  onCreateOrg,
  onClose,
}: EnterOrgModalProps) {
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
          <h1 className="text-2xl font-black text-slate-900 text-center">进入应用</h1>
          <p className="text-sm text-slate-400 text-center mt-2 mb-8">
            我们将在组织中为您提供 <span className="text-slate-600 font-bold">企业管理后台</span> 服务
          </p>

          <div className="border-t border-slate-100 pt-6 space-y-1">
            {adminOrgs.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">
                您尚未加入任何可管理的企业组织
              </p>
            ) : (
              adminOrgs.map(org => (
                <button
                  key={org.id}
                  onClick={() => onSelect(org.id)}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-base font-black shrink-0 shadow-sm">
                    {org.name.charAt(0)}
                  </div>
                  <span className="flex-1 text-left text-base font-bold text-slate-800 group-hover:text-slate-900">
                    {org.name}
                  </span>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
                </button>
              ))
            )}

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

      {/* 底部装饰 */}
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
