import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, Share2, CheckCircle2, X, ExternalLink, Loader2 } from 'lucide-react';
import { saveFileToDevice } from '../utils/pdfDownloadHelper';

export interface IdCardDownloadData {
  memberName: string;
  memberId: string;
  district: string;
  pdfBlob?: Blob;
  pdfBlobUrl?: string;
  pdfDataUrl?: string;
  pdfFileName?: string;
  frontPngBlob?: Blob;
  frontPngUrl?: string;
  frontPngFileName?: string;
  backPngBlob?: Blob;
  backPngUrl?: string;
  backPngFileName?: string;
  combPngBlob?: Blob;
  combPngUrl?: string;
  combPngFileName?: string;
}

interface IdCardDownloadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IdCardDownloadData | null;
  lang?: 'ta' | 'en';
}

export default function IdCardDownloadSuccessModal({
  isOpen,
  onClose,
  data,
  lang = 'ta'
}: IdCardDownloadSuccessModalProps) {
  const [activeDownload, setActiveDownload] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDownloadPdf = async (mode: 'auto' | 'share' | 'download' | 'view' = 'auto') => {
    setActiveDownload('pdf');
    triggerToast(lang === 'ta' ? '⏳ PDF பதிவிறக்கம் செய்யப்படுகிறது...' : '⏳ Saving PDF...');
    try {
      await saveFileToDevice(
        {
          blob: data.pdfBlob,
          blobUrl: data.pdfBlobUrl,
          dataUrl: data.pdfDataUrl
        },
        data.pdfFileName || `TNPA_Member_ID_Card_${data.memberId}.pdf`,
        `TNPA Official ID Card - ${data.memberName}`,
        mode
      );
      triggerToast(lang === 'ta' ? '✅ PDF வெற்றிகரமாக சேமிக்கப்பட்டது!' : '✅ PDF Saved Successfully!');
    } catch (err) {
      console.warn('PDF save error:', err);
    } finally {
      setTimeout(() => setActiveDownload(null), 1000);
    }
  };

  const handleDownloadCombPng = async () => {
    setActiveDownload('comb');
    triggerToast(lang === 'ta' ? '⏳ 2-in-1 படம் சேமிக்கப்படுகிறது...' : '⏳ Saving 2-in-1 Image...');
    try {
      await saveFileToDevice(
        {
          blob: data.combPngBlob,
          dataUrl: data.combPngUrl
        },
        data.combPngFileName || `TNPA_Card_Full_2in1_${data.memberId}.png`,
        `TNPA Full Card - ${data.memberName}`,
        'auto'
      );
      triggerToast(lang === 'ta' ? '✅ 2-in-1 படம் சேமிக்கப்பட்டது!' : '✅ 2-in-1 Image Saved!');
    } catch (err) {
      console.warn('Comb image save error:', err);
    } finally {
      setTimeout(() => setActiveDownload(null), 1000);
    }
  };

  const handleDownloadFrontPng = async () => {
    setActiveDownload('front');
    triggerToast(lang === 'ta' ? '⏳ முன்பக்க படம் சேமிக்கப்படுகிறது...' : '⏳ Saving Front Image...');
    try {
      await saveFileToDevice(
        {
          blob: data.frontPngBlob,
          dataUrl: data.frontPngUrl
        },
        data.frontPngFileName || `TNPA_Card_Front_${data.memberId}.png`,
        `TNPA Card Front - ${data.memberName}`,
        'auto'
      );
      triggerToast(lang === 'ta' ? '✅ முன்பக்க படம் சேமிக்கப்பட்டது!' : '✅ Front Image Saved!');
    } catch (err) {
      console.warn('Front image save error:', err);
    } finally {
      setTimeout(() => setActiveDownload(null), 1000);
    }
  };

  const handleDownloadBackPng = async () => {
    setActiveDownload('back');
    triggerToast(lang === 'ta' ? '⏳ பின்பக்க படம் சேமிக்கப்படுகிறது...' : '⏳ Saving Back Image...');
    try {
      await saveFileToDevice(
        {
          blob: data.backPngBlob,
          dataUrl: data.backPngUrl
        },
        data.backPngFileName || `TNPA_Card_Back_${data.memberId}.png`,
        `TNPA Card Back - ${data.memberName}`,
        'auto'
      );
      triggerToast(lang === 'ta' ? '✅ பின்பக்க படம் சேமிக்கப்பட்டது!' : '✅ Back Image Saved!');
    } catch (err) {
      console.warn('Back image save error:', err);
    } finally {
      setTimeout(() => setActiveDownload(null), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-yellow-400 rounded-3xl p-5 sm:p-7 shadow-2xl text-white space-y-5 my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with animated checkmark */}
        <div className="flex items-center gap-3.5 border-b border-stone-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-stone-950 flex items-center justify-center shadow-lg shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                100% Download Ready
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-0.5">
              {lang === 'ta' ? 'அடையாள அட்டை தயார்!' : 'ID Card Ready for Download!'}
            </h3>
            <p className="text-xs text-stone-300">
              {data.memberName} • <span className="font-mono text-yellow-400 font-bold">{data.memberId}</span>
            </p>
          </div>
        </div>

        {/* Toast Status Banner */}
        {toastMessage && (
          <div className="p-3 bg-emerald-600 border border-emerald-400 text-white rounded-xl text-xs font-black shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-yellow-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-stone-800/80 border border-stone-700 p-3.5 rounded-2xl text-xs text-stone-300 space-y-1">
          <p className="font-bold text-yellow-300">
            {lang === 'ta' ? '📱 உங்கள் போனில் சேமிக்க கீழே உள்ள பட்டன்களைத் தட்டவும்:' : 'Tap below to download directly to your device:'}
          </p>
          <p className="text-[11px] text-stone-400">
            {lang === 'ta' ? 'PDF ஆவணமாகவோ அல்லது உயர் தர PNG படங்களாகவோ உடனே சேமிக்கலாம்.' : 'Save as print-ready PDF or individual high-resolution PNG images.'}
          </p>
        </div>

        {/* Download Buttons Section */}
        <div className="space-y-3">
          
          {/* 1. PRIMARY PDF DOWNLOAD BUTTON */}
          <button
            type="button"
            onClick={() => handleDownloadPdf('auto')}
            disabled={activeDownload !== null}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#C00000] via-red-600 to-[#900000] hover:from-red-600 hover:to-red-800 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-between transition-all border-2 border-yellow-400/80 active:scale-98 cursor-pointer disabled:opacity-75"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#C00000] flex items-center justify-center font-black shadow">
                {activeDownload === 'pdf' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#C00000]" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="text-left">
                <div className="font-black text-sm leading-tight text-white">
                  {lang === 'ta' ? '📥 PDF அட்டை பதிவிறக்கம் (A4 300 DPI)' : '📥 Download Official PDF'}
                </div>
                <div className="text-[10px] text-yellow-200 font-bold truncate max-w-[220px] sm:max-w-xs">
                  {data.pdfFileName || 'Official_Card.pdf'}
                </div>
              </div>
            </div>
            <Download className="w-5 h-5 text-yellow-300 shrink-0" />
          </button>

          {/* 2. COMBINED 2-IN-1 PNG IMAGE DOWNLOAD */}
          <button
            type="button"
            onClick={handleDownloadCombPng}
            disabled={activeDownload !== null}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-between transition-all border border-amber-300 active:scale-98 cursor-pointer disabled:opacity-75"
          >
            <div className="flex items-center gap-2.5">
              {activeDownload === 'comb' ? (
                <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
              ) : (
                <ImageIcon className="w-5 h-5 text-stone-950" />
              )}
              <div className="text-left">
                <div className="font-black text-xs">
                  {lang === 'ta' ? '🖼️ 2-in-1 முழு அட்டை படம் (Combined Front & Back)' : '🖼️ Combined 2-in-1 PNG Image'}
                </div>
                <div className="text-[10px] text-stone-900 font-medium">ஒரே படத்தில் முன்பக்கமும் பின்பக்கமும்</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-stone-950 shrink-0" />
          </button>

          {/* 3. INDIVIDUAL FRONT & BACK PNG BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadFrontPng}
              disabled={activeDownload !== null}
              className="py-2.5 px-3.5 bg-stone-800 hover:bg-stone-700 text-yellow-300 font-black text-xs rounded-xl shadow border border-stone-700 flex items-center justify-between transition-all active:scale-98 cursor-pointer disabled:opacity-75"
            >
              <div className="flex items-center gap-2">
                {activeDownload === 'front' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span>{lang === 'ta' ? 'முன்பக்க படம் (Front)' : 'Front PNG'}</span>
              </div>
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDownloadBackPng}
              disabled={activeDownload !== null}
              className="py-2.5 px-3.5 bg-stone-800 hover:bg-stone-700 text-yellow-300 font-black text-xs rounded-xl shadow border border-stone-700 flex items-center justify-between transition-all active:scale-98 cursor-pointer disabled:opacity-75"
            >
              <div className="flex items-center gap-2">
                {activeDownload === 'back' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span>{lang === 'ta' ? 'பின்பக்க படம் (Back)' : 'Back PNG'}</span>
              </div>
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. SHARE VIA MOBILE / WHATSAPP */}
          <div className="pt-2 border-t border-stone-800 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPdf('share')}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>{lang === 'ta' ? '📱 போனில் பகிர் / WhatsApp' : '📱 Share to Phone / WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPdf('view')}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-stone-700 active:scale-95"
              title="பிரவுசரில் நேரடியாக திறக்க"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'திரையில் திற' : 'Open'}</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center pt-2 text-[10px] text-stone-500 font-semibold">
          தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் • TNPA Official ID Portal
        </div>

      </div>
    </div>
  );
}
