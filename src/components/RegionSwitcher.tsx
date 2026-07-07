import { useState } from 'react';
import { Region } from '../types';
import { Globe, Check, Signal } from 'lucide-react';

interface RegionSwitcherProps {
  regions: Region[];
  activeRegionId: string;
  onSwitch: (regionId: string) => void;
}

/**
 * Studio Cloud 区域切换器（顶栏常驻）。
 * 区域决定当前连接到哪个 Studio 云、以及可见的项目数据来源，是贯穿全局的上下文，
 * 因此放在顶栏而非仅登录落地页。
 */
export default function RegionSwitcher({ regions, activeRegionId, onSwitch }: RegionSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active = regions.find(r => r.id === activeRegionId) ?? regions[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer"
        title="切换 Studio Cloud 区域"
      >
        <span className="text-sm leading-none">{active.flag}</span>
        <span className="text-slate-700 font-bold hidden md:inline">{active.name}</span>
        <Globe size={11} className="text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-4 py-1.5 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Studio Cloud 区域</p>
              <p className="text-[10px] text-slate-400 mt-0.5">切换后将连接到对应区域的 Studio 云节点</p>
            </div>
            <div className="px-1.5 space-y-0.5 max-h-72 overflow-y-auto">
              {regions.map(r => (
                <button
                  key={r.id}
                  onClick={() => { onSwitch(r.id); setOpen(false); }}
                  className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    activeRegionId === r.id ? 'bg-slate-50 border border-slate-200/60' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="text-base leading-none">{r.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800">{r.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{r.cloudEndpoint}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <Signal size={10} /> {r.latency}
                  </div>
                  {activeRegionId === r.id && <Check size={13} className="text-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
