import {
  Account,
  MemberTag,
  Organization,
  OrgMember,
  Space,
  SpaceRole,
  SpaceShare,
  User,
  isEnterpriseOrg,
  isPersonalOrg,
  PERSONAL_ORG_ID,
  resolveAccountId,
} from '../types';

export interface VisibleSpaceItem {
  space: Space;
  role: SpaceRole;
  isOwner: boolean;
  share?: SpaceShare;
}

export interface SpacePermissions {
  canDelete: boolean;
  canTransfer: boolean;
  canEditSettings: boolean;
  canManageCollaborators: boolean;
  isShared: boolean;
  role: SpaceRole;
}

export function getAccessibleOrgs(
  userId: string,
  organizations: Organization[],
  orgMembers: OrgMember[],
): Organization[] {
  const personal = organizations.find(o => o.id === PERSONAL_ORG_ID)!;
  const orgIds = new Set(
    orgMembers.filter(m => m.userId === userId && m.status === 'Active').map(m => m.orgId),
  );
  return [personal, ...organizations.filter(o => isEnterpriseOrg(o.id) && orgIds.has(o.id))];
}

export function getCurrentMemberTag(
  userId: string,
  orgId: string,
  orgMembers: OrgMember[],
): MemberTag | null {
  const m = orgMembers.find(om => om.userId === userId && om.orgId === orgId && om.status === 'Active');
  return m?.memberTag ?? null;
}

export function isExternalMember(
  userId: string,
  orgId: string,
  orgMembers: OrgMember[],
): boolean {
  return getCurrentMemberTag(userId, orgId, orgMembers) === 'external';
}

/** 当前 Account 上下文下可见 Space */
export function getVisibleSpaces(
  userId: string,
  accountOrgId: string,
  spaces: Space[],
  spaceShares: SpaceShare[],
): VisibleSpaceItem[] {
  const accountId = resolveAccountId(userId, accountOrgId);
  const isPersonal = isPersonalOrg(accountOrgId);

  const owned = spaces.filter(s => {
    if (s.ownerAccountId !== accountId) return false;
    return isPersonal ? s.spaceType === 'personal_space' : s.spaceType === 'org_space' && s.storageOrgId === accountOrgId;
  });

  const shared = spaceShares
    .filter(sh => {
      if (sh.targetAccountId !== accountId || sh.status !== 'Active') return false;
      const space = spaces.find(s => s.id === sh.spaceId);
      if (!space) return false;
      return isPersonal
        ? sh.shareType === 'personal_space'
        : sh.shareType === 'org_space' && space.storageOrgId === accountOrgId;
    })
    .map(sh => {
      const space = spaces.find(s => s.id === sh.spaceId)!;
      return { space, role: sh.role, isOwner: false, share: sh };
    });

  const ownedItems: VisibleSpaceItem[] = owned.map(space => ({
    space,
    role: 'Owner' as SpaceRole,
    isOwner: true,
  }));

  return [...ownedItems, ...shared];
}

export function splitPersonalSpaces(items: VisibleSpaceItem[]) {
  return {
    owned: items.filter(i => i.isOwner),
    shared: items.filter(i => !i.isOwner),
  };
}

export function getSpacePermissions(
  userId: string,
  accountOrgId: string,
  spaceId: string,
  spaces: Space[],
  spaceShares: SpaceShare[],
): SpacePermissions | null {
  const accountId = resolveAccountId(userId, accountOrgId);
  const space = spaces.find(s => s.id === spaceId);
  if (!space) return null;

  const isOwner = space.ownerAccountId === accountId;
  const share = spaceShares.find(
    sh => sh.spaceId === spaceId && sh.targetAccountId === accountId && sh.status === 'Active',
  );

  if (!isOwner && !share) return null;

  const role: SpaceRole = isOwner ? 'Owner' : share!.role;
  const isAdmin = role === 'Admin';
  const isOperator = role === 'Operator';

  return {
    canDelete: isOwner,
    canTransfer: isOwner,
    canEditSettings: isOwner || isAdmin,
    canManageCollaborators: isOwner || isAdmin,
    isShared: !isOwner,
    role,
  };
}

export function getSpaceCollaborators(
  spaceId: string,
  spaces: Space[],
  spaceShares: SpaceShare[],
  accounts: Account[],
  users: User[],
  orgMembers: OrgMember[],
): Array<{
  share: SpaceShare | null;
  user: User;
  account: Account;
  memberTag: MemberTag | 'owner';
  role: SpaceRole;
}> {
  const space = spaces.find(s => s.id === spaceId);
  if (!space) return [];

  const ownerAccount = accounts.find(a => a.accountId === space.ownerAccountId);
  const ownerUser = ownerAccount ? users.find(u => u.id === ownerAccount.userId) : undefined;

  const result: Array<{
    share: SpaceShare | null;
    user: User;
    account: Account;
    memberTag: MemberTag | 'owner';
    role: SpaceRole;
  }> = [];

  if (ownerUser && ownerAccount) {
    result.push({
      share: null,
      user: ownerUser,
      account: ownerAccount,
      memberTag: 'owner',
      role: 'Owner',
    });
  }

  spaceShares
    .filter(sh => sh.spaceId === spaceId && sh.status === 'Active')
    .forEach(sh => {
      const account = accounts.find(a => a.accountId === sh.targetAccountId);
      const user = account ? users.find(u => u.id === account.userId) : undefined;
      if (!account || !user) return;
      const orgMember =
        space.spaceType === 'org_space' && space.storageOrgId
          ? orgMembers.find(om => om.accountId === account.accountId)
          : undefined;
      result.push({
        share: sh,
        user,
        account,
        memberTag: orgMember?.memberTag ?? (space.spaceType === 'personal_space' ? 'internal' : 'external'),
        role: sh.role,
      });
    });

  return result;
}

export function findUserByEmail(email: string, users: User[]): User | undefined {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}
