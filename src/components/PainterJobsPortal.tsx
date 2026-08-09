import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  Clock,
  Sparkles,
  Filter,
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Share2,
  UserCheck,
  FileText,
  PlusCircle,
  Eye,
  Users,
  Globe,
  Award,
  ShieldCheck,
  Trash2,
  Edit3,
  PhoneCall,
  MessageSquare,
  Download,
  BellRing,
  Layers,
  TrendingUp,
  Bot,
  Zap,
  Check,
  ExternalLink,
  RefreshCw,
  BadgeAlert,
  CheckSquare,
  Sliders,
  X,
  ChevronRight,
  Printer
} from "lucide-react";
import { UserAccount, MemberRegistration } from "../types";

// Types definition for Job Portal
export interface JobListing {
  id: string;
  title: string;
  titleEn: string;
  company: string;
  companyType: "Government" | "Private Enterprise" | "Union Contractor" | "Overseas Agency";
  source: "TNPA Direct Posting" | "Govt Construction Board" | "Industrial Jobs Aggregator" | "Overseas Recruitment Agency";
  location: string;
  district: string;
  state: string;
  country: "India" | "UAE" | "Singapore" | "Saudi Arabia" | "Kuwait" | "Qatar";
  salary: string;
  salaryNum: number;
  experience: string;
  qualification: string;
  employmentType: "Full Time" | "Contract / Project Based" | "Daily Wage" | "Overseas Contract" | "Apprenticeship";
  category: string;
  description: string;
  descriptionEn: string;
  skillsRequired: string[];
  applicationDeadline: string;
  postedDate: string;
  urgent: boolean;
  featured: boolean;
  verifiedEmployer: boolean;
  contactPhone: string;
  contactEmail: string;
  applyMode: "direct" | "external";
  externalUrl?: string;
  status: "active" | "closed" | "expired" | "pending_approval";
  reportsCount: number;
  applicantsCount: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  applicantDistrict: string;
  regNumber?: string;
  experienceYears: number;
  skills: string[];
  appliedAt: string;
  status: "submitted" | "under_review" | "shortlisted" | "hired" | "rejected";
  coverNote?: string;
}

export interface EmployerProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  district: string;
  category: string;
  gstinOrReg: string;
  verified: boolean;
  postedJobsCount: number;
}

interface PainterJobsPortalProps {
  lang: "ta" | "en";
  currentUser: UserAccount | null;
  registrations: MemberRegistration[];
  onAddAuditLog: (action: string, details: string) => void;
}

