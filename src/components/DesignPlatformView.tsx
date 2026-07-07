import { useState } from 'react';
import { Search, LayoutGrid, Library, Users2, Compass, Filter, Plus, MoreVertical, Puzzle, Send } from 'lucide-react';

export interface DesignPlan {
  id: string;
  title: string;
  updatedAt: string;
  status: string;
  devices: number;
  area: string;
  kind: 'plan' | 'plugin';
}

interface DesignPlatformViewProps {
  plans: DesignPlan[];
  onApply: (plan: DesignPlan) => void;
}

export default function DesignPlatformView({ plans, onApply }: DesignPlatformViewProps) {
  const [query, setQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = plans.filter(p => !query || p.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 flex min-h-0 animate-in fade-in duration-200">
      {/* 设计平台左侧栏 */}
      <aside className="w-[210px] bg-white border-r border-slate-100 flex flex-col py-4 px-3 flex-shrink-0 select-none">
        <div className="px-2 mb-5">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-black text-slate-800">Aqara</span>
            <span className="text-[15px] font-bold text-slate-500">Builder</span>
            <span className="px-1 py-0.5 rounded bg-blue-100 text-blue-600 text-[8px] font-black">BETA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">设计平台</p>
        </div>

        <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Home</p>
        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
          <Compass size={14} /> Overview
        </button>

        <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-1.5">Mine</p>
        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 cursor-pointer">
          <LayoutGrid size={14} /> Space Plan
        </button>
        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
          <Library size={14} /> Library
        </button>

        <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-1.5">Explore</p>
        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
          <Users2 size={14} /> Community
        </button>
      </aside>

      {/* 设计平台主内容 */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-2xl">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer">
            <Filter size={13} /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#2563eb] hover:bg-blue-700 cursor-pointer">
            <Plus size={14} /> New Plan
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 text-[11px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 max-w-2xl">
          <Send size={13} className="text-blue-500" />
          在设计平台完成方案设计或购买插件后，点击卡片右上角的「···」→「应用到 Site Manager」，即可导入到运维项目。
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(plan => (
            <div key={plan.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center">
                {plan.kind === 'plugin' ? (
                  <Puzzle size={40} className="text-slate-300" />
                ) : (
                  <LayoutGrid size={40} className="text-slate-300" />
                )}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[10px] font-black text-slate-400">A</div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{plan.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{plan.updatedAt}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === plan.id ? null : plan.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {menuOpenId === plan.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1">
                          <button
                            onClick={() => { onApply(plan); setMenuOpenId(null); }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Send size={12} /> 应用到 Site Manager
                          </button>
                          <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">编辑方案</button>
                          <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">复制</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold">{plan.status}</span>
                  <span className="text-[10px] text-slate-400">{plan.devices} 设备</span>
                  {plan.area !== '—' && <span className="text-[10px] text-slate-400">· {plan.area}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
