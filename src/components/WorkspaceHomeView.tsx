import { useState } from 'react';
import { ArrowRight, ChevronLeft, Plus, Search } from 'lucide-react';
import { Organization, isPersonalOrg } from '../types';

interface WorkspaceHomeViewProps {
  workspaceOptions: Organization[];
  userDisplayName: string;
  onSelectWorkspace: (orgId: string) => void;
  onCreateWorkspace?: () => void;
  onBackToLab?: () => void;
  showBackToLab?: boolean;
}

function workspaceDisplayName(org: Organization, userDisplayName: string) {
  if (isPersonalOrg(org.id)) return `${userDisplayName}'s Workspace`;
  return org.name;
}

function workspaceSubtitle(org: Organization) {
  if (isPersonalOrg(org.id)) return 'Personal · 个人项目与 Studio';
  return org.description ?? 'Enterprise workspace';
}

function workspaceInitial(org: Organization, userDisplayName: string) {
  if (isPersonalOrg(org.id)) return userDisplayName.charAt(0).toUpperCase();
  return org.name.charAt(0).toUpperCase();
}

export default function WorkspaceHomeView({
  workspaceOptions,
  userDisplayName,
  onSelectWorkspace,
  onCreateWorkspace,
  onBackToLab,
  showBackToLab,
}: WorkspaceHomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = workspaceOptions.filter(org => {
    const label = workspaceDisplayName(org, userDisplayName);
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 flex min-h-0 bg-[#f4f6f8]">
      {/* Left brand panel */}
      <aside className="hidden lg:flex w-[340px] xl:w-[380px] flex-shrink-0 flex-col justify-between bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-white p-10 xl:p-12">
        <div>
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-900/40">
              S
            </div>
            <div>
              <p className="text-[15px] font-black tracking-tight leading-none">Site Manager</p>
              <p className="text-[11px] font-semibold text-emerald-200/80 mt-0.5">Studio Cloud Operations</p>
            </div>
          </div>

          <h1 className="text-2xl xl:text-[28px] font-black tracking-tight leading-snug">
            Welcome to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
              Site Manager
            </span>
          </h1>
          <p className="mt-4 text-sm text-slate-300/90 leading-relaxed max-w-[260px]">
            选择工作区以管理项目、Studio 站点与运维资源。每个工作区拥有独立的项目配额与成员权限。
          </p>
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          Site Manager · Studio Cloud Operations
        </p>
      </aside>

      {/* Main workspace picker */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto px-6 md:px-10 py-8 md:py-12 flex-1">
          <div className="mb-8">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 lg:hidden">
              Site Manager
            </p>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              选择工作区
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              进入个人或组织工作区，查看与管理项目。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search for workspace..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-shadow"
              />
            </div>
            {onCreateWorkspace && (
              <button
                onClick={onCreateWorkspace}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors cursor-pointer shrink-0"
              >
                <Plus size={16} />
                New Workspace
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(org => (
              <button
                key={org.id}
                onClick={() => onSelectWorkspace(org.id)}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50 transition-all cursor-pointer text-left"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 ${
                    isPersonalOrg(org.id)
                      ? 'bg-gradient-to-br from-slate-500 to-slate-700'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}
                >
                  {workspaceInitial(org, userDisplayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                    {workspaceDisplayName(org, userDisplayName)}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {workspaceSubtitle(org)}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center mt-4">
              <p className="text-sm text-slate-400">未找到匹配的工作区</p>
            </div>
          )}
        </div>

        {showBackToLab && onBackToLab && (
          <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-sm px-6 md:px-10 py-4">
            <button
              onClick={onBackToLab}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-violet-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              返回 Lab
            </button>
          </footer>
        )}
      </main>
    </div>
  );
}
