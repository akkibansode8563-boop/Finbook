'use client';

import { useState } from 'react';
import { restoreDatabaseAction, exportTableDataAction } from '@/features/settings/actions';
import { toast } from 'sonner';
import { Database, Download, Upload, FileJson, AlertTriangle } from 'lucide-react';

export function BackupPanel() {
  const [restoring, setRestoring] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDownloadSQL = () => {
    // Navigate to the API route to trigger standard download
    window.location.href = '/api/backup/download';
    toast.success('SQL data backup compiled successfully.');
  };

  const handleExportJSON = async () => {
    try {
      const res = await exportTableDataAction();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finbook_data_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('JSON data export generated successfully.');
    } catch (e: any) {
      toast.error(e.message || 'Export failed.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error('Please select a SQL backup file first.');
      return;
    }

    if (confirmText !== 'RESTORE') {
      toast.error('Please type RESTORE in all-caps to confirm database recovery.');
      return;
    }

    setRestoring(true);
    toast.loading('Running transactional database restore, please wait...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const sqlString = event.target?.result as string;
        if (!sqlString) {
          toast.dismiss();
          toast.error('Failed to read backup file contents.');
          setRestoring(false);
          return;
        }

        const res = await restoreDatabaseAction(sqlString);
        toast.dismiss();
        if (res.error) {
          toast.error(`Restore failed: ${res.error}`);
        } else {
          toast.success('Database restored successfully! Re-rendering settings.');
          setSelectedFile(null);
          setConfirmText('');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
        setRestoring(false);
      };
      
      reader.onerror = () => {
        toast.dismiss();
        toast.error('File reading error.');
        setRestoring(false);
      };

      reader.readAsText(selectedFile);
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message || 'Restore failed.');
      setRestoring(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl mt-6">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-600/10 text-violet-400">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white font-display">Database Backup & Disaster Recovery</h2>
          <p className="text-xs text-slate-400">Compile database schemas, download snapshots, or restore transactional archives.</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export SQL */}
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                Download SQL Snapshot
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generates a clean Postgres-compatible SQL dump file containing schema creation statements and table inserts.
              </p>
            </div>
            <button
              onClick={handleDownloadSQL}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold py-2 px-4 rounded-lg border border-emerald-500/20 hover:border-transparent transition-all cursor-pointer"
            >
              Compile & Download SQL
            </button>
          </div>

          {/* Export JSON */}
          <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileJson className="w-4 h-4 text-sky-400" />
                Raw Data Export (JSON)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Exports all records across user collections, loans, guarantors, ledger logs, and audit trails as a single JSON workbook.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-sky-600/10 hover:bg-sky-600 text-sky-400 hover:text-white text-xs font-semibold py-2 px-4 rounded-lg border border-sky-500/20 hover:border-transparent transition-all cursor-pointer"
            >
              Export JSON Workbook
            </button>
          </div>
        </div>

        {/* Destructive Restore Section */}
        <div className="p-6 rounded-lg bg-rose-950/10 border border-rose-500/20">
          <h3 className="text-sm font-bold text-rose-450 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Restore Database Snapshot
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            WARNING: Restoring a database snapshot will overwrite all current customer profiles, loan schedules, collections, and general ledger records. Ensure you download a backup of your current database first.
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Select SQL Backup File</label>
              <input
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                disabled={restoring}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Type 'RESTORE' to verify
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="RESTORE"
                    disabled={restoring}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-md py-2 px-3 font-mono tracking-widest focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                <button
                  onClick={handleRestore}
                  disabled={restoring || confirmText !== 'RESTORE'}
                  className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900/30 disabled:text-rose-600 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-lg disabled:shadow-none transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {restoring ? 'Restoring Database...' : 'Execute Recovery Restore'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
