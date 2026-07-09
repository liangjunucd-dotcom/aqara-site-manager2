import { useState } from 'react';
import { Region } from '../types';
import { Check, Signal, Server, ChevronDown, Home } from 'lucide-react';

interface RegionOpsControlProps {
  /** 全部区域元数据（用于展示 flag/name/endpoint） */
  regions: Region[];
  /** 当前账号上下文可运维的区域 id 列表（仅这些可切换） */
  accessibleRegionIds: string[];
  /** 当前运维区域 / Studio Cloud 节点 */
  activeOpsRegionId: string;
  /** 账号归属地（用于区分「运维区域」与「账号归属地」） */
  homeRegionId: string;
  onSwitch: (regionId: string) => void;
}

/**
 * 顶栏运维区域控件（自适应）：
 * - 账号仅在单一区域有 Studio → 只读徽标；
 * - 账号在多个区域有 Studio → 下拉切换「运维区域 / Studio Cloud 节点」（仅列出可访问区域）。
 * 注意：这里切换的是「运维区域（数据源）」，不改变「账号归属地（homeRegionId）」。
 */
export default function RegionOpsControl({
  regions, accessibleRegionIds, activeOpsRegionId, homeRegionId, onSwitch,
}: RegionOpsControlProps) {
  const [open, setOpen] = useState(false);
  const active = regions.find(r => r.id === activeOpsRegionId) ?? regions[0];
  const accessibleRegions = accessibleRegionIds
    .map(id => regions.find(r => r.id === id))
    .filter((r): r is Region => Boolean(r));

  const isMulti = accessibleRegions.length > 1;

  if (!isMulti) {
    return (
      <div
        className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs select-none"
        title={`当前 Studio Cloud 运维节点：${active.name}（${active.cloudEndpoint}）`}
      >
        <span className="text-sm leading-none">{active.flag}</span>
        <span className="text-slate-700 font-bold hidden md:inline">{active.name}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer"
        title="切换运维区域 (Studio Cloud 节点)"
      >
        <span className="text-sm leading-none">{active.flag}</span>
        <span className="text-slate-700 font-bold hidden md:inline">{active.name}</span>
        <ChevronDown size={11} className="text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-4 py-1.5 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Server size={11} /> 运维区域 · Studio Cloud 节点
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">切换后加载该区域的项目数据；global 账号可切换全部可用数据中心。</p>
            </div>
            <div className="px-1.5 space-y-0.5 max-h-72 overflow-y-auto">
              {accessibleRegions.map(r => (
                <button
                  key={r.id}
                  onClick={() => { onSwitch(r.id); setOpen(false); }}
                  className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    activeOpsRegionId === r.id ? 'bg-slate-50 border border-slate-200/60' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="text-base leading-none">{r.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {r.name}
                      {r.id === homeRegionId && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100">
                          <Home size={9} /> 注册地
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{r.cloudEndpoint}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <Signal size={10} /> {r.latency}
                  </div>
                  {activeOpsRegionId === r.id && <Check size={13} className="text-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
            <div className="px-4 pt-2 mt-1 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                这里切换的是<b className="text-slate-500">运维区域（数据源）</b>，不会更改账号注册国家/地区；
                更新注册信息请前往「个人设置 · 国家/地区」。
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
