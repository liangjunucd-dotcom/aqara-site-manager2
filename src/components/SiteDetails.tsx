import React, { useState, useEffect, useRef } from 'react';
import { Site, Device } from '../types';
import { 
  ArrowLeft, Cpu, Video, Lock, Compass, Smartphone, Lightbulb, 
  Settings, AlertTriangle, Play, Plus, Trash2, Power, 
  Shield, Database, Terminal, Sliders, Server, ExternalLink,
  CheckCircle2, Globe, Info, Hash, Layers, Clock, ChevronRight
} from 'lucide-react';

interface SiteDetailsProps {
  site: Site;
  onBack: () => void;
  onUpdateDeviceStatus: (siteId: string, deviceId: string, updates: Partial<Device>) => void;
  onAddDeviceToSite: (siteId: string, device: Device) => void;
  onRemoveDeviceFromSite: (siteId: string, deviceId: string) => void;
  onUpdateSite?: (siteId: string, updates: Partial<Site>) => void;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export default function SiteDetails({ 
  site, 
  onBack, 
  onUpdateDeviceStatus, 
  onAddDeviceToSite, 
  onRemoveDeviceFromSite,
  onUpdateSite 
}: SiteDetailsProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  
  // Tab 2: Diagnostics States
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [diagLogs, setDiagLogs] = useState<string[]>([]);
  const [diagScore, setDiagScore] = useState<number | null>(null);
  const [diagMetrics, setDiagMetrics] = useState({
    rtt: 8,
    packetLoss: 0.12,
    cpuTemp: 44,
    channelInterference: 'Low Interference (Mesh optimal)',
    networkHealth: 'Excellent (Thread operational)'
  });

  // Tab 3: Disaster Recovery States
  const [lastBackupTime, setLastBackupTime] = useState<string>('2026-07-04 18:22:10');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupLogs, setBackupLogs] = useState<string[]>([]);
  const [backupsList, setBackupsList] = useState([
    { name: 'backup_guestrooms_active_v4.5.db', size: '286 KB', date: '2026-07-04 18:22:10', type: 'auto' },
    { name: 'backup_pre_migration_state.db', size: '284 KB', date: '2026-07-02 11:05:44', type: 'manual' },
    { name: 'backup_initial_provision.db', size: '242 KB', date: '2026-06-30 09:12:00', type: 'system' }
  ]);

  // Tab 4: Blueprint States
  const [activeBlueprintName, setActiveBlueprintName] = useState<string>(site.blueprint || 'v1.0 Legacy');
  const [blueprintLogs, setBlueprintLogs] = useState<string[]>([]);
  const [blueprintsRepo, setBlueprintsRepo] = useState([
    { id: 'bp-1', name: 'Smart Guest Room VIP Suite v2.3', desc: 'Premium dimming curves, automatic solar daylight curtain tracking, secure lock tokens & custom voice welcome briefings.', author: 'Aqara R&D Team', releaseDate: '2026-05-20' },
    { id: 'bp-2', name: 'Standard Hotel Double Room v1.5', desc: 'Optimized motion pathway night lights, automated master keycard power offsets, and automatic HVAC temperature overrides.', author: 'Aqara Solutions', releaseDate: '2026-06-12' },
    { id: 'bp-3', name: 'Conference Room Presentation v1.2', desc: 'Single-tap projection modes, automatic screen and blackout curtains deployment, and circadian white board backlight offsets.', author: 'Hotel IT Admin', releaseDate: '2026-07-01' }
  ]);
  const [isDraggingBlueprint, setIsDraggingBlueprint] = useState(false);

