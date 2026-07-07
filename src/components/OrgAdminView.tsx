import React, { useState } from 'react';
import { Organization, OrgDepartment, OrgMember, OrgRole, Space, User } from '../types';
import {
  Building2, Users, Network, Plus, Trash2,
  ArrowLeft, FolderTree, UserPlus, Info, KeyRound, Copy, Crown, Search,
} from 'lucide-react';

interface OrgAdminViewProps {
  organization: Organization;
  departments: OrgDepartment[];
  onUpdateDepartments: (updated: OrgDepartment[]) => void;
  orgMembers: OrgMember[];
  users: User[];
  onAddInternalMember: (email: string, name: string, departmentId?: string | null) => void;
  onRemoveOrgMember: (memberId: string) => void;
  onChangeMemberRole: (memberId: string, role: OrgRole) => void;
  onTransferOwner: (newOwnerUserId: string) => void;
  onDeleteOrg: () => void;
  spaces: Space[];
  onBack: () => void;
}

type AdminTab = 'basic' | 'members' | 'roles' | 'structure';

const ROLE_LABEL: Record<OrgRole, string> = {
  owner: '拥有者',
  admin: '管理员',
  member: '成员',
  external: '外部成员',
};

const ROLE_DEFS: { role: OrgRole; label: string; desc: string; scope: string }[] = [
  { role: 'owner', label: '拥有者 (Owner)', desc: '组织最高权限：管理成员、部门、计费与删除组织。每个组织唯一，可移交。', scope: '全组织' },
  { role: 'admin', label: '管理员 (Admin)', desc: '管理成员与组织架构，默认获得全部 org_space 的 Admin 协作权限。', scope: '全组织 org_space' },
  { role: 'member', label: '成员 (Member)', desc: '内部员工，默认继承组织 org_space 访问权限，可被授予具体项目角色。', scope: '被授予的 org_space' },
  { role: 'external', label: '外部成员 (External)', desc: '经 org_space 邀请自动入组的外部实施人员，仅可见被共享项目，角色锁定 Operator。', scope: '单个被共享 org_space' },
];

