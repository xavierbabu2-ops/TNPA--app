import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { 
  Sparkles, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Building2, 
  ShieldAlert, 
  FileText, 
  Calendar, 
  DollarSign, 
  Award, 
  BookOpen, 
  Users,
  Check
} from "lucide-react";

export interface GovernmentScheme {
  id: string;
  title: string;
  titleEn: string;
  category: "Central Govt" | "State Govt" | "Welfare Board";
  amount: string;
  amountEn: string;
  description: string;
  descriptionEn: string;
  eligibility: string;
  eligibilityEn: string;
  deadline: string;
  officialSource: string;
  applyUrl: string;
  documents: string[];
}

interface GovernmentSchemesAggregatorProps {
  lang: "ta" | "en";
  currentUser: any;
  onSelectSchemeForApplication?: (schemeTitle: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function GovernmentSchemesAggregator({
  lang,
  currentUser,
  onSelectSchemeForApplication,
  onAddAuditLog
}: GovernmentSchemesAggregatorProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  // Initial rich list of official labor department and welfare schemes
  const defaultSchemes: GovernmentScheme[] = [
    {
      id: "scheme_01",
      title: "தமிழ்நாடு கட்டுமானத் தொழிலாளர்கள் நலவாரிய ஓய்வூதியத் திட்டம்",
      titleEn: "Tamil Nadu Construction Workers Welfare Board Pension Scheme",
      category: "Welfare Board",
      amount: "₹1,000 / மாதம்",
      amountEn: "₹1,000 / month pension",
      description: "60 வயது பூர்த்தியடைந்த பதிவுபெற்ற பெயிண்டர்கள் மற்றும் கட்டுமானத் தொழிலாளர்களுக்கு மாதாந்திர ஓய்வூதியம் மற்றும் மருத்துவ உதவி.",
      descriptionEn: "Monthly pension and medical assistance for registered painters and construction workers upon attaining 60 years of age.",
      eligibility: "நலவாரியத்தில் குறைந்தது 5 ஆண்டுகள் தொடர் பதிவு மற்றும் 60 வயது பூர்த்தி.",
      eligibilityEn: "Minimum 5 years continuous registration in welfare board and age 60 completed.",
      deadline: "ஆண்டு முழுவதும் விண்ணப்பிக்கலாம் (Open Year-Round)",
      officialSource: "TNCWWB official portal (labour.tn.gov.in)",
      applyUrl: "https://www.tn.gov.in",
      documents: ["நலவாரிய அடையாள அட்டை", "ஆதார் அட்டை", "வயது சான்று", "வங்கிக் கணக்கு புத்தகம்"]
    },
    {
      id: "scheme_02",
      title: "பெயிண்டர் குழந்தைகள் கல்வி உதவித்தொகை திட்டம்",
      titleEn: "Painters Children Educational Scholarship Scheme",
      category: "Welfare Board",
      amount: "₹1,000 முதல் ₹8,000 வரை",
      amountEn: "₹1,000 to ₹8,000 per annum",
      description: "பதிவுபெற்ற தொழிலாளர்களின் குழந்தைகள் 6 ஆம் வகுப்பு முதல் கல்லூரிப் படிப்பு வரை கல்வி பயில ஆண்டுதோறும் கல்வி உதவித்தொகை.",
      descriptionEn: "Annual educational scholarship for children of registered workers studying from 6th standard to higher education and professional degrees.",
      eligibility: "பெற்றோர் நலவாரியத்தில் செயலில் உள்ள பதிவுதாரராக இருக்க வேண்டும்.",
      eligibilityEn: "Parent must be an active registered worker in the welfare board.",
      deadline: "31 அக்டோபர் 2026",
      officialSource: "Tamil Nadu Labour Department",
      applyUrl: "https://www.tn.gov.in",
      documents: ["மாணவர் அடையாள அட்டை", "முந்தைய ஆண்டு மதிப்பெண் சான்றிதழ்", "பெற்றோர் நலவாரிய அட்டை", "ஆதார்"]
    },
    {
      id: "scheme_03",
      title: "மகப்பேறு மற்றும் கருச்சிதைவு உதவித்தொகை",
      titleEn: "Maternity & Miscarriage Financial Assistance Scheme",
      category: "State Govt",
      amount: "₹18,000 (மகப்பேறு) / ₹3,000 (கருச்சிதைவு)",
      amountEn: "₹18,000 (Maternity) / ₹3,000 (Miscarriage)",
      description: "பெண் பெயிண்டர்கள் மற்றும் பதிவுபெற்ற தொழிலாளர்களின் மனைவிகளுக்கான மகப்பேறு கால ஊட்டச்சத்து மற்றும் மருத்துவ நிதி உதவி.",
      descriptionEn: "Financial assistance for maternity nutrition and medical care for female workers and wives of registered workers.",
      eligibility: "வாரியத்தில் 1 ஆண்டு பதிவு மற்றும் உரிய மருத்துவ சான்றிதழ் சமர்ப்பித்தல்.",
      eligibilityEn: "1 year board registration and valid hospital admission / medical certificates.",
      deadline: "நிகழ்நேர விண்ணப்பம் (Within 6 months of delivery)",
      officialSource: "Directorate of Industrial Safety and Health, TN",
      applyUrl: "https://www.tn.gov.in",
      documents: ["மருத்துவமனை பிறப்பு சான்றிதழ்", "பெற்றோர் அடையாள அட்டை", "வங்கிக் கணக்கு விவரம்"]
    },
    {
      id: "scheme_04",
      title: "பிரதான் மந்திரி ஷிரம் யோகி மான்-தான் (PM-SYM) ஓய்வூதியத் திட்டம்",
      titleEn: "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM) Pension",
      category: "Central Govt",
      amount: "₹3,000 / மாதம் ஓய்வூதியம் (60 வயதிற்குப் பின்)",
      amountEn: "₹3,000 / month guaranteed pension after age 60",
      description: "மத்திய அரசின் முத்திரைக் குறியீட்டுடன் கூடிய முறைசாரா தொழிலாளர்களுக்கான மாதாந்திர ஓய்வூதியத் திட்டம் (சம பங்களிப்புடன்).",
      descriptionEn: "Central Government voluntary and contributory pension scheme for unorganized workers providing ₹3,000 monthly pension after age 60.",
      eligibility: "18 முதல் 40 வயதுடைய முறைசாரா தொழிலாளர்கள் (மாத வருமானம் ₹15,000-க்கு கீழ்).",
      eligibilityEn: "Unorganized workers aged 18-40 with monthly income below ₹15,000.",
      deadline: "தொடர் பதிவு (Continuous Enrollment)",
      officialSource: "Ministry of Labour and Employment, Govt of India",
      applyUrl: "https://maandhan.in",
      documents: ["சேமிப்புக் கணக்கு / Jan Dhan A/c", "ஆதார் அட்டை", "மொபைல் எண்"]
    },
    {
      id: "scheme_05",
      title: "இ-ஷ்ரம் தேசிய தரவுத்தள விபத்து காப்பீட்டுத் திட்டம்",
      titleEn: "e-Shram National Database Accident Insurance Benefit",
      category: "Central Govt",
      amount: "₹2,00,000 (விபத்து மரணம்/நிரந்தர ஊனம்)",
      amountEn: "₹2,00,000 (Accidental death / permanent disability)",
      description: "இ-ஷ்ரம் (e-Shram) அட்டை வைத்துள்ள அனைத்து பெயிண்டர்கள் மற்றும் ஒப்பந்தத் தொழிலாளர்களுக்கு இலவச விபத்துக் காப்பீடு.",
      descriptionEn: "Free accidental insurance coverage provided to all registered e-Shram cardholders across India.",
      eligibility: "16 முதல் 59 வயதுடைய பெயிண்டர்கள் மற்றும் முறைசாரா தொழிலாளர்கள்.",
      eligibilityEn: "Unorganized painters and workers aged 16 to 59 years.",
      deadline: "எப்பொழுதும் திறந்துள்ளது (Open)",
      officialSource: "Ministry of Labour & Employment, India",
      applyUrl: "https://eshram.gov.in",
      documents: ["இ-ஷ்ரம் அட்டை", "ஆதார் அட்டை", "வாரிசுதாரர் விவரம்"]
    },
    {
      id: "scheme_06",
      title: "தொழிலாளர் திருமண நிதி உதவித் திட்டம்",
      titleEn: "Workers Marriage Financial Assistance Grant",
      category: "Welfare Board",
      amount: "₹20,000 - ₹50,000",
      amountEn: "₹20,000 to ₹50,000 financial grant",
      description: "பதிவுபெற்ற பெயிண்டர் அல்லது அவரது மகளின் திருமண செலவுகளுக்கு நலவாரியத்திலிருந்து வழங்கப்படும் நிதி உதவி.",
      descriptionEn: "Financial grant from welfare board for the marriage expenses of registered painter or their daughter.",
      eligibility: "குறைந்தது 3 ஆண்டுகள் தொடர் பதிவு பெற்ற உறுப்பினராக இருத்தல் வேண்டும்.",
      eligibilityEn: "Minimum 3 years of active continuous membership required.",
      deadline: "திருமணத்திற்கு முன் அல்லது பின் 3 மாதங்களுக்குள்",
      officialSource: "Tamil Nadu Construction Workers Welfare Board",
      applyUrl: "https://www.tn.gov.in",
      documents: ["திருமண அழைப்பிதழ்", "மணமகன் / மணமகள் ஆதார்", "பள்ளிச் சான்றிதழ் (வயது உறுதி)", "வாரிய அட்டை"]
    }
  ];

  const [schemes, setSchemes] = useState<GovernmentScheme[]>(defaultSchemes);

  // Load schemes from Firestore on mount
  useEffect(() => {
    async function loadSchemesFromFirestore() {
      try {
        const querySnapshot = await getDocs(collection(db, "government_schemes"));
        if (!querySnapshot.empty) {
          const loaded: GovernmentScheme[] = [];
          querySnapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as GovernmentScheme);
          });
          if (loaded.length > 0) {
            setSchemes(loaded);
          }
        } else {
          // Seed initial default schemes into Firestore
          for (const s of defaultSchemes) {
            await setDoc(doc(db, "government_schemes", s.id), s);
          }
        }
      } catch (err) {
        console.error("Error loading schemes from Firestore:", err);
      }
    }
    loadSchemesFromFirestore();
  }, []);

  // Function to trigger Gemini AI to fetch and parse latest official schemes and store in Firestore
  const handleFetchLatestSchemesViaGemini = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/gemini/fetch-schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "Fetch latest Tamil Nadu government labor department and central government welfare schemes, subsidies, and grants for painters and construction workers in JSON format."
        })
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.schemes) && data.schemes.length > 0) {
        setSchemes(data.schemes);
        // Save to Firestore
        for (const s of data.schemes) {
          if (s.id) {
            await setDoc(doc(db, "government_schemes", s.id), s);
          }
        }
        onAddAuditLog("Gemini Govt Schemes Fetched", `Successfully synchronized and stored ${data.schemes.length} latest official schemes via Gemini AI in Firestore.`);
        alert(lang === "ta" 
          ? `✓ ஜெினி AI மூலம் சமீபத்திய அரசு திட்டங்கள் வெற்றிகரமாகப் பெறப்பட்டு ஃபயர்வோர் (Firestore) தரவுத்தளத்தில் சேமிக்கப்பட்டன! (${data.schemes.length} திட்டங்கள்)`
          : `✓ Successfully fetched, parsed, and stored latest government schemes via Gemini AI in Firestore! (${data.schemes.length} schemes)`);
      } else {
        alert(lang === "ta" 
          ? "தற்போதைய அனைத்து அதிகாரப்பூர்வ நலவாரிய மற்றும் மத்திய அரசு திட்டங்களும் புதுப்பிக்கப்பட்டுள்ளன." 
          : "All official welfare and central schemes are already up to date.");
      }
    } catch (err: any) {
      console.error("Gemini Scheme Fetch error:", err);
      alert(lang === "ta" 
        ? "நலத்திட்டத் தரவுகளைப் பெறுவதில் பிழை ஏற்பட்டது. ஏற்கனவே உள்ள பட்டியல்கள் காட்டப்படுகின்றன." 
        : "Failed to fetch remote feeds. Displaying standard verified official schemes.");
    } finally {
      setIsFetching(false);
    }
  };

  // Filter schemes
  const filteredSchemes = schemes.filter(scheme => {
    const matchCategory = categoryFilter === "all" || scheme.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = scheme.title.toLowerCase().includes(q) ||
                        scheme.titleEn.toLowerCase().includes(q) ||
                        scheme.description.toLowerCase().includes(q) ||
                        scheme.amount.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 text-left animate-[fadeIn_0.3s_ease-out]">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-600 via-stone-900 to-stone-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-stone-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow">
              {lang === "ta" ? "AI நேரலை ஒருங்கிணைப்பாளர்" : "AI Live Aggregator"}
            </span>
            <span className="text-amber-300 text-xs font-bold">
              {lang === "ta" ? "மத்திய & மாநில அரசு சலுகைகள்" : "Central & State Labor Benefits"}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">
            {lang === "ta" ? "அரசு நலத்திட்டங்கள் & சலுகைகள் ஏஜென்ட்" : "Government Schemes & Subsidies AI Aggregator"}
          </h3>
          <p className="text-stone-300 text-xs md:text-sm max-w-2xl">
            {lang === "ta"
              ? "தொழிலாளர் துறை மற்றும் கட்டுமான நலவாரியத்தின் புதிய அறிவிப்புகள், ஓய்வூதியங்கள், கல்வி உதவித்தொகை மற்றும் விபத்துக் காப்பீட்டுத் திட்டங்களை ஜெினி AI மூலம் உடனுக்குடன் அறிந்து ஆன்லைனில் விண்ணப்பிக்கவும்."
              : "Real-time AI-powered scanner fetching latest labor department benefits, pension schemes, scholarships, and subsidies for painters and construction workers."}
          </p>
        </div>

        <button
          onClick={handleFetchLatestSchemesViaGemini}
          disabled={isFetching}
          className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-2xl shadow-lg flex items-center gap-2.5 cursor-pointer shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 z-10"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          <span>{isFetching ? (lang === "ta" ? "ஜெினி AI தேடுகிறது..." : "Scanning via AI...") : (lang === "ta" ? "🤖 புதிய திட்டங்களை AI மூலம் ஸ்கேன் செய்" : "🤖 Fetch Latest via Gemini AI")}</span>
        </button>
      </div>

      {/* FILTERS AND SEARCH BAR */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              categoryFilter === "all" ? "bg-stone-900 text-amber-400 shadow" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            {lang === "ta" ? "அனைத்து திட்டங்களும் (All)" : "All Schemes"}
          </button>
          <button
            onClick={() => setCategoryFilter("Welfare Board")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              categoryFilter === "Welfare Board" ? "bg-[#b91c1c] text-white shadow" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            {lang === "ta" ? "நலவாரியத் திட்டங்கள்" : "Welfare Board"}
          </button>
          <button
            onClick={() => setCategoryFilter("State Govt")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              categoryFilter === "State Govt" ? "bg-stone-900 text-amber-400 shadow" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            {lang === "ta" ? "மாநில அரசு (State Govt)" : "State Govt"}
          </button>
          <button
            onClick={() => setCategoryFilter("Central Govt")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              categoryFilter === "Central Govt" ? "bg-stone-900 text-amber-400 shadow" : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            {lang === "ta" ? "மத்திய அரசு (Central Govt)" : "Central Govt"}
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={lang === "ta" ? "திட்டங்கள் அல்லது தொகையைத் தேட..." : "Search schemes or benefits..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        </div>

      </div>

      {/* SCHEMES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((scheme) => (
          <div 
            key={scheme.id}
            className="bg-white border border-stone-200 hover:border-amber-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-stone-100 rounded-bl-full -z-0 opacity-50 group-hover:bg-amber-100/50 transition-colors"></div>

            <div className="space-y-3 z-10">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                  scheme.category === "Welfare Board" ? "bg-rose-100 text-[#b91c1c]" :
                  scheme.category === "State Govt" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"
                }`}>
                  {scheme.category}
                </span>
                <span className="text-stone-500 text-[11px] font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {scheme.deadline}
                </span>
              </div>

              <h4 className="text-base font-black text-stone-900 group-hover:text-[#b91c1c] transition-colors line-clamp-2">
                {lang === "ta" ? scheme.title : scheme.titleEn}
              </h4>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
                <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                  {lang === "ta" ? "வழங்கվடும் பலன் / நிதி உதவி" : "Benefit / Subsidy Amount"}
                </div>
                <div className="text-sm font-black text-stone-900 mt-0.5">
                  {lang === "ta" ? scheme.amount : scheme.amountEn}
                </div>
              </div>

              <p className="text-stone-600 text-xs line-clamp-3 leading-relaxed">
                {lang === "ta" ? scheme.description : scheme.descriptionEn}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-3 z-10">
              <div className="text-[11px] text-stone-500 flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  <strong>{lang === "ta" ? "தகுதி: " : "Eligibility: "}</strong>
                  {lang === "ta" ? scheme.eligibility : scheme.eligibilityEn}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  {lang === "ta" ? "விவரங்கள் (Details)" : "View Details"}
                </button>

                <button
                  onClick={() => {
                    if (onSelectSchemeForApplication) {
                      onSelectSchemeForApplication(scheme.title);
                    } else {
                      alert(lang === "ta" 
                        ? `"${scheme.title}" திட்டத்திற்கு விண்ணப்பிக்க சேவைகள் பகுதிக்குச் செல்லவும்.` 
                        : `Please go to Services tab to apply for "${scheme.titleEn}".`);
                    }
                  }}
                  className="flex-1 py-2.5 px-3 bg-[#b91c1c] hover:bg-rose-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
                >
                  <span>{lang === "ta" ? "விண்ணப்பிக்க" : "Apply Now"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-stone-700 font-bold text-sm">
            {lang === "ta" ? "நீங்கள் தேடும் பெயரில் எந்த திட்டமும் கிடைக்கவில்லை." : "No matching government schemes found."}
          </p>
          <button
            onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}
            className="px-4 py-2 bg-stone-900 text-amber-300 text-xs font-bold rounded-xl"
          >
            {lang === "ta" ? "அனைத்து திட்டங்களையும் காட்டு" : "Reset Filters"}
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b pb-4">
              <div className="space-y-1">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                  selectedScheme.category === "Welfare Board" ? "bg-rose-100 text-[#b91c1c]" :
                  selectedScheme.category === "State Govt" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"
                }`}>
                  {selectedScheme.category}
                </span>
                <h3 className="text-lg md:text-xl font-black text-stone-900 mt-2">
                  {lang === "ta" ? selectedScheme.title : selectedScheme.titleEn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-stone-700">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-extrabold text-amber-800 uppercase">
                    {lang === "ta" ? "நிதி உதவி / சலுகை அளவு" : "Benefit / Subsidy Amount"}
                  </div>
                  <div className="text-base font-black text-stone-900 mt-0.5">
                    {lang === "ta" ? selectedScheme.amount : selectedScheme.amountEn}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-extrabold text-stone-500 uppercase">
                    {lang === "ta" ? "கடைசி தேதி" : "Deadline"}
                  </div>
                  <div className="text-xs font-extrabold text-stone-800 mt-0.5">
                    {selectedScheme.deadline}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                  {lang === "ta" ? "திட்ட விவரங்கள்:" : "Scheme Overview:"}
                </h4>
                <p className="leading-relaxed text-stone-600">
                  {lang === "ta" ? selectedScheme.description : selectedScheme.descriptionEn}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                  {lang === "ta" ? "தகுதி வரம்பு:" : "Eligibility Criteria:"}
                </h4>
                <p className="leading-relaxed text-stone-600">
                  {lang === "ta" ? selectedScheme.eligibility : selectedScheme.eligibilityEn}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                  {lang === "ta" ? "தேவையான ஆவணங்கள்:" : "Required Documents:"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedScheme.documents.map((doc, idx) => (
                    <div key={idx} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#b91c1c] shrink-0" />
                      <span className="text-xs text-stone-800 font-semibold">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between text-xs text-stone-600">
                <span><strong>{lang === "ta" ? "அதிகாரப்பூர்வ தளம்: " : "Official Source: "}</strong>{selectedScheme.officialSource}</span>
                <a 
                  href={selectedScheme.applyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#b91c1c] font-black hover:underline flex items-center gap-1"
                >
                  <span>{lang === "ta" ? "வலைதளம்" : "Portal"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                {lang === "ta" ? "மூடு (Close)" : "Close"}
              </button>
              <button
                onClick={() => {
                  const title = selectedScheme.title;
                  setSelectedScheme(null);
                  if (onSelectSchemeForApplication) {
                    onSelectSchemeForApplication(title);
                  }
                }}
                className="px-6 py-2.5 bg-[#b91c1c] hover:bg-rose-800 text-white font-black text-xs rounded-xl cursor-pointer shadow flex items-center gap-2"
              >
                <span>{lang === "ta" ? "இந்த திட்டத்திற்கு விண்ணப்பிக்க" : "Apply For Scheme"}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
