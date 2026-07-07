import React, { useState } from 'react';
import { Site } from '../types';
import {
  Plus, Bell, Search, Filter, X, AlertTriangle, Mail, Smartphone, Webhook,
  Users,
} from 'lucide-react';

interface ProjectAlertsViewProps {
  sites: Site[];
}

type AlertsTab = 'rules' | 'recipient-groups';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: string;
  studioIds: string[];
  channel: 'email' | 'push' | 'webhook';
  enabled: boolean;
}

const METRICS = ['Temperature', 'Humidity', 'Energy Usage', 'CO₂ Level', 'Device Offline'];
const OPERATORS = ['>', '<', '>=', '<=', '='];
const CHANNELS: { id: 'email' | 'push' | 'webhook'; label: string; icon: React.ElementType }[] = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'push', label: 'Push', icon: Smartphone },
  { id: 'webhook', label: 'Webhook', icon: Webhook },
];

export default function ProjectAlertsView({ sites }: ProjectAlertsViewProps) {
  const [activeTab, setActiveTab] = useState<AlertsTab>('rules');
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formName, setFormName] = useState('');
  const [formMetric, setFormMetric] = useState(METRICS[0]);
  const [formOperator, setFormOperator] = useState('>');
  const [formThreshold, setFormThreshold] = useState('');
  const [formStudioIds, setFormStudioIds] = useState<Set<string>>(new Set());
  const [formChannel, setFormChannel] = useState<'email' | 'push' | 'webhook'>('email');

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormName('');
    setFormMetric(METRICS[0]);
    setFormOperator('>');
    setFormThreshold('');
    setFormStudioIds(new Set());
    setFormChannel('email');
  };

  const handleCreateRule = () => {
    if (!formName.trim() || !formThreshold.trim()) return;
    const studioIds = formStudioIds.size > 0
      ? Array.from(formStudioIds)
      : sites.map(s => s.id);

    setRules(prev => [
      {
        id: `rule-${Date.now()}`,
        name: formName.trim(),
        metric: formMetric,
        operator: formOperator,
        threshold: formThreshold,
        studioIds,
        channel: formChannel,
        enabled: true,
      },
      ...prev,
    ]);
    resetForm();
    setIsCreateOpen(false);
  };

  const toggleStudio = (id: string) => {
    setFormStudioIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const studioName = (id: string) => sites.find(s => s.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-900">Alerts</h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#10b981] text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer"
        >
          <Plus size={14} />
          New rule
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {([
          { id: 'rules' as AlertsTab, label: 'Rules' },
          { id: 'recipient-groups' as AlertsTab, label: 'Recipient groups' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#10b981] text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'rules' && (
        <>
          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search rules…"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
              <Filter size={13} />
              Filter
            </button>
          </div>

          {filteredRules.length > 0 ? (
            <div className="space-y-2">
              {filteredRules.map(rule => (
                <div
                  key={rule.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{rule.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {rule.metric} {rule.operator} {rule.threshold} · {rule.studioIds.length} Studio(s) · {rule.channel}
                      </p>
                    </div>
                  </div>
                  <AlertTriangle size={16} className="text-amber-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center text-center shadow-xs">
              <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Bell size={40} className="text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">No alert rules</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-5">
                Create alert rules to monitor telemetry from your Studios and get notified when thresholds are exceeded.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#10b981] text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer"
              >
                <Plus size={14} />
                New rule
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'recipient-groups' && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center text-center shadow-xs">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <Users size={32} className="text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 mb-1">No recipient groups</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Group recipients to route alerts to the right team members.
          </p>
        </div>
      )}

      {/* Create Rule Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-extrabold text-sm text-slate-800">New Alert Rule</h3>
              <button onClick={() => { setIsCreateOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Rule name</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. High temperature alert"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Metric</label>
                  <select
                    value={formMetric}
                    onChange={e => setFormMetric(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none"
                  >
                    {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Condition</label>
                  <select
                    value={formOperator}
                    onChange={e => setFormOperator(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none"
                  >
                    {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Threshold</label>
                  <input
                    value={formThreshold}
                    onChange={e => setFormThreshold(e.target.value)}
                    placeholder="28"
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-2">Studio scope</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {sites.map(site => (
                    <label key={site.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formStudioIds.has(site.id)}
                        onChange={() => toggleStudio(site.id)}
                        className="rounded border-slate-300"
                      />
                      <span className="text-xs text-slate-600">{site.name}</span>
                    </label>
                  ))}
                </div>
                {formStudioIds.size === 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">Leave empty to apply to all Studios</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-2">Notification channel</label>
                <div className="flex gap-2">
                  {CHANNELS.map(ch => {
                    const Icon = ch.icon;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setFormChannel(ch.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold cursor-pointer ${
                          formChannel === ch.id
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={13} />
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleCreateRule}
                disabled={!formName.trim() || !formThreshold.trim()}
                className="w-full py-2 rounded-lg bg-[#10b981] text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
