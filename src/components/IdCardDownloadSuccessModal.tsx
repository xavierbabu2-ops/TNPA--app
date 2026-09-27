import React, { useState } from 'react';
import { Download, Image as ImageIcon, Share2, CheckCircle2, X, Sparkles, Loader2, Eye, ShieldCheck } from 'lucide-react';
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
  frontJpgBlob?: Blob;
  frontJpgUrl?: string;
  frontJpgFileName?: string;
  backPngBlob?: Blob;
  backPngUrl?: string;
  backPngFileName?: string;
  backJpgBlob?: Blob;
  backJpgUrl?: string;
  backJpgFileName?: string;
  combPngBlob?: Blob;
  combPngUrl?: string;
  combPngFileName?: string;
  combJpgBlob?: Blob;
  combJpgUrl?: string;
  combJpgFileName?: string;
}

interface IdCardDownloadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IdCardDownloadData | null;
  lang?: 'ta' | 'en';
}

type CardTab = 'comb' | 'front' | 'back';

export default function IdCardDownloadSuccessModal({
  isOpen,
  onClose,
  data,
  lang = 'ta'
}: IdCardDownloadSuccessModalProps) {
  const [activeTab, setActiveTab] = useState<CardTab>('comb');
  const [activeDownload, setActiveDownload] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Resolve current active image data
  const getCurrentImageDetails = (tab: CardTab) => {
    if (tab === 'front') {
      return {
        url: data.frontJpgUrl || data.frontPngUrl || data.combJpgUrl || data.combPngUrl,
        blob: data.frontJpgBlob || data.frontPngBlob || data.combJpgBlob || data.combPngBlob,
        fileName: data.frontJpgFileName || data.frontPngFileName || `TNPA_Card_Front_${data.memberId}.jpg`,
        title: `TNPA Card Front - ${data.memberName}`
      };
    }
    if (tab === 'back') {
      return {
        url: data.backJpgUrl || data.backPngUrl || data.combJpgUrl || data.combPngUrl,
        blob: data.backJpgBlob || data.backPngBlob || data.combJpgBlob || data.combPngBlob,
        fileName: data.backJpgFileName || data.backPngFileName || `TNPA_Card_Back_${data.memberId}.jpg`,
        title: `TNPA Card Back - ${data.memberName}`
      };
    }
    // Default 2-in-1 Combined
    return {
      url: data.combJpgUrl || data.combPngUrl || data.frontJpgUrl || data.frontPngUrl,
      blob: data.combJpgBlob || data.combPngBlob || data.frontJpgBlob || data.frontPngBlob,
      fileName: data.combJpgFileName || data.combPngFileName || `TNPA_Full_Card_2in1_${data.memberId}.jpg`,
      title: `TNPA Full Card 2-in-1 - ${data.memberName}`
    };
  };

  const currentImg = getCurrentImageDetails(activeTab);

  const handleDownloadActiveImage = async (mode: 'auto' | 'share' | 'download' = 'auto') => {
    setActiveDownload(activeTab);
    triggerToast(lang === 'ta' ? '⏳ கேலரியில் சேமிக்கப்படுகிறது...' : '⏳ Saving to Gallery...');
    try {
      await saveFileToDevice(
        {
          blob: currentImg.blob,
          dataUrl: currentImg.url
        },
        currentImg.fileName,
        currentImg.title,
        mode
      );
      triggerToast(lang === 'ta' ? '✅ கேலரியில் சேமிக்கப்பட்டது!' : '✅ Saved to Gallery!');
    } catch (err) {
      console.warn('Image save error:', err);
    } finally {
      setTimeout(() => setActiveDownload(null), 1000);
    }
  };

  const handleShareToWhatsAppOrPhone = async () => {
    setActiveDownload('share');
    triggerToast(lang === 'ta' ? '⏳ WhatsApp / போனில் பகிரப்படுகிறது...' : '⏳ Opening share sheet...');
    try {
      await saveFileToDevice(
        {
          blob: currentImg.blob,
          dataUrl: currentImg.url
        },
        currentImg.fileName,
        currentImg.title,
        'share'
      );
    } catch (err) {
      console.warn('Share error:', err);
    } finally {
      setTimeout(() => setActiveDownload(null), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-yellow-400 rounded-3xl p-4 sm:p-6 shadow-2xl text-white space-y-4 my-6">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-stone-950 flex items-center justify-center shadow-lg shrink-0 font-black">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded border border-yellow-400/40">
                100% HD GALLERY IMAGE
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              {lang === 'ta' ? 'அடையாள அட்டை படம் தயார்!' : 'ID Card Image Ready!'}
            </h3>
            <p className="text-xs text-stone-300 truncate max-w-[240px] sm:max-w-xs">
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

        {/* Image Selection Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-800/90 rounded-2xl border border-stone-700">
          <button
            type="button"
            onClick={() => setActiveTab('comb')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'comb'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 shadow-md scale-102'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            🖼️ {lang === 'ta' ? '2-in-1 முழு அட்டை' : '2-in-1 Full'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('front')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'front'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 shadow-md scale-102'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            🪪 {lang === 'ta' ? 'முன்பக்கம்' : 'Front Side'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('back')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'back'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 shadow-md scale-102'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            📋 {lang === 'ta' ? 'பின்பக்கம்' : 'Back Side'}
          </button>
        </div>

        {/* Visual Live Image Card Display */}
        <div className="relative bg-stone-950 border-2 border-yellow-500/50 rounded-2xl p-2.5 shadow-inner flex flex-col items-center justify-center overflow-hidden group">
          {currentImg.url ? (
            <img
              src={currentImg.url}
              alt="TNPA ID Card Preview"
              className="w-full max-h-72 object-contain rounded-xl shadow-lg border border-stone-800 transition-all select-none"
            />
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-stone-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              <span className="text-xs font-bold">படம் தயாராகிறது...</span>
            </div>
          )}

          {/* Long Press Helper Badge */}
          <div className="mt-2 w-full text-center bg-amber-500/15 border border-amber-400/40 rounded-xl p-2 text-[11px] text-amber-200">
            <p className="font-bold flex items-center justify-center gap-1.5 text-yellow-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'போன் கேலரியில் (Gallery) சேமிக்கும் எளிதான வழி:' : 'Easy Save to Gallery:'}</span>
            </p>
            <p className="text-[10px] text-stone-300 mt-0.5">
              {lang === 'ta'
                ? 'மேலேயுள்ள படத்தை 1 வினாடி அழுத்திப் பிடித்து (Long Press) "Download image" அல்லது "Save image" என்பதைத் தொடவும்.'
                : 'Long-press the card image above and tap "Save image" or "Download image".'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          
          {/* 1. PRIMARY SAVE TO GALLERY BUTTON */}
          <button
            type="button"
            onClick={() => handleDownloadActiveImage('auto')}
            disabled={activeDownload !== null}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#C00000] via-red-600 to-[#900000] hover:from-red-600 hover:to-red-800 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-between transition-all border-2 border-yellow-400 active:scale-98 cursor-pointer disabled:opacity-75"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#C00000] flex items-center justify-center font-black shadow">
                {activeDownload === activeTab ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#C00000]" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </div>
              <div className="text-left">
                <div className="font-black text-sm leading-tight text-white">
                  {lang === 'ta' ? '📸 கேலரியில் சேமி (JPG / PNG பதிவிறக்கம்)' : '📸 Save to Gallery (Download Image)'}
                </div>
                <div className="text-[10px] text-yellow-200 font-bold truncate max-w-[220px]">
                  {currentImg.fileName}
                </div>
              </div>
            </div>
            <Download className="w-5 h-5 text-yellow-300 shrink-0" />
          </button>

          {/* 2. SHARE TO WHATSAPP / PHONE GALLERY SHARE SHEET */}
          <button
            type="button"
            onClick={handleShareToWhatsAppOrPhone}
            disabled={activeDownload !== null}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all border border-emerald-400 active:scale-98 cursor-pointer disabled:opacity-75"
          >
            {activeDownload === 'share' ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Share2 className="w-4 h-4 text-white" />
            )}
            <span>{lang === 'ta' ? '📱 WhatsApp / போனில் நேரடியாகப் பகிர்' : '📱 Share to WhatsApp / Phone'}</span>
          </button>

          {/* 3. DOWNLOAD ALL INDIVIDUAL PNG/JPG BUTTONS */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={async () => {
                setActiveTab('front');
                setTimeout(() => handleDownloadActiveImage('auto'), 100);
              }}
              className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-yellow-300 font-black text-xs rounded-xl shadow border border-stone-700 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'முன்பக்கம் மட்டும்' : 'Front Image'}</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setActiveTab('back');
                setTimeout(() => handleDownloadActiveImage('auto'), 100);
              }}
              className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-yellow-300 font-black text-xs rounded-xl shadow border border-stone-700 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'பின்பக்கம் மட்டும்' : 'Back Image'}</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-stone-400 pt-1 border-t border-stone-800/80">
          தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் • 100% High-Resolution PVC Print Ready
        </div>

      </div>
    </div>
  );
}
