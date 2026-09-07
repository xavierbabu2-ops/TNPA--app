import React, { useState, useMemo } from "react";
import { 
  Users, Shield, Phone, MapPin, Search, Filter, ChevronRight, 
  Award, Sparkles, UserCheck, Flame, Building2, Layers, Globe, CheckCircle2, ArrowRight, UserPlus
} from "lucide-react";
import { ALL_38_TAMILNADU_DISTRICTS, INITIAL_EXECUTIVE_MEMBERS } from "../data/initialExecutives";
import { loadAllDistrictInCharges, isFakeInCharge } from "../utils/districtInChargeStorage";

interface DistrictHierarchyDirectoryProps {
  lang: "ta" | "en";
  onClose?: () => void;
}

export default function DistrictHierarchyDirectory({ lang, onClose }: DistrictHierarchyDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Load genuine registered in-charges only (strictly no fake data)
  const registeredInCharges = useMemo(() => {
    return loadAllDistrictInCharges().filter(p => !isFakeInCharge(p));
  }, []);

  // Build directory for all 38 districts based on genuine registrations
  const directoryList = useMemo(() => {
    return ALL_38_TAMILNADU_DISTRICTS.map((dist) => {
      const code = dist.code.toUpperCase();
      const distIncharges = registeredInCharges.filter(
        i => i.districtCode?.toUpperCase() === code || i.districtTa === dist.ta
      );

      const pres = distIncharges.find(i => i.category === "district_leader" && i.role.includes("தலைவர்"));
      const sec = distIncharges.find(i => i.category === "district_leader" && i.role.includes("செயலாளர்"));
      const tres = distIncharges.find(i => i.category === "district_leader" && i.role.includes("பொருளாளர்"));

      const executives = distIncharges.filter(i => i.category === "district_executive");
      const towns = distIncharges.filter(i => i.category === "town_incharge");
      const unions = distIncharges.filter(i => i.category === "union_incharge");

      return {
        id: `dist_${dist.code.toLowerCase()}`,
        districtTa: dist.ta,
        districtEn: dist.en,
        code: dist.code,
        zone: `${dist.zone} மண்டலம்`,
        zoneEn: `${dist.zone} Zone`,
        president: pres ? { name: pres.name, nameEn: pres.nameEn || pres.name, phone: pres.phone } : null,
        secretary: sec ? { name: sec.name, nameEn: sec.nameEn || sec.name, phone: sec.phone } : null,
        treasurer: tres ? { name: tres.name, nameEn: tres.nameEn || tres.name, phone: tres.phone } : null,
        executives,
        towns,
        unions
      };
    });
  }, [registeredInCharges]);

  const filteredDistricts = directoryList.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      item.districtTa.toLowerCase().includes(term) ||
      item.districtEn.toLowerCase().includes(term) ||
      (item.president && item.president.name.toLowerCase().includes(term)) ||
      (item.secretary && item.secretary.name.toLowerCase().includes(term));

    const matchesZone = selectedZone === "all" || item.zone.includes(selectedZone);
    return matchesSearch && matchesZone;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-[fadeIn_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex justify-between items-center border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600/30 text-rose-300 font-extrabold text-[10px] uppercase border border-rose-500/40">
                {lang === "ta" ? "38 மாவட்டங்கள் அதிகாரப்பூர்வ நிர்வாகிகள் பட்டியல்" : "38 Districts Official Executive Directory"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black">
              {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கம் (TNPA²)" : "Tamil Nadu Painters & Artists Association (TNPA²)"}
            </h2>
            <p className="text-stone-400 text-xs mt-0.5">
              {lang === "ta" ? "உண்மையான பதிவு செய்யப்பட்ட பொறுப்பாளர்கள் மட்டுமே இதில் காட்சியளிப்பார்கள்." : "Only verified registered in-charges are displayed."}
            </p>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {lang === "ta" ? "மூடுக (Close)" : "Close"}
            </button>
          )}
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-stone-50 p-4 sm:p-5 border-b border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === "ta" ? "மாவட்டம் அல்லது தலைவர் பெயர் தேடுக..." : "Search district or leader name..."}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
            />
          </div>

          <div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 cursor-pointer"
            >
              <option value="all">{lang === "ta" ? "அனைத்து மண்டலங்களும் (All Zones)" : "All Zones"}</option>
              <option value="வடக்கு">{lang === "ta" ? "வடக்கு மண்டலம் (North Zone)" : "North Zone"}</option>
              <option value="தெற்கு">{lang === "ta" ? "தெற்கு மண்டலம் (South Zone)" : "South Zone"}</option>
              <option value="மத்திய">{lang === "ta" ? "மத்திய மண்டலம் (Central Zone)" : "Central Zone"}</option>
              <option value="கிழக்கு">{lang === "ta" ? "கிழக்கு மண்டலம் (East Zone)" : "East Zone"}</option>
              <option value="மேற்கு">{lang === "ta" ? "மேற்கு மண்டலம் (West Zone)" : "West Zone"}</option>
            </select>
          </div>
        </div>

        {/* Content Directory Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDistricts.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#b91c1c] text-white flex items-center justify-center font-black text-xs">
                        {item.code}
                      </div>
                      <div>
                        <h3 className="font-black text-stone-900 text-base">{item.districtTa}</h3>
                        <p className="text-[11px] font-semibold text-stone-500">{item.districtEn} District</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-stone-100 px-2 py-0.5 rounded-full text-stone-600 border border-stone-200">
                      {item.zone}
                    </span>
                  </div>

                  {/* Leaders List */}
                  <div className="space-y-2 text-xs">
                    {/* President */}
                    <div className="p-2.5 bg-stone-50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 block uppercase">மாவட்டத் தலைவர்</span>
                        <span className="font-black text-stone-800">
                          {item.president ? item.president.name : "இன்னும் நியமிக்கப்படவில்லை"}
                        </span>
                      </div>
                      {item.president?.phone && (
                        <a href={`tel:${item.president.phone}`} className="flex items-center gap-1 text-emerald-700 font-bold hover:underline">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{item.president.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Secretary */}
                    <div className="p-2.5 bg-stone-50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 block uppercase">மாவட்டச் செயலாளர்</span>
                        <span className="font-black text-stone-800">
                          {item.secretary ? item.secretary.name : "இன்னும் நியமிக்கப்படவில்லை"}
                        </span>
                      </div>
                      {item.secretary?.phone && (
                        <a href={`tel:${item.secretary.phone}`} className="flex items-center gap-1 text-emerald-700 font-bold hover:underline">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{item.secretary.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Treasurer */}
                    <div className="p-2.5 bg-stone-50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 block uppercase">மாவட்டப் பொருளாளர்</span>
                        <span className="font-black text-stone-800">
                          {item.treasurer ? item.treasurer.name : "இன்னும் நியமிக்கப்படவில்லை"}
                        </span>
                      </div>
                      {item.treasurer?.phone && (
                        <a href={`tel:${item.treasurer.phone}`} className="flex items-center gap-1 text-emerald-700 font-bold hover:underline">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{item.treasurer.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>
                    பதிவு செய்யப்பட்ட பொறுப்பாளர்கள்: <strong className="text-stone-900">{item.towns.length + item.unions.length + item.executives.length}</strong>
                  </span>
                  <span className="font-mono text-[10px] text-stone-400 font-bold">
                    Super Key பாதுகாக்கப்பட்டது
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-between items-center text-xs text-stone-600">
          <span>மொத்த மாவட்டங்கள்: <strong>38</strong></span>
          <p className="text-[11px] text-stone-500">
            பொறுப்பாளர்களை நியமிக்க <strong>"38 மாவட்ட பக்கங்கள் & நியமனம்"</strong> பகுதிக்குச் செல்லவும்.
          </p>
        </div>

      </div>
    </div>
  );
}
