import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  Building2, 
  User, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Info,
  PhoneCall,
  Calendar
} from 'lucide-react';
import { UserAccount } from '../types';
import { MemberCardRequest, MemberCardPaymentConfig } from '../types/memberCard';
import { 
  getMemberCardConfig, 
  getMemberCardRequestByMemberId, 
  saveMemberCardRequest 
} from '../utils/memberCardStorage';

interface MemberCardPortalProps {
  currentUser: UserAccount | null;
  onNavigateToAuth?: () => void;
  onNavigateToRegister?: () => void;
}

export const MemberCardPortal: React.FC<MemberCardPortalProps> = ({
  currentUser,
  onNavigateToAuth,
  onNavigateToRegister,
}) => {
  const [config, setConfig] = useState<MemberCardPaymentConfig>(getMemberCardConfig());
  const [request, setRequest] = useState<MemberCardRequest | null>(null);
  
  // Form state
  const [utrInput, setUtrInput] = useState('');
  const [paymentDateInput, setPaymentDateInput] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load existing member card request
  useEffect(() => {
    if (currentUser) {
      const memberId = currentUser.regNumber || currentUser.id;
      const existing = getMemberCardRequestByMemberId(memberId);
      setRequest(existing);
    }
  }, [currentUser]);

  // Refresh config from storage
  useEffect(() => {
    setConfig(getMemberCardConfig());
  }, []);

  const upiNumberToDisplay = config.upiNumber || "7010131915";

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiNumberToDisplay);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setSubmitError('தயவுசெய்து முதலில் உள்நுழையவும் (Please login first).');
      return;
    }

    const trimmedUtr = utrInput.trim();
    if (!trimmedUtr || trimmedUtr.length < 6) {
      setSubmitError('சரியான UTR / Transaction Reference எண்ணை உள்ளிடவும் (குறைந்தபட்சம் 6-12 இலக்கங்கள்).');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const memberId = currentUser.regNumber || currentUser.id || `TNP-${Date.now().toString().slice(-4)}`;
    const randomVerifyCode = Math.random().toString(36).substring(2, 9).toUpperCase();

    const newRequest: MemberCardRequest = {
      id: `MCR-${Date.now()}`,
      memberId: memberId,
      memberName: currentUser.name || 'உறுப்பினர்',
      memberNameEn: currentUser.nameEn || '',
      memberPhone: currentUser.phone || '',
      district: currentUser.district || 'சென்னை',
      districtEn: currentUser.districtEn || 'Chennai',
      photoUrl: currentUser.photoUrl || '',
      experienceYears: currentUser.experienceYears || 5,
      bloodGroup: currentUser.bloodGroup || 'O+',
      dob: currentUser.dob || '1990-01-01',
      amount: config.amount || 100,
      utrNumber: trimmedUtr,
      paymentDate: `${paymentDateInput} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'pending', // NEVER automatically issued - Admin verification mandatory
      cardVerificationToken: `TNPA-VERIFY-${memberId}-${randomVerifyCode}`,
      createdAt: new Date().toISOString(),
    };

    saveMemberCardRequest(newRequest);
    setRequest(newRequest);
    setIsSubmitting(false);
    setUtrInput('');
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div id="member-card-portal-root" className="max-w-4xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              அதிகாரப்பூர்வ டிஜிட்டல் உறுப்பினர் அட்டை
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              உறுப்பினர் அட்டை / Member Card
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              தமிழ்நாடு பெயிண்டர்ஸ் மற்றும் ஆர்ட்டிஸ்ட்ஸ் நல சங்கத்தின் அதிகாரப்பூர்வ அடையாள அட்டை.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {request?.status === 'approved' && (
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                அங்கீகரிக்கப்பட்டது
              </div>
            )}
            {request?.status === 'pending' && (
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl text-sm font-semibold">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                Payment Verification Pending
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guest prompt if not logged in */}
      {!currentUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 space-y-4">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-bold text-base">உறுப்பினர் அட்டை பெற உள்நுழையவும்</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                உறுப்பினர் அட்டை பெற உங்கள் உறுப்பினர் கணக்கில் உள்நுழைய வேண்டும்.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            {onNavigateToAuth && (
              <button
                id="btn-nav-login"
                onClick={onNavigateToAuth}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                உறுப்பினர் உள்நுழைவு / Member Login
              </button>
            )}
            {onNavigateToRegister && (
              <button
                id="btn-nav-register"
                onClick={onNavigateToRegister}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                புதிய உறுப்பினர் பதிவு / New Registration
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN LIFECYCLE ROUTER */}
      {currentUser && (
        <>
          {/* STATE 1: APPROVED - DISPLAY OFFICIAL MEMBER CARD */}
          {request?.status === 'approved' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Visual Smart Card */}
                <div 
                  id="printable-member-card"
                  className="w-full max-w-md bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-2xl border-2 border-indigo-400/40 relative overflow-hidden select-none"
                >
                  {/* Decorative Watermark */}
                  <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header with Association Name */}
                  <div className="border-b border-indigo-800/80 pb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                        <Building2 className="w-8 h-8 text-indigo-950" />
                      </div>
                      <div>
                        <h2 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-tight leading-tight">
                          தமிழ்நாடு பெயிண்டர்ஸ் மற்றும் ஆர்ட்டிஸ்ட்ஸ் சங்கம்
                        </h2>
                        <p className="text-[10px] text-slate-300 font-semibold tracking-wider uppercase">
                          TN Painters & Artists Association (TNPA)
                        </p>
                      </div>
                    </div>
                    <div className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                      MEMBER
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="py-5 grid grid-cols-3 gap-4 items-center">
                    {/* Member Photo */}
                    <div className="col-span-1 flex flex-col items-center">
                      <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg bg-slate-800 flex items-center justify-center">
                        {request.photoUrl || currentUser.photoUrl ? (
                          <img
                            src={request.photoUrl || currentUser.photoUrl}
                            alt={request.memberName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-12 h-12 text-slate-400" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 mt-1.5 uppercase">
                        {request.bloodGroup || currentUser.bloodGroup || 'O+'} Group
                      </span>
                    </div>

                    {/* Member Details */}
                    <div className="col-span-2 space-y-1.5 pl-1">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">பெயர் / Name</span>
                        <h3 className="text-base font-extrabold text-white leading-tight">
                          {request.memberName || currentUser.name}
                        </h3>
                        {(request.memberNameEn || currentUser.nameEn) && (
                          <p className="text-xs text-slate-300 font-medium">
                            {request.memberNameEn || currentUser.nameEn}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-semibold">உறுப்பினர் எண்</span>
                          <span className="font-bold text-amber-300 text-xs">
                            {request.memberId}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-semibold">மாவட்டம்</span>
                          <span className="font-semibold text-slate-200 text-xs">
                            {request.district || currentUser.district}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <span className="text-[9px] text-slate-400 block uppercase font-semibold">அட்டை எண் / Card ID</span>
                        <span className="font-mono text-indigo-300 text-xs font-bold">
                          {request.cardNumber || 'TNPA-CARD-2026'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-indigo-800/80 pt-3 flex items-center justify-between gap-3 bg-slate-950/40 -mx-6 -mb-6 p-4 rounded-b-3xl">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        அங்கீகரிக்கப்பட்ட உறுப்பினர்
                      </div>
                      <p className="text-[9px] text-slate-400">
                        செல்லுபடியாகும் காலம்: <span className="text-white font-semibold">{request.validUntil || '31-12-2027'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-400 block">STATE TREASURER</span>
                      <span className="text-[10px] font-bold text-slate-200">APPROVED</span>
                    </div>
                  </div>
                </div>

                {/* Print Action */}
                <div className="flex items-center justify-center pt-2">
                  <button
                    id="btn-print-member-card"
                    onClick={handlePrintCard}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    அட்டையை அச்சிட / Print Member Card
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: PENDING VERIFICATION */}
          {request?.status === 'pending' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-amber-100 pb-6">
                <div className="p-4 rounded-2xl bg-amber-100 text-amber-700">
                  <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Payment Verification Pending
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    கட்டண சரிபார்ப்பு நிலுவையில் உள்ளது
                  </h2>
                  <p className="text-sm text-slate-600">
                    Your ₹100 payment request has been submitted. The Member Card will become available after Admin verification.
                  </p>
                </div>
              </div>

              {/* Submitted Details Review */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  சமர்ப்பிக்கப்பட்ட விவரங்கள் / Submitted Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-xs block font-medium">தொகை</span>
                    <span className="text-base font-bold text-slate-900">₹{request.amount}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-xs block font-medium">UTR / Reference No</span>
                    <span className="text-base font-mono font-bold text-indigo-600">{request.utrNumber}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-xs block font-medium">தேதி</span>
                    <span className="text-sm font-semibold text-slate-800">{request.paymentDate}</span>
                  </div>
                </div>
              </div>

              {/* Safety Note */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-sm">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">
                    நிர்வாகி சரிபார்ப்பு (Admin Verification)
                  </p>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    நிர்வாகி உங்கள் UTR எண்ணை சரிபார்த்து ஒப்புதல் அளித்தவுடன் உங்கள் உறுப்பினர் அட்டை தானாகவே பதிவிறக்கம் செய்ய கிடைக்கும்.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: REJECTED */}
          {request?.status === 'rejected' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-rose-100 pb-6">
                <div className="p-4 rounded-2xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    Verification Rejected
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    கட்டணம் நிராகரிக்கப்பட்டது / Payment Rejected
                  </h2>
                  <p className="text-sm text-rose-700 font-medium">
                    காரணம் / Reason: {request.rejectionReason || 'UTR எண் வங்கி கணக்கில் பொருந்தவில்லை.'}
                  </p>
                </div>
              </div>

              <button
                id="btn-retry-payment"
                onClick={() => setRequest(null)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
              >
                மீண்டும் செலுத்த / Try Again
              </button>
            </div>
          )}

          {/* STATE 4: UNPAID - SIMPLE & DIRECT ₹100 PAYMENT FLOW */}
          {(!request || request.status === 'unpaid') && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Header Display */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border-b border-indigo-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      உறுப்பினர் அட்டை பெற ₹100 செலுத்தவும்
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Pay ₹100 to receive your official Member Card.
                    </p>
                  </div>
                  <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow text-center shrink-0">
                    <span className="text-[10px] uppercase tracking-wider block opacity-80">கட்டணம்</span>
                    <span className="text-xl font-black">₹100</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                {/* Step 1: Payment Instructions & UPI Number */}
                <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2.5 text-indigo-900 font-bold text-sm sm:text-base">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0">1</span>
                    <h3>கட்டண வழிமுறை / Payment Instructions</h3>
                  </div>

                  <p className="text-slate-800 text-sm sm:text-base font-semibold leading-relaxed">
                    PhonePe / Google Pay / Paytm அல்லது எந்த UPI app மூலமாகவும் கீழே உள்ள UPI எண்ணுக்கு ₹100 அனுப்பவும்.
                  </p>

                  {/* UPI Number Display Box */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-indigo-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        UPI / Payment Number:
                      </span>
                      <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-700 tracking-wider">
                        {upiNumberToDisplay}
                      </span>
                    </div>

                    <button
                      id="btn-copy-upi-number"
                      onClick={handleCopyUpi}
                      className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>எண் நகலெடுக்கப்பட்டது!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>UPI எண்ணை நகலெடு (Copy)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Step 2: UTR Submission Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm sm:text-base">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center shrink-0">2</span>
                    <h3>UTR எண்ணை பதிவு செய்யவும்</h3>
                  </div>

                  <p className="text-slate-800 text-sm sm:text-base font-semibold">
                    ₹100 செலுத்திய பிறகு உங்கள் UTR / Transaction Reference Number-ஐ கீழே பதிவு செய்யவும்.
                  </p>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* UTR Input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          UTR / Transaction Reference Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="input-member-card-utr"
                          type="text"
                          value={utrInput}
                          onChange={(e) => setUtrInput(e.target.value)}
                          placeholder="எ.கா. 428910293812"
                          maxLength={25}
                          required
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-mono text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 font-semibold"
                        />
                      </div>

                      {/* Payment Date */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          செலுத்திய தேதி / Payment Date
                        </label>
                        <input
                          id="input-member-card-date"
                          type="date"
                          value={paymentDateInput}
                          onChange={(e) => setPaymentDateInput(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold"
                        />
                      </div>
                    </div>

                    {submitError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                        {submitError}
                      </div>
                    )}

                    <button
                      id="btn-submit-member-card-payment"
                      type="submit"
                      disabled={isSubmitting || !utrInput.trim()}
                      className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>சமர்ப்பிக்கப்படுகிறது...</span>
                        </>
                      ) : (
                        <>
                          <span>விண்ணப்பத்தை சமர்ப்பிக்கவும் / Submit</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
