import { useMemo, useState } from 'react';
import { ProjectPlan, ProjectAsset, ProjectAssetKind, Site, Space, SpaceStructureNode } from '../types';
import { avatarColor, avatarInitials } from '../utils/avatar';
import {
  Database, LayoutGrid, Puzzle, FileArchive, HardDrive, Send, Check,
  ChevronDown, Smartphone, Users, Search, X,
  RefreshCw, RotateCcw, Download, Trash2, Upload, History, Server, Clock,
} from 'lucide-react';

export interface ProjectMemberOption {
  accountId: string;
  name: string;
  email: string;
}

interface ProjectStoragePanelProps {
  space: Space;
  assets: ProjectAsset[];
  plans: ProjectPlan[];
  sites: Site[];
  structureNodes: SpaceStructureNode[];
  members: ProjectMemberOption[];
  canManage: boolean;
  onApplyToSite: (planId: string, siteId: string) => void;
  onAssignMembers: (assetId: string, accountIds: string[]) => void;
  onCreateBackup: (spaceId: string, studioId?: string) => void;
  onDeleteAsset: (assetId: string) => void;
}

type FilterKind = 'all' | ProjectAssetKind;

const KIND_LABELS: Record<ProjectAssetKind, string> = {
  design: '方案设计',
  'data-backup': '数据备份',
  'ui-config': '界面配置',
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
  members,
  canManage,
  onApplyToSite,
  onAssignMembers,
  onCreateBackup,
  onDeleteAsset,
}: ProjectStoragePanelProps) {
  const [filter, setFilter] = useState<FilterKind>('all');
  const [applyingPlan, setApplyingPlan] = useState<ProjectPlan | null>(null);
  const [targetSiteId, setTargetSiteId] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // 界面配置「分配成员」弹窗
  const [assigningAsset, setAssigningAsset] = useState<ProjectAsset | null>(null);
  const [assignSelection, setAssignSelection] = useState<string[]>([]);
  const [assignQuery, setAssignQuery] = useState('');

  // 数据备份「备份与还原」本地状态
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [retention, setRetention] = useState(3);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState<{
    autoEnabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
  }>({ autoEnabled: true, frequency: 'daily', retention: 3 });
  // 立即备份：'' = 为项目下每台 Studio 各生成一份独立备份
  const [backupStudioId, setBackupStudioId] = useState('');

  const memberById = useMemo(() => {
    const map = new Map<string, ProjectMemberOption>();
    members.forEach(m => map.set(m.accountId, m));
    return map;
  }, [members]);

  const openAssign = (asset: ProjectAsset) => {
    setAssigningAsset(asset);
    setAssignSelection(asset.assignedMemberAccountIds ?? []);
    setAssignQuery('');
  };

  const toggleAssign = (accountId: string) => {
    setAssignSelection(prev =>
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId],
    );
  };

  const confirmAssign = () => {
    if (!assigningAsset) return;
    onAssignMembers(assigningAsset.id, assignSelection);
    setAssigningAsset(null);
    setAssignSelection([]);
    setAssignQuery('');
  };

  const filteredAssignMembers = members.filter(m => {
    const q = assignQuery.trim().toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

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

  const FREQUENCY_LABELS: Record<'daily' | 'weekly' | 'monthly', string> = {
    daily: '每天 00:00',
    weekly: '每周一 00:00',
    monthly: '每月 1 日 00:00',
  };

  const backups = useMemo(
    () =>
      assets
        .filter(a => a.kind === 'data-backup')
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [assets],
  );

  const studioCount = sites.length;

  const studioName = (id?: string) => sites.find(s => s.id === id)?.name;
  const backupScopeLabel = (asset: ProjectAsset) =>
    studioName(asset.studioId) ?? '未知 Studio';

  const openSchedule = () => {
    setScheduleDraft({ autoEnabled, frequency, retention });
    setScheduleOpen(true);
  };

  const saveSchedule = () => {
    setAutoEnabled(scheduleDraft.autoEnabled);
    setFrequency(scheduleDraft.frequency);
    setRetention(scheduleDraft.retention);
    setScheduleOpen(false);
  };

  const handleCreateBackup = () => {
    if (!backupStudioId && studioCount === 0) return;
    onCreateBackup(space.id, backupStudioId || undefined);
  };

  const handleRestoreBackup = (asset: ProjectAsset) => {
    const scope = `Studio「${studioName(asset.studioId) ?? asset.studioId ?? '未知'}」`;
    if (confirm(`确认使用云端备份「${asset.name}」还原 ${scope} 的本地数据？\n还原过程中该 Studio 将短暂离线。`)) {
      alert(`已从 Studio Cloud 下发还原任务：${asset.name}\n（Demo 模拟，${scope} 将从云端备份恢复本地配置与运行数据）`);
    }
  };

  const handleRestoreFromFile = () => {
    alert('从文件还原（Demo 模拟）：上传导出的 Backup-*.zip 备份文件，即可将对应 Studio 的本地数据从该文件还原。');
  };

  const handleDownloadBackup = (asset: ProjectAsset) => {
    const payload = JSON.stringify(
      {
        backup: asset.name,
        spaceId: asset.spaceId,
        backupType: asset.backupType ?? 'manual',
        sizeMb: asset.sizeMb,
        createdAt: asset.createdAt,
        studioId: asset.studioId ?? null,
        studioName: asset.studioId ? (studioName(asset.studioId) ?? null) : null,
        scope: 'single-studio',
        storage: 'studio-cloud',
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = asset.name.replace(/\.zip$/i, '') + '.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteBackup = (asset: ProjectAsset) => {
    if (confirm(`确认删除备份「${asset.name}」？此操作不可撤销。`)) {
      onDeleteAsset(asset.id);
    }
  };

  const filterOptions: { key: FilterKind; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'design', label: '方案设计' },
    { key: 'ui-config', label: '界面配置' },
    { key: 'data-backup', label: '数据备份' },
  ];

  const kindIcon = (asset: ProjectAsset) => {
    if (asset.kind === 'design') {
      const plan = planForAsset(asset);
      return plan?.kind === 'plugin'
        ? <Puzzle size={14} className="text-violet-500" />
        : <LayoutGrid size={14} className="text-blue-500" />;
    }
    if (asset.kind === 'ui-config') {
      return <Smartphone size={14} className="text-indigo-500" />;
    }
    return <FileArchive size={14} className="text-amber-500" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">项目资源</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          项目级共享容量，存放方案设计、界面配置与数据备份
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-start justify-end gap-4 mb-4">
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

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-xs font-extrabold text-slate-700">存储资源</h4>
          <div className="flex gap-1 flex-wrap">
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

        {filter === 'data-backup' ? (
          <div className="p-4 space-y-4">
            {/* 工具栏 */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-emerald-500" /> 备份与还原
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  由 Studio Cloud 对项目下 {studioCount} 台 Studio 的本地数据进行云端备份与还原，备份存储于项目云空间
                </p>
              </div>
              {canManage && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleRestoreFromFile}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={12} /> 从文件还原
                  </button>
                  <select
                    value={backupStudioId}
                    onChange={e => setBackupStudioId(e.target.value)}
                    title="选择要备份的 Studio"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 max-w-[160px]"
                  >
                    <option value="">全部 Studio ({studioCount} 个文件)</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleCreateBackup}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} /> 立即备份
                  </button>
                </div>
              )}
            </div>

            {/* 自动备份状态卡 */}
            <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
              autoEnabled ? 'bg-emerald-50/60 border-emerald-100' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                autoEnabled ? 'bg-emerald-100' : 'bg-slate-200'
              }`}>
                <RefreshCw size={16} className={autoEnabled ? 'text-emerald-600' : 'text-slate-400'} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  {autoEnabled ? '自动备份已开启' : '自动备份已关闭'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <Clock size={10} className="text-slate-400" />
                  {autoEnabled
                    ? `${FREQUENCY_LABELS[frequency]} · 每台 Studio 独立备份 · 共 ${studioCount} 台 · 保留最近 ${retention} 份/台 · 存储于项目云端 (Studio Cloud)`
                    : `手动备份仍可随时创建 · 选择「全部 Studio」将为每台 Studio 各生成一份备份`}
                </p>
              </div>
              {canManage && (
                <button
                  onClick={openSchedule}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer shrink-0"
                >
                  编辑计划
                </button>
              )}
            </div>

            {/* 备份历史 */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <History size={12} className="text-slate-400" />
                <h5 className="text-[11px] font-extrabold text-slate-600">备份历史</h5>
                <span className="text-[10px] text-slate-400 font-bold">· {backups.length} 个</span>
              </div>

              {backups.length === 0 ? (
                <div className="px-6 py-10 text-center border border-dashed border-slate-200 rounded-xl">
                  <Server size={26} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-bold text-slate-500">暂无备份</p>
                  <p className="text-[11px] text-slate-400 mt-1">开启自动备份或点击「立即备份」创建第一个备份</p>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <th className="px-3 py-2 font-bold">名称</th>
                        <th className="px-3 py-2 font-bold">所属 Studio</th>
                        <th className="px-3 py-2 font-bold">备份类型</th>
                        <th className="px-3 py-2 font-bold">备份时间</th>
                        <th className="px-3 py-2 font-bold text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {backups.map(asset => {
                        const isAuto = asset.backupType === 'auto';
                        return (
                          <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileArchive size={13} className="text-amber-500 shrink-0" />
                                <span className="text-xs font-bold text-slate-800 truncate">{asset.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">{formatSize(asset.sizeMb)}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                <Server size={9} className="text-slate-400" />
                                <span className="truncate max-w-[120px]">{backupScopeLabel(asset)}</span>
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isAuto ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {isAuto ? '自动' : '手动'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                              {asset.createdAt}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center justify-end gap-1">
                                {canManage && (
                                  <button
                                    onClick={() => handleRestoreBackup(asset)}
                                    title="还原"
                                    className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                                  >
                                    <RotateCcw size={11} /> 还原
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownloadBackup(asset)}
                                  title="下载"
                                  className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                                >
                                  <Download size={11} /> 下载
                                </button>
                                {canManage && (
                                  <button
                                    onClick={() => handleDeleteBackup(asset)}
                                    title="删除"
                                    className="px-2 py-1 rounded-md text-[10px] font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 size={11} /> 删除
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Database size={28} className="mx-auto text-slate-200 mb-3" />
            <p className="text-xs font-bold text-slate-500">暂无资源</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              从 Lab 导入方案、插件或界面配置，或等待 Studio 自动上传数据备份
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
                      {kindIcon(asset)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="text-xs font-bold text-slate-800 truncate">{asset.name}</h5>
                            {plan?.kind === 'plugin' && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-100 text-[9px] font-bold">插件</span>
                            )}
                            {plan?.fromMarketplace && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold">插件市场</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {KIND_LABELS[asset.kind]}
                            {plan?.kind === 'plugin' ? ' · Studio 插件' : ''}
                            {' · '}
                            {formatSize(asset.sizeMb)}
                            {' · '}
                            {asset.source === 'builder' ? (plan?.fromMarketplace ? 'Lab · 市场购买' : 'Lab') : asset.source === 'studio-cloud' ? 'Studio Cloud' : '系统'}
                            {' · '}
                            {asset.createdAt}
                          </p>
                          {plan?.marketplacePublisher && (
                            <p className="text-[9px] text-slate-400 mt-0.5">{plan.marketplacePublisher}</p>
                          )}
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

                      {asset.kind === 'ui-config' && (() => {
                        const assigned = (asset.assignedMemberAccountIds ?? [])
                          .map(id => memberById.get(id))
                          .filter((m): m is ProjectMemberOption => !!m);
                        return (
                          <div className="mt-1.5">
                            <p className="text-[10px] text-indigo-600">App 界面与主题配置，需分配给项目成员后生效</p>
                            {assigned.length > 0 ? (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {assigned.slice(0, 5).map(m => (
                                    <span
                                      key={m.accountId}
                                      title={`${m.name} · ${m.email}`}
                                      className={`w-6 h-6 rounded-full ${avatarColor(m.accountId)} border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm`}
                                    >
                                      {avatarInitials(m.name)}
                                    </span>
                                  ))}
                                  {assigned.length > 5 && (
                                    <span className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-600">
                                      +{assigned.length - 5}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold">已分配 {assigned.length} 人</span>
                              </div>
                            ) : (
                              <p className="text-[10px] text-amber-600 mt-1.5">尚未分配给任何成员</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {isDesign && (
                      <button
                        onClick={() => { setApplyingPlan(plan!); setTargetSiteId(''); }}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send size={10} /> 分发
                      </button>
                    )}

                    {asset.kind === 'ui-config' && canManage && (
                      <button
                        onClick={() => openAssign(asset)}
                        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Users size={10} /> 分配成员
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {applyingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">分发方案到 Studio</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                「{applyingPlan.title}」将从项目资源库下发到所选 Studio 运行。
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

      {/* ===== 界面配置：分配成员弹窗 ===== */}
      {assigningAsset && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-indigo-500" /> 分配成员
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  「{assigningAsset.name}」将应用到所选项目成员的终端界面
                </p>
              </div>
              <button onClick={() => setAssigningAsset(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={assignQuery}
                  onChange={e => setAssignQuery(e.target.value)}
                  placeholder="搜索项目成员"
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div className="max-h-64 overflow-y-auto -mx-1 px-1 space-y-1">
                {filteredAssignMembers.length === 0 ? (
                  <p className="text-center text-slate-400 py-6">未找到项目成员</p>
                ) : (
                  filteredAssignMembers.map(m => {
                    const checked = assignSelection.includes(m.accountId);
                    return (
                      <button
                        key={m.accountId}
                        type="button"
                        onClick={() => toggleAssign(m.accountId)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer border ${
                          checked ? 'bg-indigo-50 border-indigo-200' : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full ${avatarColor(m.accountId)} flex items-center justify-center text-[10px] font-black text-white shrink-0`}>
                          {avatarInitials(m.name)}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-bold text-slate-800 truncate">{m.name}</span>
                          <span className="block text-[10px] text-slate-400 truncate">{m.email}</span>
                        </span>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                        }`}>
                          {checked && <Check size={11} className="text-white" />}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold">已选 {assignSelection.length} 人</span>
              <div className="flex gap-2">
                <button onClick={() => setAssigningAsset(null)} className="px-4 py-2 border rounded-lg font-bold text-slate-600 cursor-pointer">
                  取消
                </button>
                <button
                  onClick={confirmAssign}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={13} /> 确认分配
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 数据备份：编辑计划弹窗 ===== */}
      {scheduleOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-emerald-500" /> 编辑自动备份计划
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">备份 Studio 本地数据并存储于项目云空间</p>
              </div>
              <button onClick={() => setScheduleOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="font-bold text-slate-700">开启自动备份</span>
                <button
                  type="button"
                  onClick={() => setScheduleDraft(d => ({ ...d, autoEnabled: !d.autoEnabled }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${scheduleDraft.autoEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${scheduleDraft.autoEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </label>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">备份频率</label>
                <select
                  disabled={!scheduleDraft.autoEnabled}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                  value={scheduleDraft.frequency}
                  onChange={e => setScheduleDraft(d => ({ ...d, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                >
                  <option value="daily">每天 00:00</option>
                  <option value="weekly">每周一 00:00</option>
                  <option value="monthly">每月 1 日 00:00</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">保留最近份数</label>
                <select
                  disabled={!scheduleDraft.autoEnabled}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                  value={scheduleDraft.retention}
                  onChange={e => setScheduleDraft(d => ({ ...d, retention: Number(e.target.value) }))}
                >
                  {[3, 5, 7, 10, 30].map(n => (
                    <option key={n} value={n}>保留最近 {n} 个</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setScheduleOpen(false)} className="px-4 py-2 border rounded-lg font-bold text-slate-600 cursor-pointer">
                取消
              </button>
              <button
                onClick={saveSchedule}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Check size={13} /> 保存计划
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
