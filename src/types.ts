export interface Device {
  id: string;
  name: string;
  type: 'hub' | 'camera' | 'sensor' | 'switch' | 'lock' | 'light' | 'curtain';
  model: string;
  status: 'online' | 'offline' | 'warning';
  batteryLevel?: number; // percentage
  signalStrength?: number; // dBm or percentage
  room?: string;
  x?: number; // relative percentage position (0-100) on floor plan
  y?: number; // relative percentage position (0-100) on floor plan
}

export interface SiteTimelinePoint {
  time: string; // "HH:MM" format
  status: 'online' | 'warning' | 'offline';
  length: number; // visual scale length of this block
}

export interface Site {
  id: string;
  name: string;
  status: 'up-to-date' | 'warning' | 'offline' | 'invited';
  timeline: SiteTimelinePoint[];
  devices: Device[];
  location: string;
  timeZone: string;
  invited?: boolean;
  isp?: string;
  selectedGlow?: boolean;
  modelType?: string;
  deviceCountBadge?: string;
  mergeLink?: boolean;
  spaceId?: string; // Links this Studio to a specific Space
  structureNodeId?: string | null; // Links this Studio to a specific sub-node in the Space structure
  blueprint?: string; // e.g. "blueprint v1.0" or "binding scheme v2.1"
}

export interface Organization {
  id: string;
  name: string;
}

export interface Space {
  id: string;
  name: string;
  orgId: string;
  description?: string;
  createdAt: string;
}

export interface SpaceStructureNode {
  id: string;
  name: string;
  spaceId: string;
  parentId?: string | null; // hierarchical parent
}

export interface PresetFloorPlan {
  id: string;
  name: string;
  dimensions: string;
  rooms: string[];
}
