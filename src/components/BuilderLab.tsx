import React, { useState, useRef, useEffect } from 'react';
import { Device, PresetFloorPlan } from '../types';
import { PRESET_FLOOR_PLANS, AVAILABLE_DEVICES_FOR_DESIGN } from '../mockData';
import { 
  Sparkles, Layers, Sliders, Trash2, HelpCircle, AlertCircle, 
  Cpu, Video, Lock, Compass, Smartphone, Lightbulb, RefreshCw, 
  Plus, Check, ChevronDown, CheckCircle2, Waves
} from 'lucide-react';

interface BuilderLabProps {
  onAddDevicesToSite?: (siteId: string, devices: Device[]) => void;
  activeSiteName?: string;
}

interface AIDeviceSuggestion {
  type: Device['type'];
  name: string;
  model: string;
  room: string;
  x: number;
  y: number;
  reason: string;
}

export default function BuilderLab({ onAddDevicesToSite, activeSiteName = 'Seattle' }: BuilderLabProps) {
  // Preset plans
  const [selectedPlan, setSelectedPlan] = useState<PresetFloorPlan>(PRESET_FLOOR_PLANS[0]);
  const [placedDevices, setPlacedDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  
  // Drag and drop state
  const [selectedDeviceType, setSelectedDeviceType] = useState<typeof AVAILABLE_DEVICES_FOR_DESIGN[0]>(AVAILABLE_DEVICES_FOR_DESIGN[0]);
  const [deviceRange, setDeviceRange] = useState<number>(25); // visual signal range percentage (0-100)
  
  // Custom signal lines toggling
  const [showMeshLines, setShowMeshLines] = useState(true);
  const [showSignalRanges, setShowSignalRanges] = useState(true);
  
  // AI Placement State
  const [aiPrompt, setAiPrompt] = useState('Create a security-focused layout with full entry surveillance and living room motion coverage');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLog, setAiLog] = useState<string[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize with some default items on plan change
  useEffect(() => {
    resetCanvas();
  }, [selectedPlan]);

  const resetCanvas = () => {
    setPlacedDevices([
      { id: 'dev-1', name: 'Central Hub M3', type: 'hub', model: 'Aqara Hub M3', status: 'online', room: 'Living Room', x: 50, y: 50 },
      { id: 'dev-2', name: 'Front Entrance Deadbolt', type: 'lock', model: 'Smart Lock U200', status: 'online', room: 'Corridor', x: 15, y: 30 },
      { id: 'dev-3', name: 'Living Room Presence FP2', type: 'sensor', model: 'Presence Sensor FP2', status: 'online', room: 'Living Room', x: 75, y: 65 }
    ]);
    setSelectedDeviceId(null);
    setAiAnalysis('');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    
    // Check if we clicked on an existing device icon (to avoid resetting selection)
    const target = e.target as HTMLElement;
    if (target.closest('.device-node')) return;

    // Place new device at click coordinate if double clicked, or select empty space to clear
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if room boundaries can be simulated based on coordinate
    const room = determineRoom(x, y, selectedPlan.rooms);

    const newDevice: Device = {
      id: `dev-${Date.now()}`,
      name: `${selectedDeviceType.name} (${room})`,
      type: selectedDeviceType.type as any,
      model: selectedDeviceType.name,
      status: 'online',
      room: room,
      x: Math.round(x),
      y: Math.round(y)
    };

    setPlacedDevices(prev => [...prev, newDevice]);
    setSelectedDeviceId(newDevice.id);
  };

  const determineRoom = (x: number, y: number, rooms: string[]) => {
    if (rooms.length === 0) return 'Main Area';
    // Divide coordinates mathematically into simple mock room cells
    if (x < 35 && y < 45) return rooms[1] || rooms[0]; // Master Bedroom
    if (x >= 35 && x < 70 && y < 45) return rooms[3] || rooms[0]; // Kitchen/Hallway
    if (x >= 70 && y < 45) return rooms[2] || rooms[0]; // Guest Bedroom
    if (x < 30 && y >= 45) return rooms[5] || rooms[0]; // Corridor/Patio
    return rooms[0]; // Living Room
  };

  const handleDeleteDevice = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlacedDevices(prev => prev.filter(d => d.id !== id));
    if (selectedDeviceId === id) {
      setSelectedDeviceId(null);
    }
  };

  const handleDeviceDrag = (id: string, x: number, y: number) => {
    setPlacedDevices(prev => prev.map(d => {
      if (d.id === id) {
        const room = determineRoom(x, y, selectedPlan.rooms);
        return { ...d, x: Math.round(x), y: Math.round(y), room };
      }
      return d;
    }));
  };

  // Call the server-side proxy endpoint for actual AI Layout design
  const triggerAiSmartDesign = async () => {
    setIsAiLoading(true);
    setAiAnalysis('');
    setAiLog(['Initializing Aqara Cloud Architecture agent...', 'Parsing physical floor space requirements...', 'Polling available Matter/Zigbee mesh nodes...']);

    try {
      const response = await fetch('/api/builder/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          floorPlanName: selectedPlan.name,
          rooms: selectedPlan.rooms
        })
      });

      if (!response.ok) {
        throw new Error('AI layout generator failed');
      }

      const data = await response.json();
      
      // Simulate slow thinking intervals for immersive UI presentation
      setTimeout(() => {
        setAiLog(prev => [...prev, 'Establishing optimal multi-hop pathways...', 'Generating Matter 1.3 clusters...']);
        setTimeout(() => {
          const suggestions: AIDeviceSuggestion[] = data.recommendations || [];
          
          const mappedDevices: Device[] = suggestions.map((s, index) => ({
            id: `ai-dev-${index}-${Date.now()}`,
            name: s.name,
            type: s.type,
            model: s.model,
            status: 'online',
            room: s.room,
            x: s.x,
            y: s.y
          }));

          setPlacedDevices(mappedDevices);
          setAiAnalysis(data.analysis || 'AI placement complete.');
          setAiLog([]);
          setIsAiLoading(false);
        }, 1200);
      }, 1000);

    } catch (error: any) {
      console.error(error);
      setAiLog(prev => [...prev, 'AI agent error. Launching safe local hardware layout schema...']);
      setIsAiLoading(false);
    }
  };

  const getDeviceIcon = (type: Device['type'], size = 18) => {
    switch (type) {
      case 'hub': return <Cpu size={size} />;
      case 'camera': return <Video size={size} />;
      case 'lock': return <Lock size={size} />;
      case 'sensor': return <Compass size={size} />;
      case 'switch': return <Smartphone size={size} />;
      case 'light': return <Lightbulb size={size} />;
      default: return <HelpCircle size={size} />;
    }
  };

  // Compute Zigbee link quality (distance-based formula matching industrial visualizers)
  const calculateLinkQuality = (dev1: Device, dev2: Device) => {
    const dx = dev1.x! - dev2.x!;
    const dy = dev1.y! - dev2.y!;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // standard range calculation
    if (distance < 20) return { percent: 100, label: 'Excellent', color: 'text-emerald-500', stroke: '#10b981' };
    if (distance < 45) return { percent: 75, label: 'Good', color: 'text-sky-500', stroke: '#0284c7' };
    if (distance < 65) return { percent: 45, label: 'Moderate', color: 'text-amber-500', stroke: '#f59e0b' };
    return { percent: 15, label: 'Poor (Weak Mesh)', color: 'text-rose-500', stroke: '#ef4444' };
  };

  const activeHub = placedDevices.find(d => d.type === 'hub');
  const selectedDevice = placedDevices.find(d => d.id === selectedDeviceId);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Visual Design Canvas Container (Takes 3 columns on large screens) */}
      <div className="xl:col-span-3 space-y-4">
        {/* Design Platform Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="p-2 bg-slate-900 text-white rounded-lg">
              <Layers size={18} />
            </span>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Aqara Builder Lab</h2>
              <p className="text-xs text-slate-400 mt-0.5">Drag-and-drop RF blueprint simulator</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Floor Plan selector dropdown */}
            <div className="relative">
              <select
                id="floorplan-select"
                value={selectedPlan.id}
                onChange={(e) => {
                  const p = PRESET_FLOOR_PLANS.find(p => p.id === e.target.value);
                  if (p) setSelectedPlan(p);
                }}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 pr-8 rounded-lg border-0 outline-none cursor-pointer"
              >
                {PRESET_FLOOR_PLANS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.dimensions}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            {/* Mesh Controls */}
            <button
              id="toggle-mesh-lines"
              onClick={() => setShowMeshLines(!showMeshLines)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showMeshLines ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Show Topology Lines
            </button>

            <button
              id="toggle-signal-ranges"
              onClick={() => setShowSignalRanges(!showSignalRanges)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showSignalRanges ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              RF Signal Clouds
            </button>

            <button
              id="reset-canvas-btn"
              onClick={resetCanvas}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Clear & Reset Layout"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Blueprint Interaction Stage */}
        <div 
          ref={canvasRef}
          id="blueprint-canvas"
          onClick={handleCanvasClick}
          className="relative h-[480px] bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center cursor-crosshair group"
        >
          {/* Blueprint grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
          
          {/* Interactive room layout lines drawn dynamically in architectural style */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-800/80 stroke-2 fill-none">
            {/* Exterior Walls */}
            <rect x="5%" y="5%" width="90%" height="90%" rx="8" strokeWidth="3" className="stroke-slate-700" />
            
            {/* Rooms segmentation based on selected preset floor plans */}
            {selectedPlan.id === 'plan-1' ? (
              <>
                {/* 2 Bedroom Villa Lines */}
                <line x1="35%" y1="5%" x2="35%" y2="95%" />
                <line x1="35%" y1="45%" x2="95%" y2="45%" />
                <line x1="70%" y1="5%" x2="70%" y2="45%" />
                <line x1="5%" y1="45%" x2="35%" y2="45%" />
                
                {/* Labels */}
                <text x="18%" y="15%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">MASTER BEDROOM</text>
                <text x="52%" y="15%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">KITCHEN</text>
                <text x="82%" y="15%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">GUEST ROOM</text>
                <text x="18%" y="70%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">ENTRANCE CORRIDOR</text>
                <text x="65%" y="70%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">MAIN LIVING ROOM</text>
              </>
            ) : selectedPlan.id === 'plan-2' ? (
              <>
                {/* High Tech Loft Lines */}
                <line x1="50%" y1="5%" x2="50%" y2="95%" strokeDasharray="4 4" />
                <line x1="5%" y1="65%" x2="50%" y2="65%" />
                <line x1="50%" y1="35%" x2="95%" y2="35%" />
                
                {/* Labels */}
                <text x="25%" y="20%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">WORK STUDIO</text>
                <text x="72%" y="20%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">OPEN BEDROOM</text>
                <text x="25%" y="80%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">BALCONY DECK</text>
                <text x="72%" y="65%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">KITCHEN & LIVING</text>
              </>
            ) : (
              <>
                {/* Corporate HQ Floor Lines */}
                <line x1="25%" y1="5%" x2="25%" y2="95%" />
                <line x1="25%" y1="50%" x2="95%" y2="50%" />
                <line x1="60%" y1="50%" x2="60%" y2="95%" />
                
                {/* Labels */}
                <text x="12%" y="50%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider rotate-270" textAnchor="middle">RECEPTION</text>
                <text x="60%" y="25%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">OPEN WORK DESKS AREA</text>
                <text x="42%" y="75%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">CONFERENCE ROOM A</text>
                <text x="78%" y="75%" className="fill-slate-500 font-mono text-[11px] font-bold tracking-wider">EXECUTIVE OFFICE</text>
              </>
            )}
          </svg>

          {/* Render active signal links (animated Zigbee lines radiating from Hub to devices) */}
          {showMeshLines && activeHub && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {placedDevices.map(d => {
                if (d.id === activeHub.id) return null;
                const mesh = calculateLinkQuality(activeHub, d);
                return (
                  <g key={`link-${d.id}`} className="opacity-75">
                    <line
                      x1={`${activeHub.x}%`}
                      y1={`${activeHub.y}%`}
                      x2={`${d.x}%`}
                      y2={`${d.y}%`}
                      stroke={mesh.stroke}
                      strokeWidth="1.5"
                      strokeDasharray="5, 5"
                      className="animate-[dash_20s_linear_infinite]"
                      style={{
                        strokeDashoffset: 100
                      }}
                    />
                    <circle
                      cx={`${(activeHub.x! + d.x!) / 2}%`}
                      cy={`${(activeHub.y! + d.y!) / 2}%`}
                      r="10"
                      fill="#1e293b"
                      stroke={mesh.stroke}
                      strokeWidth="1"
                    />
                    <text
                      x={`${(activeHub.x! + d.x!) / 2}%`}
                      y={`${(activeHub.y! + d.y!) / 2 + 3}%`}
                      className="fill-white font-mono text-[8px] font-bold"
                      textAnchor="middle"
                    >
                      {mesh.percent}%
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Signal Range Radiance Clouds */}
          {showSignalRanges && selectedDevice && (
            <div 
              className="absolute rounded-full bg-slate-500/10 border border-slate-400/30 pointer-events-none flex items-center justify-center animate-pulse"
              style={{
                width: `${deviceRange * 4}px`,
                height: `${deviceRange * 4}px`,
                left: `calc(${selectedDevice.x}% - ${(deviceRange * 4) / 2}px)`,
                top: `calc(${selectedDevice.y}% - ${(deviceRange * 4) / 2}px)`,
                transition: 'width 0.2s, height 0.2s, left 0.2s, top 0.2s'
              }}
            >
              <div className="rounded-full bg-slate-500/5 w-1/2 h-1/2 border border-slate-500/10" />
            </div>
          )}

          {/* Render Placed Device Nodes */}
          {placedDevices.map((d) => {
            const isSelected = d.id === selectedDeviceId;
            let themeColor = 'bg-slate-800 text-white ring-slate-400';
            if (d.type === 'hub') themeColor = 'bg-emerald-600 text-white ring-emerald-300';
            if (d.type === 'camera') themeColor = 'bg-sky-600 text-white ring-sky-300';
            if (d.type === 'lock') themeColor = 'bg-rose-600 text-white ring-rose-300';

            return (
              <div
                key={d.id}
                className="device-node absolute z-20 group/node cursor-grab active:cursor-grabbing transition-transform"
                style={{
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  transform: 'translate(-50%, -50%) scale(1)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeviceId(d.id);
                }}
              >
                <div className={`p-3 rounded-full shadow-lg border border-slate-900/40 hover:scale-110 active:scale-95 transition-all relative ${themeColor} ${
                  isSelected ? 'ring-4 ring-offset-2 ring-offset-slate-950 scale-110' : ''
                }`}>
                  {getDeviceIcon(d.type, 18)}

                  {/* Pulsing visual halo for the active selection */}
                  {isSelected && (
                    <span className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-25" />
                  )}
                </div>

                {/* Micro tooltip label */}
                <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-md pointer-events-none opacity-80 group-hover/node:opacity-100 transition-opacity">
                  {d.name.split(' (')[0]}
                </div>
              </div>
            );
          })}

          {/* AI Blueprint Loading overlay */}
          {isAiLoading && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center z-40 p-6 animate-in fade-in duration-300">
              <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                <span className="absolute inset-0 rounded-full border-4 border-slate-800" />
                <span className="absolute inset-0 rounded-full border-4 border-t-emerald-400 animate-spin" />
                <Sparkles size={28} className="text-emerald-400 animate-pulse" />
              </div>
              <h3 className="font-bold text-white text-base">Gemini Studio Designer</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
                Computing optimal RF overlaps and smart-switch wire paths...
              </p>
              
              {/* Dynamic console log stream */}
              <div className="mt-8 bg-black/50 border border-slate-900 rounded-lg p-3.5 w-full max-w-sm font-mono text-[10px] text-emerald-400 space-y-1 text-left h-28 overflow-y-auto">
                {aiLog.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-600">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help hint in canvas */}
          <div className="absolute bottom-3 left-3 bg-slate-900/60 text-slate-400 text-[10px] px-2.5 py-1 rounded-md pointer-events-none">
            Double-click canvas to place current item • Drag items to relocate
          </div>
        </div>
      </div>

      {/* Control / Recommendation Panel (1 column side column) */}
      <div className="space-y-4">
        {/* Device Picker drawer */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Hardware Tool Bag
          </h3>
          <p className="text-xs text-slate-400 mb-3">Select a component below, then double-click the design floor canvas to drop and deploy it.</p>
          
          <div className="space-y-2">
            {AVAILABLE_DEVICES_FOR_DESIGN.map((dev) => {
              const isSelected = selectedDeviceType.name === dev.name;
              return (
                <button
                  key={dev.name}
                  id={`picker-dev-${dev.type}`}
                  onClick={() => setSelectedDeviceType(dev)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-950/10' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg text-white ${
                    dev.type === 'hub' ? 'bg-emerald-600' :
                    dev.type === 'camera' ? 'bg-sky-600' :
                    dev.type === 'lock' ? 'bg-rose-600' : 'bg-slate-800'
                  }`}>
                    {getDeviceIcon(dev.type as any, 16)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">{dev.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{dev.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Node Properties Panel */}
        {selectedDevice ? (
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-4 animate-in slide-in-from-right-4 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Component Link
                </h4>
                <h3 className="font-bold text-slate-800 text-sm mt-1">{selectedDevice.name}</h3>
              </div>
              <button
                onClick={(e) => handleDeleteDevice(selectedDevice.id, e)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Decommission Node"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-50 pt-3">
              <div className="bg-slate-50 p-1.5 rounded">
                <span className="text-slate-400 block mb-0.5">ROOM CELL</span>
                <span className="font-semibold text-slate-700">{selectedDevice.room || 'Unassigned'}</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded">
                <span className="text-slate-400 block mb-0.5">X / Y OFFSET</span>
                <span className="font-semibold text-slate-700">{selectedDevice.x}%, {selectedDevice.y}%</span>
              </div>
            </div>

            {selectedDevice.type !== 'hub' && activeHub && (
              <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-500">Wireless Hub Mesh</span>
                  <span className={`font-semibold ${calculateLinkQuality(activeHub, selectedDevice).color}`}>
                    {calculateLinkQuality(activeHub, selectedDevice).label}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-slate-800 h-full"
                    style={{ width: `${calculateLinkQuality(activeHub, selectedDevice).percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Custom Coverage Radius Controller */}
            {showSignalRanges && (
              <div className="space-y-1.5 border-t border-slate-50 pt-3">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>RF Coverage Radius</span>
                  <span>{deviceRange} Meters</span>
                </div>
                <input
                  type="range"
                  id="device-range-slider"
                  min="10"
                  max="90"
                  value={deviceRange}
                  onChange={(e) => setDeviceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs py-10">
            No active mesh node selected. Click any placed device on the blueprint grid to view signal strengths.
          </div>
        )}

        {/* Gemini AI Smart Design Generator */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <Sparkles size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Gemini AI Builder Agent
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Input smart-automation guidelines and let Gemini automatically deploy and balance the optimal Aqara device topography.
          </p>

          <textarea
            id="ai-prompt-input"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Design a security mesh focusing on front-door camera safety and smart-lock automation."
            className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 transition-colors"
          />

          <button
            id="trigger-ai-btn"
            onClick={triggerAiSmartDesign}
            disabled={isAiLoading}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-xs rounded-lg hover:from-emerald-500 hover:to-teal-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} className="animate-pulse" />
            Synthesize Optimal Layout
          </button>

          {aiAnalysis && (
            <div className="mt-3 bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 text-[11px] text-emerald-800 space-y-1.5 animate-in fade-in duration-200">
              <span className="font-bold block text-emerald-950">AI Smart Design Analysis:</span>
              <p className="leading-relaxed">{aiAnalysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
