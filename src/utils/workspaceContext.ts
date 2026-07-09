const WORKSPACE_STORAGE_KEY = 'aqara-active-workspace-id';

export function buildSiteManagerUrl(workspaceId?: string) {
  const params = new URLSearchParams({ platform: 'site-manager' });
  if (workspaceId) params.set('workspaceId', workspaceId);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

/** Persist and resolve the active workspace when entering Site Manager. */
export function resolveInitialWorkspaceId(accessibleOrgIds: string[]): string {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('workspaceId');
  if (fromUrl && accessibleOrgIds.includes(fromUrl)) {
    sessionStorage.setItem(WORKSPACE_STORAGE_KEY, fromUrl);
    return fromUrl;
  }
  const fromStorage = sessionStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (fromStorage && accessibleOrgIds.includes(fromStorage)) return fromStorage;
  return accessibleOrgIds[0] ?? 'personal';
}

export function persistActiveWorkspaceId(orgId: string) {
  sessionStorage.setItem(WORKSPACE_STORAGE_KEY, orgId);
}
