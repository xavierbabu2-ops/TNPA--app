import React, { useState, useMemo } from "react";
import { 
  CreditCard, Shield, Download, CheckCircle, AlertCircle, Sparkles, Receipt, 
  Search, Coins, Printer, Share2, Users, Check, FileText, 
  QrCode, RefreshCw, Landmark, Info, HeartHandshake, Award, 
  ArrowUpRight, ArrowDownRight, Filter, Eye, Building2, UserPlus, Send, Copy, TrendingUp,
  Phone, Smartphone, ExternalLink
} from "lucide-react";
import { PaymentRecord, ExpenseRecord, UserAccount, MemberRegistration } from "../types";
import SubscriptionReceiptModal from "./SubscriptionReceiptModal";
import { AssociationEmblemLogo, AssociationWavingFlag } from "./UnionOfficialIdCard";

interface PaymentModuleProps {
  lang: "ta" | "en";
  onAddPayment: (newPay: PaymentRecord) => void;
  paymentsList: PaymentRecord[];
  onUpdatePayments?: (newPayments: PaymentRecord[]) => void;
  currentUser?: UserAccount | null;
  registrations?: MemberRegistration[];
  onAddAuditLog?: (action: string, details: string) => void;
  customLogoUrl?: string | null;
  customFlagUrl?: string | null;
}

// Initial Seed Subscription Payments
const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay_sub_01",
    memberId: "TNP-STATE-001",
    memberName: "ரா. சேவியர் பாபு (R. Xavier Babu)",
    amount: 720,
    paymentDate: "2026-08-01 10:30 AM",
    paymentType: "membership",
    paymentTypeTa: "மாநில பொறுப்பாளர் சந்தா (வருடாந்திரம்)",
    subscriptionTier: "state_leader",
    subscriptionTierTa: "மாநில பொறுப்பாளர் சந்தா",
    subscriptionPeriod: "12_months",
    subscriptionMonthsCount: 12,
    monthlyRate: 60,
    designation: "மாநில பொதுச்செயலாளர்",
    transactionId: "TXN983274981",
    status: "success",
    paymentMethod: "upi",
    paymentMethodLabel: "GPay UPI",
    district: "மதுரை",
    receiptNo: "TNPA-SUB-2026-0001",
    phone: "9842188899"
  },
  {
    id: "pay_sub_02",
    memberId: "TNP-STATE-002",
    memberName: "S. மைக்கேல் ஆல்வின் (S. Michael Alvin)",
    amount: 720,
    paymentDate: "2026-08-01 11:15 AM",
    paymentType: "membership",
    paymentTypeTa: "மாநில பொறுப்பாளர் சந்தா (வருடாந்திரம்)",
    subscriptionTier: "state_leader",
    subscriptionTierTa: "மாநில பொறுப்பாளர் சந்தா",
    subscriptionPeriod: "12_months",
    subscriptionMonthsCount: 12,
    monthlyRate: 60,
    designation: "மாநில தலைவர்",
    transactionId: "TXN983274982",
    status: "success",
    paymentMethod: "upi",
    paymentMethodLabel: "PhonePe UPI",
    district: "சென்னை",
    receiptNo: "TNPA-SUB-2026-0002",
    phone: "9443211100"
  },
  {
    id: "pay_sub_03",
    memberId: "TNP-DIST-MDU-01",
    memberName: "கே. பழனிச்சாமி (K. Palanisamy)",
    amount: 600,
    paymentDate: "2026-08-02 09:45 AM",
    paymentType: "membership",
    paymentTypeTa: "மாவட்ட பொறுப்பாளர் சந்தா (வருடாந்திரம்)",
    subscriptionTier: "district_leader",
    subscriptionTierTa: "மாவட்ட பொறுப்பாளர் சந்தா",
    subscriptionPeriod: "12_months",
    subscriptionMonthsCount: 12,
    monthlyRate: 50,
    designation: "மாவட்ட தலைவர் - மதுரை",
    transactionId: "TXN823749283",
    status: "success",
    paymentMethod: "upi",
    paymentMethodLabel: "Google Pay",
    district: "மதுரை",
    receiptNo: "TNPA-SUB-2026-0003",
    phone: "9842199911"
  },
  {
    id: "pay_sub_04",
    memberId: "TNP-DIST-CHE-01",
    memberName: "மு. செந்தில்வேல் (M. Senthilvel)",
    amount: 300,
    paymentDate: "2026-08-03 04:20 PM",
    paymentType: "membership",
    paymentTypeTa: "மாவட்ட பொறுப்பாளர் சந்தா (அரையாண்டு)",
    subscriptionTier: "district_leader",
    subscriptionTierTa: "மாவட்ட பொறுப்பாளர் சந்தா",
    subscriptionPeriod: "6_months",
    subscriptionMonthsCount: 6,
    monthlyRate: 50,
    designation: "மாவட்ட செயலாளர் - சென்னை",
    transactionId: "TXN776293812",
    status: "success",
    paymentMethod: "qr",
    paymentMethodLabel: "QR Scan & Pay",
    district: "சென்னை",
    receiptNo: "TNPA-SUB-2026-0004",
    phone: "9840123456"
  },
  {
    id: "pay_sub_05",
    memberId: "TNP-MEM-0045",
    memberName: "ஆ. சுப்பிரமணியன் (A. Subramanian)",
    amount: 600,
    paymentDate: "2026-08-04 11:00 AM",
    paymentType: "membership",
    paymentTypeTa: "நிர்வாகி / உறுப்பினர் சந்தா (வருடாந்திரம்)",
    subscriptionTier: "other_executive",
    subscriptionTierTa: "நிர்வாகி / உறுப்பினர் சந்தா",
    subscriptionPeriod: "12_months",
    subscriptionMonthsCount: 12,
    monthlyRate: 50,
    designation: "நகர நிர்வாகி / மூத்த ஓவியர்",
    transactionId: "TXN554182901",
    status: "success",
    paymentMethod: "cash",
    paymentMethodLabel: "Cash Handover",
    district: "கோயம்புத்தூர்",
    receiptNo: "TNPA-SUB-2026-0005",
    phone: "9789012345"
  },
  {
    id: "pay_sub_06",
    memberId: "TNP-DEV-101",
    memberName: "விஸ்வா பெயிண்ட்ஸ் & டிரேடர்ஸ் (Vishwa Paints & Traders)",
    amount: 10000,
    paymentDate: "2026-08-05 02:30 PM",
    paymentType: "donation",
    paymentTypeTa: "சங்க வளர்ச்சி நிதி",
    subscriptionTier: "development_fund",
    subscriptionTierTa: "சங்க வளர்ச்சி நிதி",
    designation: "சங்க புரவலர் / வணிக ஆதரவாளர்",
    transactionId: "TXN443219087",
    status: "success",
    paymentMethod: "bank_transfer",
    paymentMethodLabel: "RTGS Bank Transfer",
    district: "சென்னை",
    receiptNo: "TNPA-DEV-2026-0001",
    remarks: "மாநில தலைமை சங்க கட்டட வளர்ச்சி நிதி"
  },
  {
    id: "pay_sub_07",
    memberId: "TNP-DON-202",
    memberName: "என். ராஜகோபால் (N. Rajagopal)",
    amount: 5000,
    paymentDate: "2026-08-05 05:15 PM",
    paymentType: "donation",
    paymentTypeTa: "அன்பளிப்பு / நன்கொடை",
    subscriptionTier: "donation",
    subscriptionTierTa: "அன்பளிப்பு / பொது நன்கொடை",
    designation: "ஓய்வுபெற்ற ஓவிய ஆசிரியர்",
    transactionId: "TXN332190876",
    status: "success",
    paymentMethod: "upi",
    paymentMethodLabel: "GPay UPI",
    district: "திருச்சிராப்பள்ளி",
    receiptNo: "TNPA-DON-2026-0001",
    remarks: "ஏழை ஓவியர் குடும்ப நல நிதி அன்பளிப்பு"
  }
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: "exp_01",
    title: "State Executive Committee Meeting Arrangements",
    titleTa: "மாநில செயற்குழு கூட்ட அரங்கு & தேநீர் செலவு",
    amount: 12500,
    date: "2026-08-01",
    category: "event",
    categoryTa: "கூட்டங்கள் மற்றும் நிகழ்வுகள் (Event)",
    district: "மாநில தலைமை (State HQ)",
    recordedBy: "ரா. சக்திவேல் (மாநில பொருளாளர்)",
    remarks: "மதுரை மண்டல மாநாட்டு மண்டப முன்பதிவு"
  },
  {
    id: "exp_02",
    title: "Official Member ID Card Printing (Batch 1)",
    titleTa: "உறுப்பினர் ஸ்மார்ட் ஐடி கார்டு அச்சிடுதல் செலவு",
    amount: 18400,
    date: "2026-08-02",
    category: "printing",
    categoryTa: "அச்சிடுதல் மற்றும் அடையாள அட்டை (Printing)",
    district: "மாநில தலைமை (State HQ)",
    recordedBy: "ரா. சக்திவேல் (மாநில பொருளாளர்)",
    remarks: "500 உறுப்பினர்களுக்கான PVC ஸ்மார்ட் கார்டுகள்"
  },
  {
    id: "exp_03",
    title: "Painter Accident Medical Emergency Relief",
    titleTa: "பணிவிபத்தில் காயமடைந்த ஓவியருக்கு அவசர மருத்துவ உதவி",
    amount: 15000,
    date: "2026-08-04",
    category: "relief",
    categoryTa: "ஓவியர் அவசர நிவாரணம் (Emergency Relief)",
    district: "சேலம்",
    recordedBy: "சேலம் மாவட்ட தலைவர்",
    remarks: "உறுப்பினர் சண்முகம் மருத்துவமனை சிகிச்சை நிதி"
  }
];

