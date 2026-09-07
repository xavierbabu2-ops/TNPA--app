import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Download,
  Building2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText,
  ExternalLink
} from 'lucide-react';
import { UserAccount } from '../types';
import { MemberCardRequest, MemberCardPaymentConfig } from '../types/memberCard';
import {
  getMemberCardConfig,
  getMemberCardRequestByMemberId,
  saveMemberCardRequest
} from '../utils/memberCardStorage';
import { exportIdCardAsPDF, exportIdCardAsImages } from '../utils/idCardPdfExport';

interface MemberCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  targetMember?: {
    id: string;
    name: string;
    nameEn?: string;
    phone?: string;
    district?: string;
    photoUrl?: string;
    bloodGroup?: string;
    fatherName?: string;
    address?: string;
  };
  onDownloadSuccess?: () => void;
  onPaymentSubmitted?: (request: MemberCardRequest) => void;
}

export const MemberCardPaymentModal: React.FC<MemberCardPaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetMember,
  onDownloadSuccess,
  onPaymentSubmitted
}) => {
  const [config, setConfig] = useState<MemberCardPaymentConfig>(getMemberCardConfig());
  const [request, setRequest] = useState<MemberCardRequest | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [modalPdfResult, setModalPdfResult] = useState<{ blobUrl: string; fileName: string } | null>(null);

  const memberId = targetMember?.regNumber || targetMember?.id || currentUser?.regNumber || currentUser?.id || 'TNP-MEM';
  const memberName = targetMember?.name || currentUser?.name || 'உறுப்பினர்';
  const memberDistrict = targetMember?.district || currentUser?.district || 'தமிழ்நாடு';

  // Super admin / state president bypass capability
  const isSuperAdminOrState =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'state_admin' ||
    currentUser?.role === 'state_president';

  useEffect(() => {
    if (isOpen) {
      setConfig(getMemberCardConfig());
      const existing =
        getMemberCardRequestByMemberId(memberId) ||
        (targetMember?.id ? getMemberCardRequestByMemberId(targetMember.id) : null) ||
        (targetMember?.regNumber ? getMemberCardRequestByMemberId(targetMember.regNumber) : null);
      setRequest(existing);
      setErrorMessage(null);
      setDownloadProgress(null);
    }
  }, [isOpen, memberId, targetMember]);

  if (!isOpen) return null;

  const upiNumber = config.upiNumber || '7010131915';
  const upiId = config.upiId || '7010131915@ybl';
  const amount = config.amount || 100;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiNumber);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleUtrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrInput.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMessage('சரியான UTR / Transaction Reference எண்ணை உள்ளிடவும் (குறைந்தபட்சம் 6-12 இலக்கங்கள்).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const randomVerifyCode = Math.random().toString(36).substring(2, 9).toUpperCase();
    const now = new Date();

    const newReq: MemberCardRequest = {
      id: `MCR-${Date.now()}`,
      memberId: memberId,
      memberName: memberName,
      memberNameEn: targetMember?.nameEn || currentUser?.nameEn || '',
      memberPhone: targetMember?.phone || currentUser?.phone || '',
      district: memberDistrict,
      districtEn: currentUser?.districtEn || '',
      photoUrl: targetMember?.photoUrl || currentUser?.photoUrl || '',
      experienceYears: currentUser?.experienceYears || 5,
      bloodGroup: targetMember?.bloodGroup || currentUser?.bloodGroup || 'O+',
      dob: currentUser?.dob || '1990-01-01',
      amount: amount,
      utrNumber: cleanUtr,
      paymentDate: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'pending',
      cardVerificationToken: `TNPA-VERIFY-${memberId}-${randomVerifyCode}`,
      createdAt: now.toISOString()
    };

    saveMemberCardRequest(newReq);
    setRequest(newReq);
    setIsSubmitting(false);
    setUtrInput('');

    if (onPaymentSubmitted) {
      onPaymentSubmitted(newReq);
    }
  };

  const handleDirectDownload = async (type: 'pdf' | 'png') => {
    setIsDownloading(true);
    setDownloadProgress('அட்டை கோப்பை தயார் செய்கிறது...');

    try {
      const hasOfficialFront = !!document.getElementById('union-id-card-front');
      const singleElId = hasOfficialFront
        ? undefined
        : document.getElementById('printable-member-card')
        ? 'printable-member-card'
        : 'dashboard-digital-member-card';

      if (type === 'pdf') {
        const success = await exportIdCardAsPDF({
          memberName: memberName,
          memberId: memberId,
          district: memberDistrict,
          frontElementId: 'union-id-card-front',
          backElementId: 'union-id-card-back',
          singleElementId: singleElId,
          onProgress: (status) => setDownloadProgress(status),
          onSuccess: (result) => {
            setModalPdfResult({ blobUrl: result.blobUrl, fileName: result.fileName });
          }
        });

        if (success) {
          if (onDownloadSuccess) onDownloadSuccess();
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadProgress('✅ PDF தயார்! போனில் தானாக திறக்கப்படவில்லை எனில் கீழே உள்ள பொத்தானைப் பயன்படுத்தவும்.');
          }, 800);
        } else {
          setIsDownloading(false);
          setDownloadProgress('❌ பிழை ஏற்பட்டது. அச்சிடு முறையைப் பயன்படுத்தவும்.');
        }
      } else {
        await exportIdCardAsImages({
          memberName: memberName,
          memberId: memberId,
          frontElementId: 'union-id-card-front',
          backElementId: 'union-id-card-back',
          singleElementId: singleElId,
          onProgress: (status) => setDownloadProgress(status)
        });
        setDownloadProgress('✅ படங்கள் வெற்றிகரமாக சேமிக்கப்பட்டது!');
        setTimeout(() => {
          setIsDownloading(false);
          setDownloadProgress(null);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setIsDownloading(false);
      setDownloadProgress('❌ பதிவிறக்கத்தில் பிழை. அச்சிடு முறையைப் பயன்படுத்தவும்.');
    }
  };

  const isApproved = request?.status === 'approved' || isSuperAdminOrState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-stone-200 overflow-hidden relative my-6">
        
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-stone-900 via-[#800000] to-stone-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#C00000] flex items-center justify-center shadow-lg font-black shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400 text-stone-950 text-[10px] font-black uppercase">
                <Sparkles className="w-3 h-3" />
                அதிகாரப்பூர்வ அட்டை பதிவிறக்கம்
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-1">
                உறுப்பினர் அடையாள அட்டை டவுன்லோடு
              </h3>
              <p className="text-xs text-stone-200">
                {memberName} ({memberId})
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* ============================================================= */}
          {/* CASE A: APPROVED - FULL UNLOCKED DOWNLOAD ACCESS              */}
          {/* ============================================================= */}
          {isApproved ? (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-stone-900">
                  அங்கீகரிக்கப்பட்டது! (Card Approved)
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  உங்கள் உறுப்பினர் அடையாள அட்டை மாவட்ட மற்றும் சூப்பர் அட்மின் சரிபார்ப்பிற்குப் பின் அதிகாரப்பூர்வமாக வழங்கப்பட்டுள்ளது.
                </p>
                {request?.cardNumber && (
                  <div className="inline-block px-3 py-1 bg-stone-100 rounded-lg font-mono text-xs font-bold text-stone-800 border border-stone-300">
                    அட்டை எண்: {request.cardNumber}
                  </div>
                )}
              </div>

              {/* Progress status if downloading */}
              {downloadProgress && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl animate-pulse">
                  {downloadProgress}
                </div>
              )}

              {/* Persistent Open PDF Link */}
              {modalPdfResult && (
                <div className="p-3 bg-emerald-950 border border-emerald-400 text-white rounded-xl shadow-md flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>PDF தயாராக உள்ளது!</span>
                  </div>
                  <a
                    href={modalPdfResult.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={modalPdfResult.fileName}
                    className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-stone-950" />
                    <span>📂 திறக்க / Open</span>
                  </a>
                </div>
              )}

              {/* Instant Download Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={() => handleDirectDownload('pdf')}
                  className="w-full py-3.5 px-4 bg-[#C00000] hover:bg-red-700 active:scale-98 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'தயாராகிறது...' : 'PDF அட்டை டவுன்லோட்'}</span>
                </button>

                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={() => handleDirectDownload('png')}
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 active:scale-98 text-yellow-300 text-sm font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 border border-yellow-500/40"
                >
                  <FileText className="w-4 h-4" />
                  <span>PNG படங்கள் (முன் & பின்)</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-500">
                💡 இந்த PDF-ஐ A4 அல்லது CR-80 PVC கார்டு அளவில் உயர்தர பிரிண்ட் மற்றும் லேமினேட் செய்துகொள்ளலாம்.
              </p>
            </div>
          ) : request?.status === 'district_approved' ? (
            /* ============================================================= */
            /* CASE B: DISTRICT APPROVED - WAITING FOR SUPER ADMIN APPROVAL */
            /* ============================================================= */
            <div className="space-y-5">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-200 text-amber-800 rounded-xl shrink-0 mt-0.5">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      படி 1: மாவட்ட அட்மின் ஒப்புதல் முடிந்தது
                    </span>
                    <h4 className="text-base font-black text-stone-900">
                      சூப்பர் அட்மின் இறுதி ஒப்புதலுக்கு காத்திருக்கிறது
                    </h4>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      மாவட்ட நிர்வாகி (<strong className="text-stone-900">{request.districtApprovedBy || 'District Admin'}</strong>) உங்கள் ₹100 கட்டணம் மற்றும் UTR சரிபார்த்து மாவட்ட அளவில் ஒப்புதல் அளித்துள்ளார்.
                    </p>
                  </div>
                </div>

                {/* Status Stepper */}
                <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>₹100 செலுத்தி UTR சமர்ப்பிக்கப்பட்டது ({request.utrNumber})</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>மாவட்ட அட்மின் சரிபார்த்து ஒப்புதல் அளித்தார்</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 font-black">
                    <Clock className="w-4 h-4 shrink-0 animate-spin" />
                    <span>சூப்பர் அட்மின் (Super Admin) இறுதி ஒப்புதல் & டிஜிட்டல் கையொப்பம் - நிலுவையில்</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>குறிப்பு:</strong> சங்க விதிகளின்படி, மாவட்ட அட்மின் ஒப்புதல் அளித்தாலும் மாநில தலைமை & சூப்பர் அட்மின் இறுதி ஒப்புதல் அளித்தவுடன் மட்டுமே அட்டை தானாகவே பதிவிறக்கம் செய்ய திறக்கப்படும்.
                  </span>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const latest = getMemberCardRequestByMemberId(memberId);
                    setRequest(latest);
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>நிலையை புதுப்பித்து பார்க்க (Refresh Status)</span>
                </button>
              </div>
            </div>
          ) : request?.status === 'pending' ? (
            /* ============================================================= */
            /* CASE C: PENDING INITIAL VERIFICATION                          */
            /* ============================================================= */
            <div className="space-y-5">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-200 text-amber-800 rounded-xl shrink-0 mt-0.5">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                      சரிபார்ப்பு நிலுவையில் உள்ளது
                    </div>
                    <h4 className="text-base font-black text-stone-900">
                      ₹100 கட்டண UTR சமர்ப்பிக்கப்பட்டது
                    </h4>
                    <p className="text-xs text-stone-600">
                      உங்கள் UTR எண் ({request.utrNumber}) பதிவு செய்யப்பட்டுள்ளது. மாவட்ட நிர்வாகி & சூப்பர் அட்மின் சரிபார்த்து ஒப்புதல் அளித்தவுடன் அட்டை டவுன்லோடு திறக்கப்படும்.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-stone-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">தொகை:</span>
                    <span className="font-black text-stone-900">₹{request.amount}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">UTR எண்:</span>
                    <span className="font-mono font-bold text-indigo-600">{request.utrNumber}</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const latest = getMemberCardRequestByMemberId(memberId);
                    setRequest(latest);
                  }}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>நிலையை புதுப்பித்து பார்க்க (Refresh)</span>
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================= */
            /* CASE D: UNPAID - SHOW ₹100 GPAY / UPI & UTR SUBMISSION FORM   */
            /* ============================================================= */
            <div className="space-y-6">
              
              {/* Highlight Notice */}
              <div className="bg-red-50 border-2 border-[#C00000]/30 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-[#800000]">
                  <CreditCard className="w-4 h-4 text-[#C00000]" />
                  <span>அடையாள அட்டை பெற ₹100 கட்டணம்</span>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  அடையாள அட்டை அச்சிடுதல் மற்றும் அதிகாரப்பூர்வ பதிவு கட்டணமாக ₹100-ஐ கீழே உள்ள Google Pay / PhonePe எண்ணுக்கு செலுத்தி, அதன் UTR / பரிவர்த்தனை எண்ணை இங்கே பதிவு செய்யவும்.
                </p>
              </div>

              {/* Payment Box */}
              <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-[10px] font-black text-stone-500 uppercase">
                      Google Pay / PhonePe / Paytm எண்:
                    </span>
                    <div className="font-mono text-2xl font-black text-[#800000] tracking-wider">
                      {upiNumber}
                    </div>
                    <span className="text-[11px] text-stone-600 block">
                      கட்டணத் தொகை: <strong className="text-[#C00000] text-sm font-black">₹{amount}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 active:scale-95 text-yellow-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUpi ? 'நகலெடுக்கப்பட்டது!' : 'Copy Number'}</span>
                    </button>
                    
                    <a
                      href={`upi://pay?pa=${upiId}&pn=TNPA+Association&am=${amount}&cu=INR`}
                      className="px-4 py-2 bg-[#C00000] hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow"
                    >
                      <span>Pay ₹100</span>
                    </a>
                  </div>
                </div>

                {/* UTR Form */}
                <form onSubmit={handleUtrSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-stone-800 block">
                      பணம் செலுத்திய UTR / Transaction Reference எண்:
                    </label>
                    <input
                      type="text"
                      required
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="எ.கா: 412345678901 (12 இலக்க UTR எண்)"
                      className="w-full px-4 py-3 bg-white border-2 border-stone-300 rounded-xl font-mono font-bold text-stone-900 text-sm focus:outline-none focus:border-[#C00000] focus:ring-2 focus:ring-[#C00000]/20"
                    />
                    <p className="text-[10px] text-stone-500">
                      GPay அல்லது PhonePe-ல் பணம் அனுப்பிய விவரங்களில் உள்ள 12 இலக்க UPI Ref ID / UTR எண்ணை உள்ளிடவும்.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#C00000] hover:bg-red-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'பதிவு செய்கிறது...' : 'UTR எண்ணை உறுதிசெய்க (Submit UTR)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </div>

              {/* Workflow explanation note */}
              <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <div className="font-bold text-stone-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>அங்கீகார நடைமுறை (Approval Process):</span>
                </div>
                <p>
                  UTR சமர்ப்பித்தவுடன், மாவட்ட அட்மின் மற்றும் சூப்பர் அட்மின் ஒப்புதல் அளித்ததும் இந்த பட்டன் மூலமாகவே உடனடியாக PDF டவுன்லோடு செய்துகொள்ளலாம்.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
