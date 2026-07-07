import { useMemo, useState } from 'react';
import { ProjectPlan, ProjectAsset, ProjectAssetKind, Site, Space, SpaceStructureNode } from '../types';
import {
  Cloud, LayoutGrid, Puzzle, FileArchive, HardDrive, Send, Check,
  ChevronDown, Database, Clock,
} from 'lucide-react';

interface ProjectStoragePanelProps {
  space: Space;
  assets: ProjectAsset[];
  plans: ProjectPlan[];
  sites: Site[];
  structureNodes: SpaceStructureNode[];
  onApplyToSite: (planId: string, siteId: string) => void;
}

type FilterKind = 'all' | ProjectAssetKind;

const KIND_LABELS: Record<ProjectAssetKind, string> = {
  design: '方案设计',
  'log-backup': '日志备份',
  snapshot: '配置快照',
};

const formatSize = (mb: number) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
};

export default function ProjectStoragePanel({
  space,
  assets,
  plans,
  sites,
  structureNodes,
  onApplyToSite,
}: ProjectStoragePanelProps) {
  const [filter, setFilter] = useState<FilterKind>('all');
  const [applyingPlan, setApplyingPlan] = useState<ProjectPlan | null>(null);
  const [targetSiteId, setTargetSiteId] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const quotaGb = space.storageQuotaGb ?? (space.spaceType === 'org_space' ? 50 : 5);
  const usedMb = useMemo(() => assets.reduce((sum, a) => sum + a.sizeMb, 0), [assets]);
  const usedGb = usedMb / 1024;
  const usagePct = Math.min(100, Math.round((usedGb / quotaGb) * 100));

  const filteredAssets = filter === 'all' ? assets : assets.filter(a => a.kind === filter);

  const nodeName = (id?: string | null) => structureNodes.find(n => n.id === id)?.name;

  const planForAsset = (asset: ProjectAsset) =>
    asset.projectPlanId ? plans.find(p => p.id === asset.projectPlanId) : undefined;

  const confirmApply = () => {
    if (applyingPlan && targetSiteId) {
      onApplyToSite(applyingPlan.id, targetSiteId);
      setApplyingPlan(null);
      setTargetSiteId('');
    }
  };

  const filterOptions: { key: FilterKind; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'design', label: '方案设计' },
    { key: 'log-backup', label: '日志备份' },
    { key: 'snapshot', label: '配置快照' },
  ];

  return (
    <div className="space-y-5">
      {/* 容量概览 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Cloud size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">项目云存储</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                项目级共享存储，存放方案设计、日志备份与 Studio 快照
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-slate-800 tabular-nums">
              {usedGb < 0.1 ? '< 0.1' : usedGb.toFixed(1)}
              <span className="text-sm font-bold text-slate-400"> / {quotaGb} GB</span>
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{assets.length} 个资源</p>
          </div>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${usagePct > 85 ? 'bg-amber-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.max(usagePct, 2)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] font-bold text-slate-400">
          <span>已用 {usagePct}%</span>
          <span className="flex items-center gap-1">
            <HardDrive size={10} />
            Studio Cloud 对象存储
          </span>
        </div>
      </div>

      {/* 资源列表 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-xs font-extrabold text-slate-700">存储资源</h4>
          <div className="flex gap-1">
            {filterOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                  filter === opt.key
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Database size={28} className="mx-auto text-slate-200 mb-3" />
            <p className="text-xs font-bold text-slate-500">暂无存储资源</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              从 Aqara Builder 导入方案，或等待 Studio 自动上传日志备份
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredAssets.map(asset => {
              const plan = planForAsset(asset);
              const isDesign = asset.kind === 'design' && plan;
              const isExpanded = expandedPlanId === asset.id;

              return (
                <div key={asset.id} className="px-4 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      {asset.kind === 'design' ? (
                        plan?.kind === 'plugin'
                          ? <Puzzle size={14} className="text-violet-500" />
                          : <LayoutGrid size={14} className="text-blue-500" />
                      ) : asset.kind === 'log-backup' ? (
                        <FileArchive size={14} className="text-amber-500" />
                      ) : (
                        <Clock size={14} className="text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 truncate">{asset.name}</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {KIND_LABELS[asset.kind]}
                            {' · '}
                            {formatSize(asset.sizeMb)}
                            {' · '}
                            {asset.source === 'builder' ? 'Aqara Builder' : asset.source === 'studio-cloud' ? 'Studio Cloud' : '系统'}
                            {' · '}
                            {asset.createdAt}
                          </p>
                        </div>

                        {isDesign && (
                          <button
                            onClick={() => setExpandedPlanId(isExpanded ? null : asset.id)}
                            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                          >
                            {plan!.appliedSiteIds.length} 台 Studio
                            <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* 已绑定的 Studio 列表 */}
                      {isDesign && isExpanded && plan!.appliedSiteIds.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {plan!.appliedSiteIds.map(sid => {
                            const site = sites.find(s => s.id === sid);
                            if (!site) return null;
                            return (
                              <span
                                key={sid}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-semibold"
                              >
                                <Check size={9} />
                                {site.name}
                                {nodeName(site.structureNodeId) ? ` · ${nodeName(site.structureNodeId)}` : ''}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {isDesign && plan!.appliedSiteIds.length === 0 && (
                        <p className="text-[10px] text-amber-600 mt-1.5">尚未分发到任何 Studio</p>
                      )}
                    </div>

                    {isDesign && (
                      <button
                        onClick={() => { setApplyingPlan(plan!); setTargetSiteId(''); }}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send size={10} /> 分发
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 分发到 Studio 弹窗 */}
      {applyingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">分发方案到 Studio</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                「{applyingPlan.title}」将从项目云存储下发到所选 Studio 运行。
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">选择 Studio</label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-700"
                value={targetSiteId}
                onChange={e => setTargetSiteId(e.target.value)}
              >
                <option value="">— 选择项目下的 Studio —</option>
                {sites.map(s => {
                  const alreadyApplied = applyingPlan.appliedSiteIds.includes(s.id);
                  return (
                    <option key={s.id} value={s.id} disabled={alreadyApplied}>
                      {s.name}
                      {nodeName(s.structureNodeId) ? ` (${nodeName(s.structureNodeId)})` : ''}
                      {alreadyApplied ? ' · 已绑定' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setApplyingPlan(null)} className="px-4 py-2 border rounded-lg font-bold text-slate-600 cursor-pointer">
                取消
              </button>
              <button
                onClick={confirmApply}
                disabled={!targetSiteId}
                className="px-4 py-2 bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} /> 确认分发
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
