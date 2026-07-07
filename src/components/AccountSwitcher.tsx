import { useState } from 'react';
import { User } from '../types';
import { Users, X, Check, FlaskConical } from 'lucide-react';

interface AccountSwitcherProps {
  users: User[];
  currentUserId: string;
  onSwitch: (userId: string) => void;
}

/**
 * 演示用途的账号(身份)切换器 —— 悬浮在右下角。
 * 生产环境不存在，仅用于快速切换 mock 用户查看不同 Account 上下文。
 */
export default function AccountSwitcher({ users, currentUserId, onSwitch }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <div className="fixed bottom-5 right-5 z-[60] select-none">
      {open ? (
        <div className="w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <FlaskConical size={14} className="text-amber-300" />
              <span className="text-xs font-bold">演示身份切换</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white cursor-pointer">
              <X size={15} />
            </button>
          </div>
          <div className="px-3 py-2 max-h-[320px] overflow-y-auto space-y-1">
            <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              选择一个 Mock 用户登录
            </p>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => { onSwitch(u.id); setOpen(false); }}
                className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                  currentUserId === u.id ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-black shrink-0">
                  {u.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate">{u.displayName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                </div>
                {currentUserId === u.id && <Check size={14} className="text-emerald-500 shrink-0" />}
              </button>
            ))}
          </div>
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400">
            切换身份将重置到该用户的个人工作区
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 pl-2.5 pr-3.5 py-2 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer group"
          title="演示：切换 Mock 账号"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-[11px] font-black">
            {currentUser?.displayName.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[9px] font-bold text-amber-500 uppercase tracking-wide leading-none flex items-center gap-1">
              <Users size={9} /> Demo
            </div>
            <div className="text-[11px] font-bold text-slate-700 leading-tight truncate max-w-[110px]">
              {currentUser?.displayName ?? '切换身份'}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
