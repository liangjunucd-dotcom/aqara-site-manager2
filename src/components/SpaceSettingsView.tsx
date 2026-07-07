import React, { useState } from 'react';
import { Space, Account, User, OrgMember, SpaceShare, SpaceCustomRole } from '../types';
import { SpacePermissions, getSpaceCollaborators } from '../utils/accountContext';
import { Users, Settings, UserPlus, Trash2, ShieldCheck, Tag } from 'lucide-react';

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
  onRemoveShare: (shareId: string) => void;
}

type SubTab = 'basic' | 'members';

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
  onRemoveShare,
}: SpaceSettingsViewProps) {
  const currentSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];
  const collaborators = getSpaceCollaborators(activeSpaceId, spaces, spaceShares, accounts, users, orgMembers);
  const canManage = permissions?.canManageCollaborators ?? false;

  const spaceCustomRoles = customRoles.filter(r => r.spaceId === activeSpaceId);

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('basic');

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRoleKey, setNewMemberRoleKey] = useState('Operator');

  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleMapsTo, setNewRoleMapsTo] = useState<'Admin' | 'Operator'>('Operator');

  const [spaceName, setSpaceName] = useState(currentSpace?.name || '');
  const [spaceDesc, setSpaceDesc] = useState(currentSpace?.description || '');

  // 解析选中的角色 key（内置 Admin/Operator 或 custom:<id>）
  const resolveRole = (): { role: 'Admin' | 'Operator'; roleLabel?: string } => {
    if (newMemberRoleKey === 'Admin' || newMemberRoleKey === 'Operator') {
      return { role: newMemberRoleKey };
    }
    const cr = spaceCustomRoles.find(r => r.id === newMemberRoleKey.replace('custom:', ''));
    if (cr) return { role: cr.mapsTo, roleLabel: cr.name };
    return { role: 'Operator' };
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !canManage) return;
    const { role, roleLabel } = resolveRole();
    onInviteMember(newMemberEmail.trim(), newMemberName.trim(), role, roleLabel);
    setNewMemberEmail('');
    setNewMemberName('');
    setNewMemberRoleKey('Operator');
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

  return (
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
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center gap-2"><Users size={15} /> 项目成员</h3>
                <span className="text-[11px] text-slate-400">{collaborators.length} 人</span>
              </div>

              {canManage && (
                <form onSubmit={handleInvite} className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                  <input type="text" placeholder="姓名" className="px-2.5 py-1.5 text-xs border rounded w-24" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
                  <input type="email" required placeholder="邮箱" className="px-2.5 py-1.5 text-xs border rounded w-40" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
                  <select className="px-2.5 py-1.5 text-xs border rounded bg-white" value={newMemberRoleKey} onChange={e => setNewMemberRoleKey(e.target.value)}>
                    <option value="Admin">Admin（管理员）</option>
                    <option value="Operator">Operator（操作员）</option>
                    {spaceCustomRoles.length > 0 && <option disabled>── 自定义角色 ──</option>}
                    {spaceCustomRoles.map(r => (
                      <option key={r.id} value={`custom:${r.id}`}>{r.name}（≈{r.mapsTo}）</option>
                    ))}
                  </select>
                  <button type="submit" className="px-3.5 py-1.5 bg-[#10b981] text-white font-bold text-xs rounded cursor-pointer flex items-center gap-1">
                    <UserPlus size={13} /> 添加成员
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100">
                      <th className="p-3 pl-4">成员</th>
                      <th className="p-3">项目角色</th>
                      <th className="p-3 text-right pr-4">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {collaborators.map(c => (
                      <tr key={c.user.id + c.role} className="hover:bg-slate-50/50">
                        <td className="p-3 pl-4">
                          <div className="font-bold text-slate-800">{c.user.displayName}</div>
                          <div className="text-[10px] text-slate-400">{c.user.email}</div>
                        </td>
                        <td className="p-3">
                          {c.memberTag === 'owner' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100"><ShieldCheck size={10} /> Owner</span>
                          ) : (
                            <span className="text-slate-700 font-bold">
                              {c.share?.roleLabel ? `${c.share.roleLabel}` : c.role}
                              {c.share?.roleLabel && <span className="text-slate-400 font-normal"> (≈{c.role})</span>}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right pr-4">
                          {canManage && c.share ? (
                            <button onClick={() => { if (confirm(`将 ${c.user.email} 移出本项目？`)) onRemoveShare(c.share!.id); }} className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer">移除</button>
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
    </div>
  );
}
