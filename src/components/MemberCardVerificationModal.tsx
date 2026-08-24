import React from 'react';
import { ShieldCheck, ShieldAlert, X, Award, CheckCircle2, Building2, MapPin, Calendar, UserCheck } from 'lucide-react';
import { MemberCardRequest } from '../types/memberCard';

interface MemberCardVerificationModalProps {
  token: string;
  cardRequest: MemberCardRequest | null;
  onClose: () => void;
}

export const MemberCardVerificationModal: React.FC<MemberCardVerificationModalProps> = ({
  token,
  cardRequest,
  onClose,
}) => {
  const isValid = cardRequest && cardRequest.status === 'approved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className={`p-6 text-white text-center relative ${isValid ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' : 'bg-gradient-to-r from-rose-600 to-red-700'}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 rounded-full bg-white/20 mb-3 shadow-inner">
            {isValid ? (
              <ShieldCheck className="w-10 h-10 text-white animate-pulse" />
            ) : (
              <ShieldAlert className="w-10 h-10 text-white" />
            )}
          </div>

          <h2 className="text-xl font-bold tracking-wide">
            {isValid ? 'அங்கீகரிக்கப்பட்ட உறுப்பினர் அட்டை' : 'செல்லாத உறுப்பினர் அட்டை'}
          </h2>
          <p className="text-xs text-white/90 font-medium tracking-wider uppercase mt-1">
            {isValid ? 'Official Validated TNPA Membership' : 'Invalid or Unverified Card'}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {isValid && cardRequest ? (
            <div className="space-y-4">
              {/* Status Alert */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    சான்றிதழ் உறுதிப்படுத்தப்பட்டது (VERIFIED)
                  </p>
                  <p className="text-xs text-emerald-700">
                    தமிழ்நாடு பெயிண்டர்ஸ் மற்றும் ஆர்ட்டிஸ்ட்ஸ் நலச்சங்கத்தில் பதிவுபெற்ற உறுப்பினர்.
                  </p>
                </div>
              </div>

              {/* Member Card Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                  {cardRequest.photoUrl ? (
                    <img
                      src={cardRequest.photoUrl}
                      alt={cardRequest.memberName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {cardRequest.memberName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {cardRequest.memberName}
                    </h3>
                    {cardRequest.memberNameEn && (
                      <p className="text-xs text-slate-500 font-medium">
                        {cardRequest.memberNameEn}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800">
                      <UserCheck className="w-3 h-3" />
                      செயலில் உள்ள உறுப்பினர்
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                      உறுப்பினர் எண் / Member ID
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {cardRequest.memberId}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                      அட்டை எண் / Card No.
                    </span>
                    <span className="font-bold text-indigo-700 text-xs">
                      {cardRequest.cardNumber || 'TNPA-ACTIVE'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px] font-semibold uppercase">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      மாவட்டம் / District
                    </span>
                    <span className="font-semibold text-slate-800">
                      {cardRequest.district} {cardRequest.districtEn ? `(${cardRequest.districtEn})` : ''}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px] font-semibold uppercase">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      செல்லுபடியாகும் காலம் / Validity
                    </span>
                    <span className="font-semibold text-slate-800">
                      {cardRequest.validUntil || '31-12-2027'}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>தமிழ்நாடு பெயிண்டர்ஸ் மற்றும் ஆர்ட்டிஸ்ட்ஸ் நல சங்கம் (TNPA)</span>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <p className="text-[11px] text-slate-400 text-center italic">
                பாதுகாப்பு கருதி தனிப்பட்ட தொலைபேசி எண் மற்றும் ஆவணம் மறைக்கப்பட்டுள்ளது.
              </p>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
                <p className="font-bold">இந்த அட்டை எண் / டோக்கன் செல்லாதது அல்லது சரிபார்க்கப்படவில்லை.</p>
                <p className="text-xs text-rose-600 mt-1">
                  The requested membership card verification token ({token || 'UNKNOWN'}) could not be verified in the state registry.
                </p>
              </div>
              <p className="text-xs text-slate-500">
                தயவுசெய்து சங்கத்தின் மாநில தலைமை நிர்வாகத்தை தொடர்பு கொள்ளவும்.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              சரி / Close Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
