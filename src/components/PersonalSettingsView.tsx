import { useState } from 'react';
import { User, Organization, OrgMember } from '../types';
import { ArrowLeft, UserCircle, Building2, LogOut, Copy, ShieldCheck, AtSign } from 'lucide-react';

interface JoinedOrg {
  org: Organization;
  member: OrgMember;
  isOwner: boolean;
}

interface PersonalSettingsViewProps {
  user: User;
  joinedOrgs: JoinedOrg[];
  activeOrgId: string;
  onBack: () => void;
  onExitOrg: (orgId: string) => void;
  onEnterAdmin: (orgId: string) => void;
}

type Tab = 'profile' | 'orgs';

export default function PersonalSettingsView({
  user, joinedOrgs, activeOrgId, onBack, onExitOrg, onEnterAdmin,
}: PersonalSettingsViewProps) {
  const [tab, setTab] = useState<Tab>('profile');

  const handleExit = (jo: JoinedOrg) => {
    if (jo.isOwner) {
      alert(`你是「${jo.org.name}」的组织拥有者。\n\n退出前必须先在「企业后台 · 基本信息」中将拥有者移交给其他成员，之后才能退出组织。`);
      return;
    }
    if (confirm(`确认退出「${jo.org.name}」？\n退出后将销毁你在该组织的复合账号，并失去所有 org_space 项目访问权限。`)) {
      onExitOrg(jo.org.id);
    }
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-200 select-none">
      <div className="border-b border-slate-200/60 pb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 mb-2 cursor-pointer">
          <ArrowLeft size={13} /> 返回控制台
        </button>
        <div className="flex items-center gap-2">
          <UserCircle size={16} className="text-slate-700" />
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">个人设置</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mt-1">{user.displayName}</h1>
        <p className="text-xs text-slate-400 mt-1">{user.email}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-52 shrink-0 bg-white border rounded-xl p-3 space-y-1 h-fit">
          <button onClick={() => setTab('profile')} className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer ${tab === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            <UserCircle size={15} /> 个人信息
          </button>
          <button onClick={() => setTab('orgs')} className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer ${tab === 'orgs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Building2 size={15} /> 已加入组织
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{joinedOrgs.length}</span>
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {tab === 'profile' && (
            <div className="bg-white border rounded-xl p-6 space-y-5 shadow-xs">
              <h3 className="font-extrabold text-sm text-slate-800">个人信息</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xl font-black">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-base font-black text-slate-900">{user.displayName}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><AtSign size={11} /> {user.email}</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="border rounded-lg p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">用户 ID</div>
                  <div className="text-xs font-mono text-slate-700 mt-1">{user.id}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">个人原生账号</div>
                  <div className="text-xs font-mono text-slate-700 mt-1">Account({user.id})</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'orgs' && (
            <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-800">已加入组织</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">组织拥有者需先移交拥有者，才能退出组织。</p>
              </div>
              {joinedOrgs.length === 0 ? (
                <div className="px-5 py-10 text-center text-xs text-slate-400">尚未加入任何组织</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100">
                      <th className="p-3 pl-5">组织名称</th>
                      <th className="p-3">组织 ID</th>
                      <th className="p-3">我的角色</th>
                      <th className="p-3 text-right pr-5">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {joinedOrgs.map(jo => (
                      <tr key={jo.org.id} className="hover:bg-slate-50/50">
                        <td className="p-3 pl-5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-black">
                              {jo.org.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800">{jo.org.name}</span>
                            {activeOrgId === jo.org.id && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold border border-blue-100">当前组织</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          <span className="inline-flex items-center gap-1">{jo.org.id} <Copy size={10} className="text-slate-300" /></span>
                        </td>
                        <td className="p-3">
                          {jo.isOwner ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                              <ShieldCheck size={10} /> 拥有者
                            </span>
                          ) : jo.member.memberTag === 'external' ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">外部成员</span>
                          ) : jo.member.isOrgAdmin ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">管理员</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">成员</span>
                          )}
                        </td>
                        <td className="p-3 pr-5 text-right whitespace-nowrap">
                          {jo.member.memberTag === 'internal' && (
                            <button onClick={() => onEnterAdmin(jo.org.id)} className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer mr-4">
                              进入管理后台
                            </button>
                          )}
                          <button
                            onClick={() => handleExit(jo)}
                            className={`font-bold cursor-pointer inline-flex items-center gap-1 ${jo.isOwner ? 'text-slate-300 hover:text-slate-400' : 'text-rose-500 hover:text-rose-700'}`}
                          >
                            <LogOut size={11} /> 退出组织
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
