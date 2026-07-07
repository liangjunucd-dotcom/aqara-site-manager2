import {
  Account,
  OrgMember,
  Space,
  SpaceShare,
  User,
  orgAccountId,
  personalAccountId,
} from '../types';

export function inviteOrgSpaceExternal(params: {
  email: string;
  name: string;
  space: Space;
  orgId: string;
  users: User[];
  accounts: Account[];
  orgMembers: OrgMember[];
  spaceShares: SpaceShare[];
  role?: 'Admin' | 'Operator';
  roleLabel?: string;
}): {
  users: User[];
  accounts: Account[];
  orgMembers: OrgMember[];
  spaceShares: SpaceShare[];
} {
  const { email, name, space, orgId, role = 'Operator', roleLabel } = params;
  let { users, accounts, orgMembers, spaceShares } = params;

  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = { id: `user-${Date.now()}`, email, displayName: name || email.split('@')[0], homeRegionId: 'cn' };
    users = [...users, user];
  }

  const accountId = orgAccountId(user.id, orgId);
  let account = accounts.find(a => a.accountId === accountId);
  if (!account) {
    account = {
      accountId,
      userId: user.id,
      orgId,
      accountType: 'org_member',
      memberTag: 'external',
    };
    accounts = [...accounts, account];
  }

  const existingMember = orgMembers.find(m => m.userId === user!.id && m.orgId === orgId);
  if (!existingMember) {
    orgMembers = [
      ...orgMembers,
      {
        id: `om-${Date.now()}`,
        orgId,
        userId: user.id,
        accountId,
        name: name || user.displayName,
        email: user.email,
        memberTag: 'external',
        isOrgAdmin: false,
        status: 'Active',
        dateAdded: new Date().toISOString().split('T')[0],
      },
    ];
  }

  const existingShare = spaceShares.find(
    sh => sh.spaceId === space.id && sh.targetAccountId === accountId,
  );
  if (!existingShare) {
    spaceShares = [
      ...spaceShares,
      {
        id: `share-${Date.now()}`,
        spaceId: space.id,
        targetAccountId: accountId,
        role,
        roleLabel,
        shareType: 'org_space',
        status: 'Active',
        invitedAt: new Date().toISOString().split('T')[0],
      },
    ];
  }

  return { users, accounts, orgMembers, spaceShares };
}

export function invitePersonalSpace(params: {
  email: string;
  name: string;
  space: Space;
  role: 'Admin' | 'Operator';
  roleLabel?: string;
  users: User[];
  spaceShares: SpaceShare[];
}): { users: User[]; spaceShares: SpaceShare[] } {
  let { users, spaceShares } = params;
  const { email, name, space, role, roleLabel } = params;

  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = { id: `user-${Date.now()}`, email, displayName: name || email.split('@')[0], homeRegionId: 'cn' };
    users = [...users, user];
  }

  const targetAccountId = personalAccountId(user.id);
  const exists = spaceShares.some(
    sh => sh.spaceId === space.id && sh.targetAccountId === targetAccountId,
  );
  if (!exists) {
    spaceShares = [
      ...spaceShares,
      {
        id: `share-${Date.now()}`,
        spaceId: space.id,
        targetAccountId,
        role,
        roleLabel,
        shareType: 'personal_space',
        // 个人工作区邀请需对方接受后才生效
        status: 'Pending',
        invitedAt: new Date().toISOString().split('T')[0],
      },
    ];
  }

  return { users, spaceShares };
}

/** 将已存在的组织成员（accountId）批量加入某个 org_space 项目 */
export function addOrgMembersToProject(params: {
  space: Space;
  accountIds: string[];
  role: 'Admin' | 'Operator';
  roleLabel?: string;
  spaceShares: SpaceShare[];
}): { spaceShares: SpaceShare[] } {
  const { space, accountIds, role, roleLabel } = params;
  let { spaceShares } = params;

  accountIds.forEach((accountId, idx) => {
    if (space.ownerAccountId === accountId) return;
    const exists = spaceShares.some(
      sh => sh.spaceId === space.id && sh.targetAccountId === accountId,
    );
    if (exists) return;
    spaceShares = [
      ...spaceShares,
      {
        id: `share-${Date.now()}-${idx}`,
        spaceId: space.id,
        targetAccountId: accountId,
        role,
        roleLabel,
        shareType: 'org_space',
        status: 'Active',
        invitedAt: new Date().toISOString().split('T')[0],
      },
    ];
  });

  return { spaceShares };
}

