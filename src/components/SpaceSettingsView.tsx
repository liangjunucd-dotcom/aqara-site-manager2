import React, { useState } from 'react';
import { Space, SpaceStructureNode } from '../types';
import { 
  Users, Shield, Activity, FileText, Settings, Search, PlusCircle, Check, Trash, Trash2
} from 'lucide-react';

interface SpaceSettingsViewProps {
  activeSpaceId: string;
  spaces: Space[];
  onUpdateSpaces: (updated: Space[]) => void;
  structureNodes: SpaceStructureNode[];
  onUpdateNodes: (updated: SpaceStructureNode[]) => void;
  members: any[];
  onUpdateMembers: (updated: any[]) => void;
  roles: any[];
  onUpdateRoles: (updated: any[]) => void;
  auditLogs: any[];
  onUpdateAuditLogs: (updated: any[]) => void;
  onDeleteSpace: (spaceId: string) => void;
}

export default function SpaceSettingsView({
  activeSpaceId,
  spaces,
  onUpdateSpaces,
  structureNodes,
  onUpdateNodes,
  members,
  onUpdateMembers,
  roles,
  onUpdateRoles,
  auditLogs,
  onUpdateAuditLogs,
  onDeleteSpace
}: SpaceSettingsViewProps) {
  const currentSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];
  
  // Left Settings Sub-menu tab: 'members' | 'roles' | 'usage' | 'logs' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'roles' | 'usage' | 'logs' | 'settings'>('members');

  // New item states
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Operator');
  const [newMemberName, setNewMemberName] = useState('');

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [searchLogQuery, setSearchLogQuery] = useState('');

  const [spaceSettingsName, setSpaceSettingsName] = useState(currentSpace?.name || '');
  const [spaceSettingsDesc, setSpaceSettingsDesc] = useState(currentSpace?.description || '');

  // Helper to add audit log entry
  const addAuditLog = (action: string, detail: string) => {
    const newLog = {
      id: `log-${Date.now()}`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'liangjunucd@gmail.com',
      action,
      detail
    };
    onUpdateAuditLogs([newLog, ...auditLogs]);
  };

  // Manage Space Members Actions
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    const newMem = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim() || 'New Staff Member',
      email: newMemberEmail.trim(),
      role: newMemberRole,
      status: 'Pending',
      dateAdded: new Date().toISOString().split('T')[0]
    };
    onUpdateMembers([...members, newMem]);
    setNewMemberEmail('');
    setNewMemberName('');
    addAuditLog('Member Invited', `Invited ${newMemberEmail} as ${newMemberRole}`);
  };

  const handleRemoveMember = (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove member ${email}?`)) return;
    onUpdateMembers(members.filter(m => m.id !== id));
    addAuditLog('Member Removed', `Revoked access permissions for ${email}`);
  };

  // Manage Custom Roles Actions
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newRoleObj = {
      id: `role-${Date.now()}`,
      name: newRoleName,
      desc: newRoleDesc || 'Custom workspace role with specific access privileges',
      permissions: ['read', 'write']
    };
    onUpdateRoles([...roles, newRoleObj]);
    setNewRoleName('');
    setNewRoleDesc('');
    addAuditLog('Role Created', `Created customized security role "${newRoleName}"`);
  };

  // Space Settings update
  const handleUpdateSpaceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSpaces(spaces.map(s => {
      if (s.id === activeSpaceId) {
        return { ...s, name: spaceSettingsName, description: spaceSettingsDesc };
      }
      return s;
    }));
    alert('Space settings updated successfully!');
    addAuditLog('Space Configured', `Updated configuration variables for space "${spaceSettingsName}"`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
      
      {/* ==================== LEFT SUB-SIDEBAR FOR SETTINGS MENU ==================== */}
      <div className="w-full lg:w-60 shrink-0 bg-white border border-slate-200/80 rounded-xl p-3 space-y-1 select-none">
        <div className="px-3 py-2 border-b border-slate-50 mb-2">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Space Administration
          </h4>
          <p className="text-xs font-extrabold text-slate-700 truncate mt-0.5">
            {currentSpace?.name}
          </p>
        </div>

        <button
          onClick={() => setActiveSubTab('members')}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
            activeSubTab === 'members'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <Users size={15} />
          <span>成员与权限 (Members)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
            activeSubTab === 'roles'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <Shield size={15} />
          <span>角色管理 (Roles)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('usage')}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
            activeSubTab === 'usage'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <Activity size={15} />
          <span>用量与告警 (Alerts)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <FileText size={15} />
          <span>审计日志 (Audit Logs)</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('settings');
            setSpaceSettingsName(currentSpace?.name || '');
            setSpaceSettingsDesc(currentSpace?.description || '');
          }}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
            activeSubTab === 'settings'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
          }`}
        >
          <Settings size={15} />
          <span>空间设置 (Space Config)</span>
        </button>
      </div>

      {/* ==================== RIGHT PANEL CONTENT STAGE ==================== */}
      <div className="flex-1 min-w-0">
        
        {/* MEMBERS & PERMISSIONS */}
        {activeSubTab === 'members' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">成员与权限 (Members & System Access)</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Manage user administration, permission layers, and physical Studio assignment constraints.
                </p>
              </div>
              
              <form onSubmit={handleAddMember} className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  required
                  placeholder="User display name"
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none w-32 focus:border-slate-400"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none w-44 focus:border-slate-400"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
                <select
                  className="px-2.5 py-1.5 text-xs border border-slate-200 bg-white rounded focus:outline-none focus:border-slate-400"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#10b981] text-white hover:bg-[#059669] font-bold text-xs rounded transition-colors cursor-pointer"
                >
                  + Invite User
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100">
                    <th className="p-3 pl-4">Name / Contact</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">Commission State</th>
                    <th className="p-3">Invite Date</th>
                    <th className="p-3 text-right pr-4">Revocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50/50">
                      <td className="p-3 pl-4">
                        <div className="font-bold text-slate-800">{member.name}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{member.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-sm text-[10.5px]">
                          {member.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          member.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">
                        {member.dateAdded}
                      </td>
                      <td className="p-3 text-right pr-4">
                        {member.role === 'Super Admin' ? (
                          <span className="text-slate-300 text-[10px] font-semibold">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.email)}
                            className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLE ADMINISTRATION */}
        {activeSubTab === 'roles' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">角色管理 (Role Administration)</h3>
                <p className="text-[11px] text-[#94a3b8] mt-1">
                  Customize operational privileges across physical structures and Studio binding plans.
                </p>
              </div>

              <form onSubmit={handleCreateRole} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  required
                  placeholder="Custom role name..."
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none w-44 focus:border-slate-400 font-bold"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Role description..."
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none w-56 focus:border-slate-400"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs rounded transition-colors cursor-pointer"
                >
                  Create Role
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map(role => (
                <div key={role.id} className="border border-slate-100 rounded-xl p-4 bg-[#fbfbfb] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-xs">{role.name}</h4>
                      <span className="text-[9px] uppercase font-mono bg-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded">
                        ID: {role.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                      {role.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">
                      Security Permissions Mapping
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['read', 'write', 'provision', 'admin'].map(perm => {
                        const hasPerm = role.permissions.includes(perm);
                        return (
                          <span
                            key={perm}
                            className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                              hasPerm 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {perm}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALERTS & USAGE */}
        {activeSubTab === 'usage' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6 shadow-xs">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">用量与告警 (System Health, Usage & Alerts)</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure telemetry warning zones and real-time app alert triggers for active smart devices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-100 rounded-xl p-4 bg-[#fbfbfb] text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Device Events today</span>
                <span className="text-2xl font-black text-[#10b981]">1,284</span>
                <span className="text-[9px] text-slate-400 block font-semibold">Low rf-latency mesh</span>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 bg-[#fbfbfb] text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Active RF Channels</span>
                <span className="text-2xl font-black text-[#3b82f6]">Zigbee CH 11</span>
                <span className="text-[9px] text-slate-400 block font-semibold">Automated interference hop</span>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 bg-[#fbfbfb] text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">System Heartbeat Loss</span>
                <span className="text-2xl font-black text-rose-500">0 Alerts</span>
                <span className="text-[9px] text-slate-400 block font-semibold">Gateway mesh fully synchronized</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Threshold triggers configuration
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-600">
                <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-[#fdfdfd]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Temperature Warning Zone</span>
                    <span className="text-xs font-bold text-[#10b981]">35°C Max</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="60" 
                    defaultValue="35"
                    className="w-full accent-[#10b981]" 
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Triggers high-priority push notification if rack servers exceed limit.</p>
                </div>

                <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-[#fdfdfd]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Gateway Offline Latency</span>
                    <span className="text-xs font-bold text-sky-600">5 Minutes</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    defaultValue="5"
                    className="w-full accent-[#3b82f6]" 
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Triggers automated system diagnostic if a miniserver drops link.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS */}
        {activeSubTab === 'logs' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">空间审计日志 (Space Audit Logs)</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Security log record of structure changes, device bindings, and operator logins.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  className="w-full pl-7.5 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-[#fdfdfd] focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors"
                  value={searchLogQuery}
                  onChange={(e) => setSearchLogQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden border border-slate-100 rounded-lg">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100 sticky top-0">
                      <th className="p-3 pl-4">Timestamp</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Action Type</th>
                      <th className="p-3">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {auditLogs
                      .filter(log => 
                        log.action.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
                        log.detail.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
                        log.user.toLowerCase().includes(searchLogQuery.toLowerCase())
                      )
                      .map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-3 pl-4 font-mono text-[10.5px] text-slate-400">{log.time}</td>
                          <td className="p-3 text-[#1e293b] font-semibold">{log.user}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9.5px] uppercase font-bold">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-sans">{log.detail}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SPACE CONFIGURATION */}
        {activeSubTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6 shadow-xs">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">空间设置 (Space Configuration Settings)</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure parameters, rename space node, or decommission space nodes.
              </p>
            </div>

            <form onSubmit={handleUpdateSpaceSettings} className="space-y-4 max-w-xl text-xs">
              <div>
                <label htmlFor="space-settings-name" className="block font-bold text-slate-500 uppercase text-[9px] mb-1">
                  Space Name / 业务空间名称
                </label>
                <input
                  type="text"
                  id="space-settings-name"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold"
                  value={spaceSettingsName}
                  onChange={(e) => setSpaceSettingsName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="space-settings-desc" className="block font-bold text-slate-500 uppercase text-[9px] mb-1">
                  Space Description / 空间描述
                </label>
                <textarea
                  id="space-settings-desc"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                  value={spaceSettingsDesc}
                  onChange={(e) => setSpaceSettingsDesc(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="save-space-settings"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded cursor-pointer transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>

            <div className="pt-5 border-t border-slate-100">
              <h4 className="font-extrabold text-rose-600 text-xs uppercase tracking-wider mb-2">
                Danger Zone / 危险操作区
              </h4>
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h5 className="font-bold text-rose-800 text-xs">Decommission / Delete Space</h5>
                  <p className="text-[11px] text-rose-600 mt-1 leading-relaxed max-w-md">
                    This action cannot be undone. All custom subdivision nodes and Assigned Studios under this space will be reset and unassigned.
                  </p>
                </div>
                <button
                  type="button"
                  id="delete-space-trigger"
                  onClick={() => {
                    if (confirm(`CRITICAL WARNING: Are you sure you want to permanently delete Space "${currentSpace?.name}"? All structure nodes and assigned Studio endpoints will be unlinked.`)) {
                      onDeleteSpace(activeSpaceId);
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded cursor-pointer shrink-0 transition-colors"
                >
                  Delete Space
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
