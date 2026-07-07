import { useState, type ReactNode } from 'react';
import { Search, LayoutGrid, Library, Compass, Filter, Plus, MoreVertical, Puzzle, Send, Smartphone, Palette, Store, Code2, Sparkles, Eye } from 'lucide-react';

export interface DesignPlan {
  id: string;
  title: string;
  updatedAt: string;
  status: string;
  devices: number;
  area: string;
  kind: 'plan' | 'plugin';
  /** 来自插件市场（购买/安装后进入 Lab AI 库） */
  fromMarketplace?: boolean;
  marketplacePublisher?: string;
}

export interface UiThemeAsset {
  id: string;
  title: string;
  updatedAt: string;
  status: string;
  kind: 'app-ui' | 'theme';
}

interface DesignPlatformViewProps {
  plans: DesignPlan[];
  uiThemes?: UiThemeAsset[];
  onApply: (plan: DesignPlan) => void;
  onApplyUi?: (item: UiThemeAsset) => void;
}

type LabSection = 'space-plan' | 'app-ui' | 'marketplace' | 'developer-hub';

const DEFAULT_UI_THEMES: UiThemeAsset[] = [
  { id: 'ui-1', title: '客房控制面板 · 深色主题', updatedAt: '2026-06-28 14:22', status: 'Published', kind: 'theme' },
  { id: 'ui-2', title: '大堂迎宾 App 界面', updatedAt: '2026-06-25 09:15', status: 'In Design', kind: 'app-ui' },
  { id: 'ui-3', title: '能耗看板 Widget 套件', updatedAt: '2026-06-20 16:40', status: 'Published', kind: 'app-ui' },
];

/** 插件市场预览卡片（只读 Mock） */
const MARKETPLACE_PREVIEW: DesignPlan[] = [
  {
    id: 'mp-1',
    title: '物业巡检助手',
    updatedAt: '2026-06-15',
    status: 'Published',
    devices: 8,
    area: '—',
    kind: 'plugin',
    fromMarketplace: true,
    marketplacePublisher: 'Aqara Partner · 智维科技',
  },
  {
    id: 'mp-2',
    title: '多店客流热力图',
    updatedAt: '2026-06-08',
    status: 'Published',
    devices: 5,
    area: '—',
    kind: 'plugin',
    fromMarketplace: true,
    marketplacePublisher: 'Retail Labs',
  },
];

function ComingSoonBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold ${className}`}>
      <Sparkles size={9} /> 即将推出
    </span>
  );
}

function FuturePlaceholderPanel({
  icon: Icon,
  title,
  description,
  pipelineNote,
  children,
}: {
  icon: typeof Store;
  title: string;
  description: string;
  pipelineNote: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <Icon size={22} className="text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-800">{title}</h2>
              <ComingSoonBadge />
            </div>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{description}</p>
            <div className="mt-4 flex items-start gap-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              <Send size={13} className="text-blue-500 shrink-0 mt-0.5" />
              <span>{pipelineNote}</span>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function DesignPlatformView({ plans, uiThemes = DEFAULT_UI_THEMES, onApply, onApplyUi }: DesignPlatformViewProps) {
  const [section, setSection] = useState<LabSection>('space-plan');
  const [query, setQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredPlans = plans.filter(p => !query || p.title.toLowerCase().includes(query.toLowerCase()));
  const filteredUi = uiThemes.filter(p => !query || p.title.toLowerCase().includes(query.toLowerCase()));

  const isCreateSection = section === 'space-plan' || section === 'app-ui';

  return (
    <div className="flex-1 flex min-h-0 animate-in fade-in duration-200">
      <aside className="w-[210px] bg-white border-r border-slate-100 flex flex-col py-4 px-3 flex-shrink-0 select-none">
        <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Home</p>
        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
          <Compass size={14} /> Overview
        </button>

        <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-1.5">Create</p>
        <button
          onClick={() => setSection('space-plan')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
            section === 'space-plan' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid size={14} /> Space Plan
        </button>
        <button
          onClick={() => setSection('app-ui')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
            section === 'app-ui' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Smartphone size={14} /> App UI & Theme
        </button>
        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
          <Library size={14} /> Library
        </button>

        <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-1.5">Explore</p>
        <button
          onClick={() => setSection('marketplace')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
            section === 'marketplace' ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Store size={14} />
          <span className="flex-1 text-left">插件市场</span>
          {section !== 'marketplace' && <span className="text-[8px] font-bold text-amber-600/80">Soon</span>}
        </button>
        <button
          onClick={() => setSection('developer-hub')}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
            section === 'developer-hub' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Code2 size={14} />
          <span className="flex-1 text-left">开发者中心</span>
          {section !== 'developer-hub' && <span className="text-[8px] font-bold text-amber-600/80">Soon</span>}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#fafafa] p-6">
        {isCreateSection && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-2xl">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={section === 'space-plan' ? 'Search plans...' : 'Search UI & themes...'}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer">
              <Filter size={13} /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#2563eb] hover:bg-blue-700 cursor-pointer">
              <Plus size={14} /> {section === 'space-plan' ? 'New Plan' : 'New UI'}
            </button>
          </div>
        )}

        {isCreateSection && (
          <div className="mb-4 flex items-center gap-2 text-[11px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 max-w-2xl">
            <Send size={13} className="text-blue-500" />
            {section === 'space-plan'
              ? '在 Lab AI 完成空间方案或购买插件后，点击「···」→「应用到 Site Manager」，导入到项目资源库。'
              : 'App 界面与主题创作完成后，同样可分配到 Site Manager 项目下的界面配置资源。'}
          </div>
        )}

        {section === 'space-plan' && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlans.map(plan => (
              <div key={plan.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center">
                  {plan.kind === 'plugin' ? (
                    <Puzzle size={40} className="text-slate-300" />
                  ) : (
                    <LayoutGrid size={40} className="text-slate-300" />
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[10px] font-black text-slate-400">A</div>
                    {plan.kind === 'plugin' && (
                      <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[9px] font-bold">插件</span>
                    )}
                    {plan.fromMarketplace && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-100">市场</span>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{plan.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{plan.updatedAt}</p>
                      {plan.marketplacePublisher && (
                        <p className="text-[9px] text-slate-400 mt-0.5 truncate">{plan.marketplacePublisher}</p>
                      )}
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
        )}

        {section === 'app-ui' && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUi.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-indigo-50 to-violet-100 relative flex items-center justify-center">
                  {item.kind === 'theme' ? (
                    <Palette size={40} className="text-indigo-300" />
                  ) : (
                    <Smartphone size={40} className="text-indigo-300" />
                  )}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-white/80 text-[9px] font-bold text-indigo-600">
                    {item.kind === 'theme' ? 'Theme' : 'App UI'}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{item.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.updatedAt}</p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                      >
                        <MoreVertical size={15} />
                      </button>
                      {menuOpenId === item.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1">
                            <button
                              onClick={() => { onApplyUi?.(item); setMenuOpenId(null); }}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Send size={12} /> 应用到 Site Manager
                            </button>
                            <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">编辑</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[9px] font-bold">{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === 'marketplace' && (
          <FuturePlaceholderPanel
            icon={Store}
            title="插件市场"
            description="第三方开发者可发布 Studio 插件；您可浏览、购买并安装到 Lab AI 资产库。安装后的插件与自研 Space Plan 一样，通过「应用到 Site Manager」进入项目资源，再分发到各 Studio 运行。"
            pipelineNote="购买/安装 → Lab AI 插件库 → 应用到 Site Manager（方案设计 · kind=plugin）→ 分发到 Studio → 运行时加载"
          >
            <div className="mt-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">市场预览（只读）</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MARKETPLACE_PREVIEW.map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden opacity-90">
                    <div className="aspect-[16/7] bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center relative">
                      <Puzzle size={36} className="text-violet-300" />
                      <ComingSoonBadge className="absolute top-2 right-2" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.marketplacePublisher}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs font-bold text-slate-600">¥ —</span>
                        <button
                          disabled
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 bg-slate-100 cursor-not-allowed"
                        >
                          <Eye size={11} /> 预览
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FuturePlaceholderPanel>
        )}

        {section === 'developer-hub' && (
          <FuturePlaceholderPanel
            icon={Code2}
            title="开发者中心"
            description="面向 ISV 与集成商的插件开发与 App 页面开发工具。完成开发后可发布至插件市场，或直接将产物「应用到 Site Manager」指定项目的资源库。"
            pipelineNote="开发 / 打包 / 发布 → Lab AI 资产 → 应用到 Site Manager（design 或 ui-config）→ Studio 或 App 端生效"
          >
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Puzzle size={16} className="text-violet-500" />
                  <span className="text-xs font-bold text-slate-700">插件开发</span>
                  <ComingSoonBadge />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">SDK、调试与打包；发布到市场或直推项目。</p>
              </div>
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone size={16} className="text-indigo-500" />
                  <span className="text-xs font-bold text-slate-700">App 页面开发</span>
                  <ComingSoonBadge />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">可视化编辑 App UI 与主题，导出为 ui-config 资源。</p>
              </div>
            </div>
          </FuturePlaceholderPanel>
        )}
      </main>
    </div>
  );
}
