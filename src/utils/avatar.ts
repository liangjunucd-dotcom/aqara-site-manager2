// 根据字符串稳定生成头像底色（用于成员彩色圆形头像）
const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function avatarInitials(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';
  // 中文取首字，英文取首字母（大写）
  const first = trimmed[0];
  if (/[a-zA-Z]/.test(first)) return first.toUpperCase();
  return first;
}