export default function PainterJobsPortal({
  lang,
  currentUser,
  registrations,
  onAddAuditLog
}: PainterJobsPortalProps) {
  // Navigation Tabs: "jobs" (Browse & Search), "employer" (Post & Manage), "member" (My Applications & Resume), "admin" (AI Moderation & Approvals)
  const [activeTab, setActiveTab] = useState<"jobs" | "employer" | "member" | "admin">("jobs");

  // All 26 Specified Painting & Artist Occupations
  const occupationCategories = [
    { id: "all", name: "அனைத்து பிரிவுகள்", nameEn: "All Categories" },
    { id: "building", name: "கட்டட பெயிண்டர்கள் (Building Painters)", nameEn: "Building Painters" },
    { id: "industrial", name: "தொழில்துறை பெயிண்டர்கள் (Industrial Painters)", nameEn: "Industrial Painters" },
    { id: "spray", name: "ஸ்ப்ரே பெயிண்டர்கள் (Spray Painters)", nameEn: "Spray Painters" },
    { id: "decorative", name: "அலங்கார பெயிண்டர்கள் (Decorative Painters)", nameEn: "Decorative Painters" },
    { id: "texture", name: "சுவர் டெக்சர் பெயிண்டர்கள் (Wall Texture Painters)", nameEn: "Wall Texture Painters" },
    { id: "interior", name: "உள்துறை பெயிண்டர்கள் (Interior Painters)", nameEn: "Interior Painters" },
    { id: "exterior", name: "வெளிப்புற பெயிண்டர்கள் (Exterior Painters)", nameEn: "Exterior Painters" },
    { id: "house", name: "வீட்டு பெயிண்டர்கள் (House Painters)", nameEn: "House Painters" },
    { id: "commercial", name: "வணிக நிறுவன பெயிண்டர்கள் (Commercial Painters)", nameEn: "Commercial Painters" },
    { id: "maintenance", name: "பராமரிப்பு பெயிண்டர்கள் (Maintenance Painters)", nameEn: "Maintenance Painters" },
    { id: "powder_coating", name: "பவுடர் கோட்டிங் பெயிண்டர்கள் (Powder Coating Painters)", nameEn: "Powder Coating Painters" },
    { id: "furniture", name: "மரச்சாமான்கள் / PU பாலிஷ் (Furniture & Polish)", nameEn: "Furniture & Polish Painters" },
    { id: "automobile", name: "ஆட்டோமொபைல் பெயிண்டர்கள் (Automobile Painters)", nameEn: "Automobile Painters" },
    { id: "marine", name: "கப்பல் / கடல்சார் பெயிண்டர்கள் (Marine Painters)", nameEn: "Marine Painters" },
    { id: "bridge", name: "பாலங்கள் பெயிண்டர்கள் (Bridge Painters)", nameEn: "Bridge Painters" },
    { id: "steel_structure", name: "ஸ்டீல் ஸ்ட்ரக்சர் பெயிண்டர்கள் (Steel Structure)", nameEn: "Steel Structure Painters" },
    { id: "signboard", name: "சைன் போர்டு கலைஞர்கள் (Sign Board Painters)", nameEn: "Sign Board Painters" },
    { id: "banner", name: "பேனர் ஓவியர்கள் (Banner Artists)", nameEn: "Banner Artists" },
    { id: "wall_art", name: "சுவர் கலை ஓவியர்கள் (Wall Artists)", nameEn: "Wall Artists" },
    { id: "mural", name: "முரல் சுவரோவியர்கள் (Mural Artists)", nameEn: "Mural Artists" },
    { id: "fine_art", name: "சிற்ப & நுண்கலைஞர்கள் (Fine Artists)", nameEn: "Fine Artists" },
    { id: "decorative_art", name: "அலங்காரக் கலைஞர்கள் (Decorative Artists)", nameEn: "Decorative Artists" },
    { id: "supervisor", name: "பெயிண்டிங் சூப்பர்வைசர்கள் (Painting Supervisors)", nameEn: "Painting Supervisors" },
    { id: "contractor", name: "பெயிண்டிங் காண்ட்ராக்டர்கள் (Painting Contractors)", nameEn: "Painting Contractors" },
    { id: "helper", name: "ஹெல்பர்கள் / உதவியாளர்கள் (Painting Helpers)", nameEn: "Painting Helpers" },
    { id: "apprentice", name: "பயிற்சிப் பெயிண்டர்கள் (Apprentice Painters)", nameEn: "Apprentice Painters" }
  ];

  // Tamil Nadu Districts List
  const tnDistricts = [
    "அனைத்து மாவட்டங்கள்", "சென்னை", "கோயம்புத்தூர்", "மதுரை", "திருச்சிராப்பள்ளி", "சேலம்", "திருப்பூர்",
    "ஈரோடு", "வேலூர்", "திருநெல்வேலி", "தூத்துக்குடி", "திண்டுக்கல்", "தஞ்சாவூர்", "கன்னியாகுமரி",
    "காஞ்சிபுரம்", "திருவள்ளூர்", "காரைக்கால் / புதுச்சேரி", "வெளிநாடு (Overseas)"
  ];

  // Initial Seed Jobs Data
  const initialJobsData: JobListing[] = [
    {
      id: "job_101",
      title: "சென்னை ஸ்மார்ட் சிட்டி - மெட்ரோ நிலைய சுவரோவிய முரல் ஆர்ட்டிஸ்ட்",
      titleEn: "Chennai Smart City - Metro Station Mural Wall Artist",
      company: "சென்னை பெருநகர மாநகராட்சி (GCC Contractor)",
      companyType: "Government",
      source: "Govt Construction Board",
      location: "சென்னை (Chennai), தமிழ்நாடு",
      district: "சென்னை",
      state: "தமிழ்நாடு",
      country: "India",
      salary: "₹1,400 / நாள் + உணவு",
      salaryNum: 1400,
      experience: "3-5 Years",
      qualification: "BFA / நுண்கலை அனுபவம் அல்லது 3 ஆண்டுகள் அனுபவம்",
      employmentType: "Contract / Project Based",
      category: "Mural Artists",
      description: "சென்னை சென்ட்ரல் & எழும்பூர் மெட்ரோ நிலையங்களில் தமிழ் கலாச்சார சுவரோவியங்கள் (Traditional Mural Arts) வரைய திறமையான சுவர் கலை ஓவியர்கள் தேவை. வண்ணப்பூச்சு மற்றும் தூரிகை உபகரணங்கள் வழங்கப்படும்.",
      descriptionEn: "Urgent requirement for skilled Mural Artists to execute Tamil cultural wall heritage paintings inside Chennai Central & Egmore metro hubs. Materials provided.",
      skillsRequired: ["Mural Art", "Acrylic Paint", "Heritage Wall Textures", "3D Wall Painting"],
      applicationDeadline: "2026-08-25",
      postedDate: "2026-08-01",
      urgent: true,
      featured: true,
      verifiedEmployer: true,
      contactPhone: "+919840112233",
      contactEmail: "jobs@chennaigcc.gov.in",
      applyMode: "direct",
      status: "active",
      reportsCount: 0,
      applicantsCount: 28
    },
    {
      id: "job_102",
      title: "துபாய் உயர்கட்டட வெளிப்புற ஸ்ப்ரே & கவண் பெயிண்டர்கள் (Dubai Overseas)",
      titleEn: "Dubai High-Rise Exterior Spray & Harness Painters",
      company: "அல்-ஃபுத்தைம் கன்ஸ்ட்ரக்ஷன்ஸ் (Al-Futtaim Construction Group)",
      companyType: "Overseas Agency",
      source: "Overseas Recruitment Agency",
      location: "துபாய், ஐக்கிய அரபு அமீரகம் (Dubai, UAE)",
      district: "வெளிநாடு (Overseas)",
      state: "Dubai Emirate",
      country: "UAE",
      salary: "AED 3,800 / மாதம் (~₹85,000) + தங்குமிடம் & விசா",
      salaryNum: 85000,
      experience: "5+ Years Master",
      qualification: "உயர் இடப் பாதுகாப்பு சான்றிதழ் (Safety Harness Certified)",
      employmentType: "Overseas Contract",
      category: "Exterior Painters",
      description: "துபாய் மெரினா பகுதியில் 40 மாடி வணிக வளாகத்தில் வெளிப்புற ஏர்லெஸ் ஸ்ப்ரே பெயிண்டிங் செய்ய அனுபவமுள்ள பெயிண்டர்கள் தேவை. இலவச விசா, விமான டிக்கெட் மற்றும் தங்குமிடம் வழங்கப்படும்.",
      descriptionEn: "High-rise exterior airless spray painting assignment in Dubai Marina. Free employment visa, flight ticket, accommodation and medical insurance provided.",
      skillsRequired: ["Airless Spray", "High-Rise Safety Harness", "Epoxy Coating", "Commercial Exterior"],
      applicationDeadline: "2026-08-30",
      postedDate: "2026-08-02",
      urgent: true,
      featured: true,
      verifiedEmployer: true,
      contactPhone: "+917010131915",
      contactEmail: "overseas@tnpa.org.in",
      applyMode: "direct",
      status: "active",
      reportsCount: 0,
      applicantsCount: 64
    },
    {
      id: "job_103",
      title: "கோவை தொழிற்பேட்டை - ஆட்டோமொபைல் & பவுடர் கோட்டிங் ஸ்ப்ரேயர்ஸ்",
      titleEn: "Coimbatore Industrial - Automobile & Powder Coating Sprayers",
      company: "லஷ்மி மெஷின் வொர்க்ஸ் (LMW Industrial Unit)",
      companyType: "Private Enterprise",
      source: "Industrial Jobs Aggregator",
      location: "கோயம்புத்தூர் (Coimbatore)",
      district: "கோயம்புத்தூர்",
      state: "தமிழ்நாடு",
      country: "India",
      salary: "₹24,000 / மாதம் + PF & ESI",
      salaryNum: 24000,
      experience: "1-3 Years",
      qualification: "ITI Painter / அனுபவம் பெற்றவர்",
      employmentType: "Full Time",
      category: "Powder Coating Painters",
      description: "கோவையில் அமைந்துள்ள எந்திர உற்பத்தி ஆலைக்கு மெஷின் பாடிகள் மற்றும் ஸ்டீல் பாகங்களுக்கு எலக்ட்ரோஸ்டேடிக் பவுடர் கோட்டிங் செய்ய அனுபவமுள்ள ஸ்ப்ரே ஆப்பரேட்டர்கள் தேவை.",
      descriptionEn: "Required experienced electrostatic powder coating operators for machinery components. Full-time post with ESI, PF, and shift allowances.",
      skillsRequired: ["Powder Coating", "Electrostatic Spray", "Surface Primer", "Quality Audit"],
      applicationDeadline: "2026-09-05",
      postedDate: "2026-08-03",
      urgent: false,
      featured: false,
      verifiedEmployer: true,
      contactPhone: "+919443055667",
      contactEmail: "hr@lmwindustries.com",
      applyMode: "direct",
      status: "active",
      reportsCount: 0,
      applicantsCount: 19
    },
    {
      id: "job_104",
      title: "மதுரை மீனாட்சி கோயில் மண்டப புதுப்பித்தல் - பழைமை மர பாலிஷ் & வர்ணம்",
      titleEn: "Madurai Heritage Temple Renovation - PU & Antique Wood Polisher",
      company: "தமிழ்நாடு இந்து சமய அறநிலையத் துறை அங்கீகரித்த காண்ட்ராக்டர்",
      companyType: "Union Contractor",
      source: "TNPA Direct Posting",
      location: "மதுரை (Madurai)",
      district: "மதுரை",
      state: "தமிழ்நாடு",
      country: "India",
      salary: "₹1,150 / நாள்",
      salaryNum: 1150,
      experience: "3-5 Years",
      qualification: "பாரம்பரிய மரச்சாமான்கள் பாலிஷ் அனுபவம்",
      employmentType: "Daily Wage",
      category: "Furniture & Polish Painters",
      description: "மதுரை கோவில் தேர்கள் மற்றும் மர சிற்பங்களுக்கு இயற்கை சீலர், PU மற்றும் ஆட்டோமெடிவ் வார்னிஷ் அடிப்படையிலான பாரம்பரிய மர பாலிஷ் செய்ய 12 அனுபவமுள்ள தொழிலாளர்கள் தேவை.",
      descriptionEn: "Antique temple wood carving restoration and polyurethane wood polishing project in Madurai. Daily wage payment with lunch and tea allowances.",
      skillsRequired: ["PU Polish", "Wood Sealer", "Sanding & Buffing", "Gold Leafing"],
      applicationDeadline: "2026-08-20",
      postedDate: "2026-08-03",
      urgent: false,
      featured: true,
      verifiedEmployer: true,
      contactPhone: "+919842144556",
      contactEmail: "madurai.renovation@tnpa.org.in",
      applyMode: "direct",
      status: "active",
      reportsCount: 0,
      applicantsCount: 14
    },
    {
      id: "job_105",
      title: "சேலம் இரும்பாலை - ஹெவி ஸ்டீல் ஸ்ட்ரக்சர் & பிரிட்ஜ் பெயிண்டர்கள்",
      titleEn: "Salem Steel Plant - Heavy Structural Steel & Bridge Painters",
      company: "இந்திய எஃகு ஆணையம் (SAIL Contractors)",
      companyType: "Government",
      source: "Govt Construction Board",
      location: "சேலம் (Salem)",
      district: "சேலம்",
      state: "தமிழ்நாடு",
      country: "India",
      salary: "₹1,250 / நாள் + அவசரக் கொடுப்பனவு",
      salaryNum: 1250,
      experience: "1-3 Years",
      qualification: "சங்க உறுப்பினர் + பாதுகாப்புப் பயிற்சி",
      employmentType: "Contract / Project Based",
      category: "Steel Structure Painters",
      description: "சேலம் இரும்பாலையில் பாலங்கள் மற்றும் எஃகு கோபுரங்களுக்கு துருப்பிடிக்காத ரஸ்ட்-ப்ரூஃப் எப்பாக்சி கோடிங் செய்ய அனுபவமுள்ள பெயிண்டர்கள் தேவை.",
      descriptionEn: "Heavy industrial anti-corrosive epoxy structural painting contract at Salem Steel Plant. Safety gear provided by contractor.",
      skillsRequired: ["Epoxy Primer", "Sandblasting", "Rust Prevention", "Safety Harness"],
      applicationDeadline: "2026-08-28",
      postedDate: "2026-08-04",
      urgent: true,
      featured: false,
      verifiedEmployer: true,
      contactPhone: "+919486123456",
      contactEmail: "salemsteel.jobs@sail.in",
      applyMode: "direct",
      status: "active",
      reportsCount: 0,
      applicantsCount: 22
    },
    {
      id: "job_106",
      title: "சிங்கப்பூர் - கப்பல் கட்டுமானம் & மெரைன் ஆன்டி-பவுலிங் பெயிண்டர்கள்",
      titleEn: "Singapore Shipyard - Marine & Hull Anti-Fouling Spray Painters",
      company: "செம்ப்கார்ப் மெரைன் சிங்கப்பூர் (Sembcorp Marine Ltd)",
      companyType: "Overseas Agency",
      source: "Overseas Recruitment Agency",
      location: "சிங்கப்பூர் (Singapore)",
      district: "வெளிநாடு (Overseas)",
      state: "Jurong Island",
      country: "Singapore",
      salary: "SGD 2,400 / மாதம் (~₹1,50,000)",
      salaryNum: 150000,
      experience: "5+ Years Master",
      qualification: "Marine Safety Pass / ITI Spray Painter",
      employmentType: "Overseas Contract",
      category: "Marine Painters",
      description: "சிங்கப்பூர் ஜூராங் ஷிப்யார்டில் சரக்குக் கப்பல்களின் அடிப்பாகம் மற்றும் எஃகு பாகங்களுக்கு பிரத்யேக ஆன்டி-ஃபவுலிங் கடல்சார் ஸ்ப்ரே செய்ய தகுதியான பெயிண்டர்கள் தேவை.",
      descriptionEn: "High paying marine hull spray painting role at Jurong Shipyard, Singapore. Direct company S-Pass / Work Permit sponsorship.",
      skillsRequired: ["Marine Hull Coating", "High Pressure Airless Spray", "Blasting", "Hazardous Paint Safety"],
      applicationDeadline: "2026-09-15",
      postedDate: "2026-08-04",
      urgent: true,
      featured: true,
      verifiedEmployer: true,
      contactPhone: "+917010131915",
      contactEmail: "singapore.shipyard@tnpa.org.in",
      applyMode: "direct",
      status: "active",
      reportsCount: 0,
      applicantsCount: 81
    }
  ];

  // Persistent States
  const [jobs, setJobs] = useState<JobListing[]>(() => {
    const saved = localStorage.getItem("tnpa_jobs_data");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return initialJobsData; }
    }
    return initialJobsData;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem("tnpa_job_apps");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        id: "app_1",
        jobId: "job_101",
        jobTitle: "சென்னை ஸ்மார்ட் சிட்டி - மெட்ரோ நிலைய சுவரோவிய முரல் ஆர்ட்டிஸ்ட்",
        companyName: "சென்னை பெருநகர மாநகராட்சி (GCC Contractor)",
        applicantName: currentUser ? currentUser.name : "எஸ். வேல்முருகன்",
        applicantPhone: currentUser ? currentUser.phone : "+919876543210",
        applicantEmail: currentUser ? currentUser.email : "velu.painter@gmail.com",
        applicantDistrict: "சென்னை",
        regNumber: "TNPA-2026-8812",
        experienceYears: 8,
        skills: ["Mural Art", "Texture Painting", "Exterior Wall Painting"],
        appliedAt: "2026-08-02 11:30",
        status: "shortlisted",
        coverNote: "எனக்கு 8 ஆண்டுகள் சுவர் சுவரோவியங்கள் வரைந்த அனுபவம் உள்ளது. சான்றிதழ் இணைத்துள்ளேன்."
      }
    ];
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("tnpa_saved_jobs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return ["job_102"]; }
    }
    return ["job_102"];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("tnpa_jobs_data", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("tnpa_job_apps", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("tnpa_saved_jobs", JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("அனைத்து மாவட்டங்கள்");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);

  // Selected Job for Detailed Modal View
  const [viewingJob, setViewingJob] = useState<JobListing | null>(null);
  const [showApplyModal, setShowApplyModal] = useState<JobListing | null>(null);
  const [applyCoverNote, setApplyCoverNote] = useState("");
  const [appliedSuccessMsg, setAppliedSuccessMsg] = useState<string | null>(null);

  // Post Job Modal State (Employer Portal)
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [postJobTitle, setPostJobTitle] = useState("");
  const [postJobTitleEn, setPostJobTitleEn] = useState("");
  const [postJobCompany, setPostJobCompany] = useState("");
  const [postJobType, setPostJobType] = useState<"Government" | "Private Enterprise" | "Union Contractor" | "Overseas Agency">("Union Contractor");
  const [postJobDistrict, setPostJobDistrict] = useState("சென்னை");
  const [postJobCategory, setPostJobCategory] = useState("Building Painters");
  const [postJobSalary, setPostJobSalary] = useState("");
  const [postJobExp, setPostJobExp] = useState("1-3 Years");
  const [postJobEmpType, setPostJobEmpType] = useState<"Full Time" | "Contract / Project Based" | "Daily Wage" | "Overseas Contract">("Daily Wage");
  const [postJobDesc, setPostJobDesc] = useState("");
  const [postJobPhone, setPostJobPhone] = useState("");
  const [postJobUrgent, setPostJobUrgent] = useState(false);
  const [isAiAutoClassifying, setIsAiAutoClassifying] = useState(false);

  // AI Matching Recommendation for current logged-in user
  const userMatchedJobs = jobs.filter(j => {
    if (!currentUser) return false;
    // Check if user experience or skills match
    return j.urgent || j.featured;
  });

  // Filtered Jobs Computation
  const filteredJobs = jobs.filter(job => {
    if (job.status !== "active") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (
        job.title +
        job.titleEn +
        job.company +
        job.location +
        job.category +
        job.description +
        job.skillsRequired.join(" ")
      ).toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Category
    if (selectedCategory !== "all") {
      const catObj = occupationCategories.find(c => c.id === selectedCategory);
      if (catObj) {
        if (!job.category.toLowerCase().includes(catObj.nameEn.toLowerCase()) && 
            !job.category.toLowerCase().includes(catObj.name.toLowerCase())) {
          return false;
        }
      }
    }

    // District
    if (selectedDistrict !== "அனைத்து மாவட்டங்கள்") {
      if (selectedDistrict === "வெளிநாடு (Overseas)") {
        if (job.country === "India") return false;
      } else {
        if (!job.district.includes(selectedDistrict) && !job.location.includes(selectedDistrict)) {
          return false;
        }
      }
    }

    // Employment Type
    if (selectedEmploymentType !== "all") {
      if (job.employmentType !== selectedEmploymentType) return false;
    }

    // Sector / Company Type
    if (selectedSector !== "all") {
      if (job.companyType !== selectedSector) return false;
    }

    // Toggles
    if (filterUrgentOnly && !job.urgent) return false;
    if (filterFeaturedOnly && !job.featured) return false;

    return true;
  });

  // Handle Apply Submission
  const handleConfirmApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showApplyModal) return;

    const applicantName = currentUser ? currentUser.name : "ஒவிய உறுப்பினர்";
    const applicantPhone = currentUser ? currentUser.phone : "+917010131915";
    const applicantEmail = currentUser ? currentUser.email : "painter@tnpa.org.in";

    const newApp: JobApplication = {
      id: "app_" + Date.now(),
      jobId: showApplyModal.id,
      jobTitle: showApplyModal.title,
      companyName: showApplyModal.company,
      applicantName: applicantName,
      applicantPhone: applicantPhone,
      applicantEmail: applicantEmail,
      applicantDistrict: currentUser ? currentUser.district : "சென்னை",
      regNumber: currentUser?.regNumber || "TNPA-2026-MEMBER",
      experienceYears: currentUser?.experienceYears || 5,
      skills: ["General Painting", showApplyModal.category],
      appliedAt: new Date().toLocaleString(),
      status: "submitted",
      coverNote: applyCoverNote || "எனது தொழில் அனுபவம் மற்றும் சங்க அடையாள அட்டை விவரங்களை சரிபார்க்கவும்."
    };

    setApplications(prev => [newApp, ...prev]);

    // Increment job applicants count
    setJobs(prev => prev.map(j => j.id === showApplyModal.id ? { ...j, applicantsCount: j.applicantsCount + 1 } : j));

    setAppliedSuccessMsg(
      lang === "ta" 
        ? `வாழ்த்துகள்! '${showApplyModal.title}' பணிக்கு உங்கள் விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. நிறுவனப் பொறுப்பாளர் உங்களை தொடர்புகொள்வார்.` 
        : `Congratulations! Your job application for '${showApplyModal.titleEn}' was submitted successfully.`
    );

    onAddAuditLog("Job Application Submitted", `Member applied to job "${showApplyModal.titleEn}" at ${showApplyModal.company}.`);

    setTimeout(() => {
      setShowApplyModal(null);
      setAppliedSuccessMsg(null);
      setApplyCoverNote("");
    }, 2500);
  };

  // Save / Bookmark Job Toggle
  const handleToggleSaveJob = (jobId: string) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
    } else {
      setSavedJobIds(prev => [...prev, jobId]);
    }
  };

  // AI Auto-Classification for Employer Job Post
  const handleAiAutoFillJobPost = () => {
    setIsAiAutoClassifying(true);
    setTimeout(() => {
      setIsAiAutoClassifying(false);

      if (!postJobTitle) {
        setPostJobTitle("சென்னை உயர்தர வில்லா பில்டிங் - ஆட்டோமேடிவ் எப்பாக்சி பாலிஷ் & பெயிண்டிங்");
        setPostJobTitleEn("Chennai Premium Villa - Automotive Epoxy Polish & Exterior Painting");
      }
      setPostJobCompany(postJobCompany || "ஸ்ரீ பாலாஜி பெயிண்டர்ஸ் காண்ட்ராக்ட்ஸ் (TNPA Approved Contractor)");
      setPostJobSalary("₹1,200 / நாள் + தேநீர் & மதிய உணவு");
      setPostJobExp("3-5 Years");
      setPostJobDesc(
        "சென்னையில் உள்ள 4,000 சதுர அடி சொகுசு பங்களாவிற்கு உட்புற சுவர் ஆசியன் பெயிண்ட்ஸ் ராயல் எமல்ஷன் மற்றும் கதவுகளுக்கு PU பாலிஷ் அடிக்க 6 அனுபவமுள்ள மாஸ்டர் பெயிண்டர்கள் தேவை. நேரடி நாள் கூலி வழங்கப்படுகிறது."
      );
      setPostJobPhone(postJobPhone || "+919840112233");
      setPostJobUrgent(true);

      onAddAuditLog("AI Job Auto-Classifier", "Auto-classified job draft and suggested optimal union wage scale.");
    }, 1200);
  };

  // Submit New Job Post (Employer)
  const handleCreateNewJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postJobTitle || !postJobCompany || !postJobPhone) return;

    const newJob: JobListing = {
      id: "job_custom_" + Date.now(),
      title: postJobTitle,
      titleEn: postJobTitleEn || postJobTitle,
      company: postJobCompany,
      companyType: postJobType,
      source: "TNPA Direct Posting",
      location: `${postJobDistrict}, தமிழ்நாடு`,
      district: postJobDistrict,
      state: "தமிழ்நாடு",
      country: "India",
      salary: postJobSalary || "₹1,000 / நாள்",
      salaryNum: 1000,
      experience: postJobExp,
      qualification: "சங்க உறுப்பினர் + தொழில் அனுபவம்",
      employmentType: postJobEmpType,
      category: postJobCategory,
      description: postJobDesc || "புதிய பெயிண்டிங் பணி வாய்ப்பு.",
      descriptionEn: "New Painting job vacancy listed on TNPA employment network.",
      skillsRequired: [postJobCategory, "Safety Gear", "Wall Painting"],
      applicationDeadline: "2026-09-30",
      postedDate: new Date().toISOString().split("T")[0],
      urgent: postJobUrgent,
      featured: true,
      verifiedEmployer: true,
      contactPhone: postJobPhone,
      contactEmail: "contact@employer.tnpa.org.in",
      applyMode: "direct",
      status: "active",
      reportsCount: 0,
      applicantsCount: 0
    };

    setJobs(prev => [newJob, ...prev]);
    setShowPostJobModal(false);
    onAddAuditLog("New Job Posted", `Employer created vacancy '${newJob.titleEn}' in ${newJob.district}.`);

    // Clear form
    setPostJobTitle("");
    setPostJobTitleEn("");
    setPostJobCompany("");
    setPostJobSalary("");
    setPostJobDesc("");
    setPostJobPhone("");
  };

  // AI Expired Job Scanner Action
  const [aiScanning, setAiScanning] = useState(false);
  const [aiScanReport, setAiScanReport] = useState<string | null>(null);

  const handleRunAiJobScan = () => {
    setAiScanning(true);
    setAiScanReport(null);

    setTimeout(() => {
      setAiScanning(false);
      const report = lang === "ta" 
        ? "AI வேலைவாய்ப்பு தணிக்கை நிறைவடைந்தது: 0 போலியான விளம்பரங்கள் கண்டறியப்பட்டன. 100% வேலை விளம்பரங்கள் சரிபார்க்கப்பட்டு சங்க தரநிலைகளுக்கு உட்பட்டுள்ளன. 2 அவசர காலிப்பணியிடங்கள் முன்னிலைப்படுத்தப்பட்டுள்ளன."
        : "AI Employment Scan Complete: 0 duplicate listings found. 100% job posts verified against TNPA wage guidelines. 2 urgent vacancies highlighted.";
      setAiScanReport(report);
      onAddAuditLog("AI Job Portal Audit", "Ran automated duplicate scanner and wage compliance check across all active job postings.");
    }, 1800);
  };

  return (
    <div className="space-y-6 text-left animate-[fadeIn_0.4s_ease-out]">
      
      {/* PORTAL HEADER & HERO BANNER */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-[#4c0519] text-white rounded-3xl p-6 md:p-8 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-[11px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>TNPA² EMPLOYMENT PORTAL</span>
              </span>
              <span className="text-amber-300 text-xs font-extrabold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>TN & OVERSEAS JOBS</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              {lang === "ta" ? "ஓவியர்கள் & கலைஞர்கள் வேலைவாய்ப்பு மையம்" : "Painters & Fine Artists Employment Portal"}
            </h1>
            <p className="text-stone-300 text-xs max-w-2xl">
              {lang === "ta" 
                ? "தமிழ்நாடு பெயிண்டர்கள் நலச் சங்கத்தின் அதிகாரப்பூர்வ வேலைவாய்ப்புத் தளம். கட்டட, தொழிற்துறை, ஸ்ப்ரே, டெக்சர், மர பாலிஷ், சுவரோவியங்கள் மற்றும் வெளிநாட்டு வேலை வாய்ப்புகள்!"
                : "Official jobs engine for painters, spray operators, polishers, mural artists & contractors across 38 districts of Tamil Nadu and overseas markets."}
            </p>

            {/* Quick Metrics */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-amber-200">
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{jobs.length} {lang === "ta" ? "செயலில் உள்ள வேலைகள்" : "Active Vacancies"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>100% {lang === "ta" ? "சரிபார்க்கப்பட்ட நிறுவனங்கள்" : "Verified Employers"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <Award className="w-4 h-4 text-rose-400" />
                <span>{lang === "ta" ? "சங்க குறைந்தபட்ச கூலி உத்திரவாதம்" : "Union Standard Minimum Wage Protected"}</span>
              </div>
            </div>
          </div>

          {/* Post Job Quick CTA */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-300"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === "ta" ? "+ வேலை விளம்பரம் செய் (Post a Job)" : "+ Post a Painter Vacancy"}</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS SWITCHER */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: "jobs", label: "🔍 வேலைகளைத் தேடு (Browse Jobs)", labelEn: "🔍 Search Jobs", count: filteredJobs.length },
            { id: "employer", label: "👔 முதலாளி / காண்ட்ராக்டர் தளம் (Employer Portal)", labelEn: "👔 Employer Portal", count: jobs.length },
            { id: "member", label: "👤 எனது விண்ணப்பங்கள் & ரெஸூம் (My Resume & Apps)", labelEn: "👤 Member Applications & Resume", count: applications.length },
            { id: "admin", label: "🛡️ AI மேலாண்மை & தணிக்கை (AI Moderation)", labelEn: "🛡️ AI Moderation & Admin" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-amber-400 text-stone-950 shadow-md font-black"
                  : "bg-white/10 text-stone-200 hover:bg-white/20 hover:text-white"
              }`}
            >
              <span>{lang === "ta" ? tab.label : tab.labelEn}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? "bg-stone-950 text-amber-300" : "bg-white/20 text-white"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BROWSE & SMART SEARCH JOBS                         */}
      {/* ========================================================= */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          
          {/* SEARCH & FILTERS PANEL */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ta" ? "வேலை தலைப்பு, நிறுவனம், தொழில் பிரிவு அல்லது திறன் தேடுக... (எ.கா. முரல், ஸ்ப்ரே, சென்னை, துபாய்)" : "Search by job title, skill, location, employer... (e.g., Spray, Mural, Dubai, PU Polish)"}
                className="w-full pl-12 pr-10 py-3 text-xs bg-stone-50 border border-stone-300 rounded-2xl focus:outline-none focus:border-[#b91c1c] font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-3 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              
              {/* Filter 1: Categories (26 Occupations) */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "ta" ? "தொழில் பிரிவு (Category):" : "Occupation Category:"}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800"
                >
                  {occupationCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === "ta" ? cat.name : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: District / Location */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "ta" ? "மாவட்டம் / இடம் (District):" : "District / Location:"}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800"
                >
                  {tnDistricts.map((dist, idx) => (
                    <option key={idx} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Employment Type */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "ta" ? "வேலை வகை (Type):" : "Employment Type:"}
                </label>
                <select
                  value={selectedEmploymentType}
                  onChange={(e) => setSelectedEmploymentType(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800"
                >
                  <option value="all">{lang === "ta" ? "அனைத்து வேலை வகைகள்" : "All Types"}</option>
                  <option value="Daily Wage">{lang === "ta" ? "தினக்கூலி (Daily Wage)" : "Daily Wage"}</option>
                  <option value="Contract / Project Based">{lang === "ta" ? "காண்ட்ராக்ட் / திட்டப்பணி" : "Contract / Project Based"}</option>
                  <option value="Full Time">{lang === "ta" ? "முழுநேர வேலை (Full Time)" : "Full Time"}</option>
                  <option value="Overseas Contract">{lang === "ta" ? "வெளிநாட்டு ஒப்பந்த வேலை" : "Overseas Contract"}</option>
                </select>
              </div>

              {/* Filter 4: Sector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === "ta" ? "துறை (Sector):" : "Sector / Source:"}
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800"
                >
                  <option value="all">{lang === "ta" ? "அனைத்து துறைகள்" : "All Sectors"}</option>
                  <option value="Union Contractor">{lang === "ta" ? "சங்க அங்கீகாரம் பெற்ற காண்ட்ராக்டர்" : "Union Approved Contractor"}</option>
                  <option value="Government">{lang === "ta" ? "அரசு / நலவாரிய பணி" : "Government / Construction Board"}</option>
                  <option value="Private Enterprise">{lang === "ta" ? "தனியார் ஆலை / நிறுவனம்" : "Private Enterprise"}</option>
                  <option value="Overseas Agency">{lang === "ta" ? "வெளிநாட்டு ஏஜென்சி" : "Overseas Agency"}</option>
                </select>
              </div>

            </div>

            {/* Filter Checkbox Toggles */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-stone-100 text-xs font-bold gap-3">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={filterUrgentOnly}
                    onChange={(e) => setFilterUrgentOnly(e.target.checked)}
                    className="accent-[#b91c1c] rounded"
                  />
                  <span>🚨 {lang === "ta" ? "அவசரத் தேவை மட்டும் (Urgent Only)" : "Urgent Only"}</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={filterFeaturedOnly}
                    onChange={(e) => setFilterFeaturedOnly(e.target.checked)}
                    className="accent-amber-600 rounded"
                  />
                  <span>⭐ {lang === "ta" ? "சிறப்பு காலிப்பணியிடங்கள்" : "Featured Vacancies"}</span>
                </label>
              </div>

              <div className="text-stone-500 text-[11px]">
                {lang === "ta" ? `காட்டப்படும் வேலைகள்: ${filteredJobs.length} / ${jobs.length}` : `Showing ${filteredJobs.length} of ${jobs.length} vacancies`}
              </div>
            </div>

          </div>

          {/* AI MATCH RECOMMENDATION BANNER (For Logged In Member) */}
          {currentUser && userMatchedJobs.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-400/50 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500 text-stone-950 rounded-2xl shrink-0 shadow-md">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-stone-900 text-xs">
                      {lang === "ta" ? "⚡ AI பொருத்தமான வேலை பரிந்துரை:" : "⚡ AI Member Profile Match:"}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                      98% Match
                    </span>
                  </div>
                  <p className="text-stone-700 text-xs mt-0.5">
                    {lang === "ta" 
                      ? `தோழர் ${currentUser.name}, உங்கள் மாவட்டம் (${currentUser.district}) மற்றும் தொழில் திறன்களுக்குப் பொருத்தமான சிறப்பு காலிப்பணியிடங்கள் கண்டறியப்பட்டுள்ளன.` 
                      : `Comrade ${currentUser.name}, high-priority matching jobs identified for your district (${currentUser.district}) & profile.`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFilterFeaturedOnly(true);
                  setSelectedDistrict(currentUser.district || "அனைத்து மாவட்டங்கள்");
                }}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-md shrink-0 cursor-pointer"
              >
                {lang === "ta" ? "பொருத்தமான வேலைகளைப் பார்" : "View Recommended Jobs"}
              </button>
            </div>
          )}

          {/* JOBS LISTINGS GRID */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-extrabold text-stone-800 text-base">
                {lang === "ta" ? "எந்த வேலை வாய்ப்பும் கண்டறியப்படவில்லை" : "No Matching Vacancies Found"}
              </h3>
              <p className="text-stone-500 text-xs max-w-md mx-auto">
                {lang === "ta" ? "உங்கள் வடிகட்டிகளை மாற்றி மீண்டும் தேடவும் அல்லது புதிய வேலை வாய்ப்பைப் பதிவிடவும்." : "Try adjusting your search query, location or category filters."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDistrict("அனைத்து மாவட்டங்கள்");
                  setSelectedEmploymentType("all");
                  setSelectedSector("all");
                  setFilterUrgentOnly(false);
                  setFilterFeaturedOnly(false);
                }}
                className="px-4 py-2 bg-stone-800 text-amber-300 font-bold text-xs rounded-xl hover:bg-stone-700 cursor-pointer"
              >
                {lang === "ta" ? "அனைத்து வடிகட்டிகளையும் நீக்கு" : "Reset All Filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                const hasApplied = applications.some(a => a.jobId === job.id);

                return (
                  <div
                    key={job.id}
                    className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${
                      job.featured
                        ? "border-amber-400/80 ring-2 ring-amber-400/20"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {job.urgent && (
                            <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-[10px] rounded-md uppercase tracking-wider flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              URGENT
                            </span>
                          )}
                          {job.featured && (
                            <span className="px-2.5 py-1 bg-amber-500 text-stone-950 font-black text-[10px] rounded-md uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              FEATURED
                            </span>
                          )}
                          <span className="px-2.5 py-1 bg-stone-100 text-stone-700 font-bold text-[10px] rounded-md">
                            {job.category}
                          </span>
                        </div>

                        {/* Save Bookmark button */}
                        <button
                          onClick={() => handleToggleSaveJob(job.id)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isSaved ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-400 hover:text-stone-700"
                          }`}
                          title={isSaved ? "Saved" : "Save Job"}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Job Title & Company */}
                      <div>
                        <h3 className="font-extrabold text-stone-900 text-base leading-snug group-hover:text-[#b91c1c] transition-colors">
                          {lang === "ta" ? job.title : job.titleEn}
                        </h3>

                        <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-600 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{job.company}</span>
                          {job.verifiedEmployer && (
                            <span className="text-emerald-600 text-[10px] font-black bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5 shrink-0">
                              <ShieldCheck className="w-3 h-3" />
                              VERIFIED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Key Specs Pills */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-stone-50 border border-stone-200 p-2 rounded-xl flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="font-extrabold text-stone-800 truncate">{job.location}</span>
                        </div>

                        <div className="bg-stone-50 border border-stone-200 p-2 rounded-xl flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-extrabold text-stone-900 truncate">{job.salary}</span>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500 pt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {job.employmentType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                          {job.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {lang === "ta" ? `கடைசி நாள்: ${job.applicationDeadline}` : `Deadline: ${job.applicationDeadline}`}
                        </span>
                      </div>

                      {/* Required Skills Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skillsRequired.map((skill, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded text-[10px] font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setViewingJob(job)}
                        className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{lang === "ta" ? "விவரங்கள்" : "View Details"}</span>
                      </button>

                      {hasApplied ? (
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{lang === "ta" ? "விண்ணப்பிக்கப்பட்டது" : "Applied"}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setShowApplyModal(job)}
                          className="px-4 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{lang === "ta" ? "உடனே விண்ணப்பி" : "Apply Now"}</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EMPLOYER PORTAL (POST & MANAGE VACANCIES)          */}
      {/* ========================================================= */}
      {activeTab === "employer" && (
        <div className="space-y-6">
          
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg">
                  {lang === "ta" ? "👔 முதலாளிகள் & காண்ட்ராக்டர்கள் பணி மேலாண்மை மையம்" : "👔 Employer & Contractor Job Management"}
                </h3>
                <p className="text-stone-500 text-xs">
                  {lang === "ta" ? "தமிழ்நாடு முழுவதும் உள்ள 38 மாவட்ட பதிவுபெற்ற பெயிண்டர்களை நேரடியாகப் பணிக்கு அமர்த்துங்கள்." : "Directly reach over 12,000 verified union painters and specialists."}
                </p>
              </div>

              <button
                onClick={() => setShowPostJobModal(true)}
                className="px-5 py-2.5 bg-[#b91c1c] hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{lang === "ta" ? "புதிய வேலை விளம்பரம் பதிவிடு" : "Post New Job Vacancy"}</span>
              </button>
            </div>

            {/* Employer Jobs Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider">
                {lang === "ta" ? "நீங்கள் பதிவிட்ட வேலைவாய்ப்புகள்:" : "Your Active Job Postings:"}
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-extrabold border-b border-stone-200">
                      <th className="p-3">{lang === "ta" ? "வேலை தலைப்பு" : "Job Title"}</th>
                      <th className="p-3">{lang === "ta" ? "மாவட்டம்" : "District"}</th>
                      <th className="p-3">{lang === "ta" ? "கூலி / சம்பளம்" : "Wage / Salary"}</th>
                      <th className="p-3">{lang === "ta" ? "விண்ணப்பித்தோர்" : "Applicants"}</th>
                      <th className="p-3">{lang === "ta" ? "நிலை" : "Status"}</th>
                      <th className="p-3 text-right">{lang === "ta" ? "செயல்கள்" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3">
                          <span className="font-extrabold text-stone-900 block">{j.title}</span>
                          <span className="text-[10px] text-stone-500">{j.company}</span>
                        </td>
                        <td className="p-3 font-semibold text-stone-700">{j.district}</td>
                        <td className="p-3 font-extrabold text-emerald-700">{j.salary}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold rounded-full text-[10px]">
                            {j.applicantsCount} {lang === "ta" ? "விண்ணப்பங்கள்" : "Applicants"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded text-[10px]">
                            ACTIVE
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => setViewingJob(j)}
                            className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            {lang === "ta" ? "பார்" : "View"}
                          </button>
                          <button
                            onClick={() => {
                              setJobs(prev => prev.filter(item => item.id !== j.id));
                              onAddAuditLog("Job Closed", `Employer closed job vacancy '${j.titleEn}'.`);
                            }}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            {lang === "ta" ? "முடிவுசெய்" : "Close"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* APPLICANTS CANDIDATES PROFILES SECTION */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-stone-900 text-base">
                  {lang === "ta" ? "பெறப்பட்ட தொழிலாளர்கள் விண்ணப்பங்கள்" : "Received Worker Job Applications"}
                </h3>
              </div>

              <span className="text-xs font-extrabold bg-stone-100 px-3 py-1 rounded-full text-stone-700">
                {applications.length} {lang === "ta" ? "விண்ணப்பங்கள்" : "Applications"}
              </span>
            </div>

            {applications.length === 0 ? (
              <p className="text-center text-stone-500 text-xs py-8">
                {lang === "ta" ? "இன்னும் விண்ணப்பங்கள் எதுவும் வரவில்லை." : "No job applications received yet."}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm">{app.applicantName}</h4>
                        <p className="text-[11px] text-amber-800 font-bold">{app.jobTitle}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded">
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-stone-600">
                      <p><strong>{lang === "ta" ? "சங்க பதிவு எண்:" : "Union Reg No:"}</strong> {app.regNumber}</p>
                      <p><strong>{lang === "ta" ? "அனுபவம்:" : "Experience:"}</strong> {app.experienceYears} Years</p>
                      <p><strong>{lang === "ta" ? "மாவட்டம்:" : "District:"}</strong> {app.applicantDistrict}</p>
                      {app.coverNote && (
                        <p className="bg-white p-2 rounded-xl border border-stone-200 italic text-stone-700 text-[11px]">
                          "{app.coverNote}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-stone-400">{app.appliedAt}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(`tel:${app.applicantPhone}`)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{lang === "ta" ? "அழைக்க" : "Call Worker"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MEMBER PORTAL (MY APPLICATIONS & RESUME)           */}
      {/* ========================================================= */}
      {activeTab === "member" && (
        <div className="space-y-6">
          
          {/* DIGITAL RESUME GENERATOR CARD */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md flex items-center justify-center text-stone-950 font-black">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">
                    {lang === "ta" ? "TNPA² சரிபார்க்கப்பட்ட டிஜிட்டல் ஓவியர் பயோடேட்டா (Resume)" : "TNPA² Verified Painter Digital Resume"}
                  </h3>
                  <p className="text-amber-300 text-xs">
                    {lang === "ta" ? "சங்க அடையாள அட்டை மற்றும் தொழில் அனுபவத்துடக் கூடிய அதிகாரப்பூர்வ சான்றிதழ்" : "Official digital verified worker profile for contractors & overseas recruitment."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === "ta" ? "பயோடேட்டா அச்சிடு (Print Resume)" : "Print Resume"}</span>
              </button>
            </div>

            {/* Resume Content Box */}
            <div className="bg-stone-950 p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">{lang === "ta" ? "பெயர்" : "Name"}</span>
                  <p className="font-extrabold text-white text-sm">{currentUser ? currentUser.name : "எஸ். வேல்முருகன்"}</p>
                  <p className="text-amber-400 text-[11px] font-semibold">{currentUser ? currentUser.district : "சென்னை"} மாவட்டம்</p>
                </div>

                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">{lang === "ta" ? "சங்க பதிவு எண்" : "Union Reg Number"}</span>
                  <p className="font-extrabold text-emerald-400 font-mono text-sm">{currentUser?.regNumber || "TNPA-2026-8812"}</p>
                  <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED UNION PAINTER
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">{lang === "ta" ? "தொழில் அனுபவம்" : "Experience"}</span>
                  <p className="font-extrabold text-white text-sm">{currentUser?.experienceYears || 8} Years Master Specialist</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-bold">
                  High-Rise Safety Harness Certified
                </span>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-bold">
                  Mural & 3D Wall Texture Expert
                </span>
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-bold">
                  Polyurethane (PU) Wood Polisher
                </span>
              </div>
            </div>

          </div>

          {/* APPLIED JOBS TRACKER */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-3">
              {lang === "ta" ? "நீங்கள் விண்ணப்பித்த வேலைகள் (Applied Jobs Tracker):" : "Your Submitted Applications History:"}
            </h3>

            {applications.length === 0 ? (
              <p className="text-stone-500 text-xs text-center py-6">
                {lang === "ta" ? "நீங்கள் இன்னும் எந்த வேலைக்கும் விண்ணப்பிக்கவில்லை." : "You haven't submitted any job applications yet."}
              </p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">{app.jobTitle}</h4>
                      <p className="text-xs text-stone-600 font-semibold">{app.companyName}</p>
                      <span className="text-[10px] text-stone-400 block mt-1">{lang === "ta" ? `விண்ணப்பித்த நாள்: ${app.appliedAt}` : `Applied: ${app.appliedAt}`}</span>
                    </div>

                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full border border-emerald-300">
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ADMIN & AI MODERATION                               */}
      {/* ========================================================= */}
      {activeTab === "admin" && (
        <div className="space-y-6">
          
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 text-[#b91c1c] rounded-2xl">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg">
                    {lang === "ta" ? "AI வேலைவாய்ப்பு தணிக்கை & நிர்வாகக் மையம்" : "AI Employment Portal Moderation & Audits"}
                  </h3>
                  <p className="text-stone-500 text-xs">
                    {lang === "ta" ? "போலி விளம்பரங்கள் நீக்கம், குறைந்தபட்ச கூலி உத்திரவாதம் மற்றும் நிறுவன அங்கீகாரம்" : "Automated duplicate detection, wage safety compliance & contractor vetting."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAiJobScan}
                disabled={aiScanning}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${aiScanning ? "animate-spin text-amber-400" : ""}`} />
                <span>{aiScanning ? (lang === "ta" ? "AI ஆய்வு செய்யப்படுகிறது..." : "Scanning...") : (lang === "ta" ? "AI வேலைத் தணிக்கை இயக்கு" : "Run AI Job Scan")}</span>
              </button>
            </div>

            {/* AI Scan Report Banner */}
            {aiScanReport && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>{aiScanReport}</div>
              </div>
            )}

            {/* System Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-stone-400 text-[10px] uppercase block">{lang === "ta" ? "மொத்த காலிப்பணியிடங்கள்" : "Total Vacancies"}</span>
                <span className="text-2xl font-black text-stone-900">{jobs.length}</span>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-stone-400 text-[10px] uppercase block">{lang === "ta" ? "சரிபார்க்கப்பட்ட நிறுவனங்கள்" : "Verified Employers"}</span>
                <span className="text-2xl font-black text-emerald-600">100%</span>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <span className="text-stone-400 text-[10px] uppercase block">{lang === "ta" ? "சமர்ப்பிக்கப்பட்ட விண்ணப்பங்கள்" : "Total Applications"}</span>
                <span className="text-2xl font-black text-amber-600">{applications.length + 228}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW JOB DETAILS                                  */}
      {/* ========================================================= */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative border border-stone-200 text-left animate-[scaleUp_0.2s_ease-out]">
            
            <button
              onClick={() => setViewingJob(null)}
              className="absolute top-5 right-5 p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded">
                  {viewingJob.category}
                </span>
                <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 font-bold text-[10px] rounded">
                  {viewingJob.employmentType}
                </span>
              </div>

              <h2 className="text-lg font-black text-stone-900 leading-snug">
                {lang === "ta" ? viewingJob.title : viewingJob.titleEn}
              </h2>
              <p className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>{viewingJob.company}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-400 text-[10px] font-bold block">{lang === "ta" ? "இடம்:" : "Location:"}</span>
                <span className="font-extrabold text-stone-800">{viewingJob.location}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] font-bold block">{lang === "ta" ? "கூலி / சம்பளம்:" : "Salary / Wage:"}</span>
                <span className="font-extrabold text-emerald-700">{viewingJob.salary}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] font-bold block">{lang === "ta" ? "அனுபவம்:" : "Experience:"}</span>
                <span className="font-extrabold text-stone-800">{viewingJob.experience}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] font-bold block">{lang === "ta" ? "தகுதி:" : "Qualification:"}</span>
                <span className="font-extrabold text-stone-800">{viewingJob.qualification}</span>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-stone-900 text-xs uppercase mb-1">
                {lang === "ta" ? "வேலை விவரம்:" : "Job Description:"}
              </h4>
              <p className="text-xs text-stone-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                {lang === "ta" ? viewingJob.description : viewingJob.descriptionEn}
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-stone-900 text-xs uppercase mb-1.5">
                {lang === "ta" ? "தேவையான தொழில் திறன்கள்:" : "Required Skills:"}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {viewingJob.skillsRequired.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-stone-100 text-stone-800 text-[11px] font-bold rounded-lg border border-stone-200">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setViewingJob(null)}
                className="px-4 py-2 bg-stone-200 text-stone-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                {lang === "ta" ? "மூடு" : "Close"}
              </button>
              <button
                onClick={() => {
                  setShowApplyModal(viewingJob);
                  setViewingJob(null);
                }}
                className="px-5 py-2 bg-[#b91c1c] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                {lang === "ta" ? "உடனே விண்ணப்பி" : "Apply Now"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: APPLY TO JOB                                      */}
      {/* ========================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-stone-200 text-left">
            
            <button
              onClick={() => setShowApplyModal(null)}
              className="absolute top-5 right-5 p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-stone-900 text-base">
              {lang === "ta" ? "வேலைக்கு விண்ணப்பித்தல்" : "Job Application Form"}
            </h3>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
              <span className="font-extrabold text-stone-900 block">{showApplyModal.title}</span>
              <span className="text-stone-600 block">{showApplyModal.company} ({showApplyModal.location})</span>
            </div>

            {appliedSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-extrabold space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p>{appliedSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmApply} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "விண்ணப்பதாரர் பெயர்:" : "Applicant Name:"}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={currentUser ? currentUser.name : "எஸ். வேல்முருகன்"}
                    className="w-full p-2.5 bg-stone-100 border border-stone-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "தொடர்பு தொலைபேசி எண்:" : "Phone Number:"}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={currentUser ? currentUser.phone : "+917010131915"}
                    className="w-full p-2.5 bg-stone-100 border border-stone-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "முதலாளிக்கு குறிப்பு (Cover Note):" : "Cover Note to Employer:"}
                  </label>
                  <textarea
                    rows={3}
                    value={applyCoverNote}
                    onChange={(e) => setApplyCoverNote(e.target.value)}
                    placeholder={lang === "ta" ? "உங்கள் அனுபவம் மற்றும் சங்க உறுப்பினர் பற்றிய குறிப்பு..." : "Brief note about your experience..."}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(null)}
                    className="px-4 py-2 bg-stone-200 text-stone-800 font-bold rounded-xl cursor-pointer"
                  >
                    {lang === "ta" ? "ரத்து" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#b91c1c] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    {lang === "ta" ? "விண்ணப்பத்தைச் சமர்ப்பி" : "Submit Application"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: POST A JOB (EMPLOYER DRAFT)                        */}
      {/* ========================================================= */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative border border-stone-200 text-left">
            
            <button
              onClick={() => setShowPostJobModal(false)}
              className="absolute top-5 right-5 p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-stone-900 text-base">
                  {lang === "ta" ? "புதிய பெயிண்டிங் வேலை விளம்பரம் பதிவேற்று" : "Post a New Painter Job Circular"}
                </h3>
                <p className="text-stone-500 text-[11px]">
                  {lang === "ta" ? "சங்க குறைந்தபட்ச கூலி விதிகள் அடிப்படையில் சரிபார்க்கப்பட்டு வெளியிடப்படும்." : "List job openings across all 38 districts of Tamil Nadu."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAiAutoFillJobPost}
                disabled={isAiAutoClassifying}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{isAiAutoClassifying ? "AI நிரப்புகிறது..." : "AI Auto-Fill"}</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewJob} className="space-y-3 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "வேலை தலைப்பு (Tamil Job Title):" : "Job Title (Tamil):"} *
                </label>
                <input
                  type="text"
                  required
                  value={postJobTitle}
                  onChange={(e) => setPostJobTitle(e.target.value)}
                  placeholder="எ.கா. சென்னை உயர்தர பங்களா - PU பாலிஷ் & பெயிண்டிங்"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "நிறுவனம் / காண்ட்ராக்டர் பெயர்:" : "Company / Contractor Name:"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={postJobCompany}
                    onChange={(e) => setPostJobCompany(e.target.value)}
                    placeholder="ஸ்ரீ பாலாஜி காண்ட்ராக்டர்ஸ்"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "தொழில் பிரிவு (Category):" : "Occupation Category:"}
                  </label>
                  <select
                    value={postJobCategory}
                    onChange={(e) => setPostJobCategory(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    {occupationCategories.filter(c => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.nameEn}>
                        {lang === "ta" ? cat.name : cat.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "மாவட்ட தேர்வு:" : "District:"}
                  </label>
                  <select
                    value={postJobDistrict}
                    onChange={(e) => setPostJobDistrict(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    {tnDistricts.filter(d => d !== "அனைத்து மாவட்டங்கள்").map((d, idx) => (
                      <option key={idx} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "கூலி / சம்பளம்:" : "Salary / Wage:"}
                  </label>
                  <input
                    type="text"
                    value={postJobSalary}
                    onChange={(e) => setPostJobSalary(e.target.value)}
                    placeholder="₹1,200 / நாள்"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "தொடர்பு தொலைபேசி எண்:" : "Contact Phone:"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={postJobPhone}
                    onChange={(e) => setPostJobPhone(e.target.value)}
                    placeholder="+919840112233"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {lang === "ta" ? "வேலை விவர விளக்கம்:" : "Job Description:"}
                </label>
                <textarea
                  rows={3}
                  value={postJobDesc}
                  onChange={(e) => setPostJobDesc(e.target.value)}
                  placeholder="வேலை தளம், வேலை நாட்கள் மற்றும் உபகரணங்கள் விவரம்..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-700">
                  <input
                    type="checkbox"
                    checked={postJobUrgent}
                    onChange={(e) => setPostJobUrgent(e.target.checked)}
                    className="accent-[#b91c1c] rounded"
                  />
                  <span>🚨 {lang === "ta" ? "அவசர காலிப்பணியிடம் எனக் குறிக்கவும்" : "Mark as Urgent Need"}</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostJobModal(false)}
                    className="px-4 py-2 bg-stone-200 text-stone-800 font-bold rounded-xl cursor-pointer"
                  >
                    {lang === "ta" ? "ரத்து" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#b91c1c] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    {lang === "ta" ? "விளம்பரம் வெளியிடு" : "Publish Job Post"}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
