import React, { useMemo, useState } from 'react';
import { Space, Account, User, OrgMember, SpaceShare, SpaceCustomRole, SpaceRole } from '../types';
import { SpacePermissions, getSpaceCollaborators } from '../utils/accountContext';
import { avatarColor, avatarInitials } from '../utils/avatar';
import {
  Users, Settings, UserPlus, Trash2, ShieldCheck, Tag,
  Search, X, Check, Link2, Copy, Clock, Mail,
} from 'lucide-react';

interface SpaceSettingsViewProps {
  activeSpaceId: string;
  spaces: Space[];
  onUpdateSpaces: (updated: Space[]) => void;
  accounts: Account[];
  users: User[];
  orgMembers: OrgMember[];
  spaceShares: SpaceShare[];
  permissions: SpacePermissions | null;
  customRoles: SpaceCustomRole[];
  onAddCustomRole: (name: string, mapsTo: 'Admin' | 'Operator') => void;
  onRemoveCustomRole: (id: string) => void;
  onDeleteSpace: (spaceId: string) => void;
  onInviteMember: (email: string, name: string, role: 'Admin' | 'Operator', roleLabel?: string) => void;
  onAddOrgMembersToProject: (accountIds: string[], role: 'Admin' | 'Operator', roleLabel?: string) => void;
  onAcceptShare: (shareId: string) => void;
  onRemoveShare: (shareId: string) => void;
}

type SubTab = 'basic' | 'members';

interface MemberRow {
  key: string;
  name: string;
  email: string;
  role: SpaceRole;
  roleLabel?: string;
  status: 'Owner' | 'Added' | 'Pending';
  shareId?: string;
}

