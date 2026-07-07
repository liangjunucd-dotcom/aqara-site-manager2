import { ArrowRight, Share2 } from 'lucide-react';
import { VisibleSpaceItem } from '../utils/accountContext';

interface ProjectCardProps {
  item: VisibleSpaceItem;
  studioCount: number;
  ownerLabel?: string;
  onClick: () => void;
}

export default function ProjectCard({ item, studioCount, ownerLabel, onClick }: ProjectCardProps) {
  const { space, role, isOwner } = item;

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 hover:shadow-sm transition-all duration-200 flex flex-col justify-between cursor-pointer min-h-[132px]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900 truncate">{space.name}</h3>
        {!isOwner && (
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
            <Share2 size={9} /> {role}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-6">
        <div className="text-[11px] text-slate-400">
          <span>{studioCount} Studios</span>
          {ownerLabel && !isOwner && <span className="block text-amber-600 mt-0.5">来自 {ownerLabel}</span>}
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-white transition-all">
          <ArrowRight size={15} />
        </div>
      </div>
    </div>
  );
}
