import { useMemo, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Space } from '../types';
import { VisibleSpaceItem } from '../utils/accountContext';

export function projectInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

const PROJECT_AVATAR_CLASSES = [
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-green-400 to-emerald-600',
  'bg-gradient-to-br from-teal-400 to-cyan-500',
  'bg-gradient-to-br from-lime-400 to-green-600',
  'bg-gradient-to-br from-emerald-500 to-green-700',
];

export function projectAvatarClass(spaceId: string) {
  let hash = 0;
  for (let i = 0; i < spaceId.length; i++) {
    hash = spaceId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROJECT_AVATAR_CLASSES[Math.abs(hash) % PROJECT_AVATAR_CLASSES.length];
}

interface ProjectPickerListProps {
  activeSpaceId: string;
  projects: VisibleSpaceItem[];
  onSpaceChange: (spaceId: string) => void;
  onCreateProject?: () => void;
}

export function ProjectPickerList({
  activeSpaceId,
  projects,
  onSpaceChange,
  onCreateProject,
}: ProjectPickerListProps) {
  return (
    <div className="px-1">
      <div className="max-h-52 overflow-y-auto space-y-0.5">
        {projects.map(({ space }) => (
          <button
            key={space.id}
            onClick={() => onSpaceChange(space.id)}
            className={`w-full px-2.5 py-2 rounded-lg text-left text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSpaceId === space.id
                ? 'bg-emerald-50 text-slate-900 border border-emerald-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 border border-transparent'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-black shrink-0 ${projectAvatarClass(space.id)}`}
            >
              {projectInitial(space.name)}
            </div>
            <span className="flex-1 truncate">{space.name}</span>
            {activeSpaceId === space.id && <Check size={12} className="text-emerald-500 shrink-0" />}
          </button>
        ))}
      </div>

      {onCreateProject && (
        <>
          <div className="h-px bg-slate-100 my-1.5" />
          <button
            onClick={onCreateProject}
            className="w-full px-2.5 py-2 rounded-lg text-left text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={14} className="text-slate-400 shrink-0" />
            <span>新建项目</span>
          </button>
        </>
      )}
    </div>
  );
}

interface ProjectSwitcherProps {
  activeSpaceId: string;
  currentSpace: Space;
  projectOptions: VisibleSpaceItem[];
  onSpaceChange: (spaceId: string) => void;
  onCreateProject?: () => void;
}

export default function ProjectSwitcher({
  activeSpaceId,
  currentSpace,
  projectOptions,
  onSpaceChange,
  onCreateProject,
}: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const recentProjects = useMemo(() => {
    return [...projectOptions].sort((a, b) => {
      const dateA = a.space.createdAt ?? '';
      const dateB = b.space.createdAt ?? '';
      return dateB.localeCompare(dateA);
    });
  }, [projectOptions]);

  const close = () => setIsOpen(false);

  const handleSelect = (spaceId: string) => {
    onSpaceChange(spaceId);
    close();
  };

  const handleCreate = () => {
    onCreateProject?.();
    close();
  };

  return (
    <div className="px-3 py-3 border-b border-slate-100">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors cursor-pointer text-left"
          title="切换项目"
        >
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black shrink-0 ${projectAvatarClass(currentSpace.id)}`}
          >
            {projectInitial(currentSpace.name)}
          </div>
          <span className="flex-1 text-xs font-bold text-slate-800 truncate">{currentSpace.name}</span>
          <ChevronDown
            size={14}
            className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={close} />
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in duration-150">
              <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  最近使用
                </span>
              </div>
              <ProjectPickerList
                activeSpaceId={activeSpaceId}
                projects={recentProjects}
                onSpaceChange={handleSelect}
                onCreateProject={onCreateProject ? handleCreate : undefined}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