export function removeOrgMember(params: {
  memberId: string;
  orgMembers: OrgMember[];
  spaceShares: SpaceShare[];
  accounts: Account[];
}): { orgMembers: OrgMember[]; spaceShares: SpaceShare[]; accounts: Account[] } {
  const member = params.orgMembers.find(m => m.id === params.memberId);
  if (!member) return params;

  const orgMembers = params.orgMembers.filter(m => m.id !== params.memberId);
  const spaceShares = params.spaceShares.filter(sh => sh.targetAccountId !== member.accountId);
  const accounts = params.accounts.filter(a => a.accountId !== member.accountId);

  return { orgMembers, spaceShares, accounts };
}

export function removeSpaceShare(params: {
  shareId: string;
  spaceShares: SpaceShare[];
  orgMembers: OrgMember[];
  accounts: Account[];
  space: Space;
}): { spaceShares: SpaceShare[]; orgMembers: OrgMember[]; accounts: Account[] } {
  const share = params.spaceShares.find(sh => sh.id === params.shareId);
  if (!share) return params;

  let spaceShares = params.spaceShares.filter(sh => sh.id !== params.shareId);
  let { orgMembers, accounts } = params;

  if (params.space.spaceType === 'org_space' && share.shareType === 'org_space') {
    const otherShares = spaceShares.filter(sh => sh.targetAccountId === share.targetAccountId);
    if (otherShares.length === 0) {
      orgMembers = orgMembers.filter(m => m.accountId !== share.targetAccountId);
      accounts = accounts.filter(a => a.accountId !== share.targetAccountId);
    }
  }

  return { spaceShares, orgMembers, accounts };
}

export function addInternalOrgMember(params: {
  email: string;
  name: string;
  orgId: string;
  departmentId?: string | null;
  users: User[];
  accounts: Account[];
  orgMembers: OrgMember[];
  spaces: Space[];
  spaceShares: SpaceShare[];
}): {
  users: User[];
  accounts: Account[];
  orgMembers: OrgMember[];
  spaceShares: SpaceShare[];
} {
  let { users, accounts, orgMembers, spaceShares, spaces } = params;
  const { email, name, orgId, departmentId } = params;

  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = { id: `user-${Date.now()}`, email, displayName: name, homeRegionId: 'cn' };
    users = [...users, user];
  }

  const accountId = orgAccountId(user.id, orgId);
  if (!accounts.find(a => a.accountId === accountId)) {
    accounts = [
      ...accounts,
      { accountId, userId: user.id, orgId, accountType: 'org_member', memberTag: 'internal' },
    ];
  }

  if (!orgMembers.find(m => m.userId === user.id && m.orgId === orgId)) {
    orgMembers = [
      ...orgMembers,
      {
        id: `om-${Date.now()}`,
        orgId,
        userId: user.id,
        accountId,
        name,
        email,
        memberTag: 'internal',
        departmentId: departmentId ?? null,
        isOrgAdmin: false,
        status: 'Active',
        dateAdded: new Date().toISOString().split('T')[0],
      },
    ];
  }

  const orgSpaces = spaces.filter(s => s.spaceType === 'org_space' && s.storageOrgId === orgId);
  orgSpaces.forEach(space => {
    if (space.ownerAccountId === accountId) return;
    const exists = spaceShares.some(
      sh => sh.spaceId === space.id && sh.targetAccountId === accountId,
    );
    if (!exists) {
      spaceShares = [
        ...spaceShares,
        {
          id: `share-${Date.now()}-${space.id}`,
          spaceId: space.id,
          targetAccountId: accountId,
          role: 'Admin',
          shareType: 'org_space',
          status: 'Active',
          invitedAt: new Date().toISOString().split('T')[0],
        },
      ];
    }
  });

  return { users, accounts, orgMembers, spaceShares };
}
