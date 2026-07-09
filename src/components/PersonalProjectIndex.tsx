import { Plus, Search } from 'lucide-react';
import { VisibleSpaceItem, splitPersonalSpaces } from '../utils/accountContext';
import ProjectCard from './ProjectCard';

interface PersonalProjectIndexProps {
  visibleSpaces: VisibleSpaceItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSpace: (spaceId: string) => void;
  onCreateProject: () => void;
  getStudioCount: (spaceId: string) => number;
  getOwnerLabel: (item: VisibleSpaceItem) => string | undefined;
  userDisplayName: string;
}

export default function PersonalProjectIndex({
  visibleSpaces,
  searchQuery,
  onSearchChange,
  onSelectSpace,
  onCreateProject,
  getStudioCount,
  getOwnerLabel,
}: PersonalProjectIndexProps) {
  const filtered = visibleSpaces.filter(item =>
    item.space.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const { owned, shared } = splitPersonalSpaces(filtered);

  return (
    <div className="flex-1 overflow-y-auto max-w-6xl w-full mx-auto p-6 md:p-10 space-y-6 animate-in fade-in duration-200 select-none">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-black tracking-tight text-slate-900">个人工作区</h1>
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
          <button
            onClick={onCreateProject}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> 新建项目
          </button>
        </div>
      </div>

      {owned.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">我创建的</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {owned.map(item => (
              <ProjectCard
                key={item.space.id}
                item={item}
                studioCount={getStudioCount(item.space.id)}
                onClick={() => onSelectSpace(item.space.id)}
              />
            ))}
          </div>
        </section>
      )}

      {shared.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">共享给我的</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shared.map(item => (
              <ProjectCard
                key={item.space.id}
                item={item}
                studioCount={getStudioCount(item.space.id)}
                ownerLabel={getOwnerLabel(item)}
                onClick={() => onSelectSpace(item.space.id)}
              />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="border border-dashed border-slate-200 rounded-2xl p-16 text-center">
          <p className="text-slate-400 text-xs mb-5">还没有项目</p>
          <button onClick={onCreateProject} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer">
            + 新建项目
          </button>
        </div>
      )}
    </div>
  );
}
