import React, { useState, useEffect } from 'react';
import { X, Folder, Server, Check, ArrowRight, Download, RefreshCw, FileText, Calendar, Trash2, ArrowUpRight } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface ExportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  exportType: 'pdf' | 'csv' | 'json';
  dataContent: string; // The ready CSV string, JSON string, or other plain format
  componentRef?: React.RefObject<HTMLDivElement | null>; // Ref to capture for PDF snapshot
  language: 'id' | 'en';
}

interface ServerFile {
  filename: string;
  path: string;
  size: number;
  createdAt: string;
}

export default function ExportWizardModal({
  isOpen,
  onClose,
  filename,
  exportType,
  dataContent,
  componentRef,
  language,
}: ExportWizardModalProps) {
  const [saveTarget, setSaveTarget] = useState<'temp' | 'local'>('temp');
  const [localFolder, setLocalFolder] = useState('Downloads/Dooitly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<any | null>(null);
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([]);
  const [submittingError, setSubmittingError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'history'>('export');
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load server export files history
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/export/list-temp');
      if (res.ok) {
        const data = await res.json();
        setServerFiles(data.files || []);
      }
    } catch (e) {
      console.error('Failed to load temporary files history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setExportSuccess(null);
      setSubmittingError(null);
      setActiveTab('export');
      loadHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsProcessing(true);
    setSubmittingError(null);
    setExportSuccess(null);

    try {
      let finalContent = '';
      let isBase64 = false;

      // 1. Prepare/Generate contents based on exportType
      if (exportType === 'pdf') {
        if (!componentRef || !componentRef.current) {
          throw new Error(language === 'id' ? 'Gagal mengambil screenshot halaman (Ref kosong)' : 'Failed to capture screen image (Ref empty)');
        }
        
        const element = componentRef.current;
        // Temporary apply print styling class (pure white background, black text, high contrast)
        element.classList.add('pdf-print-theme');
        // Let the state repaint the DOM
        await new Promise(resolve => setTimeout(resolve, 150));

        // Capture element to canvas
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 1.5,
          logging: false,
          useCORS: true
        });

        // Remand styling class
        element.classList.remove('pdf-print-theme');

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Convert to Base64 string for back-end transmission
        const pdfBase64 = pdf.output('datauristring').split(',')[1];
        finalContent = pdfBase64;
        isBase64 = true;
      } else {
        finalContent = dataContent;
        isBase64 = false;
      }

      // 2. Route save target
      if (saveTarget === 'temp') {
        // Save to server temp folder via API
        const payload = {
          filename: filename,
          content: finalContent,
          isBase64: isBase64
        };

        const response = await fetch('/api/export/save-temp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Server rejected export storage process.');
        }

        const resData = await response.json();
        setExportSuccess({
          target: 'temp',
          path: resData.path,
          filename: resData.filename,
          size: resData.size,
          timestamp: new Date().toLocaleTimeString()
        });

        // reload history list
        loadHistory();
      } else {
        // Save to local computer (Browser download triggered, asking folder)
        // Construct standard file blobs depending on type
        let fileUrl = '';
        if (exportType === 'pdf') {
          // Regenerate pdf blob to trigger download
          const pdf = new jsPDF('p', 'mm', 'a4');
          if (componentRef && componentRef.current) {
            const element = componentRef.current;
            
            // Temporary apply print styling class (pure white background, black text, high contrast)
            element.classList.add('pdf-print-theme');
            // Let state repaint the DOM
            await new Promise(resolve => setTimeout(resolve, 150));

            const canvas = await html2canvas(element, {
              backgroundColor: '#ffffff',
              scale: 1.5,
              logging: false,
              useCORS: true
            });

            // Remand styling class
            element.classList.remove('pdf-print-theme');

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          }
          const pdfBlob = pdf.output('blob');
          fileUrl = URL.createObjectURL(pdfBlob);
        } else {
          const blobType = exportType === 'json' ? 'application/json' : 'text/csv;charset=utf-8;';
          const blob = new Blob([finalContent], { type: blobType });
          fileUrl = URL.createObjectURL(blob);
        }

        // Trigger browser save
        const link = document.createElement('a');
        link.setAttribute('href', fileUrl);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExportSuccess({
          target: 'local',
          path: localFolder ? `${localFolder}/${filename}` : `${filename}`,
          filename: filename,
          size: finalContent.length,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (err: any) {
      console.error(err);
      setSubmittingError(err?.message || 'Universal export pipeline triggered an error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Click-away backdrop overlay to close floating element on outside click */}
      <div 
        data-html2canvas-ignore="true"
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" 
        onClick={onClose} 
      />
      {/* Absolute floating box directly beneath the trigger button */}
      <div 
        data-html2canvas-ignore="true"
        className="export-wizard-popup absolute right-0 top-full mt-2 w-[90vw] sm:w-[500px] bg-[#0b0b0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in font-sans text-left"
      >
        
        {/* Futuristic glowing border accent */}
        <div className="h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#070708]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black tracking-widest text-indigo-400 uppercase block">
                {language === 'id' ? 'SISTEM EKSPOR DATA HUD' : 'SECURE DATA EXPORT NODE'}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {language === 'id' ? 'Konfigurasi Penyimpanan Berkas' : 'Export Location & Path Config'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-zinc-900 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer select-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Selection Tabs */}
        <div className="flex border-b border-white/5 bg-zinc-950/20 px-3 py-1">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all select-none cursor-pointer ${
              activeTab === 'export' ? 'text-indigo-400 border-indigo-500 font-extrabold' : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            ⚙️ {language === 'id' ? 'PILIH PENYIMPANAN' : 'SAVE CONFIG'}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('history'); loadHistory(); }}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all select-none cursor-pointer flex items-center gap-2 ${
              activeTab === 'history' ? 'text-indigo-400 border-indigo-500 font-extrabold' : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            📋 {language === 'id' ? 'RIWAYAT TEMP SERVER' : 'SERVER TEMP LIST'}
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-white/5 rounded-full font-normal">
              {serverFiles.length}
            </span>
          </button>
        </div>

        {/* Modal Main Core Body */}
        <div className="p-5 max-h-[420px] overflow-y-auto">
          {activeTab === 'export' ? (
            <>
              {/* File details overview */}
              <div className="mb-5 bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    {language === 'id' ? 'NAMA BERKAS TARGET' : 'TARGET EXPORT ARTIFACT'}
                  </div>
                  <span className="font-bold text-xs text-white block select-text font-mono truncate max-w-[280px]">
                    {filename}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    {language === 'id' ? 'FORMAT' : 'TYPE'}
                  </div>
                  <span className="inline-block mt-1 font-mono text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full uppercase">
                    {exportType}
                  </span>
                </div>
              </div>

              {/* Destination Selector Choices */}
              <div className="space-y-3 mb-5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                  {language === 'id' ? 'Pilih Direktori Penyimpanan' : 'Select Target Destination Path'}
                </span>

                <div className="grid grid-cols-1 gap-3">
                  
                  {/* Location 1: Server Temp Directory */}
                  <button
                    type="button"
                    onClick={() => { setSaveTarget('temp'); setExportSuccess(null); }}
                    className={`p-4 text-left rounded-xl border flex gap-4 transition-all duration-150 relative cursor-pointer group ${
                      saveTarget === 'temp'
                        ? 'bg-zinc-950/60 border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(79,70,229,0.1)]'
                        : 'bg-[#0e0e10]/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                      saveTarget === 'temp' ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-900 border-white/5 text-zinc-400 group-hover:text-zinc-200'
                    }`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0 pr-6">
                      <span className="text-xs font-bold text-white block">
                        {language === 'id' ? 'Folder Temp Server (/tmp/dooitly_exports)' : 'Server Temp Directory (/tmp/dooitly_exports)'}
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        {language === 'id' 
                          ? 'Sangat direkomendasikan untuk menembus proteksi keamanan unduhan browser sandbox. File tersimpan aman di server Cloud Run.' 
                          : 'Highly stable backup. Directly circumvents browser download limits in secure sandbox environments.'}
                      </p>
                    </div>
                    {saveTarget === 'temp' && (
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-400 text-white animate-scale-in">
                        <Check className="w-3 h-3 font-bold" />
                      </div>
                    )}
                  </button>

                  {/* Location 2: Local Storage */}
                  <button
                    type="button"
                    onClick={() => { setSaveTarget('local'); setExportSuccess(null); }}
                    className={`p-4 text-left rounded-xl border flex gap-4 transition-all duration-150 relative cursor-pointer group ${
                      saveTarget === 'local'
                        ? 'bg-zinc-950/60 border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(79,70,229,0.1)]'
                        : 'bg-[#0e0e10]/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                      saveTarget === 'local' ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-900 border-white/5 text-zinc-400 group-hover:text-zinc-200'
                    }`}>
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0 pr-6">
                      <span className="text-xs font-bold text-white block">
                        {language === 'id' ? 'Folder Penyimpanan Lokal Komputer' : 'Local Computer Directory Storage'}
                      </span>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        {language === 'id' 
                          ? 'Konfigurasikan folder lokal sasaran Anda. Berkas akan terinstal melalui pengelola unduhan browser Anda.' 
                          : 'Specify coordinates. Browser downloader proxy routes the export artifact direct to your local machine.'}
                      </p>
                    </div>
                    {saveTarget === 'local' && (
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-400 text-white animate-scale-in">
                        <Check className="w-3 h-3 font-bold" />
                      </div>
                    )}
                  </button>

                </div>
              </div>

              {/* Extra Inputs for Local Saving directory confirmation */}
              {saveTarget === 'local' && (
                <div className="bg-zinc-950 p-4 border border-white/5 rounded-xl space-y-2 mb-5 animate-slide-down">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                    {language === 'id' ? 'JALUR DIREKTORI DOSSIER LOKAL SASARAN' : 'SPECIFY TARGET LOCAL PATH'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={localFolder}
                      onChange={(e) => setLocalFolder(e.target.value)}
                      placeholder="e.g. Downloads/Dooitly"
                      className="w-full text-xs font-mono bg-zinc-900 border border-white/10 text-white px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition placeholder-zinc-600 font-bold"
                    />
                    <span className="absolute right-3.5 top-3 text-[9px] text-zinc-500 font-mono">
                      CONFIRMED
                    </span>
                  </div>
                  <p className="text-[9.5px] text-zinc-500 leading-tight">
                    {language === 'id' 
                      ? 'Catatan: Dikarenakan regulasi web, browser mengunduh berkas ke folder unduhan standar, namun target folder ini dijadikan pencatatan dooitly.' 
                      : 'Note: Web applications secure files via standard browser downloads path. We record your preferred target directory designation.'}
                  </p>
                </div>
              )}

              {/* Loading indicator */}
              {isProcessing && (
                <div className="py-4 flex flex-col items-center justify-center gap-3 bg-zinc-950/40 rounded-xl border border-white/5 my-4">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse font-black">
                    {language === 'id' ? 'MEMPROSES EXPORT DATA...' : 'RENDERING DATAFEED EXPORT...'}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {submittingError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold my-4">
                  ⚠️ Error: {submittingError}
                </div>
              )}

              {/* Success Result Panel */}
              {exportSuccess && (
                <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl text-teal-300 space-y-2.5 my-4 animate-scale-in">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                      <Check className="w-3.5 h-3.5 font-black" />
                    </div>
                    <span className="text-xs font-bold text-white">
                      {language === 'id' ? 'Ekspor Berhasil Disimpan!' : 'Data Export Successful!'}
                    </span>
                  </div>
                  <div className="bg-zinc-950/80 p-3 rounded-lg text-[10px] font-mono border border-white/5 space-y-1">
                    <div>
                      <span className="text-zinc-500">TARGET:</span>{' '}
                      <span className="text-zinc-300 font-bold uppercase">{exportSuccess.target}</span>
                    </div>
                    <div className="truncate select-all select-text cursor-copy">
                      <span className="text-zinc-500">PATH:</span>{' '}
                      <span className="text-teal-400 font-extrabold">{exportSuccess.path}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">SIZE:</span>{' '}
                      <span className="text-zinc-300">{(exportSuccess.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">TIME:</span>{' '}
                      <span className="text-zinc-300">{exportSuccess.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Core trigger block */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-lg disabled:opacity-50 select-none cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'id' ? 'MENGKOMPILASI ARTIFAK...' : 'COMPILING DATA ARTIFACT...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'id' ? 'EXINTEGRATE & PROSES EKSPOR' : 'EXECUTE DATA EXPORT PIPELINE'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Temporary storage files listing history tab */
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black">
                  {language === 'id' ? 'DATABASE BERKAS TEMP SERVER' : 'SERVER TEMPORARY FOLDER RECORDSET'}
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">
                  {serverFiles.length} {language === 'id' ? 'berkas' : 'files'}
                </span>
              </div>

              {historyLoading ? (
                <div className="text-center py-10">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-500 mb-2" />
                  <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">LOADING DATABASE DIRECTORY...</span>
                </div>
              ) : serverFiles.length === 0 ? (
                <div className="text-center py-12 bg-[#0e0e10]/30 border border-dashed border-white/5 rounded-xl text-zinc-500 text-xs text-sans">
                  📭 {language === 'id' ? 'Belum ada berkas ekspor yang disimpan di folder temp server.' : 'No backup exports are currently located in temporary directory.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {serverFiles.map((file, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#0d0d0e]/60 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-sans leading-tight shadow-md"
                    >
                      <div className="min-w-0 flex-1 flex gap-3 items-start">
                        <div className="p-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-indigo-400 mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-bold text-white block truncate select-all">{file.filename}</span>
                          <span className="text-[9px] font-mono text-teal-500 block truncate font-semibold mt-0.5 select-all">{file.path}</span>
                          <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                            {new Date(file.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5 min-w-[70px]">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-black bg-zinc-950 p-1 px-1.5 border border-white/5 rounded">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        
                        {/* We could allow downloading file locally directly if user clicks this download arrow */}
                        <a
                          href={`data:text/plain;charset=utf-8,${encodeURIComponent(language === 'id' ? 'Download direct' : 'Direct')}`}
                          onClick={(e) => {
                            // Let's copy path to clipboard! Simple fallback to help local devs
                            e.preventDefault();
                            navigator.clipboard.writeText(file.path);
                            alert(language === 'id' ? `Jalur direktori telah disalin ke clipboard:\n${file.path}` : `File path copied to clipboard:\n${file.path}`);
                          }}
                          className="flex items-center gap-1 text-[9px] font-mono text-indigo-400 hover:text-indigo-300 font-extrabold uppercase transition select-none"
                        >
                          COPY PATH <PlusCircleIcon className="w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer actions */}
        <div className="p-4 bg-[#070708] border-t border-white/5 flex justify-end font-mono">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase transition tracking-wider select-none cursor-pointer"
          >
            {language === 'id' ? 'KEMBALI KE HUD' : 'DISMISS'}
          </button>
        </div>

      </div>
    </>
  );
}

function PlusCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  );
}