  // Tab 5: Firmware States
  const [currentFirmware, setCurrentFirmware] = useState<string>('v4.1.8_0023');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isUpdatingFirmware, setIsUpdatingFirmware] = useState(false);
  const [firmwareUpdateProgress, setFirmwareUpdateProgress] = useState(0);
  const [firmwareLogs, setFirmwareLogs] = useState<string[]>([]);
  const [hasFirmwareUpdate, setHasFirmwareUpdate] = useState(true);

  const [automations, setAutomations] = useState<AutomationRule[]>([
    { id: 'rule-1', name: 'Safe Night Walkway', trigger: 'Living Room Motion T1 detects presence', action: 'Turn on Living Room Ceiling Light to 35%', enabled: true },
    { id: 'rule-2', name: 'Secure Entryway Auto-Lock', trigger: 'Front Entrance Lock remains unlocked for 5 min', action: 'Secure Deadbolt Lock and record G3 clip', enabled: true },
    { id: 'rule-3', name: 'Energy Save Curtains', trigger: 'Temp Sensor T1 registers >28°C', action: 'Deploy Curtain Driver E1 to close fully', enabled: false }
  ]);
  
  // Console log logs state
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [Aqara Cloud] Remote session established securely.`,
    `[${new Date().toLocaleTimeString()}] [Hub M3] Syncing 12 Matter/Thread end-nodes.`,
    `[${new Date().toLocaleTimeString()}] [Device Monitor] All local batteries register above 85% threshold.`
  ]);

  // Modals / Adding device locally
  const [isAdding, setIsAdding] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState<Device['type']>('sensor');
  const [newDevModel, setNewDevModel] = useState('Door & Window Sensor T1');

  // Interactive Live stream references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  // Set first camera as default if available
  const siteCameras = site.devices.filter(d => d.type === 'camera');
  useEffect(() => {
    if (siteCameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(siteCameras[0].id);
    }
  }, [site, siteCameras, selectedCameraId]);

  // HTML5 CCTV simulated stream with canvas rendering
  useEffect(() => {
    if (!canvasRef.current || !selectedCameraId) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    // Mock target scanning coordinate tracking
    let targetX = 150;
    let targetY = 100;
    let targetDX = 1.2;
    let targetDY = 0.8;

    const render = () => {
      frame++;
      
      // Clear with CCTV vintage style green-black hue
      ctx.fillStyle = '#051108';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render scanner grid overlays
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw active scanning bounds / Target Person tracking box
      targetX += targetDX;
      targetY += targetDY;
      if (targetX < 50 || targetX > canvas.width - 50) targetDX = -targetDX;
      if (targetY < 50 || targetY > canvas.height - 50) targetDY = -targetDY;

      // Pulse bounding trackbox
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(targetX - 25, targetY - 25, 50, 50);
      
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('TRACK_OBJ_01 (CONF: 99%)', targetX - 25, targetY - 30);

      // Rotating radar sweep effect
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, (frame * 0.02) % (Math.PI * 2));
      ctx.lineTo(canvas.width / 2, canvas.height / 2);
      ctx.stroke();

      // Vignette camera text overlay
      ctx.fillStyle = '#10b981';
      ctx.font = '10px monospace';
      ctx.fillText('REC ● LIVE FEED', 15, 25);
      ctx.fillText(`CAM_SITE: ${site.name.toUpperCase()}`, 15, 40);
      ctx.fillText(`ID: ${selectedCameraId.toUpperCase()}`, 15, 55);
      
      // Timestamps update dynamically
      const dateStr = new Date().toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString();
      ctx.fillText(`DATE: ${dateStr}`, canvas.width - 150, 25);
      ctx.fillText(`TIME: ${timeStr}`, canvas.width - 150, 40);

      // Center crosshair
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2);
      ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2);
      ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10);
      ctx.lineTo(canvas.width / 2, canvas.height / 2 + 10);
      ctx.stroke();

      // Simulated analog noise static
      ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
      for (let n = 0; n < 8; n++) {
        const noiseY = Math.floor(Math.random() * canvas.height);
        ctx.fillRect(0, noiseY, canvas.width, Math.random() * 2);
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [site, selectedCameraId]);

  const addLogEntry = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 40));
  };

  // Run/test an automation rule manually
  const triggerAutomation = (rule: AutomationRule) => {
    addLogEntry(`[Automation] Triggering rule test: "${rule.name}"`);
    addLogEntry(`[Rule Engine] Evaluated condition: SUCCESS - "${rule.trigger}" matched.`);
    
    // Perform simulated actions based on rule
    setTimeout(() => {
      addLogEntry(`[Action Executed] Success dispatching output command: "${rule.action}"`);
    }, 400);
  };

  const handleDevicePowerToggle = (device: Device) => {
    const nextStatus = device.status === 'online' ? 'offline' : 'online';
    onUpdateDeviceStatus(site.id, device.id, { status: nextStatus as any });
    addLogEntry(`[Site Manager] Set device state: "${device.name}" to ${nextStatus.toUpperCase()}`);
  };

  const handleAddDeviceLocally = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName.trim()) return;

    const newDev: Device = {
      id: `dev-add-${Date.now()}`,
      name: newDevName,
      type: newDevType,
      model: newDevModel,
      status: 'online',
      batteryLevel: 100,
      signalStrength: 85,
      room: 'Living Room'
    };

    onAddDeviceToSite(site.id, newDev);
    addLogEntry(`[Device Registry] Registered new ${newDevType} module: "${newDevName}" successfully.`);
    setIsAdding(false);
    setNewDevName('');
  };

  const handleRemoveDeviceLocally = (deviceId: string) => {
    const dev = site.devices.find(d => d.id === deviceId);
    onRemoveDeviceFromSite(site.id, deviceId);
    if (dev) {
      addLogEntry(`[Device Registry] Decommissioned device module: "${dev.name}" from local hub list.`);
    }
  };

  // Tab 2: System Diagnostics Trigger
  const runSystemDiagnostics = () => {
    setIsDiagnosing(true);
    setDiagnosticProgress(0);
    setDiagScore(null);
    setDiagLogs([`[${new Date().toLocaleTimeString()}] Diagnostic Scan initiated.`]);

    let step = 0;
    const steps = [
      "Initializing Thread-node connectivity sweep...",
      "Probing Aqara Hub M3 local processor core temperature...",
      "Measuring Matter end-node response latency (Round-Trip-Time)...",
      "Scanning 2.4GHz RF spectrum for potential Wi-Fi overlaps...",
      "Evaluating device power indexes & battery health tables...",
      "Generating system topology score & final recommendation report."
    ];

    const timer = setInterval(() => {
      step += 1;
      setDiagnosticProgress(Math.min(step * 17, 100));
      
      const timeStr = new Date().toLocaleTimeString();
      const currentLog = steps[step - 1] || "Finalizing scan summary...";
      setDiagLogs(prev => [`[${timeStr}] ${currentLog}`, ...prev]);

      if (step >= steps.length) {
        clearInterval(timer);
        setIsDiagnosing(false);
        setDiagnosticProgress(100);
        const score = Math.floor(Math.random() * 8) + 92;
        setDiagScore(score);
        
        setDiagMetrics({
          rtt: Math.floor(Math.random() * 5) + 4,
          packetLoss: Math.random() > 0.5 ? 0.08 : 0.11,
          cpuTemp: Math.floor(Math.random() * 6) + 38,
          channelInterference: 'Low Interference (Mesh optimal)',
          networkHealth: 'Excellent (Thread operational)'
        });
        
        addLogEntry(`[Diagnostics] Finished system scan. Topology score: ${score}/100.`);
      }
    }, 400);
  };

  // Tab 3: Disaster Recovery Backup Trigger
  const runSystemBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    setBackupLogs([`[${new Date().toLocaleTimeString()}] Starting configuration snapshot encapsulation.`]);

    let step = 0;
    const steps = [
      "Serializing active automation schema states...",
      "Binding Thread key tokens & logical node paths...",
      "Creating SHA-256 integrity security signature...",
      "Transmitting payload to secure Cloud DR server (EU-West)...",
      "Writing local copy backup on Gateway TF/SD card... Done."
    ];

    const timer = setInterval(() => {
      step += 1;
      setBackupProgress(Math.min(step * 20, 100));
      
      const timeStr = new Date().toLocaleTimeString();
      setBackupLogs(prev => [`[${timeStr}] ${steps[step - 1]}`, ...prev]);

      if (step >= steps.length) {
        clearInterval(timer);
        setIsBackingUp(false);
        setBackupProgress(100);
        
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        setLastBackupTime(formattedDate);
        
        const newBackup = {
          name: `backup_hotel_room_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.db`,
          size: `${Math.floor(Math.random() * 20) + 270} KB`,
          date: formattedDate,
          type: 'manual'
        };
        
        setBackupsList(prev => [newBackup, ...prev]);
        addLogEntry(`[DR Engine] Successfully created cloud snapshot: "${newBackup.name}".`);
      }
    }, 400);
  };

  const handleDeleteBackup = (name: string) => {
    setBackupsList(prev => prev.filter(b => b.name !== name));
    addLogEntry(`[DR Engine] Purged backup snapshot: "${name}" from cloud registry.`);
  };

  // Tab 4: Load Blueprint Trigger
  const loadBlueprintScheme = (bp: typeof blueprintsRepo[0]) => {
    addLogEntry(`[Blueprint Engine] Deploying schema: "${bp.name}"`);
    
    let newRules: AutomationRule[] = [];
    if (bp.id === 'bp-1' || bp.name.includes('VIP')) {
      newRules = [
        { id: 'rule-vip-1', name: 'VIP Welcome Chime', trigger: 'Door Lock U200 is unlocked with VIP credentials', action: 'Broadcast Welcome Audio and trigger LED light strip to sunset gradient', enabled: true },
        { id: 'rule-vip-2', name: 'Circadian Solar Blinds', trigger: 'Ambient light sensor reads > 5000 Lux', action: 'Set Curtain Driver E1 to track 45% shadow angle', enabled: true },
        { id: 'rule-vip-3', name: 'Comfort Climate Boost', trigger: 'Guest Presence FP2 is active', action: 'Turn HVAC AC on and set target to 22°C', enabled: true }
      ];
    } else if (bp.id === 'bp-2' || bp.name.includes('Standard')) {
      newRules = [
        { id: 'rule-std-1', name: 'Energy Card Saver', trigger: 'Presence FP2 reports absence for 15 min', action: 'De-energize room relays and setback HVAC to 26°C', enabled: true },
        { id: 'rule-std-2', name: 'Pathway Night Guide', trigger: 'Motion Sensor T1 registers steps in dark', action: 'Turn on pathway night-lights to 10%', enabled: true },
        { id: 'rule-std-3', name: 'Standard HVAC Offset', trigger: 'Windows open detected by Door T1', action: 'Cut off cooling to prevent waste', enabled: true }
      ];
    } else {
      newRules = [
        { id: 'rule-conf-1', name: 'Presentation Mode Toggle', trigger: 'Wireless Switch Smart H1 is double clicked', action: 'Dim spotlights, deploy screen and activate projector', enabled: true },
        { id: 'rule-conf-2', name: 'Meeting Air Refresh', trigger: 'Air quality TVOC registers > 1200ppm', action: 'Engage ventilator fans to 100% capacity', enabled: true }
      ];
    }

    setAutomations(newRules);
    setActiveBlueprintName(bp.name);
    
    if (onUpdateSite) {
      onUpdateSite(site.id, { blueprint: bp.name });
    }

    addLogEntry(`[Blueprint Engine] Successfully loaded and synchronized "${bp.name}" with local devices.`);
  };

  const handleBlueprintFileDrop = (fileName: string) => {
    const fakeBp = {
      id: `bp-custom-${Date.now()}`,
      name: fileName.replace('.json', '').replace('.yaml', ''),
      desc: 'User-uploaded custom local automation scheme. Parses structural rules and binds target end-nodes.',
      author: 'Local Integrator',
      releaseDate: new Date().toISOString().split('T')[0]
    };
    
    setBlueprintsRepo(prev => [fakeBp, ...prev]);
    addLogEntry(`[Blueprint Registry] Imported custom blueprint file: "${fileName}" successfully.`);
    loadBlueprintScheme(fakeBp);
  };

  // Tab 5: Firmware OTA Upgrade Trigger
  const runFirmwareOTA = () => {
    setIsUpdatingFirmware(true);
    setFirmwareUpdateProgress(0);
    setFirmwareLogs([`[${new Date().toLocaleTimeString()}] Triggering OTA firmware deployment for ${site.name} Hub M3.`]);

    let pct = 0;
    const steps = [
      { prg: 20, log: "Downloading compiled firmware bin file from Secure CDN... [20%]" },
      { prg: 40, log: "Downloading package complete. Verifying SHA-256 digital signature... [OK]" },
      { prg: 65, log: "Halting non-essential Zigbee polling. Saving current mesh state... [Saved]" },
      { prg: 85, log: "Writing firmware sectors on Master Hub EEPROM... [85%]" },
      { prg: 95, log: "Triggering soft hardware reset and reloading border router. [Done]" },
      { prg: 100, log: "Reconnected Thread mesh. Upgraded successfully to v4.2.0_0150." }
    ];

    const timer = setInterval(() => {
      const nextStep = steps.find(s => s.prg > pct);
      if (nextStep) {
        pct = nextStep.prg;
        setFirmwareUpdateProgress(pct);
        const timeStr = new Date().toLocaleTimeString();
        setFirmwareLogs(prev => [`[${timeStr}] ${nextStep.log}`, ...prev]);
      } else {
        clearInterval(timer);
        setIsUpdatingFirmware(false);
        setFirmwareUpdateProgress(100);
        setCurrentFirmware('v4.2.0_0150');
        setHasFirmwareUpdate(false);
        addLogEntry(`[Firmware Manager] Hub M3 successfully updated to v4.2.0_0150.`);
      }
    }, 500);
  };

  const getDeviceIcon = (type: Device['type'], size = 16, className = "text-slate-600") => {
    switch (type) {
      case 'hub': return <Cpu size={size} className={className} />;
      case 'camera': return <Video size={size} className={className} />;
      case 'lock': return <Lock size={size} className={className} />;
      case 'sensor': return <Compass size={size} className={className} />;
      case 'switch': return <Smartphone size={size} className={className} />;
      case 'light': return <Lightbulb size={size} className={className} />;
      default: return <Database size={size} className={className} />;
    }
  };

  const studioTitle = site.modelType || 'Aqara Hub M3';
  const hubDevice = site.devices.find(d => d.type === 'hub');
  const displaySerial = hubDevice
    ? hubDevice.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12).padEnd(12, '0')
    : site.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12).padEnd(12, '0');
  const offlineCount = site.devices.filter(d => d.status === 'offline').length;
  const warningCount = site.devices.filter(d => d.status === 'warning').length;
  const healthStatus =
    site.status === 'offline' || offlineCount > 0 ? 'critical'
    : site.status === 'warning' || warningCount > 0 ? 'warning'
    : 'healthy';

  const detailTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'programs', label: 'Programs' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            id="back-to-sites"
            onClick={onBack}
            className="p-2 mt-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <Server size={22} className="text-slate-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{studioTitle}</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1 ml-[30px]">{site.location} ›</p>
          </div>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-start sm:mt-1">
          <button
            type="button"
            onClick={() => addLogEntry('[Aqara App] Launching remote mobile session…')}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Open in Aqara App
            <ExternalLink size={14} />
          </button>
          <button
            type="button"
            onClick={() => addLogEntry('[Aqara Studio] Opening local configuration workspace…')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Open in Aqara Studio
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Pill tabs */}
      <div className="flex gap-2">
        {detailTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {/* Health */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Health</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                  healthStatus === 'healthy'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : healthStatus === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <CheckCircle2 size={12} />
                  {healthStatus === 'healthy' ? 'Healthy' : healthStatus === 'warning' ? 'Attention' : 'Critical'}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {healthStatus === 'healthy'
                  ? `Studio 运行正常，${site.devices.length} 个设备在线，Thread/Matter 网络稳定。`
                  : healthStatus === 'warning'
                  ? `检测到 ${warningCount || 1} 项需关注：设备待升级或网关信号偏弱，建议尽快处理。`
                  : `Studio 存在严重告警：${offlineCount} 个设备离线或核心网关失去连接。`}
              </p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Actions</h3>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
              >
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Globe size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Manage Device</p>
                  <p className="text-xs text-slate-500 mt-0.5">注册或管理 Studio 下的 Matter 设备</p>
                </div>
              </button>
              <button
                type="button"
                onClick={runSystemDiagnostics}
                disabled={isDiagnosing}
                className="w-full flex items-center gap-3 p-3 mt-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer disabled:opacity-50"
              >
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Terminal size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Run Diagnostics</p>
                  <p className="text-xs text-slate-500 mt-0.5">扫描网络拓扑与设备健康状态</p>
                </div>
              </button>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">System Status</h3>
              <div className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Welcome to Aqara Studio Cloud</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    此 Studio 已通过云端绑定。您可以在 Aqara Studio 中编辑自动化逻辑、蓝图方案，并在此面板监控运行状态。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Details</h3>
              <dl className="space-y-3">
                {[
                  { icon: Hash, label: 'Serial Number', value: displaySerial },
                  { icon: Layers, label: 'Studio Role', value: 'Standard' },
                  { icon: Cpu, label: 'Update Level', value: 'RELEASE', badge: true },
                  { icon: Database, label: 'Blueprint', value: site.blueprint || 'v1.0 Legacy' },
                  { icon: Clock, label: 'Timezone', value: site.timeZone },
                ].map(({ icon: Icon, label, value, badge }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon size={15} className="text-slate-400 shrink-0" />
                    <dt className="text-slate-500 w-28 shrink-0">{label}</dt>
                    <dd className="text-slate-800 font-medium">
                      {badge ? (
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-600">
                          {value}
                        </span>
                      ) : value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Recommended Settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Recommended Settings</h3>
              <p className="text-sm text-slate-400 text-center py-6">
                You are not authorized to perform these actions
              </p>
            </div>

            {/* History preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
              <h3 className="font-bold text-slate-900 text-sm mb-4">History</h3>
              <div className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 mb-4">
                <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Welcome to Aqara Studio Cloud</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    最近备份：{lastBackupTime}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('history')}
                className="self-end flex items-center gap-0.5 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                History
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Programs */}
      {activeSubTab === 'programs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Automations</h3>
              <span className="text-xs text-slate-400 font-mono">{automations.length} rules</span>
            </div>
            <div className="space-y-2">
              {automations.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    rule.enabled ? 'border-slate-200 bg-slate-50/50' : 'border-slate-100 opacity-60'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{rule.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      IF {rule.trigger} → THEN {rule.action}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerAutomation(rule)}
                      className="px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg hover:bg-white cursor-pointer"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => {
                        setAutomations(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
                        addLogEntry(`[Automation] ${rule.enabled ? 'Disabled' : 'Enabled'} "${rule.name}"`);
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded-lg cursor-pointer"
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Registered Devices</h3>
            <div className="space-y-2">
              {site.devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.type, 16)}
                    <div>
                      <p className="text-sm font-bold text-slate-800">{device.name}</p>
                      <p className="text-xs text-slate-400">{device.model} · {device.room}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      device.status === 'offline' ? 'bg-rose-500' :
                      device.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-500'
                    }`} />
                    <button
                      onClick={() => handleRemoveDeviceLocally(device.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Blueprint Library</h3>
            <div className="space-y-2">
              {blueprintsRepo.map((bp) => (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => loadBlueprintScheme(bp)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <p className="text-sm font-bold text-slate-800">{bp.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{bp.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {activeSubTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm">System Logs</h3>
              <button
                onClick={runSystemBackup}
                disabled={isBackingUp}
                className="px-3 py-1 text-xs font-bold bg-slate-900 text-white rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {isBackingUp ? `Backing up ${backupProgress}%` : 'Create Backup'}
              </button>
            </div>
            <div className="bg-slate-950 text-emerald-400 p-3 rounded-lg font-mono text-[11px] space-y-1 max-h-64 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx}><span className="text-emerald-600">&gt;</span> {log}</div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Backup Snapshots</h3>
            <div className="space-y-2">
              {backupsList.map((b) => (
                <div key={b.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{b.name}</p>
                    <p className="text-xs text-slate-400">{b.date} · {b.size}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBackup(b.name)}
                    className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Device Dialog */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="bg-slate-950 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Register Matter End-node</h3>
                <p className="text-xs text-slate-400 mt-0.5">Central site provisioning</p>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleAddDeviceLocally} className="p-5 space-y-4">
              <div>
                <label htmlFor="device-name-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Device Name
                </label>
                <input
                  type="text"
                  id="device-name-input"
                  required
                  placeholder="e.g. Master Bedroom Ceiling Light"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="device-type-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Device Category
                </label>
                <select
                  id="device-type-input"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white"
                  value={newDevType}
                  onChange={(e) => {
                    setNewDevType(e.target.value as any);
                    // Match default models nicely
                    if (e.target.value === 'sensor') setNewDevModel('Presence Sensor FP2');
                    if (e.target.value === 'camera') setNewDevModel('Camera Hub G3');
                    if (e.target.value === 'lock') setNewDevModel('Smart Lock U200');
                    if (e.target.value === 'light') setNewDevModel('Ceiling Light T1');
                    if (e.target.value === 'switch') setNewDevModel('Smart Wall Switch H1');
                    if (e.target.value === 'curtain') setNewDevModel('Curtain Driver E1');
                  }}
                >
                  <option value="sensor">Sensor</option>
                  <option value="camera">Security Camera</option>
                  <option value="lock">Smart Deadbolt Lock</option>
                  <option value="light">Ceiling/LED Light</option>
                  <option value="switch">Wall Switch</option>
                  <option value="curtain">Curtain Driver</option>
                </select>
              </div>

              <div>
                <label htmlFor="device-model-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Hardware SKU Model
                </label>
                <input
                  type="text"
                  id="device-model-input"
                  required
                  placeholder="e.g. Aqara Wall Switch H1 Triple"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 bg-slate-50 text-slate-600"
                  value={newDevModel}
                  onChange={(e) => setNewDevModel(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  id="close-add-modal-local"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-add-device-local"
                  className="px-4 py-2 bg-slate-950 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
