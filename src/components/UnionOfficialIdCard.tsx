import React from "react";
import { formatMemberNumber } from "../utils/districtCodes";

interface UnionOfficialIdCardProps {
  member: {
    id?: string;
    name: string;
    fatherName?: string;
    regNumber?: string;
    district?: string;
    occupation?: string;
    photoUrl?: string;
    bloodGroup?: string;
    age?: string | number;
    dob?: string;
    phone?: string;
    place?: string;
  };
  side?: "front" | "back" | "both";
  className?: string;
}

export default function UnionOfficialIdCard({
  member,
  side = "both",
  className = ""
}: UnionOfficialIdCardProps) {
  const districtName = member.district || "மதுரை";
  const displayMemberNo = formatMemberNumber(member.regNumber || "4016", districtName);
  const memberName = member.name || "மு.பிரகாசம்";
  const fatherName = member.fatherName || "சு. முனுசாமி";
  const occupation = member.occupation || "பெயிண்டர்";
  const bloodGroup = member.bloodGroup || "O+";
  const age = member.age || "38";
  const place = member.place || member.district || "மதுரை";
  const photoUrl = member.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400&h=500";

  // State Leaders Photos
  const leaderPhoto1 = "/s_michael_alvin.svg";
  const leaderPhoto2 = "/r_xavier_babu.svg";

  return (
    <div className={`space-y-8 flex flex-col items-center ${className}`}>
      
      {/* ======================================================== */}
      {/* FRONT CARD                                               */}
      {/* ======================================================== */}
      {(side === "front" || side === "both") && (
        <div 
          id="union-id-card-front"
          className="w-full max-w-[660px] aspect-[1.58/1] bg-white rounded-xl border-4 border-[#c80000] shadow-2xl overflow-hidden flex flex-col justify-between relative select-none"
          style={{ fontFamily: "'Mukta Malalar', 'Catamaran', 'Noto Sans Tamil', sans-serif" }}
        >
          {/* TOP RED HEADER BANNER */}
          <div className="bg-[#c80000] text-white px-3 py-2 flex items-center justify-between border-b-2 border-stone-900 shrink-0">
            {/* Left Circular Logo */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-yellow-400 flex flex-col items-center justify-center text-stone-950 p-1 shrink-0 shadow-md">
              <span className="text-[6px] md:text-[7px] font-extrabold tracking-tighter text-center leading-tight text-red-700">
                தமிழ்நாடு பெயிண்டர்கள்
              </span>
              <div className="text-[14px] md:text-[16px] my-0">✊</div>
              <span className="text-[7px] md:text-[8px] font-black tracking-tighter text-center leading-none text-black">
                TN PA²
              </span>
            </div>

            {/* Center Header Titles */}
            <div className="text-center space-y-0.5 px-2 flex-1">
              <h1 className="text-sm md:text-base lg:text-lg font-black tracking-wide text-white drop-shadow-sm leading-tight">
                தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள்
              </h1>
              <h2 className="text-sm md:text-base lg:text-lg font-black tracking-wide text-white drop-shadow-sm leading-tight">
                முன்னேற்ற சங்கம்
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-yellow-200 tracking-wide leading-tight">
                அரசு பதிவு எண் TNMDUJCLMDUTU-50-26-00044
              </p>
              <p className="text-[9px] md:text-[10px] font-bold text-white tracking-wide leading-tight">
                1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107
              </p>
            </div>

            {/* Right Circular Logo */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-yellow-400 flex flex-col items-center justify-center text-stone-950 p-1 shrink-0 shadow-md">
              <span className="text-[6px] md:text-[7px] font-extrabold tracking-tighter text-center leading-tight text-red-700">
                தமிழ்நாடு பெயிண்டர்கள்
              </span>
              <div className="text-[14px] md:text-[16px] my-0">✊</div>
              <span className="text-[7px] md:text-[8px] font-black tracking-tighter text-center leading-none text-black">
                TN PA²
              </span>
            </div>
          </div>

          {/* MIDDLE BODY SECTION */}
          <div className="px-6 py-4 flex-1 relative flex items-center justify-between overflow-hidden bg-white">
            
            {/* Background Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-8 border-[#c80000] flex flex-col items-center justify-center p-4 text-[#c80000] text-center">
                <span className="text-4xl md:text-5xl">✊</span>
                <span className="text-[10px] md:text-xs font-black leading-tight mt-1">
                  தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
                </span>
                <span className="text-sm font-black mt-1 tracking-widest">TN PA²</span>
              </div>
            </div>

            {/* Left Member Details List */}
            <div className="space-y-3.5 relative z-10 text-[#c80000] text-base md:text-lg font-black leading-snug">
              <div className="flex items-center gap-3">
                <span className="w-36 md:w-40 text-[#c80000] font-black">உறுப்பினர் எண்</span>
                <span className="text-[#c80000] font-black">:</span>
                <span className="text-[#c80000] font-mono font-black text-lg md:text-xl tracking-wider">
                  {displayMemberNo}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-36 md:w-40 text-[#c80000] font-black">உறுப்பினர் பெயர்</span>
                <span className="text-[#c80000] font-black">:</span>
                <span className="text-[#c80000] font-black text-lg md:text-xl">
                  {memberName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-36 md:w-40 text-[#c80000] font-black">உறுப்பினர் தொழில்</span>
                <span className="text-[#c80000] font-black">:</span>
                <span className="text-[#c80000] font-black text-lg md:text-xl">
                  {occupation}
                </span>
              </div>
            </div>

            {/* Right Member Passport Photo Box */}
            <div className="relative z-10 shrink-0">
              <div className="w-28 h-36 md:w-36 md:h-44 bg-white border-2 border-black rounded-sm shadow-md overflow-hidden flex items-center justify-center">
                <img 
                  src={photoUrl} 
                  alt="Member Photo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-none" 
                  style={{ imageRendering: "crisp-edges" }}
                />
              </div>
            </div>

          </div>

          {/* SIGNATURES ROW */}
          <div className="px-6 py-2 grid grid-cols-3 gap-2 border-t border-stone-300 text-center text-[10px] md:text-xs font-black text-stone-900 bg-white shrink-0">
            <div className="space-y-0.5">
              <div className="h-7 flex items-end justify-center font-serif italic font-bold text-stone-900 text-xs md:text-sm">
                S. Michael A.
              </div>
              <div className="font-black text-[#c80000] text-xs">மாநிலத் தலைவர்</div>
            </div>

            <div className="space-y-0.5">
              <div className="h-7 flex items-end justify-center font-serif italic font-bold text-stone-900 text-xs md:text-sm">
                R. Xavier Babu
              </div>
              <div className="font-black text-[#c80000] text-xs">மாநில பொதுச்செயலாளர்</div>
            </div>

            <div className="space-y-0.5">
              <div className="h-7 flex items-end justify-center font-serif italic font-bold text-stone-900 text-xs md:text-sm">
                R. Sakthivel
              </div>
              <div className="font-black text-[#c80000] text-xs">மாநில பொருளாளர்</div>
            </div>
          </div>

          {/* BOTTOM RED FOOTER BANNER */}
          <div className="bg-[#c80000] text-white py-1.5 px-6 flex justify-between items-center text-sm md:text-base font-black tracking-widest shrink-0">
            <span>உழைப்போம்.......</span>
            <span>உயர்வோம் ......</span>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* BACK CARD                                                */}
      {/* ======================================================== */}
      {(side === "back" || side === "both") && (
        <div 
          id="union-id-card-back"
          className="w-full max-w-[660px] aspect-[1.58/1] bg-white rounded-xl border-4 border-[#c80000] shadow-2xl overflow-hidden flex flex-col justify-between relative select-none"
          style={{ fontFamily: "'Mukta Malalar', 'Catamaran', 'Noto Sans Tamil', sans-serif" }}
        >
          {/* TOP RED HEADER BANNER */}
          <div className="bg-[#c80000] text-white px-3 py-2 flex items-center justify-between border-b-2 border-stone-900 shrink-0">
            {/* Left Circular Logo */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-yellow-400 flex flex-col items-center justify-center text-stone-950 p-1 shrink-0 shadow-md">
              <span className="text-[6px] md:text-[7px] font-extrabold tracking-tighter text-center leading-tight text-red-700">
                தமிழ்நாடு பெயிண்டர்கள்
              </span>
              <div className="text-[14px] md:text-[16px] my-0">✊</div>
              <span className="text-[7px] md:text-[8px] font-black tracking-tighter text-center leading-none text-black">
                TN PA²
              </span>
            </div>

            {/* Center Header Titles */}
            <div className="text-center space-y-0.5 px-2 flex-1">
              <h1 className="text-sm md:text-base lg:text-lg font-black tracking-wide text-white drop-shadow-sm leading-tight">
                தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள்
              </h1>
              <h2 className="text-sm md:text-base lg:text-lg font-black tracking-wide text-white drop-shadow-sm leading-tight">
                முன்னேற்ற சங்கம்
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-yellow-200 tracking-wide leading-tight">
                அரசு பதிவு எண் TNMDUJCLMDUTU-50-26-00044
              </p>
              <p className="text-[9px] md:text-[10px] font-bold text-white tracking-wide leading-tight">
                1/14 அம்பலக்காரன் பட்டி உத்தங்குடி மதுரை 625107
              </p>
            </div>

            {/* Right Circular Logo */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-yellow-400 flex flex-col items-center justify-center text-stone-950 p-1 shrink-0 shadow-md">
              <span className="text-[6px] md:text-[7px] font-extrabold tracking-tighter text-center leading-tight text-red-700">
                தமிழ்நாடு பெயிண்டர்கள்
              </span>
              <div className="text-[14px] md:text-[16px] my-0">✊</div>
              <span className="text-[7px] md:text-[8px] font-black tracking-tighter text-center leading-none text-black">
                TN PA²
              </span>
            </div>
          </div>

          {/* MIDDLE BODY SECTION (BACK) */}
          <div className="px-6 py-4 flex-1 relative flex items-center justify-between overflow-hidden bg-white">
            
            {/* Background Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-8 border-[#c80000] flex flex-col items-center justify-center p-4 text-[#c80000] text-center">
                <span className="text-4xl md:text-5xl">✊</span>
                <span className="text-[10px] md:text-xs font-black leading-tight mt-1">
                  தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
                </span>
                <span className="text-sm font-black mt-1 tracking-widest">TN PA²</span>
              </div>
            </div>

            {/* Left Member Details List (Back) */}
            <div className="space-y-3 relative z-10 text-[#c80000] text-base md:text-lg font-black leading-snug">
              <div className="flex items-center gap-3">
                <span className="w-32 md:w-36 text-[#c80000] font-black">தந்தை பெயர்</span>
                <span className="text-[#c80000] font-black">:</span>
                <span className="text-[#c80000] font-black text-lg md:text-xl">
                  {fatherName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-32 md:w-36 text-[#c80000] font-black">வயது</span>
                <span className="text-[#c80000] font-black">:</span>
                <span className="text-[#c80000] font-black text-lg md:text-xl">
                  {age}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-32 md:w-36 text-[#c80000] font-black">ரத்த வகை</span>
                <span className="text-[#c80000] font-black">:</span>
                <span className="text-[#c80000] font-black text-lg md:text-xl">
                  {bloodGroup}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-32 md:w-36 text-[#c80000] font-black">இருப்பிடம்</span>
                <span className="text-[#c80000] font-black">:</span>
                <span className="text-[#c80000] font-black text-lg md:text-xl">
                  {place}
                </span>
              </div>
            </div>

            {/* Right Side: Govt Seal & Leaders */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 shrink-0 pl-2">
              <div className="text-xs md:text-sm font-black text-[#c80000] tracking-wide">
                தமிழ்நாடு அரசு அனுமதி பெற்ற சங்கம்
              </div>

              {/* Tamil Nadu Govt Emblem Seal */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-emerald-600 bg-white p-1 flex items-center justify-center shadow-sm">
                <div className="text-center flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl leading-none">🏛️</span>
                  <span className="text-[7px] md:text-[8px] font-black text-emerald-800 leading-tight">
                    தமிழ்நாடு அரசு
                  </span>
                </div>
              </div>

              {/* Two Leaders Photos */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="w-10 h-12 md:w-12 md:h-14 bg-stone-100 border border-stone-800 rounded-sm overflow-hidden shadow-sm">
                  <img src={leaderPhoto1} alt="Leader 1" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-12 md:w-12 md:h-14 bg-stone-100 border border-stone-800 rounded-sm overflow-hidden shadow-sm">
                  <img src={leaderPhoto2} alt="Leader 2" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="text-[10px] md:text-xs font-black text-[#c80000] leading-tight space-y-0.5">
                <div>ஒன்றுபடுவோம்!</div>
                <div>உரிமையை மீட்போம்.</div>
              </div>
            </div>

          </div>

          {/* BOTTOM RED FOOTER BANNER (BACK) */}
          <div className="bg-[#c80000] text-white py-1.5 px-6 flex justify-between items-center text-xs md:text-sm font-black tracking-widest shrink-0">
            <span>TN PA² STATE UNION</span>
            <span>SECURE DIGITAL ID</span>
          </div>

        </div>
      )}

    </div>
  );
}
