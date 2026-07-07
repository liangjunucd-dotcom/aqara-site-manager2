import React, { useState } from 'react';
import { Site } from '../types';
import {
  RefreshCw, CheckCircle2, Download, AlertCircle, Loader2, RotateCcw, X,
} from 'lucide-react';

interface ProjectUpdatesViewProps {
  sites: Site[];
}

type UpdateStatus = 'up-to-date' | 'update-available' | 'updating' | 'failed';

interface StudioFirmware {
  siteId: string;
  siteName: string;
  currentVersion: string;
  availableVersion: string;
  status: UpdateStatus;
}

const MOCK_VERSIONS = ['4.2.1', '4.3.0', '4.3.0', '4.1.8', '4.3.0'];

function deriveInitialFirmware(sites: Site[]): StudioFirmware[] {
  return sites.map((site, i) => {
    const current = MOCK_VERSIONS[i % MOCK_VERSIONS.length];
    const available = '4.3.0';
    const hasUpdate = current !== available;
    return {
      siteId: site.id,
      siteName: site.name,
      currentVersion: current,
      availableVersion: available,
      status: hasUpdate ? 'update-available' : 'up-to-date',
    };
  });
}

export default function ProjectUpdatesView({ sites }: ProjectUpdatesViewProps) {
  const [firmwareList, setFirmwareList] = useState<StudioFirmware[]>(() => deriveInitialFirmware(sites));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<'update' | 'rollback' | null>(null);

  React.useEffect(() => {
    setFirmwareList(deriveInitialFirmware(sites));
    setSelectedIds(new Set());
  }, [sites]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === firmwareList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(firmwareList.map(f => f.siteId)));
    }
  };

  const statusBadge = (status: UpdateStatus) => {
    switch (status) {
      case 'up-to-date':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={11} /> Up to date
          </span>
        );
      case 'update-available':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
            <Download size={11} /> Update available
          </span>
        );
      case 'updating':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
            <Loader2 size={11} className="animate-spin" /> Updating
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
            <AlertCircle size={11} /> Failed
          </span>
        );
    }
  };

  const runBatchUpdate = () => {
    const targets = selectedIds.size > 0
      ? Array.from(selectedIds)
      : firmwareList.filter(f => f.status === 'update-available').map(f => f.siteId);

    setFirmwareList(prev =>
      prev.map(f =>
        targets.includes(f.siteId) ? { ...f, status: 'updating' as UpdateStatus } : f
      )
    );
    setConfirmAction(null);

    targets.forEach((siteId, idx) => {
      setTimeout(() => {
        setFirmwareList(prev =>
          prev.map(f => {
            if (f.siteId !== siteId) return f;
            const fail = Math.random() < 0.1;
            return fail
              ? { ...f, status: 'failed' as UpdateStatus }
              : { ...f, currentVersion: f.availableVersion, status: 'up-to-date' as UpdateStatus };
          })
        );
      }, 2000 + idx * 800);
    });
  };

  const runBatchRollback = () => {
    const targets = selectedIds.size > 0
      ? Array.from(selectedIds)
      : firmwareList.map(f => f.siteId);

    setFirmwareList(prev =>
      prev.map(f =>
        targets.includes(f.siteId) ? { ...f, status: 'updating' as UpdateStatus } : f
      )
    );
    setConfirmAction(null);

    targets.forEach((siteId, idx) => {
      setTimeout(() => {
        setFirmwareList(prev =>
          prev.map(f => {
            if (f.siteId !== siteId) return f;
            const parts = f.currentVersion.split('.');
            const rolled = parts.length >= 3
              ? `${parts[0]}.${parts[1]}.${Math.max(0, parseInt(parts[2], 10) - 1)}`
              : f.currentVersion;
            return { ...f, currentVersion: rolled, status: 'update-available' as UpdateStatus };
          })
        );
      }, 2000 + idx * 800);
    });
  };

  const updatableCount = firmwareList.filter(f => f.status === 'update-available').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Updates</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Batch firmware management for project Studios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmAction('rollback')}
            disabled={firmwareList.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <RotateCcw size={13} />
            Rollback
          </button>
          <button
            onClick={() => setConfirmAction('update')}
            disabled={updatableCount === 0 && selectedIds.size === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#10b981] text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} />
            Update all
          </button>
        </div>
      </div>

      {firmwareList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center text-center shadow-xs">
          <RefreshCw size={40} className="text-slate-300 mb-4" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">No Studios</h3>
          <p className="text-xs text-slate-400">Add Studios to this project to manage firmware updates.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === firmwareList.length && firmwareList.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Studio</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {firmwareList.map(fw => (
                <tr key={fw.siteId} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(fw.siteId)}
                      onChange={() => toggleSelect(fw.siteId)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-800">{fw.siteName}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{fw.currentVersion}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{fw.availableVersion}</td>
                  <td className="px-4 py-3">{statusBadge(fw.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {updatableCount > 0 && (
        <p className="text-[11px] text-slate-400">
          {updatableCount} Studio(s) have firmware updates available
          {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
        </p>
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-800">
                {confirmAction === 'update' ? 'Confirm Batch Update' : 'Confirm Rollback'}
              </h3>
              <button onClick={() => setConfirmAction(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                {confirmAction === 'update'
                  ? `This will update firmware on ${selectedIds.size > 0 ? selectedIds.size : updatableCount} Studio(s). Devices may reboot during the process.`
                  : `This will rollback firmware on ${selectedIds.size > 0 ? selectedIds.size : firmwareList.length} Studio(s) to the previous version.`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction === 'update' ? runBatchUpdate : runBatchRollback}
                  className={`flex-1 py-2 rounded-lg text-white text-xs font-bold cursor-pointer ${
                    confirmAction === 'update'
                      ? 'bg-[#10b981] hover:bg-emerald-600'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {confirmAction === 'update' ? 'Update' : 'Rollback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