export default function PaymentModule({
  lang,
  onAddPayment,
  paymentsList,
  onUpdatePayments,
  currentUser,
  registrations = [],
  onAddAuditLog,
  customLogoUrl,
  customFlagUrl
}: PaymentModuleProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"subscriptions" | "development_fund" | "donations" | "continuous_ledger" | "expenses" | "bank_details">("subscriptions");

  // Selected Subscription Tier
  // 1. state_leader (₹60/mo)
  // 2. district_leader (₹50/mo)
  // 3. other_executive (₹50/mo)
  // 4. development_fund
  // 5. donation
  const [selectedTier, setSelectedTier] = useState<"state_leader" | "district_leader" | "other_executive" | "development_fund" | "donation">("state_leader");
  
  // Subscription Period: 1_month, 3_months, 6_months, 12_months, custom
  const [selectedPeriod, setSelectedPeriod] = useState<"1_month" | "3_months" | "6_months" | "12_months" | "custom">("12_months");
  const [customMonths, setCustomMonths] = useState<number>(1);
  const [customAmount, setCustomAmount] = useState<number>(1000);

  // Form Fields
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberDistrict, setMemberDistrict] = useState("சென்னை");
  const [memberDesignation, setMemberDesignation] = useState("மாநிலப் பொறுப்பாளர்");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "qr" | "bank_transfer" | "cash">("upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  // Ledger Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterDistrict, setFilterDistrict] = useState("all");

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expCategory, setExpCategory] = useState<"office" | "event" | "travel" | "printing" | "training" | "relief" | "other">("office");
  const [expRemarks, setExpRemarks] = useState("");

  // All combined payments list
  const combinedPayments = useMemo(() => {
    const map = new Map<string, PaymentRecord>();
    SEED_PAYMENTS.forEach((p) => map.set(p.id, p));
    paymentsList.forEach((p) => map.set(p.id, p));
    return Array.from(map.values()).sort((a, b) => {
      return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
    });
  }, [paymentsList]);

  // Calculate monthly rate based on tier
  const monthlyRate = useMemo(() => {
    if (selectedTier === "state_leader") return 60;
    if (selectedTier === "district_leader") return 50;
    if (selectedTier === "other_executive") return 50;
    return 0;
  }, [selectedTier]);

  // Calculate total amount to pay
  const calculatedAmount = useMemo(() => {
    if (selectedTier === "development_fund" || selectedTier === "donation") {
      return customAmount > 0 ? customAmount : 500;
    }
    if (selectedPeriod === "1_month") return monthlyRate * 1;
    if (selectedPeriod === "3_months") return monthlyRate * 3;
    if (selectedPeriod === "6_months") return monthlyRate * 6;
    if (selectedPeriod === "12_months") return monthlyRate * 12;
    if (selectedPeriod === "custom") return monthlyRate * (customMonths > 0 ? customMonths : 1);
    return monthlyRate * 12;
  }, [selectedTier, selectedPeriod, monthlyRate, customMonths, customAmount]);

  // Handle Member Quick Autofill
  const handleMemberLookup = (idOrPhone: string) => {
    setMemberId(idOrPhone);
    const cleaned = idOrPhone.trim().toLowerCase();
    if (!cleaned) return;

    const found = registrations.find(
      (r) => r.regNumber.toLowerCase().includes(cleaned) || r.phone.includes(cleaned) || r.name.toLowerCase().includes(cleaned)
    );

    if (found) {
      setMemberName(found.name);
      setMemberPhone(found.phone);
      setMemberDistrict(found.district);
      if (found.designation) {
        setMemberDesignation(found.designation);
      }
    }
  };

  // Switch Tier helper
  const handleSelectTier = (tier: typeof selectedTier) => {
    setSelectedTier(tier);
    if (tier === "state_leader") {
      setMemberDesignation("மாநிலப் பொறுப்பாளர்");
    } else if (tier === "district_leader") {
      setMemberDesignation("மாவட்டப் பொறுப்பாளர்");
    } else if (tier === "other_executive") {
      setMemberDesignation("நிர்வாகி / உறுப்பினர்");
    } else if (tier === "development_fund") {
      setMemberDesignation("சங்க வளர்ச்சிப் புரவலர்");
      setCustomAmount(1000);
    } else if (tier === "donation") {
      setMemberDesignation("நன்கொடையாளர்");
      setCustomAmount(2000);
    }
  };

  // Submit Subscription or Fund Payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberName.trim()) {
      alert(lang === "ta" ? "செலுத்துபவர் பெயரை உள்ளிடவும்!" : "Please enter the payer's name!");
      return;
    }

    if (calculatedAmount <= 0) {
      alert(lang === "ta" ? "சரியான தொகையை உள்ளிடவும்!" : "Please enter a valid amount!");
      return;
    }

    setIsSubmitting(true);

    const receiptNo = `TNPA-${selectedTier === "development_fund" ? "DEV" : selectedTier === "donation" ? "DON" : "SUB"}-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId = utrNumber.trim() || `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;

    const tierLabelsTa: Record<string, string> = {
      state_leader: "மாநில பொறுப்பாளர் சந்தா (₹60/மாதம்)",
      district_leader: "மாவட்ட பொறுப்பாளர் சந்தா (₹50/மாதம்)",
      other_executive: "நிர்வாகி / உறுப்பினர் சந்தா (₹50/மாதம்)",
      development_fund: "சங்க வளர்ச்சி நிதி",
      donation: "அன்பளிப்பு / பொது நன்கொடை"
    };

    const paymentMethodLabels: Record<string, string> = {
      upi: "GPay / PhonePe UPI",
      qr: "QR Scan & Pay",
      bank_transfer: "Bank Transfer (NEFT/IMPS/RTGS)",
      cash: "Cash Received (நேரடி ரொக்கம்)"
    };

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      memberId: memberId.trim() || `TNP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      memberName: memberName.trim(),
      amount: calculatedAmount,
      paymentDate: new Date().toLocaleString(),
      paymentType: selectedTier === "development_fund" || selectedTier === "donation" ? "donation" : "membership",
      paymentTypeTa: tierLabelsTa[selectedTier],
      subscriptionTier: selectedTier,
      subscriptionTierTa: tierLabelsTa[selectedTier],
      subscriptionPeriod: selectedPeriod,
      subscriptionMonthsCount: selectedPeriod === "1_month" ? 1 : selectedPeriod === "3_months" ? 3 : selectedPeriod === "6_months" ? 6 : selectedPeriod === "12_months" ? 12 : customMonths,
      monthlyRate: monthlyRate || undefined,
      designation: memberDesignation.trim(),
      phone: memberPhone.trim(),
      transactionId,
      status: "success",
      paymentMethod,
      paymentMethodLabel: paymentMethodLabels[paymentMethod],
      district: memberDistrict,
      receiptNo,
      remarks: remarks.trim() || undefined
    };

    setTimeout(() => {
      onAddPayment(newPayment);
      setIsSubmitting(false);
      setShowQRModal(false);
      setSelectedReceipt(newPayment); // Auto-open generated receipt!

      if (onAddAuditLog) {
        onAddAuditLog(
          "Subscription Payment Recorded",
          `Recorded ${newPayment.subscriptionTierTa} of ₹${newPayment.amount} for ${newPayment.memberName} (${newPayment.memberId}). Receipt: ${receiptNo}`
        );
      }

      // Reset form
      setMemberId("");
      setMemberName("");
      setMemberPhone("");
      setUtrNumber("");
      setRemarks("");
    }, 800);
  };

  // Add Expense Record
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) {
      alert("Please enter title and amount!");
      return;
    }

    const categoriesTaMap: Record<string, string> = {
      office: "அலுவலகச் செலவுகள் (Office)",
      event: "கூட்டங்கள் மற்றும் நிகழ்வுகள் (Event)",
      travel: "பயணச் செலவு (Travel)",
      printing: "அச்சிடுதல் மற்றும் அடையாள அட்டை (Printing)",
      training: "தொழில்நுட்பப் பயிற்சி (Training)",
      relief: "ஓவியர் அவசர நிவாரணம் (Emergency Relief)",
      other: "இதர செலவுகள் (Other)"
    };

    const newExp: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      title: expTitle,
      titleTa: expTitle,
      amount: expAmount,
      date: new Date().toISOString().split("T")[0],
      category: expCategory,
      categoryTa: categoriesTaMap[expCategory],
      district: "மாநில தலைமை (State HQ)",
      recordedBy: currentUser ? currentUser.name : "மாநில பொருளாளர்",
      remarks: expRemarks
    };

    setExpenses([newExp, ...expenses]);
    setShowExpenseForm(false);
    setExpTitle("");
    setExpAmount(0);
    setExpRemarks("");

    if (onAddAuditLog) {
      onAddAuditLog("Expense Recorded", `Logged ₹${newExp.amount} for ${newExp.titleTa}`);
    }
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    let stateLeadersTotal = 0;
    let stateLeadersCount = 0;
    let districtLeadersTotal = 0;
    let districtLeadersCount = 0;
    let otherMembersTotal = 0;
    let otherMembersCount = 0;
    let devFundTotal = 0;
    let donationTotal = 0;
    let grandTotal = 0;

    combinedPayments.forEach((p) => {
      grandTotal += p.amount;
      if (p.subscriptionTier === "state_leader") {
        stateLeadersTotal += p.amount;
        stateLeadersCount += 1;
      } else if (p.subscriptionTier === "district_leader") {
        districtLeadersTotal += p.amount;
        districtLeadersCount += 1;
      } else if (p.subscriptionTier === "other_executive" || p.subscriptionTier === "general_member") {
        otherMembersTotal += p.amount;
        otherMembersCount += 1;
      } else if (p.subscriptionTier === "development_fund") {
        devFundTotal += p.amount;
      } else if (p.subscriptionTier === "donation") {
        donationTotal += p.amount;
      } else {
        otherMembersTotal += p.amount;
        otherMembersCount += 1;
      }
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = grandTotal - totalExpenses;

    return {
      grandTotal,
      stateLeadersTotal,
      stateLeadersCount,
      districtLeadersTotal,
      districtLeadersCount,
      otherMembersTotal,
      otherMembersCount,
      devFundTotal,
      donationTotal,
      totalExpenses,
      netBalance
    };
  }, [combinedPayments, expenses]);

  // Filtered Payments for the Continuous Ledger
  const filteredLedger = useMemo(() => {
    return combinedPayments.filter((p) => {
      const matchSearch = 
        !searchQuery.trim() ||
        p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.receiptNo && p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.phone && p.phone.includes(searchQuery.trim())) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTier = 
        filterTier === "all" ||
        p.subscriptionTier === filterTier ||
        (filterTier === "other_executive" && (p.subscriptionTier === "other_executive" || p.subscriptionTier === "general_member" || !p.subscriptionTier));

      const matchDistrict = filterDistrict === "all" || p.district === filterDistrict;

      return matchSearch && matchTier && matchDistrict;
    });
  }, [combinedPayments, searchQuery, filterTier, filterDistrict]);

  // Copy Phone Number Handler
  const handleCopyPhone = () => {
    navigator.clipboard.writeText("7010131915");
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Copy UPI ID Handler
  const handleCopyUpi = () => {
    navigator.clipboard.writeText("tnpa.association@sbi");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. TOP HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7f1d1d] via-[#4c0519] to-[#1e1b4b] text-white p-5 sm:p-7 shadow-xl border border-stone-800">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="space-y-2 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-300 font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ta" ? "அதிகாரப்பூர்வ சந்தா & வளர்ச்சி நிதி தளம்" : "Official Subscription & Development Fund Center"}</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-white">
              {lang === "ta" 
                ? "மாநில, மாவட்ட பொறுப்பாளர்கள் சந்தா & சங்க வளர்ச்சி நிதி" 
                : "Leadership Subscriptions & Union Development Funds"}
            </h2>
            
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {lang === "ta"
                ? "மாநில பொறுப்பாளர்கள் (மாதம் ₹60), மாவட்ட பொறுப்பாளர்கள் (மாதம் ₹50), மற்ற நிர்வாகிகள் (மாதம் ₹50) சந்தா மற்றும் சங்க வளர்ச்சி நிதி, அன்பளிப்பு செலுத்தும் தளம். பணம் செலுத்தியவுடன் தானாகவே அதிகாரப்பூர்வ சந்தா ரசீது உருவாக்கப்படும்."
                : "Dedicated tiered subscriptions: State Leaders (₹60/mo), District Leaders (₹50/mo), Executives (₹50/mo), Union Development Fund, and Voluntary Donations with instant auto-generated receipts."}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
            <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 text-center min-w-[130px]">
              <span className="text-[10px] text-stone-300 uppercase font-bold block">{lang === "ta" ? "மொத்த சந்தா வசூல்" : "Total Collected"}</span>
              <span className="text-lg sm:text-xl font-black text-amber-400">₹{metrics.grandTotal.toLocaleString()}</span>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 text-center min-w-[130px]">
              <span className="text-[10px] text-stone-300 uppercase font-bold block">{lang === "ta" ? "கட்டியவர்கள் எண்ணிக்கை" : "Active Payers"}</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">{combinedPayments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "subscriptions", label: "💳 சந்தா செலுத்துக (Subscriptions)", labelEn: "Pay Subscription" },
          { id: "continuous_ledger", label: "📜 தொடர் சந்தா பதிவேடு (Live Ledger)", labelEn: "Continuous Ledger" },
          { id: "development_fund", label: "🏗️ சங்க வளர்ச்சி நிதி (Dev Fund)", labelEn: "Union Development Fund" },
          { id: "donations", label: "🎁 அன்பளிப்பு / நன்கொடை (Donations)", labelEn: "Voluntary Donations" },
          { id: "expenses", label: "📊 வரவு - செலவு கணக்கு (Expenses)", labelEn: "Expenses & Audit" },
          { id: "bank_details", label: "🏛️ சங்க வங்கி விபரம் (Bank Info)", labelEn: "Union Bank Info" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-[#b91c1c] text-white shadow-md border-b-2 border-amber-400"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <span>{lang === "ta" ? tab.label : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PAY SUBSCRIPTIONS (TIERED CARDS & FORM)                           */}
      {/* ========================================================================= */}
      {(activeTab === "subscriptions" || activeTab === "development_fund" || activeTab === "donations") && (
        <div className="space-y-6">
          
          {/* TIER SELECTION CARDS */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
              {lang === "ta" ? "1. சந்தா / நிதிப் பிரிவைத் தேர்ந்தெடுக்கவும்:" : "1. Select Subscription Tier / Fund Category:"}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Tier 1: State Leaders */}
              <div
                onClick={() => handleSelectTier("state_leader")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === "state_leader"
                    ? "border-[#b91c1c] bg-rose-50/70 shadow-md ring-2 ring-rose-300"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {selectedTier === "state_leader" && (
                  <span className="absolute top-2 right-2 bg-[#b91c1c] text-white p-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 block tracking-wider">
                    {lang === "ta" ? "மாநில பொறுப்பாளர்கள்" : "State Leaders"}
                  </span>
                  <div className="text-lg font-black text-stone-900 mt-1">
                    ₹60 <span className="text-xs font-bold text-stone-500">/ {lang === "ta" ? "மாதம்" : "month"}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-tight">
                    {lang === "ta" ? "மாநில தலைவர், பொதுச்செயலாளர், பொருளாளர் உள்ளிட்ட பொறுப்பாளர்கள்" : "State President, Gen Sec, Treasurer & State Team"}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 text-[10px] font-bold text-[#b91c1c]">
                  {lang === "ta" ? "வருடாந்திரம்: ₹720" : "Annual: ₹720"}
                </div>
              </div>

              {/* Tier 2: District Leaders */}
              <div
                onClick={() => handleSelectTier("district_leader")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === "district_leader"
                    ? "border-[#b91c1c] bg-rose-50/70 shadow-md ring-2 ring-rose-300"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {selectedTier === "district_leader" && (
                  <span className="absolute top-2 right-2 bg-[#b91c1c] text-white p-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-700 block tracking-wider">
                    {lang === "ta" ? "மாவட்ட பொறுப்பாளர்கள்" : "District Leaders"}
                  </span>
                  <div className="text-lg font-black text-stone-900 mt-1">
                    ₹50 <span className="text-xs font-bold text-stone-500">/ {lang === "ta" ? "மாதம்" : "month"}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-tight">
                    {lang === "ta" ? "மாவட்ட தலைவர், செயலாளர், பொருளாளர் மற்றும் மாவட்ட நிர்வாகிகள்" : "District Presidents, Secretaries & District Execs"}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 text-[10px] font-bold text-blue-700">
                  {lang === "ta" ? "வருடாந்திரம்: ₹600" : "Annual: ₹600"}
                </div>
              </div>

              {/* Tier 3: Other Executives & Members */}
              <div
                onClick={() => handleSelectTier("other_executive")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === "other_executive"
                    ? "border-[#b91c1c] bg-rose-50/70 shadow-md ring-2 ring-rose-300"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {selectedTier === "other_executive" && (
                  <span className="absolute top-2 right-2 bg-[#b91c1c] text-white p-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 block tracking-wider">
                    {lang === "ta" ? "மற்ற நிர்வாகிகள் & உறுப்பினர்கள்" : "Other Execs & Members"}
                  </span>
                  <div className="text-lg font-black text-stone-900 mt-1">
                    ₹50 <span className="text-xs font-bold text-stone-500">/ {lang === "ta" ? "மாதம்" : "month"}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-tight">
                    {lang === "ta" ? "ஒன்றிய, நகர, பகுதி பொறுப்பாளர்கள் மற்றும் பொது உறுப்பினர்கள்" : "Union, Town, Ward Leaders & General Members"}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 text-[10px] font-bold text-emerald-700">
                  {lang === "ta" ? "வருடாந்திரம்: ₹600" : "Annual: ₹600"}
                </div>
              </div>

              {/* Tier 4: Union Development Fund */}
              <div
                onClick={() => handleSelectTier("development_fund")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === "development_fund"
                    ? "border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-300"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {selectedTier === "development_fund" && (
                  <span className="absolute top-2 right-2 bg-amber-600 text-white p-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 block tracking-wider">
                    {lang === "ta" ? "சங்க வளர்ச்சி நிதி" : "Union Dev Fund"}
                  </span>
                  <div className="text-lg font-black text-amber-900 mt-1">
                    {lang === "ta" ? "விருப்ப நிதி" : "Flexible"}
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-tight">
                    {lang === "ta" ? "சங்க கட்டடம், மாநாடு மற்றும் நவீன உபகரண வளர்ச்சி நிதி" : "Building fund, conferences, legal aid & union infrastructure"}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200 text-[10px] font-bold text-amber-800">
                  {lang === "ta" ? "விரும்பிய தொகை" : "Custom Amount"}
                </div>
              </div>

              {/* Tier 5: Donation */}
              <div
                onClick={() => handleSelectTier("donation")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === "donation"
                    ? "border-purple-600 bg-purple-50/80 shadow-md ring-2 ring-purple-300"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {selectedTier === "donation" && (
                  <span className="absolute top-2 right-2 bg-purple-600 text-white p-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-800 block tracking-wider">
                    {lang === "ta" ? "அன்பளிப்பு / நன்கொடை" : "Donations"}
                  </span>
                  <div className="text-lg font-black text-purple-900 mt-1">
                    {lang === "ta" ? "அன்பளிப்பு" : "Voluntary"}
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-tight">
                    {lang === "ta" ? "ஓவியர் அவசர மருத்துவ உதவி மற்றும் குடும்ப நல நன்கொடை" : "Painter welfare, emergency medical aid & benevolent fund"}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-purple-200 text-[10px] font-bold text-purple-800">
                  {lang === "ta" ? "நன்கொடை சான்றிதழ்" : "Tax Exempt / Receipt"}
                </div>
              </div>

            </div>
          </div>

          {/* MAIN PAYMENT FORM & DYNAMIC RECEIPT GENERATOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 7 COLS: THE PAYMENT FORM */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#b91c1c]" />
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                    {lang === "ta" ? "சந்தா / நிதி செலுத்தும் படிவம்" : "Payment Submission Form"}
                  </h3>
                </div>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                  {selectedTier === "state_leader" ? "மாநில சந்தா (₹60/மாதம்)" : selectedTier === "district_leader" ? "மாவட்ட சந்தா (₹50/மாதம்)" : selectedTier === "other_executive" ? "நிர்வாகி சந்தா (₹50/மாதம்)" : selectedTier === "development_fund" ? "வளர்ச்சி நிதி" : "நன்கொடை"}
                </span>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                
                {/* Duration / Period Selection for Monthly Tiers */}
                {(selectedTier === "state_leader" || selectedTier === "district_leader" || selectedTier === "other_executive") && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      {lang === "ta" ? "சந்தா செலுத்தும் கால அளவு:" : "Subscription Duration:"}
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "1_month", label: "1 மாதம்", labelEn: "1 Month", amt: monthlyRate * 1 },
                        { id: "3_months", label: "3 மாதங்கள்", labelEn: "3 Months (Quarter)", amt: monthlyRate * 3 },
                        { id: "6_months", label: "6 மாதங்கள்", labelEn: "6 Months (Half-Yr)", amt: monthlyRate * 6 },
                        { id: "12_months", label: "1 வருடம் (12 மாதம்)", labelEn: "1 Year (Annual)", amt: monthlyRate * 12 }
                      ].map((period) => (
                        <button
                          key={period.id}
                          type="button"
                          onClick={() => setSelectedPeriod(period.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedPeriod === period.id
                              ? "border-[#b91c1c] bg-[#b91c1c] text-white font-black shadow-xs"
                              : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 font-semibold"
                          }`}
                        >
                          <span className="text-xs block">{lang === "ta" ? period.label : period.labelEn}</span>
                          <span className={`text-[11px] block mt-0.5 ${selectedPeriod === period.id ? "text-amber-300 font-black" : "text-stone-600 font-bold"}`}>
                            ₹{period.amt}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Amount for Dev Fund or Donation */}
                {(selectedTier === "development_fund" || selectedTier === "donation") && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      {lang === "ta" ? "செலுத்த விரும்பும் தொகையைத் தேர்ந்தெடுக்கவும் அல்லது உள்ளிடவும்:" : "Select or Enter Amount:"}
                    </label>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {[250, 500, 1000, 2000, 5000, 10000].map((amt) => (
                        <button
                          key={`fund_chip_${amt}`}
                          type="button"
                          onClick={() => setCustomAmount(amt)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            customAmount === amt
                              ? "bg-amber-600 text-white border-amber-700"
                              : "bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          ₹{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-500 font-black">₹</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                        placeholder="5000"
                        min="50"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Autofill search */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "உறுப்பினர் எண் / பதிவு எண் (விரைவு தேடல்):" : "Member ID / Reg No (Quick Autofill):"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={memberId}
                      onChange={(e) => handleMemberLookup(e.target.value)}
                      placeholder={lang === "ta" ? "உதாரணம்: TNP-2026-0034 அல்லது போன் எண்" : "e.g., TNP-2026-0034 or Phone"}
                      className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === "ta" ? "செலுத்துபவர் பெயர் *" : "Payer Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder={lang === "ta" ? "பெயர் (எ.கா: கே. பழனிச்சாமி)" : "Name"}
                      className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === "ta" ? "கைபேசி எண் (வாட்ஸ்அப்)" : "Mobile Phone (WhatsApp)"}
                    </label>
                    <input
                      type="tel"
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      placeholder="98421XXXXX"
                      className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                    />
                  </div>
                </div>

                {/* Designation & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === "ta" ? "பொறுப்பு / பதவி" : "Designation / Role"}
                    </label>
                    <input
                      type="text"
                      value={memberDesignation}
                      onChange={(e) => setMemberDesignation(e.target.value)}
                      placeholder={lang === "ta" ? "பொறுப்பு (எ.கா: மாவட்ட தலைவர்)" : "Designation"}
                      className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === "ta" ? "மாவட்டம் *" : "District *"}
                    </label>
                    <select
                      value={memberDistrict}
                      onChange={(e) => setMemberDistrict(e.target.value)}
                      className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 bg-white focus:outline-none focus:border-[#b91c1c]"
                    >
                      {[
                        "சென்னை", "மதுரை", "கோயம்புத்தூர்", "திருச்சிராப்பள்ளி", "சேலம்", 
                        "திருநெல்வேலி", "ஈரோடு", "வேலூர்", "தூத்துக்குடி", "திண்டுக்கல்", 
                        "தஞ்சாவூர்", "விருதுநகர்", "கரூர்", "நாமக்கல்", "கன்னியாகுமரி", 
                        "காஞ்சிபுரம்", "திருவள்ளூர்", "திருப்பூர்", "தர்மபுரி", "கிருஷ்ணகிரி",
                        "புதுக்கோட்டை", "சிவகங்கை", "ராமநாதபுரம்", "தேனி", "நீலகிரி", 
                        "திருவண்ணாமலை", "விழுப்புரம்", "கடலூர்", "நாகப்பட்டினம்", "மயிலாடுதுறை",
                        "திருவாரூர்", "பெரம்பலூர்", "அரியலூர்", "கள்ளக்குறிச்சி", "ராணிப்பேட்டை",
                        "திருப்பத்தூர்", "செங்கல்பட்டு", "தென்காசி"
                      ].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    {lang === "ta" ? "பணம் செலுத்தும் முறை (Payment Mode):" : "Payment Mode:"}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "upi", label: "GPay / PhonePe / Paytm", sub: "எண்: 7010131915", icon: Smartphone },
                      { id: "bank_transfer", label: "Bank Transfer", sub: "SBI வங்கி கணக்கு", icon: Landmark },
                      { id: "cash", label: "நேரடி ரொக்கம்", sub: "Cash at Office", icon: Coins }
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            paymentMethod === m.id
                              ? "border-[#b91c1c] bg-rose-50 text-[#b91c1c] font-black shadow-xs ring-1 ring-rose-200"
                              : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px] font-bold">{m.label}</span>
                          <span className="text-[9px] opacity-75">{m.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Transaction ID / Code Number Input */}
                {paymentMethod !== "cash" && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-[#b91c1c]">
                        {lang === "ta" ? "பணம் செலுத்திய ரசீதில் உள்ள கோட் நம்பர் (Transaction ID / UTR Code) *" : "Receipt Transaction / Code Number (UTR / Ref ID) *"}
                      </label>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                        {lang === "ta" ? "ரசீது பெற முக்கியம்" : "Required for Receipt"}
                      </span>
                    </div>
                    <input
                      type="text"
                      required={paymentMethod === "upi"}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder={lang === "ta" ? "எ.கா: 421889912839 அல்லது UPI Ref / UTR கோட் நம்பர்" : "e.g., 421889912839 or UPI Ref / UTR Code"}
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c]"
                    />
                    <p className="text-[11px] text-stone-600 leading-tight">
                      {lang === "ta" 
                        ? "💡 GPay, PhonePe அல்லது Paytm-ல் 7010131915 எண்ணிற்கு பணம் செலுத்திய பின் கிடைக்கும் ரசீதில் உள்ள 12 இலக்க UTR / Transaction ID கோட் நம்பரை இங்கே உள்ளிட்டு உடனடி அதிகாரப்பூர்வ சந்தா ரசீதைப் பெற்றுக்கொள்ளவும்." 
                        : "💡 Enter the 12-digit UTR or Transaction Code from your GPay / PhonePe / Paytm payment receipt to generate the official union receipt."}
                    </p>
                  </div>
                )}

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === "ta" ? "குறிப்பு / விபரம் (Remarks):" : "Remarks:"}
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={lang === "ta" ? "எ.கா: ஆகஸ்ட் 2026 சந்தா" : "e.g., August 2026 Subscription"}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#b91c1c] to-rose-700 hover:from-rose-700 hover:to-[#b91c1c] text-white font-black text-sm rounded-2xl shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{lang === "ta" ? "ரசீது உருவாக்கப்படுகிறது..." : "Generating Receipt..."}</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-5 h-5 text-amber-300" />
                        <span>
                          {lang === "ta" 
                            ? `₹${calculatedAmount.toLocaleString()} செலுத்தி தானியங்கி ரசீது பெறுக` 
                            : `Pay ₹${calculatedAmount.toLocaleString()} & Generate Official Receipt`}
                        </span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>

            {/* RIGHT 5 COLS: OFFICIAL UPI MOBILE PAYMENT & STEP-BY-STEP WORKFLOW */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Official Approved UPI Mobile Payment Card */}
              <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-neutral-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-amber-400/80 shadow-2xl space-y-5 text-left relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="space-y-1 border-b border-stone-800 pb-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[11px] text-amber-300 font-black">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === "ta" ? "சங்கத்தின் அங்கீகரிக்கப்பட்ட செலுத்துகை எண்" : "Official Approved Union Payment Number"}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white mt-1">
                    {lang === "ta" ? "GPay, PhonePe, Paytm வழி சந்தா செலுத்த" : "Pay via GPay, PhonePe & Paytm"}
                  </h4>
                </div>

                {/* Big Highlighted Phone Number Display */}
                <div className="bg-white/5 border-2 border-amber-400/60 rounded-2xl p-4 text-center space-y-3">
                  <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">
                    {lang === "ta" ? "அங்கீகரிக்கப்பட்ட தொலைபேசி எண் (UPI Payment Mobile)" : "Approved Official Mobile Number"}
                  </span>

                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-widest flex items-center justify-center gap-2">
                    <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
                    <span>70 10 13 19 15</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPhone ? (lang === "ta" ? "எண் நகலெடுக்கப்பட்டது!" : "Copied!") : (lang === "ta" ? "எண்ணை நகலெடு (Copy)" : "Copy Number")}</span>
                    </button>

                    <a
                      href="tel:7010131915"
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 border border-white/20"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{lang === "ta" ? "அழைக்க" : "Call"}</span>
                    </a>
                  </div>
                </div>

                {/* Supported UPI Apps Badges */}
                <div className="space-y-2">
                  <span className="text-[11px] text-stone-400 font-bold block uppercase tracking-wider">
                    {lang === "ta" ? "இந்த எண்ணில் இயங்கும் செயலிகள் (Supported UPI Apps):" : "Active UPI Apps on this Number:"}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        G
                      </div>
                      <span className="text-[11px] font-black text-white">Google Pay</span>
                      <span className="text-[9px] text-emerald-400 font-bold">இயங்குகிறது ✓</span>
                    </div>

                    <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        Pe
                      </div>
                      <span className="text-[11px] font-black text-white">PhonePe</span>
                      <span className="text-[9px] text-emerald-400 font-bold">இயங்குகிறது ✓</span>
                    </div>

                    <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        Pay
                      </div>
                      <span className="text-[11px] font-black text-white">Paytm</span>
                      <span className="text-[9px] text-emerald-400 font-bold">இயங்குகிறது ✓</span>
                    </div>
                  </div>
                </div>

                {/* 4-Step Instructions to Pay and Receive Instant Receipt */}
                <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    {lang === "ta" ? "சந்தா செலுத்தி ரசீது பெறும் எளிய முறை:" : "How to Pay & Get Official Receipt:"}
                  </span>

                  <ol className="text-xs text-stone-200 space-y-2.5 list-none">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>
                        {lang === "ta" 
                          ? <>உங்கள் <b>Google Pay / PhonePe / Paytm</b> செயலியில் சங்க அங்கீகரிக்கப்பட்ட எண் <b>7010131915</b>-க்கு உங்கள் சந்தா தொகையைச் செலுத்தவும்.</>
                          : <>Send your subscription amount to <b>7010131915</b> via <b>GPay / PhonePe / Paytm</b>.</>}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>
                        {lang === "ta" 
                          ? <>பணம் செலுத்திய ரசீதில் உள்ள <b>பரிவர்த்தனை கோட் நம்பரை (Transaction ID / UTR / Ref No)</b> குறித்துக்கொள்ளவும்.</>
                          : <>Note down the <b>Transaction ID / UTR Code</b> from your payment success receipt.</>}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>
                        {lang === "ta" 
                          ? <>இடதுபுற படிவத்தில் உங்கள் பெயர், விவரங்களுடன் அந்த <b>கோட் நம்பரை உள்ளீடு (Enter)</b> செய்யவும்.</>
                          : <>Enter the <b>Code Number</b> along with your details in the payment form.</>}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>
                        {lang === "ta" 
                          ? <><b>"தானியங்கி ரசீது பெறுக"</b> பொத்தானை அழுத்தி, சங்கத்தின் அதிகாரப்பூர்வ சீல் வைத்த சந்தா ரசீதைப் பெற்றுக்கொள்ளவும்!</>
                          : <>Click <b>"Generate Official Receipt"</b> to view, download, and print your verified receipt!</>}
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Current Amount to Pay Badge */}
                <div className="bg-black/60 border border-stone-700 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-medium">
                    {lang === "ta" ? "தற்போது செலுத்த வேண்டிய தொகை:" : "Selected Amount to Pay:"}
                  </span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    ₹{calculatedAmount.toLocaleString()}.00
                  </span>
                </div>

              </div>

              {/* Official Association Bank Details */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-extrabold text-xs uppercase tracking-wider border-b border-stone-100 pb-2">
                  <Building2 className="w-4 h-4 text-[#b91c1c]" />
                  <span>{lang === "ta" ? "சங்கத்தின் அதிகாரப்பூர்வ வங்கிக் கணக்கு" : "Official Union Bank Account"}</span>
                </div>

                <div className="text-xs space-y-2 text-stone-700">
                  <div className="flex justify-between border-b border-stone-50 pb-1">
                    <span className="text-stone-500 font-medium">{lang === "ta" ? "கணக்கு பெயர்:" : "A/C Name:"}</span>
                    <span className="font-bold text-stone-900 text-right">TN PAINTERS PROGRESSIVE ASSN</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-50 pb-1">
                    <span className="text-stone-500 font-medium">{lang === "ta" ? "வங்கி பெயர்:" : "Bank:"}</span>
                    <span className="font-bold text-stone-900">STATE BANK OF INDIA</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-50 pb-1">
                    <span className="text-stone-500 font-medium">{lang === "ta" ? "கணக்கு எண்:" : "A/C Number:"}</span>
                    <span className="font-mono font-black text-stone-900">41920039281</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-50 pb-1">
                    <span className="text-stone-500 font-medium">{lang === "ta" ? "IFSC குறியீடு:" : "IFSC Code:"}</span>
                    <span className="font-mono font-bold text-blue-700">SBIN0001234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">{lang === "ta" ? "கிளை:" : "Branch:"}</span>
                    <span className="font-semibold text-stone-800">MADURAI MAIN</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CONTINUOUS STATE & EXECUTIVE SUBSCRIPTION LEDGER                   */}
      {/* ========================================================================= */}
      {activeTab === "continuous_ledger" && (
        <div className="space-y-5">
          
          {/* Header Controls & Live Counters */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#b91c1c]" />
                  <span>{lang === "ta" ? "தொடர் சந்தா பதிவேடு (அனைத்து மாநில நிர்வாகிகளுக்கான நேரலை பட்டியல்)" : "Live Continuous Subscription Ledger"}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === "ta"
                    ? "சந்தா தொகை கட்டியவர்கள் பெயர்கள், பொறுப்பு, தொகை மற்றும் உடனடி சந்தா ரசீது விபரங்கள்."
                    : "Real-time list of all leaders and members who paid their subscriptions with instant verified e-receipts."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{filteredLedger.length} {lang === "ta" ? "பதிவுகள்" : "Records"}</span>
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "ta" ? "பெயர், உறுப்பினர் எண், ரசீது எண், போன்..." : "Search Name, ID, Receipt No..."}
                  className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#b91c1c]"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>

              {/* Tier Filter */}
              <div>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 bg-white focus:outline-none focus:border-[#b91c1c]"
                >
                  <option value="all">{lang === "ta" ? "அனைத்து பிரிவுகள் (All Tiers)" : "All Tiers"}</option>
                  <option value="state_leader">{lang === "ta" ? "மாநில பொறுப்பாளர்கள் (₹60/மாதம்)" : "State Leaders (₹60/mo)"}</option>
                  <option value="district_leader">{lang === "ta" ? "மாவட்ட பொறுப்பாளர்கள் (₹50/மாதம்)" : "District Leaders (₹50/mo)"}</option>
                  <option value="other_executive">{lang === "ta" ? "நிர்வாகிகள் & உறுப்பினர்கள் (₹50/மாதம்)" : "Other Execs / Members (₹50/mo)"}</option>
                  <option value="development_fund">{lang === "ta" ? "சங்க வளர்ச்சி நிதி" : "Union Development Fund"}</option>
                  <option value="donation">{lang === "ta" ? "அன்பளிப்பு / நன்கொடை" : "Donations"}</option>
                </select>
              </div>

              {/* District Filter */}
              <div>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 bg-white focus:outline-none focus:border-[#b91c1c]"
                >
                  <option value="all">{lang === "ta" ? "அனைத்து மாவட்டங்கள் (All Districts)" : "All Districts"}</option>
                  {[
                    "சென்னை", "மதுரை", "கோயம்புத்தூர்", "திருச்சிராப்பள்ளி", "சேலம்", 
                    "திருநெல்வேலி", "ஈரோடு", "வேலூர்", "தூத்துக்குடி", "திண்டுக்கல்", 
                    "தஞ்சாவூர்", "விருதுநகர்", "கரூர்", "நாமக்கல்", "கன்னியாகுமரி"
                  ].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Continuous Table Display */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-stone-200">
                    <th className="p-3.5">{lang === "ta" ? "ரசீது எண்" : "Receipt No"}</th>
                    <th className="p-3.5">{lang === "ta" ? "உறுப்பினர் பெயர் & எண்" : "Member Details"}</th>
                    <th className="p-3.5">{lang === "ta" ? "பொறுப்பு / பதவி" : "Designation / Role"}</th>
                    <th className="p-3.5">{lang === "ta" ? "மாவட்டம்" : "District"}</th>
                    <th className="p-3.5">{lang === "ta" ? "சந்தா பிரிவு & காலம்" : "Tier & Duration"}</th>
                    <th className="p-3.5 text-right">{lang === "ta" ? "செலுத்திய தொகை" : "Amount Paid"}</th>
                    <th className="p-3.5 text-center">{lang === "ta" ? "தேதி" : "Payment Date"}</th>
                    <th className="p-3.5 text-center">{lang === "ta" ? "சந்தா ரசீது" : "Official Receipt"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-400">
                        {lang === "ta" ? "சந்தா பதிவுகள் எதுவும் கிடைக்கவில்லை." : "No subscription records found matching your filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((record) => {
                      const isState = record.subscriptionTier === "state_leader";
                      const isDistrict = record.subscriptionTier === "district_leader";
                      const isDev = record.subscriptionTier === "development_fund";
                      const isDon = record.subscriptionTier === "donation";

                      return (
                        <tr key={record.id} className="hover:bg-stone-50 transition-colors">
                          
                          {/* Receipt No */}
                          <td className="p-3.5 font-mono font-bold text-[#b91c1c]">
                            {record.receiptNo || `TNPA-SUB-${record.id.slice(-4)}`}
                          </td>

                          {/* Member Details */}
                          <td className="p-3.5">
                            <span className="font-extrabold text-stone-900 block">{record.memberName}</span>
                            <span className="font-mono text-[10px] text-stone-500 block">{record.memberId} {record.phone ? `• ${record.phone}` : ""}</span>
                          </td>

                          {/* Role / Designation */}
                          <td className="p-3.5">
                            <span className="font-bold text-stone-800">
                              {record.designation || record.payerRole || (lang === "ta" ? "சங்க உறுப்பினர்" : "Member")}
                            </span>
                          </td>

                          {/* District */}
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-stone-100 rounded-md font-semibold text-stone-700 text-[11px]">
                              {record.district || "சென்னை"}
                            </span>
                          </td>

                          {/* Tier & Duration */}
                          <td className="p-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              isState ? "bg-rose-100 text-[#b91c1c]" :
                              isDistrict ? "bg-blue-100 text-blue-800" :
                              isDev ? "bg-amber-100 text-amber-900" :
                              isDon ? "bg-purple-100 text-purple-900" :
                              "bg-emerald-100 text-emerald-800"
                            }`}>
                              {record.subscriptionTierTa || record.paymentTypeTa}
                            </span>
                            {record.subscriptionMonthsCount && (
                              <span className="text-[10px] text-stone-500 block mt-0.5">
                                {record.subscriptionMonthsCount} {lang === "ta" ? "மாதங்கள்" : "Months"}
                              </span>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="p-3.5 text-right font-black text-sm text-[#b91c1c]">
                            ₹{record.amount.toLocaleString()}
                          </td>

                          {/* Date */}
                          <td className="p-3.5 text-center text-[11px] text-stone-500">
                            {record.paymentDate}
                          </td>

                          {/* Action: View & Download Receipt */}
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setSelectedReceipt(record)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 mx-auto cursor-pointer"
                              title={lang === "ta" ? "அதிகாரப்பூர்வ ரசீதை காண்க & அச்சிடுக" : "View & Print Official Receipt"}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{lang === "ta" ? "ரசீது" : "Receipt"}</span>
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: EXPENSES & AUDIT REGISTER                                         */}
      {/* ========================================================================= */}
      {activeTab === "expenses" && (
        <div className="space-y-5">
          
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#b91c1c]" />
                  <span>{lang === "ta" ? "சங்கத்தின் அதிகாரப்பூர்வ வரவு - செலவு கணக்கு" : "Income & Expense Audit Registry"}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === "ta" ? "சங்கத்தின் நிதி வெளிப்படைத்தன்மை மற்றும் செலவினப் பதிவேடு." : "Financial transparency, expense tracking and audit logs."}
                </p>
              </div>

              <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="px-4 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{showExpenseForm ? (lang === "ta" ? "படிவத்தை மூடு" : "Close Form") : (lang === "ta" ? "+ புதிய செலவை பதிவு செய்" : "+ Add Expense")}</span>
              </button>
            </div>

            {/* Income vs Expense Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">{lang === "ta" ? "மொத்த சந்தா வரவு" : "Total Revenue"}</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">₹{metrics.grandTotal.toLocaleString()}</span>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="text-[10px] font-bold uppercase text-rose-800 block">{lang === "ta" ? "மொத்த செலவுகள்" : "Total Expenses"}</span>
                <span className="text-xl font-black text-rose-700 mt-1 block">₹{metrics.totalExpenses.toLocaleString()}</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800 block">{lang === "ta" ? "கையிருப்பு நிதி" : "Net Balance"}</span>
                <span className="text-xl font-black text-amber-900 mt-1 block">₹{metrics.netBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* New Expense Form */}
            {showExpenseForm && (
              <form onSubmit={handleAddExpense} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
                  {lang === "ta" ? "புதிய செலவு பதிவு படிவம்" : "Record New Expense"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">{lang === "ta" ? "செலவு விபரம் *" : "Title *"}</label>
                    <input
                      type="text"
                      required
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder={lang === "ta" ? "எ.கா: மண்டப வாடகை" : "Title"}
                      className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">{lang === "ta" ? "தொகை (₹) *" : "Amount (₹) *"}</label>
                    <input
                      type="number"
                      required
                      value={expAmount || ""}
                      onChange={(e) => setExpAmount(Number(e.target.value))}
                      placeholder="5000"
                      className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">{lang === "ta" ? "பிரிவு" : "Category"}</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold bg-white"
                    >
                      <option value="office">அலுவலகச் செலவு (Office)</option>
                      <option value="event">நிகழ்வு / கூட்டம் (Event)</option>
                      <option value="printing">அச்சிடுதல் / அடையாள அட்டை (Printing)</option>
                      <option value="relief">அவசர நிவாரணம் (Relief)</option>
                      <option value="travel">பயணச் செலவு (Travel)</option>
                      <option value="other">இதர செலவுகள் (Other)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {lang === "ta" ? "செலவை சேமிக்குக" : "Save Expense"}
                </button>
              </form>
            )}
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-stone-200">
                    <th className="p-3.5">{lang === "ta" ? "தேதி" : "Date"}</th>
                    <th className="p-3.5">{lang === "ta" ? "செலவு விபரம்" : "Expense Title"}</th>
                    <th className="p-3.5">{lang === "ta" ? "பிரிவு" : "Category"}</th>
                    <th className="p-3.5">{lang === "ta" ? "பதிவு செய்தவர்" : "Recorded By"}</th>
                    <th className="p-3.5 text-right">{lang === "ta" ? "தொகை" : "Amount"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-stone-50">
                      <td className="p-3.5 text-stone-500 font-mono">{e.date}</td>
                      <td className="p-3.5 font-bold text-stone-900">{lang === "ta" ? e.titleTa : e.title}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-stone-100 rounded text-[11px] font-semibold text-stone-700">
                          {e.categoryTa || e.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600">{e.recordedBy}</td>
                      <td className="p-3.5 text-right font-black text-rose-700">₹{e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: BANK ACCOUNT & OFFICIAL INFORMATION                               */}
      {/* ========================================================================= */}
      {activeTab === "bank_details" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2 border-b border-stone-100 pb-5">
            <AssociationEmblemLogo customUrl={customLogoUrl || undefined} size="lg" className="mx-auto" />
            <h3 className="text-lg sm:text-xl font-black text-[#b91c1c]">
              {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்" : "TN Painters and Artists Progressive Association"}
            </h3>
            <p className="text-xs text-stone-500">
              {lang === "ta" ? "அதிகாரப்பூர்வ வங்கிக் கணக்கு விபரங்கள் (Official Bank Information)" : "Official Bank Account Credentials"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-500 block">{lang === "ta" ? "கணக்கு பெயர்" : "Account Name"}</span>
              <span className="text-sm font-black text-stone-900 mt-1 block">TN PAINTERS PROGRESSIVE ASSN</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-500 block">{lang === "ta" ? "வங்கி பெயர்" : "Bank Name"}</span>
              <span className="text-sm font-black text-stone-900 mt-1 block">STATE BANK OF INDIA (SBI)</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-500 block">{lang === "ta" ? "கணக்கு எண்" : "Account Number"}</span>
              <span className="text-sm font-mono font-black text-stone-900 mt-1 block">41920039281</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-500 block">{lang === "ta" ? "IFSC குறியீடு" : "IFSC Code"}</span>
              <span className="text-sm font-mono font-black text-blue-700 mt-1 block">SBIN0001234</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <span className="text-xs font-bold text-amber-900 block">
              {lang === "ta" ? "UPI ID: tnpa.association@sbi" : "UPI ID: tnpa.association@sbi"}
            </span>
            <p className="text-[11px] text-amber-800 mt-1">
              {lang === "ta" 
                ? "வங்கி பரிவர்த்தனை செய்த பின் அதன் குறிப்பு எண்ணை (UTR Number) சந்தா படிவத்தில் பதிவு செய்து உடனடி ரசீதை பெற்றுக்கொள்ளவும்." 
                : "After making a bank transfer, enter the UTR Number in the subscription form to receive your auto-generated receipt."}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AUTO-GENERATED OFFICIAL SUBSCRIPTION RECEIPT                         */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <SubscriptionReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          lang={lang}
          customLogoUrl={customLogoUrl}
          customFlagUrl={customFlagUrl}
        />
      )}

    </div>
  );
}
