import React, { useState, useRef, useEffect } from 'react';
import { Site, Device, Space, SpaceStructureNode, SiteTimelinePoint, ProjectPlan } from '../types';
import { 
  Search, Grid, List, Plus, Folder, FolderPlus, Edit2, Trash2, 
  Check, ChevronDown, ChevronRight, Cpu, Video, Lock, Compass, Smartphone, 
  Lightbulb, HelpCircle, Star, PlusCircle, AlertTriangle, Home, Server,
  MoreVertical, Pin, FolderTree, Settings, Bell, Key, RefreshCw, Database, Shield, Activity,
  Code, LayoutGrid, Puzzle
} from 'lucide-react';

const getStudioSpecs = (studioId: string, studioNameOriginal: string, indexInList: number, totalInList: number) => {
  let hash = 0;
  for (let i = 0; i < studioId.length; i++) {
    hash = (hash << 5) - hash + studioId.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // 1. Studio Name: e.g. aqarastudio-f9e0
  const hexSuffix = (absHash % 65535).toString(16).padStart(4, '0');
  const studioName = `aqarastudio-${hexSuffix}`;

  // 2. Display name: unified "xxx 主机" format
  let hostName = studioNameOriginal;
  if (studioId === 'local-branch-office' || studioNameOriginal.includes('客厅')) {
    hostName = '1F 客厅主机';
  } else if (studioId === 'corporate-hq' || studioNameOriginal.includes('单身公寓')) {
    hostName = '2F 客房主机';
  } else if (studioId === 'strategic-hq') {
    hostName = '1F 大堂主机';
  } else if (studioId === 'warehouse') {
    hostName = 'B1 仓储主机';
  } else if (studioId === 'global-hq') {
    hostName = '10F 董事主机';
  } else if (studioId === 'main-office') {
    hostName = '1F 商务主机';
  } else if (studioId === 'operations-hub') {
    hostName = '3F 运维主机';
  } else if (studioId === 'administrative-center') {
    hostName = '5F 行政主机';
  } else if (studioId === 'business-center') {
    hostName = '2F 共享主机';
  } else if (studioId === 'innovation-hub') {
    hostName = '4F 研发主机';
  } else if (studioId === 'service-center') {
    hostName = '1F 客服主机';
  } else if (studioId === 'technology-hub') {
    hostName = 'B2 数据主机';
  } else {
    const prefixes = ['1F 走廊', '2F 前厅', '3F 商务', 'B-201 客房', 'C栋 大堂', 'D-403 客房', '总统套房'];
    hostName = `${prefixes[absHash % prefixes.length]} 主机`;
  }

  // 3. Primary vs Secondary (主站 vs 子站)
  // The first studio in the list gets primary status, others secondary.
  const role: 'primary' | 'secondary' = totalInList <= 1 ? 'primary' : (indexInList === 0 ? 'primary' : 'secondary');

  // 4. Device ID
  let hexString = '';
  for (let i = 0; i < 4; i++) {
    hexString += Math.abs(Math.sin(absHash + i) * 1000000).toString(16).substring(0, 4);
  }
  hexString = hexString.padEnd(16, 'a').substring(0, 16);
  const deviceId = `lumi3.${hexString}`;

  // 5. IP Address
  const ipLastByte = (absHash % 220) + 10;
  const ipAddress = `192.168.1.${ipLastByte}`;

  // 6. Timezone
  const timezone = '亚洲/上海';

  // 7. Load & Automations (calculated deterministic metrics)
  const automations = (absHash % 12) + 6;
  const cpuLoad = 15 + (absHash % 55);
  const ramLoad = 25 + (absHash % 45);

  return {
    studioName,
    hostName,
    role,
    deviceId,
    ipAddress,
    timezone,
    automations,
    cpuLoad,
    ramLoad
  };
};

type StudioHealth = 'healthy' | 'warning' | 'critical';

const getStudioHealth = (studio: Site, cpuLoad: number): StudioHealth => {
  const offlineDevs = studio.devices.filter(d => d.status === 'offline').length;
  const warningDevs = studio.devices.filter(d => d.status === 'warning').length;
  const hubOffline = studio.devices.some(d => d.type === 'hub' && d.status === 'offline');
  const weakHub = studio.devices.some(
    d => d.type === 'hub' && d.signalStrength !== undefined && d.signalStrength < 40
  );
  const needsUpgrade = !studio.blueprint || studio.blueprint.includes('v1.0');

  if (studio.status === 'offline' || hubOffline || offlineDevs > 0) {
    return 'critical';
  }
  if (studio.status === 'warning' || warningDevs > 0 || weakHub || needsUpgrade || cpuLoad > 65) {
    return 'warning';
  }
  return 'healthy';
};

const getTimelineSegmentColor = (segmentStatus: 'online' | 'warning' | 'offline'): string => {
  if (segmentStatus === 'offline') return 'bg-rose-500';
  if (segmentStatus === 'warning') return 'bg-amber-400';
  return 'bg-emerald-500';
};

const hashStudioId = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const TIMELINE_PRESETS: SiteTimelinePoint[][] = [
  [
    { time: '05:00', status: 'online', length: 88 },
    { time: '11:00', status: 'warning', length: 7 },
    { time: 'Now', status: 'online', length: 5 },
  ],
  [
    { time: '05:00', status: 'online', length: 72 },
    { time: '11:00', status: 'offline', length: 10 },
    { time: 'Now', status: 'online', length: 18 },
  ],
  [
    { time: '05:00', status: 'online', length: 58 },
    { time: '11:00', status: 'warning', length: 22 },
    { time: 'Now', status: 'online', length: 20 },
  ],
  [
    { time: '05:00', status: 'online', length: 45 },
    { time: '11:00', status: 'offline', length: 18 },
    { time: 'Now', status: 'warning', length: 37 },
  ],
  [
    { time: '05:00', status: 'online', length: 100 },
  ],
  [
    { time: '05:00', status: 'online', length: 80 },
    { time: '11:00', status: 'warning', length: 12 },
    { time: 'Now', status: 'online', length: 8 },
  ],
  [
    { time: '05:00', status: 'online', length: 65 },
    { time: '11:00', status: 'offline', length: 8 },
    { time: 'Now', status: 'offline', length: 27 },
  ],
  [
    { time: '05:00', status: 'warning', length: 15 },
    { time: '11:00', status: 'online', length: 70 },
    { time: 'Now', status: 'online', length: 15 },
  ],
];

const isMonotoneTimeline = (timeline: SiteTimelinePoint[]) =>
  !timeline.length || timeline.every(s => s.status === 'online');

const applyCurrentHealthToNow = (timeline: SiteTimelinePoint[], health: StudioHealth): SiteTimelinePoint[] => {
  const result = timeline.map(s => ({ ...s }));
  if (!result.length) return result;

  const last = result[result.length - 1];
  if (health === 'critical') {
    last.status = 'offline';
  } else if (health === 'warning' && last.status === 'online') {
    last.status = 'warning';
  }
  return result;
};

const getTimelineForStudio = (studio: Site, health: StudioHealth): SiteTimelinePoint[] => {
  const existing = studio.timeline?.length ? studio.timeline : [];

  if (!isMonotoneTimeline(existing)) {
    return applyCurrentHealthToNow(existing, health);
  }

  const preset = TIMELINE_PRESETS[hashStudioId(studio.id) % TIMELINE_PRESETS.length];
  return applyCurrentHealthToNow(preset, health);
};

interface BlueprintDetails {
  name: string;
  updatedAt: string;
}

const BLUEPRINT_LABELS: Record<string, string> = {
  'blueprint v1.0': 'Standard Home Layout',
  'blueprint v1.1': 'Compact Apartment Scheme',
  'blueprint v1.5': 'Office Automation Map',
  'blueprint v2.0': 'Hotel Guest Suite v2.0',
  'blueprint v3.0': 'Enterprise NOC Blueprint',
};

const getBlueprintDetails = (studioId: string, blueprint?: string): BlueprintDetails => {
  if (!blueprint) {
    return { name: '未绑定蓝图', updatedAt: '—' };
  }
  const hash = hashStudioId(studioId);
  const name = BLUEPRINT_LABELS[blueprint] || blueprint.replace(/^blueprint\s*/i, '');
  const month = ((hash % 12) + 1).toString().padStart(2, '0');
  const day = ((hash % 28) + 1).toString().padStart(2, '0');
  const hour = (hash % 24).toString().padStart(2, '0');
  const minute = ((hash >> 4) % 60).toString().padStart(2, '0');
  return {
    name,
    updatedAt: `2026/${month}/${day} ${hour}:${minute}`,
  };
};

interface SpaceHubViewProps {
  sites: Site[];
  activeSpaceId: string;
  spaces: Space[];
  structureNodes: SpaceStructureNode[];
  projectPlans?: ProjectPlan[];
  onSelectSite: (siteId: string) => void;
  onUpdateSites: (updated: Site[]) => void;
  onUpdateNodes: (updated: SpaceStructureNode[]) => void;
}

export default function SpaceHubView({
  sites,
  activeSpaceId,
  spaces,
  structureNodes,
  projectPlans = [],
  onSelectSite,
  onUpdateSites,
  onUpdateNodes
}: SpaceHubViewProps) {
  
  // Selected Structure tree node ID ('all' or specific node ID)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Structure Node modal/editing state with hierarchical parent and collapse supports
  const [isNewNodeOpen, setIsNewNodeOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Record<string, boolean>>({});
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeName, setEditingNodeName] = useState('');

  // Dialog and Modal states for Backup, Notification, Update and Provisioning
  const [activeDialog, setActiveDialog] = useState<'backup' | 'notification' | 'update' | 'provision' | null>(null);
  const [dialogNodeId, setDialogNodeId] = useState<string>('all');
  const [dialogNodeName, setDialogNodeName] = useState<string>('');

  // Individual modal specific interaction states
  const [backupLogs, setBackupLogs] = useState<{ id: string, date: string, size: string }[]>([
    { id: 'b-1', date: '2026-07-04 12:00:15', size: '1.4 MB' },
    { id: 'b-2', date: '2026-07-02 04:30:22', size: '1.38 MB' },
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    outageAlerts: true,
    powerFailures: true,
    maintenance: false,
    apiWebhooks: true,
    alertSeverity: 'high' as 'all' | 'high' | 'none'
  });
  const [updateChan, setUpdateChan] = useState<'stable' | 'beta'>('stable');
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateCheckResult, setUpdateCheckResult] = useState<string | null>(null);

  // Dropdown menus
  const [isAssignNodeOpen, setIsAssignNodeOpen] = useState<string | null>(null); // studio ID

  // Collapsed technical specifications state
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});

  // Dynamic diagnostics state
  const [runningDiagnosticId, setRunningDiagnosticId] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  
  // Provision / Add new Studio state
  const [isAddStudioOpen, setIsAddStudioOpen] = useState(false);
  const [newStudioName, setNewStudioName] = useState('');
  const [newStudioModel, setNewStudioModel] = useState('Aqara Hub M3');
  const [newStudioIsp, setNewStudioIsp] = useState('AT&T Business');
  const [newStudioTZ, setNewStudioTZ] = useState('PST (UTC-8)');
  const [activeMenuNodeId, setActiveMenuNodeId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(true);
  const [isSidebarFloatingOpen, setIsSidebarFloatingOpen] = useState<boolean>(false);
  const closeTimeoutRef = useRef<any>(null);
  const [openBlueprintId, setOpenBlueprintId] = useState<string | null>(null);
  const blueprintMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openBlueprintId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (blueprintMenuRef.current && !blueprintMenuRef.current.contains(e.target as Node)) {
        setOpenBlueprintId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openBlueprintId]);

  const handleOpenBlueprint = (studio: Site) => {
    const details = getBlueprintDetails(studio.id, studio.blueprint);
    setOpenBlueprintId(null);
    alert(`正在 Aqara Studio 中打开「${details.name}」…`);
  };

  const handleDownloadBlueprint = (studio: Site) => {
    const details = getBlueprintDetails(studio.id, studio.blueprint);
    const payload = JSON.stringify({
      studioId: studio.id,
      blueprint: studio.blueprint,
      name: details.name,
      exportedAt: new Date().toISOString(),
    }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${details.name.replace(/\s+/g, '_')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setOpenBlueprintId(null);
  };

  const handleDeleteBlueprint = (studioId: string) => {
    if (!confirm('确认解除该 Studio 的蓝图绑定？此操作不可撤销。')) return;
    onUpdateSites(sites.map(s => s.id === studioId ? { ...s, blueprint: undefined } : s));
    setOpenBlueprintId(null);
  };

  const getStudioPlan = (studioId: string) =>
    projectPlans.find(p => p.appliedSiteIds.includes(studioId));

  const renderSchemeBadge = (studio: Site, compact = false) => {
    const plan = getStudioPlan(studio.id);
    if (plan) {
      const PlanIcon = plan.kind === 'plugin' ? Puzzle : LayoutGrid;
      return (
        <div
          className={`flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-semibold text-blue-700 shrink-0 ${compact ? 'w-[118px]' : ''}`}
          title={`运行方案：${plan.title} · ${plan.devices} 设备`}
        >
          <PlanIcon size={10} className="shrink-0 text-blue-500" />
          <span className="truncate min-w-0">{plan.title}</span>
        </div>
      );
    }
    if (studio.blueprint) {
      return renderBlueprintBadge(studio);
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 border border-dashed border-slate-200 rounded-full text-[10px] font-medium text-slate-400 shrink-0">
        未绑定方案
      </span>
    );
  };

  const renderBlueprintBadge = (studio: Site) => {
    const details = getBlueprintDetails(studio.id, studio.blueprint);
    const isOpen = openBlueprintId === studio.id;

    return (
      <div
        className="relative shrink-0"
        ref={isOpen ? blueprintMenuRef : undefined}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenBlueprintId(isOpen ? null : studio.id);
          }}
          className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer w-[118px]"
        >
          <Code size={10} className="shrink-0 text-slate-500" />
          <span className="truncate min-w-0">{details.name}</span>
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {studio.blueprint ? (
              <>
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-[11px] text-slate-700 font-medium">{details.updatedAt}</p>
                </div>
                <div className="py-1 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenBlueprint(studio)}
                    className="w-full text-left px-3 py-2 text-[11px] text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    在 Aqara Studio 中打开
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadBlueprint(studio)}
                    className="w-full text-left px-3 py-2 text-[11px] text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    下载
                  </button>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => handleDeleteBlueprint(studio.id)}
                    className="w-full text-left px-3 py-2 text-[11px] text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    删除
                  </button>
                </div>
              </>
            ) : (
              <div className="px-3 py-3">
                <p className="text-[11px] text-slate-500">尚未绑定蓝图方案</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleMouseEnterTrigger = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsSidebarFloatingOpen(true);
  };

  const handleMouseLeaveTrigger = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsSidebarFloatingOpen(false);
    }, 300);
  };

  const handleMouseEnterSidebar = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsSidebarFloatingOpen(true);
  };

  const handleMouseLeaveSidebar = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsSidebarFloatingOpen(false);
    }, 300);
  };

  const currentSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];

  // Filter Structure Nodes by Space
  const currentNodes = structureNodes.filter(node => node.spaceId === activeSpaceId);

  // Recursive check: Is targetNodeId a descendant of nodeId?
  const isNodeOrDescendantSelected = (nodeId: string, targetNodeId: string | null): boolean => {
    if (!targetNodeId) return false;
    if (targetNodeId === nodeId) return true;
    
    const targetNode = currentNodes.find(n => n.id === targetNodeId);
    if (!targetNode || !targetNode.parentId) return false;
    
    return isNodeOrDescendantSelected(nodeId, targetNode.parentId);
  };

  // Helper to trace the full ancestor path of the selected node for breadcrumbs
  const getBreadcrumbPath = (): { id: string; name: string }[] => {
    if (selectedNodeId === 'all') return [];
    const path: { id: string; name: string }[] = [];
    let current = currentNodes.find(n => n.id === selectedNodeId);
    while (current) {
      path.push({ id: current.id, name: current.name });
      current = current.parentId ? currentNodes.find(n => n.id === current.parentId) : undefined;
    }
    return path.reverse();
  };

  // Filter Studios (Sites) by Space and Node (recursively including descendants for selection)
  const spaceStudios = sites.filter(site => site.spaceId === activeSpaceId);
  const filteredStudios = spaceStudios.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (site.modelType && site.modelType.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (site.location && site.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedNodeId === 'all') return matchesSearch;
    const matchesNode = site.structureNodeId === selectedNodeId || isNodeOrDescendantSelected(selectedNodeId, site.structureNodeId);
    return matchesSearch && matchesNode;
  });

  // Add a structure node (Folder)
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    const newNodeObj: SpaceStructureNode = {
      id: `node-${Date.now()}`,
      name: newNodeName,
      spaceId: activeSpaceId,
      parentId: newNodeParentId
    };
    onUpdateNodes([...structureNodes, newNodeObj]);
    setNewNodeName('');
    setNewNodeParentId(null);
    setIsNewNodeOpen(false);
  };

  // Edit a structure node (Rename)
  const handleSaveRenameNode = () => {
    if (!editingNodeId || !editingNodeName.trim()) return;
    onUpdateNodes(structureNodes.map(node => {
      if (node.id === editingNodeId) {
        return { ...node, name: editingNodeName };
      }
      return node;
    }));
    setEditingNodeId(null);
    setEditingNodeName('');
  };

  // Delete a structure node
  const handleDeleteNode = (nodeId: string, nodeName: string) => {
    if (!confirm(`Are you sure you want to delete subdivision "${nodeName}"?`)) return;
    onUpdateNodes(structureNodes.filter(node => node.id !== nodeId));
    // Clear site associations
    onUpdateSites(sites.map(site => {
      if (site.spaceId === activeSpaceId && site.structureNodeId === nodeId) {
        return { ...site, structureNodeId: null };
      }
      return site;
    }));
    setSelectedNodeId('all');
  };

  // Assign Studio to a Space Structure Node
  const handleAssignStudioNode = (studioId: string, nodeId: string | null) => {
    onUpdateSites(sites.map(site => {
      if (site.id === studioId) {
        return { ...site, structureNodeId: nodeId };
      }
      return site;
    }));
    setIsAssignNodeOpen(null);
  };

  // Provision / Add new Studio
  const handleAddStudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudioName.trim()) return;
    const newId = `studio-${Date.now()}`;
    const newSiteObj: Site = {
      id: newId,
      name: newStudioName,
      status: 'up-to-date',
      location: 'Custom Lab',
      timeZone: newStudioTZ,
      modelType: newStudioModel,
      isp: newStudioIsp,
      spaceId: activeSpaceId,
      structureNodeId: selectedNodeId === 'all' ? null : selectedNodeId,
      blueprint: 'blueprint v1.0',
      timeline: [
        { time: '05:00', status: 'online', length: 100 }
      ],
      devices: [
        { id: `dev-${Date.now()}-1`, name: 'Primary Controller Hub', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Suite A' },
        { id: `dev-${Date.now()}-2`, name: 'Dome Security Camera', type: 'camera', model: 'Camera Hub G3', status: 'online', room: 'Suite A' }
      ]
    };
    onUpdateSites([...sites, newSiteObj]);
    setNewStudioName('');
    setIsAddStudioOpen(false);
  };

  // Render device icon inside Studio card
  const getDeviceIcon = (type: Device['type'], size = 12) => {
    switch (type) {
      case 'hub': return <Cpu size={size} className="text-slate-500" />;
      case 'camera': return <Video size={size} className="text-slate-500" />;
      case 'lock': return <Lock size={size} className="text-slate-500" />;
      case 'sensor': return <Compass size={size} className="text-slate-500" />;
      case 'switch': return <Smartphone size={size} className="text-slate-500" />;
      case 'light': return <Lightbulb size={size} className="text-slate-500" />;
      default: return <HelpCircle size={size} className="text-slate-500" />;
    }
  };

  const renderSidebar = (isFloating: boolean) => {
    // Interfaces for tree building
    interface TreeNode {
      node: SpaceStructureNode;
      children: TreeNode[];
    }

    // Build tree from flat currentNodes list
    const buildTree = (nodes: SpaceStructureNode[]): TreeNode[] => {
      const nodeMap: Record<string, TreeNode> = {};
      const roots: TreeNode[] = [];

      nodes.forEach(n => {
        nodeMap[n.id] = { node: n, children: [] };
      });

      nodes.forEach(n => {
        const treeNode = nodeMap[n.id];
        if (n.parentId && nodeMap[n.parentId]) {
          nodeMap[n.parentId].children.push(treeNode);
        } else {
          roots.push(treeNode);
        }
      });

      return roots;
    };

    const toggleNodeCollapse = (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setCollapsedNodeIds(prev => ({
        ...prev,
        [nodeId]: !prev[nodeId]
      }));
    };

    const getRecursiveCount = (nId: string | 'all'): number => {
      if (nId === 'all') {
        return spaceStudios.length;
      }
      const direct = spaceStudios.filter(s => s.structureNodeId === nId).length;
      const subNodes = currentNodes.filter(cn => cn.parentId === nId);
      return direct + subNodes.reduce((acc, sub) => acc + getRecursiveCount(sub.id), 0);
    };

    // Recursive renderer for unified tree (including roots and subroots)
    const renderTreeNodeItem = (
      id: string, 
      name: string, 
      childrenList: TreeNode[], 
      depth: number, 
      isRootSpace: boolean,
      parentId: string | null = null
    ): React.ReactNode => {
      const isSelected = selectedNodeId === id;
      const isCollapsed = collapsedNodeIds[id] === true;
      const hasChildren = childrenList.length > 0;
      const totalCount = getRecursiveCount(id);

      return (
        <div key={id} className="space-y-1" onMouseLeave={() => activeMenuNodeId === id && setActiveMenuNodeId(null)}>
          <div className="group/node relative">
            {editingNodeId === id ? (
              <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-200" style={{ paddingLeft: `${depth * 14 + 4}px` }}>
                <input
                  type="text"
                  className="w-full text-xs px-2 py-1 bg-white border border-[#10b981] rounded focus:outline-none font-medium"
                  value={editingNodeName}
                  onChange={(e) => setEditingNodeName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameNode()}
                  onClick={(e) => e.stopPropagation()}
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (id === 'all') {
                      setEditingNodeId(null);
                    } else {
                      handleSaveRenameNode();
                    }
                  }}
                  className="p-1 bg-[#10b981] text-white rounded hover:bg-[#059669] cursor-pointer shrink-0"
                >
                  <Check size={11} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setSelectedNodeId(id)}
                style={{ paddingLeft: `${depth * 14 + 4}px` }}
                className={`w-full text-left py-2 pr-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-100/95 text-slate-900 border-l-2 border-slate-800 pl-2 font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {hasChildren ? (
                    <button
                      onClick={(e) => toggleNodeCollapse(id, e)}
                      className="p-0.5 hover:bg-slate-200/65 rounded text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                    >
                      {isCollapsed ? (
                        <ChevronRight size={13} className="text-slate-500" />
                      ) : (
                        <ChevronDown size={13} className="text-slate-500" />
                      )}
                    </button>
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center shrink-0 text-slate-400 text-[10px] select-none font-bold">○</span>
                  )}
                  
                  <span className={`truncate text-slate-700 ${isRootSpace ? 'font-bold text-slate-900 text-xs' : ''}`}>
                    {name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded-sm text-slate-500 border border-slate-200/40">
                    {totalCount}
                  </span>
                  
                  {/* Menu trigger button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuNodeId(activeMenuNodeId === id ? null : id);
                    }}
                    className={`p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-opacity cursor-pointer shrink-0 ${
                      activeMenuNodeId === id ? 'opacity-100' : 'opacity-0 group-hover/node:opacity-100'
                    }`}
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>

                {/* Absolute popover action menu exactly as shown in screenshot */}
                {activeMenuNodeId === id && (
                  <div className="absolute right-2 top-8 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-40 min-w-[155px] text-[11px] font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewNodeParentId(isRootSpace ? null : id);
                        setIsNewNodeOpen(true);
                        setActiveMenuNodeId(null);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Plus size={12} className="text-emerald-500" />
                      <span>Create</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNodeId(id);
                        setEditingNodeName(name);
                        setActiveMenuNodeId(null);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Edit2 size={11} className="text-slate-500" />
                      <span>Edit</span>
                    </button>
                    
                    {!isRootSpace && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(id, name);
                          setActiveMenuNodeId(null);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Trash2 size={12} className="text-rose-500" />
                        <span>Delete</span>
                      </button>
                    )}

                    <div className="h-[1px] bg-slate-100 my-1" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogNodeId(id);
                        setDialogNodeName(name);
                        setActiveDialog('backup');
                        setActiveMenuNodeId(null);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Settings size={12} className="text-slate-500" />
                      <span>Backup Settings</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogNodeId(id);
                        setDialogNodeName(name);
                        setActiveDialog('notification');
                        setActiveMenuNodeId(null);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Bell size={12} className="text-slate-500" />
                      <span>Notification Settings</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogNodeId(id);
                        setDialogNodeName(name);
                        setActiveDialog('update');
                        setActiveMenuNodeId(null);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw size={12} className="text-slate-500" />
                      <span>Update Settings</span>
                    </button>

                    <div className="h-[1px] bg-slate-100 my-1" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogNodeId(id);
                        setDialogNodeName(name);
                        setActiveDialog('provision');
                        setActiveMenuNodeId(null);
                      }}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Key size={12} className="text-slate-500" />
                      <span>Provisioning code</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isCollapsed && hasChildren && (
            <div className="space-y-1">
              {childrenList.map(({ node, children }) => 
                renderTreeNodeItem(node.id, node.name, children, depth + 1, false, id)
              )}
            </div>
          )}
        </div>
      );
    };

    const roots = buildTree(currentNodes);

    return (
      <div 
        className={
          isFloating
            ? "absolute left-0 top-12 z-50 w-72 bg-white border border-slate-200 shadow-xl rounded-xl p-4 flex flex-col justify-between select-none animate-in slide-in-from-left-2 fade-in duration-150"
            : "xl:col-span-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs select-none"
        }
        onMouseEnter={isFloating ? handleMouseEnterSidebar : undefined}
        onMouseLeave={isFloating ? handleMouseLeaveSidebar : undefined}
      >
        <div className="space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="font-bold text-slate-800 text-xs tracking-tight font-sans">
                Project Structure
              </h3>
            </div>
            <button 
              onClick={() => {
                if (isFloating) {
                  setIsSidebarPinned(true);
                  setIsSidebarFloatingOpen(false);
                } else {
                  setIsSidebarPinned(false);
                }
              }}
              className="p-1.5 bg-slate-100 hover:bg-slate-200/85 text-slate-600 rounded-lg transition-colors cursor-pointer" 
              title={isFloating ? "Pin Sidebar" : "Collapse Sidebar"}
            >
              <Pin size={11} className={`text-slate-500 transition-transform duration-200 ${isFloating ? 'transform rotate-45' : ''}`} />
            </button>
          </div>

          {/* Unified Division Trees with the Active Space name as the Root Node */}
          <div className="space-y-1 font-sans">
            {renderTreeNodeItem(
              'all', 
              currentSpace?.name ? currentSpace.name.replace(/\s*\(.*?\)\s*/g, '') : 'Active Project',
              roots, 
              0, 
              true
            )}
          </div>

        </div>


      </div>
    );
  };

  return (
    <div className="space-y-4">
      
      {/* ==================== 1. COMPACT SPACE HEADER ==================== */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {!isSidebarPinned && (
                <button
                  onMouseEnter={handleMouseEnterTrigger}
                  onMouseLeave={handleMouseLeaveTrigger}
                  onClick={() => setIsSidebarFloatingOpen(!isSidebarFloatingOpen)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 border border-slate-200/40 shadow-xs flex items-center justify-center"
                  title="Project Structure"
                >
                  <FolderTree size={16} />
                </button>
              )}
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                {currentSpace?.name ? currentSpace.name.replace(/\s*\(.*?\)\s*/g, '') : 'Miniserver Hub'}
              </h2>
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
              >
                <Star size={16} fill={isFavorite ? '#f59e0b' : 'none'} className={isFavorite ? 'text-amber-500' : 'text-slate-400'} />
              </button>
            </div>
            
            {/* Dynamic Breadcrumbs matching User Screenshot */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
              <span 
                className="hover:text-slate-800 cursor-pointer transition-colors"
                onClick={() => setSelectedNodeId('all')}
              >
                {currentSpace?.name ? currentSpace.name.replace(/\s*\(.*?\)\s*/g, '') : '查看所有项目'}
              </span>
              <span className="text-slate-300 font-light select-none">›</span>
              {(() => {
                const breadcrumbs = getBreadcrumbPath();
                return breadcrumbs.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <span 
                      className={`hover:text-slate-800 cursor-pointer transition-colors ${idx === breadcrumbs.length - 1 ? 'text-slate-900 font-bold' : ''}`}
                      onClick={() => setSelectedNodeId(item.id)}
                    >
                      {item.name}
                    </span>
                    <span className="text-slate-300 font-light select-none">›</span>
                  </React.Fragment>
                ));
              })()}
            </div>
          </div>

        </div>
      </div>

      {/* ==================== 2. MAIN LAYOUT: STRUCTURE + STUDIOS ==================== */}
      <div className="relative">
        
        {/* Floating Sidebar (when unpinned and open) */}
        {!isSidebarPinned && isSidebarFloatingOpen && renderSidebar(true)}

        <div className={`grid grid-cols-1 ${isSidebarPinned ? 'xl:grid-cols-5' : 'grid-cols-1'} gap-4`}>
          
          {/* Static Sidebar (when pinned) */}
          {isSidebarPinned && renderSidebar(false)}

          {/* ==================== RIGHT STUDIOS LIST ==================== */}
          <div className={`${isSidebarPinned ? 'xl:col-span-4' : 'w-full'} space-y-4`}>
          
          {/* Toolbar row (Search & Switcher View & Add Studio Button) */}
          <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row items-center justify-end gap-3 shadow-xs select-none">
            
            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
              
              {/* Search query */}
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search Studios..."
                  className="w-full pl-7.5 pr-2.5 py-1 text-xs border border-slate-200 rounded-md bg-[#fdfdfd] focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Card / List Toggles */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Grid View"
                >
                  <Grid size={12} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                  title="List View"
                >
                  <List size={12} />
                </button>
              </div>

              {/* Provision Studio Button (Unifi Green style) */}
              <button
                onClick={() => setIsAddStudioOpen(true)}
                className="px-3 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>添加站点</span>
              </button>

            </div>

          </div>

          {/* Studios Cards / List View Stage */}
          {filteredStudios.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-16 px-6 flex flex-col items-center justify-center min-h-[320px] text-center select-none">
              <p className="text-slate-500 text-sm mb-6">
                {spaceStudios.length === 0 ? '暂无站点' : '未找到匹配的站点'}
              </p>
              <button
                onClick={() => setIsAddStudioOpen(true)}
                className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
              >
                添加站点
              </button>
            </div>

          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 auto-rows-fr">
              {filteredStudios.map((studio, idx) => {
                const specs = getStudioSpecs(studio.id, studio.name, idx, filteredStudios.length);
                const totalDevs = studio.devices.length;
                const offlineDevs = studio.devices.filter(d => d.status === 'offline').length;
                const warningDevs = studio.devices.filter(d => d.status === 'warning').length;
                const onlineDevs = totalDevs - offlineDevs - warningDevs;
                const health = getStudioHealth(studio, specs.cpuLoad);

                return (
                  <div
                    key={studio.id}
                    className="group h-full min-h-[172px] bg-white border border-slate-200 rounded-xl p-4 transition-all duration-200 flex flex-col hover:border-slate-300 hover:shadow-md cursor-pointer select-none"
                    onClick={() => onSelectSite(studio.id)}
                  >
                    {/* Header: fixed 2-row grid — name+tag | blueprint, then studio id */}
                    <div className="grid grid-cols-[minmax(0,1fr)_118px] gap-x-2 gap-y-1 mb-2.5 shrink-0">
                      <div className="min-w-0 flex items-center gap-1.5 overflow-hidden">
                        <h4
                          className="font-bold text-slate-800 text-sm leading-tight truncate min-w-0 group-hover:text-slate-950"
                          title={specs.hostName}
                        >
                          {specs.hostName}
                        </h4>
                        {specs.role === 'primary' ? (
                          <span className="px-1 py-px bg-teal-50 text-teal-700 text-[8px] font-bold rounded border border-teal-200/40 shrink-0 whitespace-nowrap">
                            主站
                          </span>
                        ) : (
                          <span className="px-1 py-px bg-slate-50 text-slate-400 text-[8px] font-semibold rounded border border-slate-200 shrink-0 whitespace-nowrap">
                            子站
                          </span>
                        )}
                      </div>
                      <div className="self-start justify-self-end">
                        {renderSchemeBadge(studio, true)}
                      </div>
                      <p
                        className="col-span-2 text-[10px] font-mono text-slate-400 truncate leading-none"
                        title={specs.studioName}
                      >
                        {specs.studioName}
                      </p>
                    </div>

                    {/* Status bar — always below studio id */}
                    <div className="shrink-0 mb-3 space-y-1">
                      <div className="flex h-[5px] w-full rounded-full overflow-hidden bg-slate-100 gap-px">
                        {getTimelineForStudio(studio, health).map((segment, index) => (
                          <div
                            key={index}
                            className={`h-full shrink-0 ${getTimelineSegmentColor(segment.status)}`}
                            style={{ width: `${segment.length}%` }}
                            title={
                              segment.status === 'online' ? '正常运行' :
                              segment.status === 'warning' ? '存在异常' : '离线'
                            }
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono tracking-wider leading-none">
                        <span>05:00</span>
                        <span>11:00</span>
                        <span>Now</span>
                      </div>
                    </div>

                    {/* Location & device count */}
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mt-auto min-h-[16px]">
                      <span className="truncate min-w-0 text-slate-500 font-medium">
                        {studio.structureNodeId
                          ? (currentNodes.find(n => n.id === studio.structureNodeId)?.name || '未分配')
                          : '根分区'}
                      </span>
                      <span className="font-mono shrink-0 whitespace-nowrap">
                        <span className="font-bold text-slate-600">{onlineDevs}/{totalDevs}</span> 设备
                      </span>
                    </div>

                    {/* Device icons — fixed footer height */}
                    <div className="flex items-center gap-1 pt-3 mt-3 border-t border-slate-100 min-h-[32px] shrink-0">
                      {['hub', 'camera', 'lock', 'sensor', 'switch'].map(type => {
                        const count = studio.devices.filter(d => d.type === type).length;
                        if (count === 0) return null;
                        return (
                          <div
                            key={type}
                            className="w-5 h-5 rounded bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400"
                            title={`${count} 个设备`}
                          >
                            {getDeviceIcon(type as Device['type'], 10)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          ) : (
            
            /* LIST VIEW OF STUDIOS */
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs select-none">
              <table className="w-full text-left border-collapse border-spacing-0">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3 pl-4">Studio 描述信息</th>
                    {!(currentSpace?.id === 'my-home' || currentSpace?.id === 'bachelor-pad') && <th className="p-3">逻辑分区 Subdivision</th>}
                    <th className="p-3">运行方案</th>
                    <th className="p-3">底层运维参数 Technical Specs</th>
                    <th className="p-3">运行状态 System Health</th>
                    {!(currentSpace?.id === 'my-home' || currentSpace?.id === 'bachelor-pad') && <th className="p-3 text-right pr-4">运维重新划分</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredStudios.map((studio, idx) => {
                    const specs = getStudioSpecs(studio.id, studio.name, idx, filteredStudios.length);
                    const totalDevs = studio.devices.length;
                    const offlineDevs = studio.devices.filter(d => d.status === 'offline').length;
                    const warningDevs = studio.devices.filter(d => d.status === 'warning').length;

                    let listHealthBadge = (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>在线正常</span>
                      </span>
                    );
                    if (studio.status === 'offline') {
                      listHealthBadge = (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>主机离线</span>
                        </span>
                      );
                    } else if (offlineDevs > 0) {
                      listHealthBadge = (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>设备离线 ({offlineDevs})</span>
                        </span>
                      );
                    } else if (warningDevs > 0) {
                      listHealthBadge = (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>告警故障 ({warningDevs})</span>
                        </span>
                      );
                    }

                    return (
                      <tr 
                        key={studio.id} 
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => onSelectSite(studio.id)}
                      >
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 text-sm">{specs.hostName}</span>
                            {specs.role === 'primary' ? (
                              <span className="px-1 py-0.2 bg-teal-50 text-teal-700 border border-teal-200/40 text-[8px] font-extrabold rounded">
                                ⭐ 主站
                              </span>
                            ) : (
                              <span className="px-1 py-0.2 bg-slate-50 text-slate-400 border border-slate-200 text-[8px] font-medium rounded">
                                子站
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                            <span>{specs.studioName}</span>
                            <span>•</span>
                            <span>{studio.modelType || 'Aqara Hub M3'}</span>
                          </div>
                        </td>
                        {!(currentSpace?.id === 'my-home' || currentSpace?.id === 'bachelor-pad') && (
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10.5px] rounded border border-slate-200">
                              {studio.structureNodeId 
                                ? (currentNodes.find(n => n.id === studio.structureNodeId)?.name || 'Custom Division')
                                : 'Root level (未分配)'}
                            </span>
                          </td>
                        )}
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          {renderSchemeBadge(studio)}
                        </td>
                        <td className="p-3 font-mono text-[10px] leading-normal">
                          <div className="text-slate-600 flex items-center gap-1">
                            <span className="text-slate-400 font-sans font-bold text-[9px]">SN:</span>
                            <span className="font-semibold select-all text-slate-700">{specs.deviceId}</span>
                          </div>
                          <div className="text-slate-600 flex items-center gap-1 mt-0.5">
                            <span className="text-slate-400 font-sans font-bold text-[9px]">IP:</span>
                            <span className="font-semibold select-all text-slate-700">{specs.ipAddress}</span>
                          </div>
                          <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="text-slate-400 font-sans font-bold text-[9px]">时区:</span>
                            <span className="text-slate-600">{specs.timezone}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {listHealthBadge}
                        </td>
                        {!(currentSpace?.id === 'my-home' || currentSpace?.id === 'bachelor-pad') && (
                          <td className="p-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setIsAssignNodeOpen(isAssignNodeOpen === studio.id ? null : studio.id)}
                                className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 font-bold text-[10px] text-slate-600 flex items-center gap-1 cursor-pointer"
                              >
                                <span>运维重新分配</span>
                                <ChevronDown size={10} />
                              </button>

                              {isAssignNodeOpen === studio.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1">
                                  <button
                                    onClick={() => handleAssignStudioNode(studio.id, null)}
                                    className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-50 text-slate-600 flex items-center justify-between"
                                  >
                                    <span>Root (未分配)</span>
                                    {studio.structureNodeId === null && <Check size={11} className="text-emerald-500" />}
                                  </button>
                                  {currentNodes.map(node => (
                                    <button
                                      key={node.id}
                                      onClick={() => handleAssignStudioNode(studio.id, node.id)}
                                      className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-50 text-slate-600 flex items-center justify-between"
                                    >
                                      <span className="truncate">{node.name}</span>
                                      {studio.structureNodeId === node.id && <Check size={11} className="text-emerald-500" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>

      {/* ==================== MODAL: ADD STUDIO TO SPACE ==================== */}
      {isAddStudioOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#2b3542] p-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">新增 Studio 节点 (Provision Studio)</h3>
                <p className="text-[10px] text-slate-300 mt-0.5">Register a hardware controller on Aqara Studio cloud</p>
              </div>
              <button
                onClick={() => setIsAddStudioOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleAddStudioSubmit} className="p-4 space-y-3.5 text-xs text-slate-600">
              <div>
                <label htmlFor="modal-studio-name" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Studio Node Name *
                </label>
                <input
                  type="text"
                  id="modal-studio-name"
                  required
                  placeholder="e.g. Office Core Controller, Reception Gateway"
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-slate-800"
                  value={newStudioName}
                  onChange={(e) => setNewStudioName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-studio-model" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Hub Controller Model
                  </label>
                  <select
                    id="modal-studio-model"
                    className="w-full px-2.5 py-2 border border-slate-200 bg-white rounded focus:outline-none focus:border-slate-400"
                    value={newStudioModel}
                    onChange={(e) => setNewStudioModel(e.target.value)}
                  >
                    <option value="Aqara Hub M3">Aqara Hub M3</option>
                    <option value="Aqara Hub E1">Aqara Hub E1</option>
                    <option value="Camera Hub G3">Camera Hub G3</option>
                    <option value="Network Server">Network Server</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-studio-isp" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Provider Gateway ISP
                  </label>
                  <select
                    id="modal-studio-isp"
                    className="w-full px-2.5 py-2 border border-slate-200 bg-white rounded focus:outline-none focus:border-slate-400"
                    value={newStudioIsp}
                    onChange={(e) => setNewStudioIsp(e.target.value)}
                  >
                    <option value="AT&T Business">AT&T Business</option>
                    <option value="Comcast Business">Comcast Business</option>
                    <option value="Verizon Fios Business">Verizon Fios</option>
                    <option value="Vodafone">Vodafone</option>
                    <option value="TET">TET</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="modal-studio-tz" className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Timezone Zone
                </label>
                <select
                  id="modal-studio-tz"
                  className="w-full px-2.5 py-2 border border-slate-200 bg-white rounded focus:outline-none focus:border-slate-400"
                  value={newStudioTZ}
                  onChange={(e) => setNewStudioTZ(e.target.value)}
                >
                  <option value="PST (UTC-8)">PST (UTC-8) - Pacific Standard Time</option>
                  <option value="EST (UTC-5)">EST (UTC-5) - Eastern Standard Time</option>
                  <option value="GMT (UTC+0)">GMT (UTC+0) - Greenwich Mean Time</option>
                  <option value="CET (UTC+1)">CET (UTC+1) - Central European Time</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  id="cancel-studio-create"
                  onClick={() => setIsAddStudioOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-studio-create"
                  className="px-4 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white rounded font-bold cursor-pointer"
                >
                  Provision Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== BACKUP SETTINGS DIALOG ==================== */}
      {activeDialog === 'backup' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Backup & Recovery</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Division: {dialogNodeName === 'all' ? 'Root' : dialogNodeName}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveDialog(null);
                  setIsBackingUp(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              Create secure local and cloud-replicated snapshots of your Studio controllers, automation maps, and paired devices.
            </p>

            {/* Backups List */}
            <div className="space-y-2 mb-5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Snapshots</div>
              {backupLogs.map(b => (
                <div key={b.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-slate-400" />
                    <div>
                      <div className="font-semibold text-slate-700 text-xs">{b.date}</div>
                      <div className="text-[9px] font-mono text-slate-400">{b.size}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert(`Successfully restored division to snapshot dated ${b.date}`)}
                      className="px-2 py-1 bg-slate-200/80 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] cursor-pointer"
                    >
                      Restore
                    </button>
                    <button 
                      onClick={() => setBackupLogs(prev => prev.filter(item => item.id !== b.id))}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col gap-3">
              {isBackingUp ? (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Creating secure backup snapshot...</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#10b981] h-full animate-pulse" style={{ width: '80%' }}></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsBackingUp(true);
                    setTimeout(() => {
                      const now = new Date();
                      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                      setBackupLogs(prev => [
                        { id: `b-${Date.now()}`, date: formattedDate, size: '1.42 MB' },
                        ...prev
                      ]);
                      setIsBackingUp(false);
                    }, 1200);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Backup NowSnap</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== NOTIFICATION SETTINGS DIALOG ==================== */}
      {activeDialog === 'notification' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Alert Notifications</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Division: {dialogNodeName === 'all' ? 'Root' : dialogNodeName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveDialog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              Configure which events trigger urgent app pushes, SMS alerts, and webhooks for devices in this division.
            </p>

            <div className="space-y-3.5 mb-6">
              {/* Toggle Outage alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Outage Alerting</div>
                  <div className="text-[10px] text-slate-400 font-medium">Notify immediately on device power/network offline events</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifSettings.outageAlerts}
                  onChange={(e) => setNotifSettings(prev => ({ ...prev, outageAlerts: e.target.checked }))}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Toggle Power alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Power Supply Failures</div>
                  <div className="text-[10px] text-slate-400 font-medium">Alert if main grid power fails and backup battery starts</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifSettings.powerFailures}
                  onChange={(e) => setNotifSettings(prev => ({ ...prev, powerFailures: e.target.checked }))}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Toggle Maintenance alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Maintenance Schedule Warnings</div>
                  <div className="text-[10px] text-slate-400 font-medium">Warn before scheduled system maintenance or OTA updates</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifSettings.maintenance}
                  onChange={(e) => setNotifSettings(prev => ({ ...prev, maintenance: e.target.checked }))}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Toggle Webhooks */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">External Webhooks</div>
                  <div className="text-[10px] text-slate-400 font-medium">Forward system telemetry payload to registered webhook URLs</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifSettings.apiWebhooks}
                  onChange={(e) => setNotifSettings(prev => ({ ...prev, apiWebhooks: e.target.checked }))}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Sensitivity selector */}
              <div className="pt-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Alert Level Filter</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'high', 'none'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setNotifSettings(prev => ({ ...prev, alertSeverity: level }))}
                      className={`py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer capitalize ${
                        notifSettings.alertSeverity === level
                          ? 'bg-slate-900 text-white border-transparent'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {level === 'all' ? 'All Alerts' : level === 'high' ? 'High Only' : 'Disabled'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert("Successfully saved alert configurations!");
                setActiveDialog(null);
              }}
              className="w-full py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm text-center"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* ==================== UPDATE SETTINGS DIALOG ==================== */}
      {activeDialog === 'update' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">OTA Update Settings</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Division: {dialogNodeName === 'all' ? 'Root' : dialogNodeName}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveDialog(null);
                  setIsCheckingUpdate(false);
                  setUpdateCheckResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              Oversee smart hub firmware distributions and configure the automatic upgrade window.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Firmware</div>
                  <div className="text-xs font-bold text-slate-800">v4.3.8 (Build 2110)</div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Stable</span>
              </div>

              {/* Release Channel Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Distribution Channel</label>
                <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                  <button
                    onClick={() => setUpdateChan('stable')}
                    className={`flex-1 py-1 rounded-md text-xs font-semibold text-center cursor-pointer transition-all ${
                      updateChan === 'stable' ? 'bg-white shadow-xs text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Stable Release
                  </button>
                  <button
                    onClick={() => setUpdateChan('beta')}
                    className={`flex-1 py-1 rounded-md text-xs font-semibold text-center cursor-pointer transition-all ${
                      updateChan === 'beta' ? 'bg-white shadow-xs text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Beta Testing
                  </button>
                </div>
              </div>

              {/* Automatic upgrades */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Auto-Update Firmware</div>
                  <div className="text-[10px] text-slate-400 font-medium">Install critical security upgrades automatically at 03:00 AM</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoUpdateEnabled}
                  onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Checker panel */}
              {isCheckingUpdate ? (
                <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-center text-xs font-medium text-slate-600 animate-pulse">
                  Connecting to Aqara OTA server...
                </div>
              ) : updateCheckResult ? (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-xs font-semibold text-emerald-800">
                  {updateCheckResult}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsCheckingUpdate(true);
                    setTimeout(() => {
                      setIsCheckingUpdate(false);
                      setUpdateCheckResult("Your system is running the latest version!");
                    }, 1000);
                  }}
                  className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer text-center"
                >
                  Check for Updates
                </button>
              )}
            </div>

            <button
              onClick={() => {
                alert("OTA distribution channel and upgrade window updated!");
                setActiveDialog(null);
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm text-center"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}

      {/* ==================== PROVISIONING CODE DIALOG ==================== */}
      {activeDialog === 'provision' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Provisioning Code</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Division: {dialogNodeName === 'all' ? 'Root' : dialogNodeName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveDialog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-5 font-medium font-sans">
              Copy the alphanumeric key below or scan the generated QR code to securely authenticate and bind a new Aqara Hub M3 or Miniserver to this division.
            </p>

            <div className="space-y-4 mb-6">
              {/* Alphanumeric key display */}
              <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Pairing Code</div>
                  <div className="text-xs font-mono font-bold text-slate-800">AQ-M3-{dialogNodeId.slice(0, 4).toUpperCase()}-984B</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`AQ-M3-${dialogNodeId.slice(0, 4).toUpperCase()}-984B`);
                    alert("Provisioning key copied to clipboard!");
                  }}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-[10px] transition-colors cursor-pointer"
                >
                  Copy Key
                </button>
              </div>

              {/* Custom SVG Barcode / QR code mockup */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs mb-2">
                  {/* Mock QR design */}
                  <div className="w-32 h-32 flex flex-col justify-between p-1">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 border-4 border-slate-900 rounded-sm flex items-center justify-center">
                        <div className="w-3 h-3 bg-slate-900"></div>
                      </div>
                      <div className="w-8 h-8 border-4 border-slate-900 rounded-sm flex items-center justify-center">
                        <div className="w-3 h-3 bg-slate-900"></div>
                      </div>
                    </div>
                    {/* QR filler details */}
                    <div className="flex flex-col gap-1 items-center justify-center py-2">
                      <div className="w-20 h-2 bg-slate-800 rounded-full"></div>
                      <div className="w-16 h-2 bg-slate-400 rounded-full"></div>
                      <div className="w-24 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-8 h-8 border-4 border-slate-900 rounded-sm flex items-center justify-center">
                        <div className="w-3 h-3 bg-slate-900"></div>
                      </div>
                      <div className="w-6 h-6 bg-slate-950 rounded-xs"></div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium font-mono">ID: {dialogNodeId}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveDialog(null)}
              className="w-full py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm text-center"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
