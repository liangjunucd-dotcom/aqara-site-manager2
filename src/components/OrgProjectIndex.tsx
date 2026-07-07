import { Plus, Search } from 'lucide-react';
import { Organization } from '../types';
import { VisibleSpaceItem } from '../utils/accountContext';
import ProjectCard from './ProjectCard';

interface OrgProjectIndexProps {
  organization: Organization;
  visibleSpaces: VisibleSpaceItem[];
  isExternal: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSpace: (spaceId: string) => void;
  onCreateProject: () => void;
  getStudioCount: (spaceId: string) => number;
  userDisplayName: string;
}

export default function OrgProjectIndex({
  organization,
  visibleSpaces,
  isExternal,
  searchQuery,
  onSearchChange,
  onSelectSpace,
  onCreateProject,
  getStudioCount,
}: OrgProjectIndexProps) {
  const filtered = visibleSpaces.filter(item =>
    item.space.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 space-y-6 animate-in fade-in duration-200 select-none">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-black tracking-tight text-slate-900">{organization.name}</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-56 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="搜索项目..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-slate-400"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
          {!isExternal && (
            <button
              onClick={onCreateProject}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> 新建项目
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-2xl p-16 text-center">
          <p className="text-slate-400 text-xs">
            {isExternal ? '暂无授权给您的项目，请联系项目负责人。' : '还没有项目，点击「新建项目」开始。'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <ProjectCard
              key={item.space.id}
              item={item}
              studioCount={getStudioCount(item.space.id)}
              onClick={() => onSelectSpace(item.space.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
