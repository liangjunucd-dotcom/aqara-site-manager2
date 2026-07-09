import { type ReactNode } from 'react';
import {
  Bell,
  Database,
  LayoutGrid,
  PieChart,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { Space } from '../types';
import { VisibleSpaceItem } from '../utils/accountContext';
import ProjectSwitcher from './ProjectSwitcher';

export type SiteManagerTab =
  | 'sites'
  | 'storage'
  | 'builder'
  | 'analytics'
  | 'space-settings'
  | 'analytics-dashboard'
  | 'alerts'
  | 'updates';

interface SiteManagerSidebarProps {
  mode: 'list' | 'project';
  currentSpace?: Space;
  activeSpaceId?: string;
  projectOptions?: VisibleSpaceItem[];
  activeTab: SiteManagerTab;
  isExternal: boolean;
  onTabChange: (tab: SiteManagerTab) => void;
  onClearActiveSite: () => void;
  onSpaceChange?: (spaceId: string) => void;
  onCreateProject?: () => void;
}

interface NavItemProps {
  id: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}

function NavItem({ id, label, icon, active, onClick }: NavItemProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors cursor-pointer ${
        active
          ? 'bg-slate-100 text-slate-950'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
    >
      <span className={`shrink-0 ${active ? 'text-slate-700' : 'text-slate-400'}`}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function SiteManagerSidebar({
  mode,
  currentSpace,
  activeSpaceId,
  projectOptions = [],
  activeTab,
  isExternal,
  onTabChange,
  onClearActiveSite,
  onSpaceChange,
  onCreateProject,
}: SiteManagerSidebarProps) {
  const handleTab = (tab: SiteManagerTab) => {
    onClearActiveSite();
    onTabChange(tab);
  };

  return (
    <aside className="w-56 bg-white border-r border-slate-100 flex-shrink-0 z-30 select-none flex flex-col h-full">
      {mode === 'project' && currentSpace && activeSpaceId && onSpaceChange && (
        <ProjectSwitcher
          activeSpaceId={activeSpaceId}
          currentSpace={currentSpace}
          projectOptions={projectOptions}
          onSpaceChange={onSpaceChange}
          onCreateProject={onCreateProject}
        />
      )}

      {mode === 'list' ? (
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          <NavItem
            id="nav-projects"
            label="项目列表"
            icon={<LayoutGrid size={16} />}
            active
            onClick={() => {}}
          />
        </nav>
      ) : (
        <>
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            <NavItem
              id="tab-sites"
              label="站点总览"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              }
              active={activeTab === 'sites'}
              onClick={() => handleTab('sites')}
            />
            <NavItem
              id="tab-storage"
              label="项目资源"
              icon={<Database size={16} />}
              active={activeTab === 'storage'}
              onClick={() => handleTab('storage')}
            />
            <NavItem
              id="tab-analytics-dashboard"
              label="数据分析"
              icon={<PieChart size={16} />}
              active={activeTab === 'analytics-dashboard'}
              onClick={() => handleTab('analytics-dashboard')}
            />
            <NavItem
              id="tab-alerts"
              label="告警规则"
              icon={<Bell size={16} />}
              active={activeTab === 'alerts'}
              onClick={() => handleTab('alerts')}
            />
            <NavItem
              id="tab-updates"
              label="固件更新"
              icon={<RefreshCw size={16} />}
              active={activeTab === 'updates'}
              onClick={() => handleTab('updates')}
            />

            {!isExternal && (
              <>
                <div className="h-px bg-slate-100 my-2 mx-1" />
                <NavItem
                  id="tab-space-settings"
                  label="项目设置"
                  icon={<Settings size={16} />}
                  active={activeTab === 'space-settings'}
                  onClick={() => handleTab('space-settings')}
                />
              </>
            )}
          </nav>
        </>
      )}
    </aside>
  );
}