export default function SpaceSettingsView({
  activeSpaceId,
  spaces,
  onUpdateSpaces,
  accounts,
  users,
  orgMembers,
  spaceShares,
  permissions,
  customRoles,
  onAddCustomRole,
  onRemoveCustomRole,
  onDeleteSpace,
  onInviteMember,
  onAddOrgMembersToProject,
  onAcceptShare,
  onRemoveShare,
}: SpaceSettingsViewProps) {
  const currentSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];
  const collaborators = getSpaceCollaborators(activeSpaceId, spaces, spaceShares, accounts, users, orgMembers);
  const canManage = permissions?.canManageCollaborators ?? false;

  const isOrgSpace = currentSpace?.spaceType === 'org_space';
  const orgId = currentSpace?.storageOrgId ?? null;

  const spaceCustomRoles = customRoles.filter(r => r.spaceId === activeSpaceId);

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('basic');

  // 通用角色选择（内置 Admin/Operator 或 custom:<id>）
  const [newMemberRoleKey, setNewMemberRoleKey] = useState('Operator');

  // 个人工作区：邮箱邀请
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  // 组织项目：从组织成员中勾选
  const [showAddModal, setShowAddModal] = useState(false);
  const [orgSearch, setOrgSearch] = useState('');
  const [selectedOrgMemberIds, setSelectedOrgMemberIds] = useState<string[]>([]);

  // 组织项目：更多邀请方式（链接邀请）
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkApproval, setLinkApproval] = useState<'none' | 'review'>('review');
  const [linkCopied, setLinkCopied] = useState(false);

  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleMapsTo, setNewRoleMapsTo] = useState<'Admin' | 'Operator'>('Operator');

  const [spaceName, setSpaceName] = useState(currentSpace?.name || '');
  const [spaceDesc, setSpaceDesc] = useState(currentSpace?.description || '');

  const resolveRole = (): { role: 'Admin' | 'Operator'; roleLabel?: string } => {
    if (newMemberRoleKey === 'Admin' || newMemberRoleKey === 'Operator') {
      return { role: newMemberRoleKey };
    }
    const cr = spaceCustomRoles.find(r => r.id === newMemberRoleKey.replace('custom:', ''));
    if (cr) return { role: cr.mapsTo, roleLabel: cr.name };
    return { role: 'Operator' };
  };

  const resolveShareUser = (accountId: string): User | undefined => {
    const acc = accounts.find(a => a.accountId === accountId);
    if (acc) return users.find(u => u.id === acc.userId);
    // 个人工作区待接受邀请：targetAccountId 即 userId
    return users.find(u => u.id === accountId);
  };

  // 已经是项目成员（或待接受）的 accountId 集合，用于组织成员推荐去重
  const existingAccountIds = useMemo(() => {
    const set = new Set<string>();
    if (currentSpace) set.add(currentSpace.ownerAccountId);
    spaceShares.filter(sh => sh.spaceId === activeSpaceId).forEach(sh => set.add(sh.targetAccountId));
    return set;
  }, [currentSpace, spaceShares, activeSpaceId]);

  // 可推荐加入的组织成员（云效式）
  const recommendableOrgMembers = useMemo(() => {
    if (!isOrgSpace || !orgId) return [];
    return orgMembers.filter(
      m => m.orgId === orgId && m.status === 'Active' && !existingAccountIds.has(m.accountId),
    );
  }, [isOrgSpace, orgId, orgMembers, existingAccountIds]);

  const filteredOrgMembers = recommendableOrgMembers.filter(m => {
    const q = orgSearch.trim().toLowerCase();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  // 成员行（活跃 + 待接受）— 直接派生自 spaceShares，避免 useMemo 依赖遗漏导致 UI 不刷新
  const memberRows: MemberRow[] = useMemo(() => {
    const activeAccountIds = new Set(collaborators.map(c => c.account.accountId));
    const rows: MemberRow[] = collaborators.map(c => ({
      key: `active-${c.account.accountId}`,
      name: c.user.displayName,
      email: c.user.email,
      role: c.role,
      roleLabel: c.share?.roleLabel,
      status: c.memberTag === 'owner' ? 'Owner' : 'Added',
      shareId: c.share?.id,
    }));
    spaceShares
      .filter(sh => sh.spaceId === activeSpaceId && sh.status === 'Pending')
      .forEach(sh => {
        if (activeAccountIds.has(sh.targetAccountId)) return;
        const u = resolveShareUser(sh.targetAccountId);
        rows.push({
          key: `pending-${sh.id}`,
          name: u?.displayName ?? sh.targetAccountId,
          email: u?.email ?? '',
          role: sh.role,
          roleLabel: sh.roleLabel,
          status: 'Pending',
          shareId: sh.id,
        });
      });
    return rows;
  }, [collaborators, spaceShares, activeSpaceId, accounts, users]);

  const inviteLink = useMemo(
    () => `https://builder.aqara.com/invite/${activeSpaceId}?token=${activeSpaceId.slice(0, 6)}9f2ac1`,
    [activeSpaceId],
  );

  const roleOptions = (
    <>
      <option value="Admin">Admin（管理员）</option>
      <option value="Operator">Operator（操作员）</option>
      {spaceCustomRoles.length > 0 && <option disabled>── 自定义角色 ──</option>}
      {spaceCustomRoles.map(r => (
        <option key={r.id} value={`custom:${r.id}`}>{r.name}（≈{r.mapsTo}）</option>
      ))}
    </>
  );

  const roleKeyLabel = () => {
    if (newMemberRoleKey === 'Admin') return 'Admin';
    if (newMemberRoleKey === 'Operator') return 'Operator';
    const cr = spaceCustomRoles.find(r => r.id === newMemberRoleKey.replace('custom:', ''));
    return cr ? cr.name : 'Operator';
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setOrgSearch('');
    setSelectedOrgMemberIds([]);
    setNewMemberEmail('');
    setNewMemberName('');
    setNewMemberRoleKey('Operator');
  };

  const toggleOrgMember = (id: string) => {
    setSelectedOrgMemberIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleSubmitOrgMembers = () => {
    if (selectedOrgMemberIds.length === 0 || !canManage) return;
    const { role, roleLabel } = resolveRole();
    const accountIds = recommendableOrgMembers
      .filter(m => selectedOrgMemberIds.includes(m.id))
      .map(m => m.accountId);
    onAddOrgMembersToProject(accountIds, role, roleLabel);
    setShowAddModal(false);
  };

  const handleSubmitPersonalInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !canManage) return;
    const { role, roleLabel } = resolveRole();
    onInviteMember(newMemberEmail.trim(), newMemberName.trim(), role, roleLabel);
    setShowAddModal(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      /* ignore (mock) */
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    onAddCustomRole(newRoleName.trim(), newRoleMapsTo);
    setNewRoleName('');
    setNewRoleMapsTo('Operator');
    setShowAddRole(false);
  };

  const handleSaveBasic = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSpaces(spaces.map(s => s.id === activeSpaceId ? { ...s, name: spaceName, description: spaceDesc } : s));
    alert('项目信息已更新');
  };

  const statusBadge = (status: MemberRow['status']) => {
    if (status === 'Owner') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100"><ShieldCheck size={10} /> Owner</span>;
    }
    if (status === 'Pending') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200"><Clock size={10} /> Pending</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100"><Check size={10} /> Added</span>;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-slate-900">项目设置</h2>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
      {/* 左侧子菜单 */}
      <div className="w-full lg:w-52 shrink-0 bg-white border border-slate-200/80 rounded-xl p-3 space-y-1 select-none h-fit">
        <div className="px-3 py-2 border-b border-slate-50 mb-2">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">项目设置</h4>
          <p className="text-xs font-extrabold text-slate-700 truncate mt-0.5">{currentSpace?.name}</p>
        </div>
        <button
          onClick={() => { setActiveSubTab('basic'); setSpaceName(currentSpace?.name || ''); setSpaceDesc(currentSpace?.description || ''); }}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 cursor-pointer ${activeSubTab === 'basic' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Settings size={15} /> 基本信息
        </button>
        <button
          onClick={() => setActiveSubTab('members')}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 cursor-pointer ${activeSubTab === 'members' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Users size={15} /> 项目成员
        </button>
      </div>

      <div className="flex-1 min-w-0 space-y-5">
        {/* ===== 基本信息 ===== */}
        {activeSubTab === 'basic' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
            <h3 className="font-extrabold text-slate-800 text-sm">基本信息</h3>
            <form onSubmit={handleSaveBasic} className="space-y-4 max-w-xl text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1.5">项目名称</label>
                <input
                  type="text" required disabled={!permissions?.canEditSettings}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold disabled:bg-slate-50 disabled:text-slate-400"
                  value={spaceName} onChange={e => setSpaceName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1.5">项目描述</label>
                <textarea
                  rows={3} disabled={!permissions?.canEditSettings}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                  value={spaceDesc} onChange={e => setSpaceDesc(e.target.value)}
                />
              </div>
              {permissions?.canEditSettings && (
                <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer">保存</button>
              )}
            </form>

            {permissions?.canDelete && (
              <div className="pt-5 border-t border-slate-100">
                <h4 className="font-extrabold text-rose-600 text-xs mb-2">删除项目</h4>
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-[11px] text-rose-600 leading-relaxed max-w-md">
                    删除后不可恢复，项目下的结构节点与已分配的 Studio 绑定关系将被解除。
                  </p>
                  <button
                    type="button"
                    onClick={() => { if (confirm(`确认永久删除项目「${currentSpace?.name}」？`)) onDeleteSpace(activeSpaceId); }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <Trash2 size={13} /> 删除项目
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== 项目成员 ===== */}
        {activeSubTab === 'members' && (
          <>
            {!canManage && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] text-slate-500">
                您当前为 {permissions?.role ?? '访客'}，无法管理项目成员。
              </div>
            )}

            {/* 成员列表 */}
            <div className="bg-white border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-sm flex items-center gap-2"><Users size={15} /> 项目成员</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">{memberRows.length} 人</span>
                  {canManage && (
                    <button
                      onClick={openAddModal}
                      className="px-3.5 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <UserPlus size={13} /> 添加成员
                    </button>
                  )}
                </div>
              </div>

              {canManage && (
                <p className="text-[11px] text-slate-400 -mt-1">
                  {isOrgSpace
                    ? '从组织成员中选择加入本项目，或通过「更多邀请方式」生成邀请链接。'
                    : '通过 Aqara 账号邮箱邀请协作者，对方接受后加入本项目；邀请时设定的角色不可更改。'}
                </p>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100">
                      <th className="p-3 pl-4">成员</th>
                      <th className="p-3">项目角色</th>
                      <th className="p-3">状态</th>
                      <th className="p-3 text-right pr-4">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {memberRows.map(row => (
                      <tr key={row.key} className="hover:bg-slate-50/50">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-full ${avatarColor(row.email || row.key)} flex items-center justify-center text-[10px] font-black text-white shrink-0`}>
                              {avatarInitials(row.name)}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate">{row.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{row.email || '待接受邀请'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {row.status === 'Owner' ? (
                            <span className="text-slate-400 font-normal">—</span>
                          ) : (
                            <span className="text-slate-700 font-bold">
                              {row.roleLabel ? row.roleLabel : row.role}
                              {row.roleLabel && <span className="text-slate-400 font-normal"> (≈{row.role})</span>}
                            </span>
                          )}
                        </td>
                        <td className="p-3">{statusBadge(row.status)}</td>
                        <td className="p-3 text-right pr-4">
                          {canManage && row.shareId ? (
                            <div className="flex items-center justify-end gap-2">
                              {row.status === 'Pending' && (
                                <button
                                  onClick={() => onAcceptShare(row.shareId!)}
                                  className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                                  title="模拟对方接受邀请"
                                >
                                  接受(模拟)
                                </button>
                              )}
                              <button
                                onClick={() => { if (confirm(`将 ${row.email || row.name} 移出本项目？`)) onRemoveShare(row.shareId!); }}
                                className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                              >
                                移除
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 项目角色管理 */}
            <div className="bg-white border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-2"><Tag size={15} /> 项目角色</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    内置 <strong>Admin</strong> / <strong>Operator</strong>；可新增自定义角色（如「爸爸」「妈妈」），权限暂映射到 Admin 或 Operator。
                  </p>
                </div>
                {canManage && (
                  <button onClick={() => setShowAddRole(!showAddRole)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0">+ 新增角色</button>
                )}
              </div>

              {showAddRole && canManage && (
                <form onSubmit={handleAddRole} className="flex flex-wrap gap-2 items-center bg-slate-50 rounded-lg p-3">
                  <input type="text" required placeholder="角色名称（如 爸爸）" className="px-2.5 py-1.5 text-xs border rounded w-40 bg-white" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
                  <span className="text-[11px] text-slate-400">权限映射为</span>
                  <select className="px-2.5 py-1.5 text-xs border rounded bg-white" value={newRoleMapsTo} onChange={e => setNewRoleMapsTo(e.target.value as 'Admin' | 'Operator')}>
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                  </select>
                  <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded cursor-pointer">保存</button>
                </form>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">Admin<span className="text-[10px] text-slate-400 font-normal">内置</span></span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">Operator<span className="text-[10px] text-slate-400 font-normal">内置</span></span>
                {spaceCustomRoles.map(r => (
                  <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                    {r.name}<span className="text-[10px] text-emerald-500 font-normal">≈{r.mapsTo}</span>
                    {canManage && (
                      <button onClick={() => onRemoveCustomRole(r.id)} className="text-emerald-400 hover:text-rose-500 cursor-pointer"><Trash2 size={11} /></button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== 添加成员弹窗（按工作区类型分流） ===== */}
      {showAddModal && canManage && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <UserPlus size={14} className="text-emerald-500" /> 添加成员
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isOrgSpace ? `从「${currentSpace?.name}」所属组织中选择成员加入本项目` : '通过 Aqara 账号邮箱邀请协作者'}
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0">
                <X size={16} />
              </button>
            </div>

            {isOrgSpace ? (
              /* ===== 组织项目：云效式勾选组织成员 ===== */
              <>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={orgSearch}
                        onChange={e => setOrgSearch(e.target.value)}
                        placeholder="搜索组织成员"
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                    <button
                      onClick={() => { setShowAddModal(false); setShowLinkModal(true); setLinkCopied(false); }}
                      className="ml-3 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap cursor-pointer flex items-center gap-1"
                    >
                      <Link2 size={12} /> 更多邀请方式
                    </button>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">推荐成员</div>
                  <div className="max-h-56 overflow-y-auto -mx-1 px-1 space-y-1">
                    {filteredOrgMembers.length === 0 ? (
                      <p className="text-center text-slate-400 py-6">该组织暂无可添加的成员</p>
                    ) : (
                      filteredOrgMembers.map(m => {
                        const checked = selectedOrgMemberIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleOrgMember(m.id)}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer border ${
                              checked ? 'bg-emerald-50 border-emerald-200' : 'border-transparent hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-full ${avatarColor(m.accountId)} flex items-center justify-center text-[10px] font-black text-white shrink-0`}>
                              {avatarInitials(m.name)}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block font-bold text-slate-800 truncate">
                                {m.name}
                                {m.memberTag === 'external' && <span className="ml-1 text-[9px] font-bold text-amber-600">外部</span>}
                              </span>
                              <span className="block text-[10px] text-slate-400 truncate">{m.email}</span>
                            </span>
                            <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              checked ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
                            }`}>
                              {checked && <Check size={11} className="text-white" />}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500">添加为</span>
                    <select
                      className="px-2.5 py-1.5 text-xs border rounded bg-white flex-1"
                      value={newMemberRoleKey}
                      onChange={e => setNewMemberRoleKey(e.target.value)}
                    >
                      {roleOptions}
                    </select>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-bold">已选 {selectedOrgMemberIds.length} 个，添加为 {roleKeyLabel()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg font-bold text-slate-600 cursor-pointer">取消</button>
                    <button
                      onClick={handleSubmitOrgMembers}
                      disabled={selectedOrgMemberIds.length === 0}
                      className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={13} /> 提交
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ===== 个人工作区：邮箱 + 角色邀请（Loxone 式） ===== */
              <form onSubmit={handleSubmitPersonalInvite}>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Aqara 账号邮箱</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email" required
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">备注姓名（可选）</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      placeholder="如 家人 / 同事"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">授予角色（邀请后不可更改）</label>
                    <select
                      className="w-full px-2.5 py-2 text-xs border rounded bg-white"
                      value={newMemberRoleKey}
                      onChange={e => setNewMemberRoleKey(e.target.value)}
                    >
                      {roleOptions}
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                    邀请将以 <strong>Pending</strong> 状态发出，对方接受后变为 <strong>Added</strong>。角色在邀请后固定，不可修改。
                  </p>
                </div>
                <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg font-bold text-slate-600 cursor-pointer">取消</button>
                  <button type="submit" className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5">
                    <UserPlus size={13} /> 发送邀请
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===== 组织项目：更多邀请方式（链接邀请） ===== */}
      {showLinkModal && canManage && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Link2 size={14} className="text-emerald-500" /> 通过链接邀请
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">分享链接给对方，可加入「{currentSpace?.name}」项目</p>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">加入方式</label>
                <select
                  className="w-full px-2.5 py-2 text-xs border rounded bg-white"
                  value={linkApproval}
                  onChange={e => setLinkApproval(e.target.value as 'none' | 'review')}
                >
                  <option value="review">需要审批（管理员确认后加入）</option>
                  <option value="none">不需要审批，直接加入</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">邀请链接</label>
                <div className="flex items-stretch gap-2">
                  <input
                    readOnly
                    value={inviteLink}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {linkCopied ? <Check size={13} /> : <Copy size={13} />}
                    {linkCopied ? '已复制' : '复制'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {linkApproval === 'review'
                    ? '对方通过链接申请后，需在成员列表中审批通过。'
                    : '对方打开链接即可直接加入本项目。'}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => { setShowLinkModal(false); openAddModal(); }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
              >
                <Users size={12} /> 返回选择组织成员
              </button>
              <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 border rounded-lg font-bold text-slate-600 cursor-pointer">完成</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