export default function OrgAdminView({
  organization,
  departments,
  onUpdateDepartments,
  orgMembers,
  users,
  onAddInternalMember,
  onRemoveOrgMember,
  onChangeMemberRole,
  onTransferOwner,
  onDeleteOrg,
  spaces,
  onBack,
}: OrgAdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('basic');
  const [memberTab, setMemberTab] = useState<'internal' | 'external'>('internal');
  const [memberSearch, setMemberSearch] = useState('');

  const [newDeptName, setNewDeptName] = useState('');
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberDeptId, setNewMemberDeptId] = useState('');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTargetUserId, setTransferTargetUserId] = useState('');

  const orgDepartments = departments.filter(d => d.orgId === organization.id);
  const orgMemberList = orgMembers.filter(m => m.orgId === organization.id);
  const internalMembers = orgMemberList.filter(m => m.memberTag === 'internal');
  const externalMembers = orgMemberList.filter(m => m.memberTag === 'external');
  const orgProjects = spaces.filter(s => s.storageOrgId === organization.id);
  const ownerMember = orgMemberList.find(m => (m.orgRole === 'owner') || m.userId === organization.ownerUserId);
  const transferCandidates = internalMembers.filter(m => m.userId !== ownerMember?.userId);

  const getDeptName = (deptId?: string | null) =>
    orgDepartments.find(d => d.id === deptId)?.name ?? '—';

  const roleOf = (m: OrgMember): OrgRole =>
    m.orgRole ?? (m.memberTag === 'external' ? 'external' : m.isOrgAdmin ? 'admin' : 'member');

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    onUpdateDepartments([
      ...departments,
      { id: `dept-${Date.now()}`, orgId: organization.id, name: newDeptName.trim(), parentId: null },
    ]);
    setNewDeptName('');
    setIsAddDeptOpen(false);
  };

  const handleAddInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    onAddInternalMember(newMemberEmail.trim(), newMemberName.trim() || 'New Member', newMemberDeptId || null);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberDeptId('');
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetUserId) return;
    const target = internalMembers.find(m => m.userId === transferTargetUserId);
    if (target && confirm(`确认将「${organization.name}」的拥有者移交给 ${target.name}？\n移交后你将降级为管理员。`)) {
      onTransferOwner(transferTargetUserId);
      setIsTransferOpen(false);
      setTransferTargetUserId('');
    }
  };

  const filteredMembers = (memberTab === 'internal' ? internalMembers : externalMembers)
    .filter(m => !memberSearch || m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase()));

  const renderRoleBadge = (role: OrgRole) => {
    const map: Record<OrgRole, string> = {
      owner: 'bg-amber-50 text-amber-700 border-amber-100',
      admin: 'bg-blue-50 text-blue-700 border-blue-100',
      member: 'bg-slate-100 text-slate-600 border-slate-200',
      external: 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[role]}`}>
        {role === 'owner' && <Crown size={10} />} {ROLE_LABEL[role]}
      </span>
    );
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-200 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 mb-2 cursor-pointer">
            <ArrowLeft size={13} /> 返回控制台
          </button>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#3b82f6]" />
            <span className="text-[10px] uppercase font-black tracking-wider text-[#3b82f6]">企业管理后台</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">{organization.name}</h1>
        </div>
        <div className="flex gap-3 text-center">
          <div className="px-4 py-2.5 bg-white border rounded-xl">
            <div className="text-lg font-black">{internalMembers.length}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">内部成员</div>
          </div>
          <div className="px-4 py-2.5 bg-white border rounded-xl">
            <div className="text-lg font-black">{externalMembers.length}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">外部成员</div>
          </div>
          <div className="px-4 py-2.5 bg-white border rounded-xl">
            <div className="text-lg font-black">{orgProjects.length}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase">org_space</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-52 shrink-0 bg-white border rounded-xl p-3 space-y-1 h-fit">
          {([
            { id: 'basic', label: '基本信息', icon: Info },
            { id: 'members', label: '成员管理', icon: Users },
            { id: 'roles', label: '角色权限', icon: KeyRound },
            { id: 'structure', label: '组织架构', icon: Network },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer ${activeTab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 space-y-5">
          {/* ===== 基本信息 ===== */}
          {activeTab === 'basic' && (
            <>
              <div className="bg-white border rounded-xl p-6 space-y-5 shadow-xs">
                <h3 className="font-extrabold text-sm text-slate-800">基本信息</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">组织名称</div>
                    <div className="text-sm font-bold text-slate-800 mt-1">{organization.name}</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">组织 ID</div>
                    <div className="text-xs font-mono text-slate-700 mt-1 flex items-center gap-1">{organization.id} <Copy size={11} className="text-slate-300" /></div>
                  </div>
                  <div className="border rounded-lg p-3 sm:col-span-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">组织简介</div>
                    <div className="text-xs text-slate-600 mt-1">{organization.description ?? '—'}</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">创建时间</div>
                    <div className="text-xs text-slate-600 mt-1">{organization.createdAt ?? '—'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-6 space-y-3 shadow-xs">
                <h3 className="font-extrabold text-sm text-slate-800">组织拥有者</h3>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black">
                    {ownerMember?.name.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {ownerMember?.name ?? '未知'} <Crown size={12} className="text-amber-500" />
                    </div>
                    <div className="text-[11px] text-slate-400">{ownerMember?.email}</div>
                  </div>
                  <button onClick={() => setIsTransferOpen(true)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                    移交拥有者
                  </button>
                </div>
              </div>

              <div className="bg-white border border-rose-100 rounded-xl p-6 space-y-3 shadow-xs">
                <h3 className="font-extrabold text-sm text-rose-600">删除组织</h3>
                <p className="text-[11px] text-slate-500">
                  删除组织后，将永久删除所有 org_space 项目、成员复合账号、部门等组织内所有数据，且不可恢复，请谨慎操作！
                </p>
                <button
                  onClick={() => {
                    if (confirm(`确认永久删除组织「${organization.name}」？\n该操作不可恢复，将销毁全部 org_space 项目与成员账号。`)) {
                      onDeleteOrg();
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-lg hover:bg-rose-100 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> 删除组织
                </button>
              </div>
            </>
          )}

          {/* ===== 成员管理 ===== */}
          {activeTab === 'members' && (
            <div className="bg-white border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-wrap gap-2 items-center border-b border-slate-100 pb-3">
                <button onClick={() => setMemberTab('internal')} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${memberTab === 'internal' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  内部成员 · {internalMembers.length}
                </button>
                <button onClick={() => setMemberTab('external')} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${memberTab === 'external' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  外部成员 · {externalMembers.length}
                </button>
                <div className="ml-auto relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="搜索成员" className="pl-7 pr-2 py-1.5 text-xs border rounded-lg w-40" />
                </div>
              </div>

              {memberTab === 'internal' && (
                <form onSubmit={handleAddInternal} className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                  <input type="text" placeholder="姓名" className="px-2.5 py-1.5 text-xs border rounded w-28" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
                  <input type="email" required placeholder="邮箱" className="px-2.5 py-1.5 text-xs border rounded w-44" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
                  <select className="px-2.5 py-1.5 text-xs border rounded bg-white" value={newMemberDeptId} onChange={e => setNewMemberDeptId(e.target.value)}>
                    <option value="">选择部门</option>
                    {orgDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button type="submit" className="px-3.5 py-1.5 bg-[#10b981] text-white font-bold text-xs rounded cursor-pointer flex items-center gap-1"><UserPlus size={13} /> 添加成员</button>
                </form>
              )}

              {memberTab === 'external' && (
                <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <Info size={13} />
                  外部成员无手动录入入口，仅通过 org_space 协作邀请自动创建，角色固定 Operator。
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100">
                      <th className="p-3 pl-4">成员名称</th>
                      <th className="p-3">成员状态</th>
                      <th className="p-3">角色</th>
                      <th className="p-3">部门</th>
                      <th className="p-3">最近访问</th>
                      <th className="p-3 text-right pr-4">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMembers.map(member => {
                      const role = roleOf(member);
                      const isOwner = role === 'owner';
                      return (
                        <tr key={member.id} className="hover:bg-slate-50/50">
                          <td className="p-3 pl-4">
                            <div className="font-bold text-slate-800">{member.name}</div>
                            <div className="text-slate-400 text-[10px]">主账号：{member.email}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${member.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {member.status === 'Active' ? '使用中' : '待审批'}
                            </span>
                          </td>
                          <td className="p-3">
                            {isOwner || member.memberTag === 'external' ? (
                              renderRoleBadge(role)
                            ) : (
                              <select
                                value={role}
                                onChange={e => onChangeMemberRole(member.id, e.target.value as OrgRole)}
                                className="px-2 py-1 text-[11px] border rounded bg-white font-bold text-slate-700 cursor-pointer"
                              >
                                <option value="admin">管理员</option>
                                <option value="member">成员</option>
                              </select>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">{getDeptName(member.departmentId)}</td>
                          <td className="p-3 text-slate-400 text-[11px]">{member.lastActiveAt ?? '—'}</td>
                          <td className="p-3 text-right pr-4">
                            {isOwner ? (
                              <span className="text-slate-300 text-[10px]">拥有者受保护</span>
                            ) : (
                              <button
                                onClick={() => {
                                  if (confirm(`移除 ${member.email}？将销毁复合账号并回收该组织全部 org_space 权限。`)) {
                                    onRemoveOrgMember(member.id);
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                              >
                                移除
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== 角色权限 ===== */}
          {activeTab === 'roles' && (
            <div className="bg-white border rounded-xl p-5 space-y-4 shadow-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">角色权限</h3>
                <p className="text-[11px] text-slate-400 mt-1">组织内共 4 类角色，决定成员在组织与 org_space 项目内的权限范围。</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {ROLE_DEFS.map(r => (
                  <div key={r.role} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      {renderRoleBadge(r.role)}
                      <span className="text-[10px] font-bold text-slate-400">
                        {orgMemberList.filter(m => roleOf(m) === r.role).length} 人
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">{r.label}</div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
                    <div className="mt-2 text-[10px] text-slate-400">
                      <span className="font-bold">权限范围：</span>{r.scope}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== 组织架构 ===== */}
          {activeTab === 'structure' && (
            <div className="bg-white border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm">组织架构 · 部门</h3>
                <button onClick={() => setIsAddDeptOpen(true)} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1">
                  <Plus size={13} /> 添加部门
                </button>
              </div>
              <div className="border rounded-xl p-3 bg-[#fbfbfb] min-h-[200px] text-xs space-y-1">
                {orgDepartments.filter(d => !d.parentId).map(root => (
                  <div key={root.id}>
                    <div className="flex items-center gap-2 py-1.5 font-bold text-slate-800">
                      <FolderTree size={13} className="text-slate-400" /> {root.name}
                      <span className="text-[10px] font-normal text-slate-400">
                        ({orgMemberList.filter(m => m.departmentId === root.id).length})
                      </span>
                    </div>
                    {orgDepartments.filter(d => d.parentId === root.id).map(child => (
                      <div key={child.id} className="flex items-center gap-2 py-1 pl-6 text-slate-600">
                        <span className="w-1 h-1 rounded-full bg-slate-300" /> {child.name}
                        <span className="text-[10px] text-slate-400">
                          ({orgMemberList.filter(m => m.departmentId === child.id).length})
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 移交拥有者弹窗 */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleTransfer} className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 text-xs">
            <h3 className="font-extrabold text-sm">移交组织拥有者</h3>
            <p className="text-[11px] text-slate-500">选择一名内部成员作为新的拥有者，移交后你将降级为管理员。</p>
            <select required className="w-full px-3 py-2 border rounded-lg bg-white" value={transferTargetUserId} onChange={e => setTransferTargetUserId(e.target.value)}>
              <option value="">选择新拥有者</option>
              {transferCandidates.map(m => <option key={m.userId} value={m.userId}>{m.name} · {m.email}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsTransferOpen(false)} className="flex-1 py-2 border rounded-lg cursor-pointer">取消</button>
              <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg cursor-pointer">确认移交</button>
            </div>
          </form>
        </div>
      )}

      {/* 添加部门弹窗 */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddDepartment} className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-3 text-xs">
            <h3 className="font-extrabold">添加部门</h3>
            <input required className="w-full px-3 py-2 border rounded-lg" placeholder="部门名称" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsAddDeptOpen(false)} className="flex-1 py-2 border rounded-lg cursor-pointer">取消</button>
              <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg cursor-pointer">创建</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
