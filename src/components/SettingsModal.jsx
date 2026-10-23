import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Download, 
  Upload, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { 
  getStorageUsage, 
  exportAppData, 
  importAppData, 
  clearAllStorage 
} from '../utils/storage';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  apiKey, 
  onSaveApiKey, 
  onDataReload 
}) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const storageUsage = getStorageUsage();

  const handleSaveKey = () => {
    onSaveApiKey(keyInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExport = () => {
    exportAppData();
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importAppData(content);
        if (result.success) {
          setImportStatus(`Imported ${result.count} courses`);
          onDataReload();
          setTimeout(() => setImportStatus(''), 2500);
        } else {
          setImportStatus(`Failed: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClearAll = () => {
    clearAllStorage();
    setShowClearConfirm(false);
    onDataReload();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#161821] border border-[#232733] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232733]">
          <h2 className="text-sm font-semibold text-white">Settings & Data</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* YouTube API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium flex items-center space-x-1.5">
                <span>YouTube Data API Key</span>
                {keyInput && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                    Active
                  </span>
                )}
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Protected in .env</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste API Key here..."
                className="flex-1 px-3 py-1.5 bg-[#101217] border border-[#232733] rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition shrink-0"
              >
                {isSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>

          {/* LocalStorage meter */}
          <div className="p-3 rounded-lg bg-[#101217] border border-[#232733] space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>LocalStorage Usage</span>
              <span className="font-mono text-slate-400">{storageUsage.kb} KB used</span>
            </div>
            <div className="w-full h-1.5 bg-[#232733] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.max(2, storageUsage.percentage)}%` }}
              />
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-1.5">
            <span className="text-slate-300 font-medium">Backup & Restore</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-[#101217] hover:bg-[#1f222d] border border-[#232733] text-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-[#101217] hover:bg-[#1f222d] border border-[#232733] text-slate-200 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
            {importStatus && <p className="text-center text-blue-400 pt-1">{importStatus}</p>}
          </div>

          {/* Clear Storage Option */}
          <div className="pt-2 border-t border-[#232733] flex items-center justify-between">
            <div>
              <div className="text-rose-400 font-medium">Clear All Data</div>
              <div className="text-[11px] text-slate-500">Reset courses and history</div>
            </div>

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-2.5 py-1 text-xs border border-rose-900/60 text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
              >
                Clear
              </button>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearAll}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition"
                >
                  Confirm Delete
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#232733] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#202330] hover:bg-[#282d3d] text-slate-300 text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
