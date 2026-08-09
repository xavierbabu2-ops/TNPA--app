import React, { useState, useMemo } from "react";
import { 
  CreditCard, Shield, Download, CheckCircle, AlertCircle, Sparkles, Receipt, 
  Search, Coins, Trash2, Printer, Share2, Clipboard, Users, Check, FileText, 
  QrCode, RefreshCw, Landmark, Info, HeartHandshake, ShieldAlert, Award, ArrowUpRight, ArrowDownRight, Filter
} from "lucide-react";
import { PaymentRecord, ExpenseRecord, UserAccount, MemberRegistration } from "../types";

interface PaymentModuleProps {
  lang: "ta" | "en";
  onAddPayment: (newPay: PaymentRecord) => void;
  paymentsList: PaymentRecord[];
  onUpdatePayments?: (newPayments: PaymentRecord[]) => void;
  currentUser?: UserAccount | null;
  registrations?: MemberRegistration[];
  onAddAuditLog?: (action: string, details: string) => void;
}

// Substantial static seed data to populate analytics and dashboards right away
const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay_101",
    memberId: "TNP-2026-0034",
    memberName: "ரா. கார்த்திகேயன் (R. Karthikeyan)",
    amount: 500,
    paymentDate: "2026-08-01 10:45 AM",
    paymentType: "membership",
    paymentTypeTa: "உறுப்பினர் கட்டணம்",
    transactionId: "TXN983274981",
    status: "success",
    paymentMethod: "upi",
    paymentMethodLabel: "GPay UPI",
    district: "சென்னை",
    receiptNo: "TNPA-REC-2026-0428"
  },
  {
    id: "pay_102",
    memberId: "TNP-2026-0035",
    memberName: "ம. சித்ரா (M. Chitra)",
    amount: 1000,
    paymentDate: "2026-08-03 02:30 PM",
    paymentType: "welfare_fund",
    paymentTypeTa: "நல நிதி",
    transactionId: "TXN823749283",
    status: "pending",
    paymentMethod: "bank_transfer",
    paymentMethodLabel: "Bank Transfer",
    district: "மதுரை",
    receiptNo: "TNPA-REC-2026-0429"
  },
  {
    id: "pay_103",
    memberId: "TNP-2026-1024",
    memberName: "கே. பழனிச்சாமி (K. Palanisamy)",
    amount: 500,
    paymentDate: "2026-07-28 11:15 AM",
    paymentType: "renewal",
    paymentTypeTa: "புதுப்பித்தல்",
    transactionId: "TXN102948212",
    status: "success",
    paymentMethod: "qr",
    paymentMethodLabel: "QR Scan & Pay",
    district: "கோயம்புத்தூர்",
    receiptNo: "TNPA-REC-2026-0430"
  },
  {
    id: "pay_104",
    memberId: "TNP-2026-2091",
    memberName: "சு. ரவிச்சந்திரன் (S. Ravichandran)",
    amount: 5000,
    paymentDate: "2026-07-15 04:00 PM",
    paymentType: "donation",
    paymentTypeTa: "நன்கொடை",
    transactionId: "TXN776293812",
    status: "success",
    paymentMethod: "card",
    paymentMethodLabel: "Credit Card",
    district: "சேலம்",
    receiptNo: "TNPA-REC-2026-0431",
    donorType: "individual"
  },
  {
    id: "pay_105",
    memberId: "TNP-2026-4412",
    memberName: "விஸ்வா பெயிண்ட்ஸ் (Vishwa Paints)",
    amount: 15000,
    paymentDate: "2026-07-12 01:20 PM",
    paymentType: "donation",
    paymentTypeTa: "நன்கொடை",
    transactionId: "TXN554182901",
    status: "success",
    paymentMethod: "bank_transfer",
    paymentMethodLabel: "RTGS Bank Transfer",
    district: "சென்னை",
    receiptNo: "TNPA-REC-2026-0432",
    donorType: "organization"
  },
  {
    id: "pay_106",
    memberId: "TNP-2026-0112",
    memberName: "அ. முகம்மது அலி (A. Mohamed Ali)",
    amount: 300,
    paymentDate: "2026-08-02 09:45 AM",
    paymentType: "event",
    paymentTypeTa: "நிகழ்வு கட்டணம்",
    transactionId: "TXN338291048",
    status: "success",
    paymentMethod: "upi",
    paymentMethodLabel: "Paytm UPI",
    district: "திருச்சிராப்பள்ளி",
    receiptNo: "TNPA-REC-2026-0433"
  },
  {
    id: "pay_107",
    memberId: "TNP-2026-8812",
    memberName: "பெ. தர்மராஜ் (P. Dharmaraj)",
    amount: 500,
    paymentDate: "2026-08-04 08:30 AM",
    paymentType: "renewal",
    paymentTypeTa: "புதுப்பித்தல்",
    transactionId: "TXN112049281",
    status: "success",
    paymentMethod: "cash",
    paymentMethodLabel: "Cash Entry",
    district: "சென்னை",
    receiptNo: "TNPA-REC-2026-0434",
    approverName: "R. Sakthivel"
  },
  {
    id: "pay_108",
    memberId: "TNP-2026-3024",
    memberName: "ஆர். காளிதாஸ் (R. Kalidas)",
    amount: 1000,
    paymentDate: "2026-08-04 09:00 AM",
    paymentType: "welfare_fund",
    paymentTypeTa: "நல நிதி",
    transactionId: "TXN220194829",
    status: "pending",
    paymentMethod: "qr",
    paymentMethodLabel: "QR Scan & Pay",
    district: "மதுரை",
    receiptNo: "TNPA-REC-2026-0435"
  }
];

const SEED_EXPENSES: ExpenseRecord[] = [
  {
    id: "exp_1",
    title: "Office Stationary and Ledger Printing",
    titleTa: "அலுவலக எழுதுபொருள் மற்றும் பதிவேடுகள் அச்சிடுதல்",
    amount: 12500,
    date: "2026-07-20",
    category: "printing",
    categoryTa: "அச்சிடுதல் (Printing)",
    district: "சென்னை",
    recordedBy: "R. Sakthivel",
    remarks: "Printed 500 member files & receipt books"
  },
  {
    id: "exp_2",
    title: "District Meeting Hall rent and refreshments",
    titleTa: "மாவட்ட கிளை கூட்டம் - அரங்கு வாடகை மற்றும் சிற்றுண்டி",
    amount: 25000,
    date: "2026-07-28",
    category: "event",
    categoryTa: "நிகழ்வு (Event)",
    district: "மதுரை",
    recordedBy: "R. Kalidas",
    remarks: "Rent for union hall and snacks for 150 members"
  },
  {
    id: "exp_3",
    title: "Travel Allowance for Accidental Relief Visit",
    titleTa: "விபத்து விபரங்களை அறிய பயணித்த பயணப்பொறுப்புத் தொகை",
    amount: 4500,
    date: "2026-08-02",
    category: "travel",
    categoryTa: "பயணச் செலவு (Travel)",
    district: "சென்னை",
    recordedBy: "R. Sakthivel",
    remarks: "Travel expenses for hospital welfare visitation"
  },
  {
    id: "exp_4",
    title: "Immediate emergency assistance to family of deceased painter",
    titleTa: "மரணமடைந்த ஓவியர் குடும்பத்திற்கு வழங்கப்பட்ட அவசர மரண நிவாரணம்",
    amount: 50000,
    date: "2026-07-18",
    category: "relief",
    categoryTa: "அவசர நிவாரணம் (Relief)",
    district: "கோயம்புத்தூர்",
    recordedBy: "V. Sundaramoorthy",
    remarks: "Immediate cash payout to widow of Late painter Thiru. Selvam"
  },
  {
    id: "exp_5",
    title: "Advanced Spray Painting Tech Training Consumables",
    titleTa: "நவீன ஸ்ப்ரே பெயிண்டிங் தொழில்நுட்ப பயிற்சி உபகரணங்கள்",
    amount: 35000,
    date: "2026-08-01",
    category: "training",
    categoryTa: "பயிற்சி (Training)",
    district: "திருச்சிராப்பள்ளி",
    recordedBy: "K. Shanmugam",
    remarks: "Purchased testing canvas panels and spray primer cans for 50 trainees"
  }
];

export default function PaymentModule({ 
  lang, 
  onAddPayment, 
  paymentsList, 
  onUpdatePayments, 
  currentUser, 
  registrations = [], 
  onAddAuditLog 
}: PaymentModuleProps) {
  
  // Combine parent payments with our robust seed payments
  const allPayments = useMemo(() => {
    const combined = [...paymentsList];
    SEED_PAYMENTS.forEach((seed) => {
      if (!combined.some(p => p.id === seed.id || p.transactionId === seed.transactionId)) {
        combined.push(seed);
      }
    });
    return combined.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [paymentsList]);

  // Handle local state for expenses
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(SEED_EXPENSES);

  // Demo Simulation Role System (allows switching views in dev mode)
  const [demoRole, setDemoRole] = useState<"member" | "district_admin" | "state_treasurer" | "super_admin">(
    currentUser?.role === "super_admin" ? "super_admin" : 
    currentUser?.role === "state_treasurer" ? "state_treasurer" : 
    currentUser?.role === "district_admin" ? "district_admin" : "member"
  );

  const [demoDistrict, setDemoDistrict] = useState<string>("சென்னை");

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"pay_portal" | "donations" | "expenses" | "reports" | "analytics">("pay_portal");

  // Dynamic Payment States
  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberDistrict, setMemberDistrict] = useState("சென்னை");
  const [amount, setAmount] = useState<number>(500);
  const [payType, setPayType] = useState<"membership" | "renewal" | "donation" | "welfare_fund" | "event" | "training" | "other">("membership");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "qr" | "card" | "netbanking" | "cash" | "bank_transfer">("upi");
  const [donorType, setDonorType] = useState<"individual" | "organization" | "sponsor">("individual");
  const [remarks, setRemarks] = useState("");
  
  // Bank transfer state
  const [bankName, setBankName] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // Search filter terms
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("all");
  const [searchType, setSearchType] = useState("all");

  // Interaction states
  const [loading, setLoading] = useState(false);
  const [successRecord, setSuccessRecord] = useState<PaymentRecord | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCounter, setQrCounter] = useState(300);
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);

  // New Expense form state
  const [expTitle, setExpTitle] = useState("");
  const [expTitleTa, setExpTitleTa] = useState("");
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expCategory, setExpCategory] = useState<"office" | "event" | "travel" | "printing" | "training" | "relief" | "other">("office");
  const [expRemarks, setExpRemarks] = useState("");

  // Live member lookup helper
  const handleMemberLookup = (idOrPhone: string) => {
    setMemberId(idOrPhone);
    const cleaned = idOrPhone.trim();
    if (!cleaned) return;

    // Search in registered members
    const foundReg = registrations.find(
      (r) => r.regNumber === cleaned || r.phone === cleaned || r.name.includes(cleaned)
    );
    if (foundReg) {
      setMemberName(foundReg.name);
      setMemberDistrict(foundReg.district);
    }
  };

  // Payment Submission Process
  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      alert(lang === "ta" ? "பணம் செலுத்துபவர் பெயரை உள்ளிடவும்!" : "Please enter the payer's name!");
      return;
    }
    if (amount <= 0) {
      alert(lang === "ta" ? "செல்லுபடியாகும் தொகையை உள்ளிடவும்!" : "Please enter a valid amount!");
      return;
    }

    setLoading(true);

    const processPayment = () => {
      const receiptNo = `TNPA-REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const transactionId = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
      
      const paymentTypesTaMap: Record<string, string> = {
        membership: "உறுப்பினர் கட்டணம்",
        renewal: "புதுப்பித்தல்",
        donation: "நன்கொடை",
        welfare_fund: "நல நிதி",
        event: "நிகழ்வு கட்டணம்",
        training: "பயிற்சி கட்டணம்",
        other: "இதர வருவாய்"
      };

      const paymentMethodLabels: Record<string, string> = {
        upi: "GPay / PhonePe UPI",
        qr: "QR Scan & Pay",
        card: "Credit/Debit Card",
        netbanking: "Net Banking",
        cash: "Cash Received (Manual)",
        bank_transfer: "Bank Transfer Recording"
      };

      const newPay: PaymentRecord = {
        id: `pay_${Date.now()}`,
        memberId: memberId || "GUEST-PAYER",
        memberName,
        amount,
        paymentDate: new Date().toLocaleString(),
        paymentType: payType,
        paymentTypeTa: paymentTypesTaMap[payType] || "இதர வருவாய்",
        transactionId,
        status: paymentMethod === "qr" || paymentMethod === "bank_transfer" ? "pending" : "success",
        paymentMethod,
        paymentMethodLabel: paymentMethodLabels[paymentMethod],
        district: memberDistrict,
        receiptNo,
        remarks: remarks || undefined,
        donorType: payType === "donation" ? donorType : undefined,
        dueDate: payType === "membership" || payType === "renewal" ? "2027-08-04" : undefined
      };

      onAddPayment(newPay);
      setSuccessRecord(newPay);
      setLoading(false);
      setShowQRModal(false);

      if (onAddAuditLog) {
        onAddAuditLog(
          "Union Payment Processed", 
          `Processed ${newPay.paymentType} payment of ₹${newPay.amount} for ${newPay.memberName} via ${newPay.paymentMethodLabel}. Status: ${newPay.status}`
        );
      }
    };

    if (paymentMethod === "qr") {
      setLoading(false);
      setShowQRModal(true);
      setQrCounter(300);
      const interval = setInterval(() => {
        setQrCounter((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeout(processPayment, 1200);
    }
  };

  // Complete QR Verification flow
  const handleConfirmQRPayment = () => {
    setLoading(true);
    setTimeout(() => {
      const receiptNo = `TNPA-REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const transactionId = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
      
      const newPay: PaymentRecord = {
        id: `pay_${Date.now()}`,
        memberId: memberId || "GUEST-QR",
        memberName,
        amount,
        paymentDate: new Date().toLocaleString(),
        paymentType: payType,
        paymentTypeTa: payType === "membership" ? "உறுப்பினர் கட்டணம்" : payType === "welfare_fund" ? "நல நிதி" : "நன்கொடை",
        transactionId,
        status: "success",
        paymentMethod: "qr",
        paymentMethodLabel: "QR Scan & Pay Verified",
        district: memberDistrict,
        receiptNo,
        remarks: remarks || "QR Code Scanned"
      };

      onAddPayment(newPay);
      setSuccessRecord(newPay);
      setLoading(false);
      setShowQRModal(false);

      if (onAddAuditLog) {
        onAddAuditLog("UPI QR Payment Confirmed", `Accredited ₹${newPay.amount} paid by ${newPay.memberName} via scan.`);
      }
    }, 1000);
  };

  // Expense Submission
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) {
      alert("Please provide a title and amount for the expense!");
      return;
    }

    const categoriesTaMap: Record<string, string> = {
      office: "அலுவலகச் செலவுகள் (Office)",
      event: "கூட்டங்கள் மற்றும் நிகழ்வுகள் (Event)",
      travel: "பயணச் செலவு (Travel)",
      printing: "அச்சிடுதல் மற்றும் எழுதுபொருள் (Printing)",
      training: "தொழில்நுட்பப் பயிற்சி (Training)",
      relief: "ஓவியர் அவசர நிவாரணம் (Emergency Relief)",
      other: "இதர செலவுகள் (Other)"
    };

    const newExp: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      title: expTitle,
      titleTa: expTitleTa || expTitle,
      amount: expAmount,
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      categoryTa: categoriesTaMap[expCategory],
      district: demoRole === "district_admin" ? demoDistrict : "மாநில தலைமை (State Board)",
      recordedBy: currentUser ? currentUser.nameEn : "State Treasurer R. Sakthivel",
      remarks: expRemarks
    };

    setExpenses((prev) => [newExp, ...prev]);
    setExpTitle("");
    setExpTitleTa("");
    setExpAmount(0);
    setExpRemarks("");

    if (onAddAuditLog) {
      onAddAuditLog("Expense Logged", `Registered cash outflow of ₹${newExp.amount} for category '${newExp.category}'`);
    }

    alert(lang === "ta" ? "செலவினக் கணக்கு வெற்றிகரமாக பதியப்பட்டது!" : "Expense successfully recorded in ledger!");
  };

  // Administrative Actions
  const handleApprovePendingPayment = (paymentId: string) => {
    if (onUpdatePayments) {
      const updated = allPayments.map(p => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: "success" as const,
            approverName: currentUser?.nameEn || "Treasurer R. Sakthivel",
            approvedAt: new Date().toLocaleString()
          };
        }
        return p;
      });
      onUpdatePayments(updated);
      if (onAddAuditLog) {
        onAddAuditLog("Manual Entry Authorized", `Approved pending payment record ID ${paymentId}`);
      }
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    if (onUpdatePayments) {
      const updated = allPayments.filter(p => p.id !== paymentId);
      onUpdatePayments(updated);
      if (onAddAuditLog) {
        onAddAuditLog("Authorized Record Deleted", `Deleted transaction ledger entry ID ${paymentId}`);
      }
      alert(lang === "ta" ? "பரிவர்த்தனை நீக்கப்பட்டது." : "Ledger record deleted successfully.");
    }
  };

  // Download receipt files
  const downloadReceiptTxt = (record: PaymentRecord) => {
    const text = `
==================================================
   தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
          TAMIL NADU PAINTERS ASSOCIATION
==================================================
ரசீது எண் (Receipt No)  : ${record.receiptNo || "N/A"}
தேதி (Date)           : ${record.paymentDate}
உறுப்பினர் ID (Member ID): ${record.memberId}
பெயர் (Name)          : ${record.memberName}
மாவட்டம் (District)   : ${record.district || "சென்னை"}
கட்டண வகை (Type)      : ${record.paymentTypeTa} (${record.paymentType.toUpperCase()})
செலுத்திய தொகை (Paid) : ₹${record.amount}.00 INR
பரிவர்த்தனை ID (TXN ID): ${record.transactionId}
பணம் செலுத்திய முறை   : ${record.paymentMethodLabel || "Online Wallet"}
நிலை (Status)         : SUCCESSFUL (வெற்றி)
--------------------------------------------------
      ஒன்று கூடுவோம், வென்று காட்டுவோம் - நன்றி!
==================================================
`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TNPA_Receipt_${record.receiptNo || record.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerPrintReceipt = (record: PaymentRecord) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>TNPA OFFICIAL RECEIPT - ${record.receiptNo}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #000; }
            .receipt { border: 2px dashed #000; padding: 25px; max-width: 500px; margin: 0 auto; }
            .center { text-align: center; }
            .header-title { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
            .line { border-bottom: 1px dashed #000; margin: 15px 0; }
            table { width: 100%; font-size: 14px; }
            td { padding: 4px 0; }
            .bold { font-weight: bold; }
            .footer-msg { font-size: 12px; margin-top: 25px; text-align: center; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center">
              <div class="header-title">தமிழ்நாடு பெயிண்டர்கள் சங்கம்</div>
              <div>TAMIL NADU PAINTERS ASSOCIATION</div>
              <div style="font-size: 12px;">ESTD: 1989 | State Reg: 428/Coimbatore</div>
            </div>
            <div class="line"></div>
            <div class="center bold" style="font-size: 15px; margin-bottom: 10px;">OFFICIAL INVOICE & RECEIPT</div>
            <table>
              <tr><td>Receipt Number:</td><td class="bold">${record.receiptNo || "REC-10291"}</td></tr>
              <tr><td>Transaction Date:</td><td>${record.paymentDate}</td></tr>
              <tr><td>Member ID:</td><td class="bold">${record.memberId}</td></tr>
              <tr><td>Payer Name:</td><td class="bold">${record.memberName}</td></tr>
              <tr><td>District Branch:</td><td>${record.district || "Chennai"}</td></tr>
              <tr><td>Payment Reason:</td><td>${record.paymentTypeTa} (${record.paymentType.toUpperCase()})</td></tr>
              <tr class="bold"><td>Amount Paid:</td><td>₹${record.amount}.00 INR</td></tr>
              <tr><td>Payment Method:</td><td>${record.paymentMethodLabel || "Digital UPI"}</td></tr>
              <tr><td>Transaction ID:</td><td style="font-size: 11px;">${record.transactionId}</td></tr>
              <tr><td>Status:</td><td class="bold" style="color: green;">SUCCESS (PAID)</td></tr>
            </table>
            <div class="line"></div>
            <div class="center" style="font-size: 11px;">
              Verify online using QR code verification seal
            </div>
            <div class="footer-msg">
              "உழைப்பே உயர்வு - Painters Unity" <br/> Thank you for your contribution to the Welfare Fund!
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShareReceipt = (record: PaymentRecord) => {
    const url = `https://tnpa-association.org/verify/receipt/${record.receiptNo || record.id}`;
    navigator.clipboard.writeText(url);
    setCopiedReceiptId(record.id);
    setTimeout(() => setCopiedReceiptId(null), 3000);
    alert(lang === "ta" 
      ? "வாட்ஸ்அப் அல்லது எஸ்எம்எஸ் மூலம் பகிர ரசீது சரிபார்ப்பு இணைப்பு நகலெடுக்கப்பட்டது!" 
      : "Receipt verification link copied! Ready to share via WhatsApp or SMS.");
  };

  // Export tables to CSV
  const handleExportCSV = (type: "income" | "expenses" | "outstanding") => {
    let csvContent = "";
    if (type === "income") {
      csvContent = "Receipt No,Member ID,Name,District,Payment Type,Amount,Date,Method,Status\n";
      allPayments.forEach((p) => {
        csvContent += `"${p.receiptNo || "N/A"}","${p.memberId}","${p.memberName}","${p.district}","${p.paymentType}","${p.amount}","${p.paymentDate}","${p.paymentMethod}","${p.status}"\n`;
      });
    } else {
      csvContent = "Expense ID,Title,Category,Amount,Date,District,Recorded By\n";
      expenses.forEach((e) => {
        csvContent += `"${e.id}","${e.title}","${e.category}","${e.amount}","${e.date}","${e.district}","${e.recordedBy}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TNPA_Finance_${type}_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculated Dashboard Stats (Dynamically Computed)
  const currentMetrics = useMemo(() => {
    const totalIncome = allPayments.filter(p => p.status === "success").reduce((acc, curr) => acc + curr.amount, 0);
    const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingCollections = allPayments.filter(p => p.status === "pending").reduce((acc, curr) => acc + curr.amount, 0);
    
    // Seed adjustment to match union scale
    const baseWelfareDisbursed = 1850000;
    const baseSubscriptions = 4829000;

    return {
      todayCollection: allPayments
        .filter(p => p.paymentDate.includes("08-04") || p.paymentDate.includes("Aug 4") || p.paymentDate.includes("Today") || p.paymentDate.includes("Just now"))
        .reduce((acc, p) => acc + p.amount, 0),
      monthlyCollection: totalIncome + 48000,
      yearlyCollection: totalIncome + baseSubscriptions,
      netReserve: (totalIncome + baseSubscriptions) - totalExp - baseWelfareDisbursed,
      totalWelfareDisbursed: baseWelfareDisbursed + expenses.filter(e => e.category === "relief").reduce((acc, e) => acc + e.amount, 0),
      pendingCount: allPayments.filter(p => p.status === "pending").length,
      pendingAmount: pendingCollections
    };
  }, [allPayments, expenses]);

  // Dynamic filter for searchable records table
  const filteredLedger = useMemo(() => {
    return allPayments.filter((p) => {
      const matchQuery = 
        p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.receiptNo && p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchDistrict = searchDistrict === "all" || p.district === searchDistrict;
      const matchType = searchType === "all" || p.paymentType === searchType;

      // Role restriction: District Admin can only view their own district's data
      if (demoRole === "district_admin") {
        return matchQuery && p.district === demoDistrict && matchType;
      }
      return matchQuery && matchDistrict && matchType;
    });
  }, [allPayments, searchQuery, searchDistrict, searchType, demoRole, demoDistrict]);

  // Aggregate collections by district for high-end SVG reporting
  const districtLeaderboard = useMemo(() => {
    const counts: Record<string, number> = {};
    allPayments.forEach((p) => {
      if (p.status === "success" && p.district) {
        counts[p.district] = (counts[p.district] || 0) + p.amount;
      }
    });
    // Add seed padding so it reflects a massive network
    const seeds: Record<string, number> = {
      "சென்னை": 184500,
      "மதுரை": 125000,
      "கோயம்புத்தூர்": 162000,
      "திருச்சிராப்பள்ளி": 94000,
      "சேலம்": 82000
    };
    Object.keys(seeds).forEach((k) => {
      counts[k] = (counts[k] || 0) + seeds[k];
    });

    return Object.entries(counts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [allPayments]);

  // Dynamic values for payment option pre-fill
  const getPreFilledAmount = (type: string) => {
    switch (type) {
      case "membership": return 500;
      case "renewal": return 500;
      case "welfare_fund": return 1000;
      case "event": return 300;
      case "training": return 200;
      default: return 1000;
    }
  };

  const handlePayTypeSelect = (type: any) => {
    setPayType(type);
    setAmount(getPreFilledAmount(type));
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden shadow-xl text-stone-800">
      
      {/* SECTION 1: DEMO SIMULATION HEADER PANEL */}
      <div className="bg-[#1e1e1e] px-6 py-3.5 border-b border-stone-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
            ⚙️ DEMO SANDBOX & MULTI-ROLE SIMULATOR
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-stone-400 mr-1">
            {lang === "ta" ? "பார்வை மாற்றி (Switch Role):" : "View System as:"}
          </span>
          <div className="inline-flex rounded-lg bg-stone-900 p-0.5 border border-stone-700 text-[10px]">
            <button
              onClick={() => {
                setDemoRole("member");
                setActiveTab("pay_portal");
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${demoRole === "member" ? "bg-[#b91c1c] text-white" : "text-stone-400 hover:text-white"}`}
            >
              👤 {lang === "ta" ? "ஓவியர் (Member)" : "Member"}
            </button>
            <button
              onClick={() => {
                setDemoRole("district_admin");
                setActiveTab("pay_portal");
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${demoRole === "district_admin" ? "bg-[#b91c1c] text-white" : "text-stone-400 hover:text-white"}`}
            >
              📍 {lang === "ta" ? "மாவட்ட செயலாளர்" : "District Sec"}
            </button>
            <button
              onClick={() => {
                setDemoRole("state_treasurer");
                setActiveTab("treasurer");
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${demoRole === "state_treasurer" ? "bg-[#b91c1c] text-white" : "text-stone-400 hover:text-white"}`}
            >
              💼 {lang === "ta" ? "பொருளாளர்" : "Treasurer"}
            </button>
            <button
              onClick={() => {
                setDemoRole("super_admin");
                setActiveTab("treasurer");
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${demoRole === "super_admin" ? "bg-[#b91c1c] text-white" : "text-stone-400 hover:text-white"}`}
            >
              👑 {lang === "ta" ? "தலைமை நிர்வாகி" : "Super Admin"}
            </button>
          </div>

          {demoRole === "district_admin" && (
            <select
              value={demoDistrict}
              onChange={(e) => setDemoDistrict(e.target.value)}
              className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-bold border border-stone-700 text-[10px] outline-none cursor-pointer"
            >
              <option value="சென்னை">சென்னை (Chennai)</option>
              <option value="மதுரை">மதுரை (Madurai)</option>
              <option value="கோயம்புத்தூர்">கோயம்புத்தூர் (Coimbatore)</option>
              <option value="சேலம்">சேலம் (Salem)</option>
              <option value="திருச்சிராப்பள்ளி">திருச்சிராப்பள்ளி (Trichy)</option>
            </select>
          )}
        </div>
      </div>

      {/* SECTION 2: SYSTEM LOGO & TAB DIRECTORY */}
      <div className="bg-white px-6 py-6 border-b border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-[#b91c1c]" />
              <span className="px-2.5 py-0.5 bg-[#b91c1c]/10 text-[#b91c1c] font-black tracking-widest text-[9px] rounded-full uppercase">
                SECURE PLATFORM
              </span>
            </div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight mt-1">
              {lang === "ta" ? "டிஜிட்டல் நிதி மேலாண்மை மற்றும் கட்டண நுழைவாயில்" : "Digital Finance & Payment Management Gateway"}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் • TNPA Painters Treasury
            </p>
          </div>

          {/* Tab switches */}
          <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold border border-stone-200/60 self-start">
            <button
              onClick={() => setActiveTab("pay_portal")}
              className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all ${activeTab === "pay_portal" ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}
            >
              💳 {lang === "ta" ? "கட்டணம் செலுத்துதல்" : "Pay Fees & Register"}
            </button>
            <button
              onClick={() => setActiveTab("donations")}
              className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all ${activeTab === "donations" ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}
            >
              ❤️ {lang === "ta" ? "நன்கொடைகள்" : "Donation Corner"}
            </button>
            
            {(demoRole === "state_treasurer" || demoRole === "super_admin") && (
              <button
                onClick={() => setActiveTab("expenses")}
                className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all ${activeTab === "expenses" ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}
              >
                💸 {lang === "ta" ? "செலவுகள் பதிவு" : "Log Expenses"}
              </button>
            )}

            {(demoRole === "state_treasurer" || demoRole === "super_admin" || demoRole === "district_admin") && (
              <button
                onClick={() => setActiveTab("treasurer")}
                className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all ${activeTab === "treasurer" ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}
              >
                📊 {demoRole === "district_admin" ? (lang === "ta" ? "மாவட்ட நிதி" : "District Ledger") : (lang === "ta" ? "பொருளாளர் மேலாண்மை" : "Treasurer Dashboard")}
              </button>
            )}

            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all ${activeTab === "reports" ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}
            >
              📋 {lang === "ta" ? "கணக்கு அறிக்கை & தேடல்" : "Reports & Audit"}
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3.5 py-2 rounded-lg cursor-pointer transition-all ${activeTab === "analytics" ? "bg-white text-stone-950 shadow-sm" : "text-stone-500 hover:text-stone-900"}`}
            >
              📈 {lang === "ta" ? "வரைபடங்கள்" : "Visual Analytics"}
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATUS TICKER */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 font-bold">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {lang === "ta" 
              ? `சங்கத்தின் தற்போதைய நிதி நிலை: ₹${currentMetrics.yearlyCollection.toLocaleString()} சந்தாக்கள் மற்றும் ₹${expenses.reduce((acc,e)=>acc+e.amount,0).toLocaleString()} செலவுகள் பதிவாகியுள்ளன.` 
              : `Treasury Overview: Cumulative subscriptions ₹${currentMetrics.yearlyCollection.toLocaleString()} | Logged expenses: ₹${expenses.reduce((acc,e)=>acc+e.amount,0).toLocaleString()}`}
          </span>
        </div>
        <div className="text-[10px] uppercase font-black tracking-widest text-[#b91c1c]">
          {lang === "ta" ? "● கணக்குகள் தணிக்கை செய்யப்பட்டது" : "● Accounts Audited"}
        </div>
      </div>

      {/* TAB CONTAINER BODY */}
      <div className="p-6">

        {/* ======================================= */}
        {/* TAB A: MEMBERSHIP PAYMENTS & FEES PORTAL */}
        {activeTab === "pay_portal" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Quick Payment Categories Picker */}
            <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm text-left">
              <span className="font-extrabold text-[#b91c1c] text-xs uppercase tracking-wider block">
                ⭐ {lang === "ta" ? "கட்டணப் பிரிவுகள்" : "PAYMENT CATEGORIES"}
              </span>
              
              <div className="space-y-2">
                <button
                  onClick={() => handlePayTypeSelect("membership")}
                  className={`w-full p-3.5 border rounded-xl text-left flex justify-between items-center transition-all cursor-pointer ${payType === "membership" ? "bg-[#b91c1c]/5 border-[#b91c1c] ring-1 ring-[#b91c1c]" : "bg-stone-50 hover:bg-stone-100 border-stone-200"}`}
                >
                  <div>
                    <span className="font-extrabold text-stone-950 text-xs block">
                      {lang === "ta" ? "புதிய உறுப்பினர் சேர்க்கை" : "New Membership Enrollment"}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {lang === "ta" ? "சங்கத்தில் புதியவராக பதிவு செய்ய" : "Initial union registration & badge"}
                    </span>
                  </div>
                  <span className="font-black text-stone-950 text-xs">₹500</span>
                </button>

                <button
                  onClick={() => handlePayTypeSelect("renewal")}
                  className={`w-full p-3.5 border rounded-xl text-left flex justify-between items-center transition-all cursor-pointer ${payType === "renewal" ? "bg-[#b91c1c]/5 border-[#b91c1c] ring-1 ring-[#b91c1c]" : "bg-stone-50 hover:bg-stone-100 border-stone-200"}`}
                >
                  <div>
                    <span className="font-extrabold text-stone-950 text-xs block">
                      {lang === "ta" ? "ஆண்டு சந்தா புதுப்பித்தல்" : "Annual Subscription Renewal"}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {lang === "ta" ? "அடையாள அட்டை செல்லுபடியாகும் கால நீட்டிப்பு" : "Extend ID card validity with welfare board"}
                    </span>
                  </div>
                  <span className="font-black text-stone-950 text-xs">₹500</span>
                </button>

                <button
                  onClick={() => handlePayTypeSelect("welfare_fund")}
                  className={`w-full p-3.5 border rounded-xl text-left flex justify-between items-center transition-all cursor-pointer ${payType === "welfare_fund" ? "bg-[#b91c1c]/5 border-[#b91c1c] ring-1 ring-[#b91c1c]" : "bg-stone-50 hover:bg-stone-100 border-stone-200"}`}
                >
                  <div>
                    <span className="font-extrabold text-stone-950 text-xs block">
                      {lang === "ta" ? "குடும்ப நல நிதிப் பங்களிப்பு" : "Family Welfare Fund"}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {lang === "ta" ? "ஓவியர்களுக்கான அவசரக் குழு நிதி" : "Mutual insurance and medical relief pool"}
                    </span>
                  </div>
                  <span className="font-black text-stone-950 text-xs">₹1000</span>
                </button>

                <button
                  onClick={() => handlePayTypeSelect("event")}
                  className={`w-full p-3.5 border rounded-xl text-left flex justify-between items-center transition-all cursor-pointer ${payType === "event" ? "bg-[#b91c1c]/5 border-[#b91c1c] ring-1 ring-[#b91c1c]" : "bg-stone-50 hover:bg-stone-100 border-stone-200"}`}
                >
                  <div>
                    <span className="font-extrabold text-stone-950 text-xs block">
                      {lang === "ta" ? "மாநாடு / நிகழ்வு கட்டணம்" : "Union Event & Assembly Fee"}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {lang === "ta" ? "பொதுக்குழு சந்திப்பில் பங்கேற்க" : "Annual General Body Meeting access card"}
                    </span>
                  </div>
                  <span className="font-black text-stone-950 text-xs">₹300</span>
                </button>

                <button
                  onClick={() => handlePayTypeSelect("training")}
                  className={`w-full p-3.5 border rounded-xl text-left flex justify-between items-center transition-all cursor-pointer ${payType === "training" ? "bg-[#b91c1c]/5 border-[#b91c1c] ring-1 ring-[#b91c1c]" : "bg-stone-50 hover:bg-stone-100 border-stone-200"}`}
                >
                  <div>
                    <span className="font-extrabold text-stone-950 text-xs block">
                      {lang === "ta" ? "நவீன பெயிண்டிங் பயிற்சி கட்டணம்" : "Spray & Canvas Tech Training"}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {lang === "ta" ? "வெளிநாட்டு உபகரணங்கள் கையாளுதல் சான்றிதழ்" : "Advanced machine application certifications"}
                    </span>
                  </div>
                  <span className="font-black text-stone-950 text-xs">₹200</span>
                </button>
              </div>

              {/* Outstanding Renewal Reminder Alert Box */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-[#b91c1c] font-black text-[11px] uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-[#b91c1c]" />
                  <span>{lang === "ta" ? "ஆண்டு சந்தா நினைவூட்டல்!" : "Renewal Dues Pending!"}</span>
                </div>
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  {lang === "ta"
                    ? "ஆகஸ்ட் 15-க்குள் ஆண்டு சந்தா ₹500 செலுத்தாத உறுப்பினர்களின் அடையாள அட்டை தற்காலிகமாக செயலிழக்கம் செய்யப்படலாம்."
                    : "Failure to clear the ₹500 annual subscription renewal before August 15 may affect the claim process of construction board benefits."}
                </p>
              </div>
            </div>

            {/* Main Interactive Form Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* If last payment was successful, display the gorgeous digital receipt instantly */}
              {successRecord ? (
                <div className="bg-white border-2 border-dashed border-[#b91c1c] rounded-3xl p-6 shadow-md text-left space-y-5 animate-[fadeIn_0.4s_ease-out]">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        ✓
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-widest uppercase rounded">
                          {lang === "ta" ? "பரிவர்த்தனை வெற்றி" : "TRANSACTION SUCCESS"}
                        </span>
                        <h4 className="font-black text-stone-900 text-sm mt-0.5">
                          {lang === "ta" ? "அதிகாரப்பூர்வ டிஜிட்டல் ரசீது" : "Official Digital Audit Receipt"}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-stone-400 font-bold">
                      <div>{lang === "ta" ? "ரசீது எண்:" : "Receipt No:"}</div>
                      <div className="text-stone-900 font-black">{successRecord.receiptNo || "TNPA-REC-1029"}</div>
                    </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                    <div className="text-center font-black text-xs uppercase tracking-widest text-[#b91c1c] border-b border-stone-200 pb-2">
                      {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் சங்கம் - மாநில பொதுக்குழு" : "TAMIL NADU PAINTERS ASSOCIATION - STATE HQ"}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-stone-400 block font-bold text-[10px]">{lang === "ta" ? "உறுப்பினர் பெயர் / Payer:" : "Payer Name:"}</span>
                        <span className="font-extrabold text-stone-950">{successRecord.memberName}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block font-bold text-[10px]">{lang === "ta" ? "உறுப்பினர் ID / Member ID:" : "Member Association ID:"}</span>
                        <span className="font-extrabold text-stone-950">{successRecord.memberId}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block font-bold text-[10px]">{lang === "ta" ? "மாவட்டம் / Branch:" : "District Branch:"}</span>
                        <span className="font-extrabold text-stone-950">📍 {successRecord.district || "சென்னை"}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block font-bold text-[10px]">{lang === "ta" ? "பரிவர்த்தனை தேதி / Date:" : "Payment Timestamp:"}</span>
                        <span className="font-bold text-stone-700">{successRecord.paymentDate}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block font-bold text-[10px]">{lang === "ta" ? "கட்டண விபரம் / Purpose:" : "Payment Reason:"}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-black text-[10px] inline-block mt-0.5">
                          {lang === "ta" ? successRecord.paymentTypeTa : successRecord.paymentType.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block font-bold text-[10px]">{lang === "ta" ? "செலுத்தும் முறை / Method:" : "Payment Channel:"}</span>
                        <span className="font-bold text-stone-700">{successRecord.paymentMethodLabel || "Digital Wallet"}</span>
                      </div>
                      <div className="md:col-span-2 border-t border-stone-200/50 pt-2.5 flex justify-between items-center bg-stone-100/50 -mx-5 -mb-4 px-5 py-3 rounded-b-2xl">
                        <div>
                          <span className="text-[10px] text-stone-400 block font-bold">{lang === "ta" ? "தொகை / Total Amount:" : "Net Amount Paid:"}</span>
                          <span className="text-lg font-black text-stone-950">₹ {successRecord.amount}.00</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-600 font-black block">● {lang === "ta" ? "சரிபார்க்கப்பட்டது" : "SECURELY RECEIVED"}</span>
                          <span className="text-[9px] text-stone-400 block mt-0.5">TXN ID: {successRecord.transactionId}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Print and Download Actions */}
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleShareReceipt(successRecord)}
                      className="px-3.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Share2 className="w-4 h-4 text-stone-500" />
                      <span>{copiedReceiptId === successRecord.id ? (lang === "ta" ? "நகலெடுக்கப்பட்டது!" : "Copied!") : (lang === "ta" ? "பகிர்க (Share)" : "Copy verification URL")}</span>
                    </button>
                    <button
                      onClick={() => downloadReceiptTxt(successRecord)}
                      className="px-3.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-stone-500" />
                      <span>{lang === "ta" ? "ரசீதை பதிவிறக்கு (.txt)" : "Download Plaintext"}</span>
                    </button>
                    <button
                      onClick={() => triggerPrintReceipt(successRecord)}
                      className="px-4 py-2 bg-[#b91c1c] hover:bg-red-800 text-white rounded-xl text-xs font-black tracking-wider uppercase cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{lang === "ta" ? "ரசீது அச்சிடுக (Print)" : "Print Official Receipt"}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-200 text-center">
                    <button
                      onClick={() => {
                        setSuccessRecord(null);
                        setMemberName("");
                        setMemberId("");
                      }}
                      className="text-[#b91c1c] hover:underline font-extrabold text-xs cursor-pointer"
                    >
                      ← {lang === "ta" ? "மற்றொரு கட்டணம் செலுத்த" : "Return to make another payment"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm text-left">
                  <form onSubmit={handlePaySubmit} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                      <div className="bg-[#b91c1c]/10 text-[#b91c1c] p-2 rounded-xl">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm">
                          {lang === "ta" ? "உறுப்பினர் சந்தா செலுத்துதல்" : "Immediate Union Subscription Intake"}
                        </h4>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          {lang === "ta" ? "ரசீதுகள் மற்றும் கோப்பு அறிக்கைகள் தானாகவே தயாராகும்" : "Receipt and audit trails automatically dispatched to state servers"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Search / Member lookup field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-stone-700">
                          {lang === "ta" ? "உறுப்பினர் ID அல்லது அலைபேசி எண் (Lookup)" : "Member Registry Lookup ID / Mobile *"}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={memberId}
                            onChange={(e) => handleMemberLookup(e.target.value)}
                            placeholder={lang === "ta" ? "எ.கா: TNP-2026-0034 அல்லது 9876543210" : "e.g. TNP-2026-0034 or 9876543210"}
                            className="w-full pl-3 pr-10 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                          />
                          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                        </div>
                        <span className="text-[9px] text-stone-400 block">
                          {lang === "ta" ? "💡 டைப் செய்யும்போது உறுப்பினர் விபரங்களை தானாகவே தேடும்!" : "💡 Starts autofilling name and district on matching registry IDs!"}
                        </span>
                      </div>

                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-stone-700">
                          {lang === "ta" ? "பணம் செலுத்துபவர் பெயர்" : "Payer / Member Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          placeholder="Name of Painter / Sponsor"
                          className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                        />
                      </div>

                      {/* District Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-stone-700">
                          {lang === "ta" ? "சங்க மாவட்டம்" : "Association District Branch *"}
                        </label>
                        <select
                          value={memberDistrict}
                          onChange={(e) => setMemberDistrict(e.target.value)}
                          className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b91c1c] cursor-pointer"
                        >
                          <option value="சென்னை">சென்னை (Chennai)</option>
                          <option value="மதுரை">மதுரை (Madurai)</option>
                          <option value="கோயம்புத்தூர்">கோயம்புத்தூர் (Coimbatore)</option>
                          <option value="திருச்சிராப்பள்ளி">திருச்சிராப்பள்ளி (Tiruchirappalli)</option>
                          <option value="சேலம்">சேலம் (Salem)</option>
                        </select>
                      </div>

                      {/* Amount input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-stone-700">
                          {lang === "ta" ? "தொகை (ரூபாய்)" : "Payment Amount (INR) *"}
                        </label>
                        <input
                          type="number"
                          required
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                        />
                      </div>
                    </div>

                    {/* SELECT PAYMENT METHOD */}
                    <div className="space-y-2 border-t border-stone-100 pt-4">
                      <label className="block text-xs font-extrabold text-stone-800 tracking-wider uppercase">
                        💳 {lang === "ta" ? "செலுத்தும் முறை தேர்வு செய்க" : "CHOOSE PAYMENT METHOD"}
                      </label>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("upi")}
                          className={`p-3 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${paymentMethod === "upi" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                        >
                          <span className="text-xs font-extrabold block">GPay / PhonePe UPI</span>
                          <span className="text-[9px] text-stone-400 block font-bold">Fast Approval</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("qr")}
                          className={`p-3 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${paymentMethod === "qr" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                        >
                          <QrCode className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-extrabold block">{lang === "ta" ? "QR குறியீடு ஸ்கேன்" : "QR Scan & Pay"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`p-3 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${paymentMethod === "card" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                        >
                          <span className="text-xs font-extrabold block">Credit/Debit Card</span>
                          <span className="text-[9px] text-stone-400 block font-bold">Secure SSL Gate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("netbanking")}
                          className={`p-3 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${paymentMethod === "netbanking" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                        >
                          <Landmark className="w-5 h-5 text-sky-600" />
                          <span className="text-xs font-extrabold block">Net Banking</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("bank_transfer")}
                          className={`p-3 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${paymentMethod === "bank_transfer" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                        >
                          <span className="text-xs font-extrabold block">{lang === "ta" ? "வங்கி பரிமாற்றம்" : "Bank Transfer Log"}</span>
                          <span className="text-[9px] text-stone-400 block font-bold">UTR Record Entry</span>
                        </button>

                        {/* Cash entry only allowed for treasurer, admin, or in sandbox mock roles */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cash")}
                          className={`p-3 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${paymentMethod === "cash" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                        >
                          <Coins className="w-5 h-5 text-emerald-600" />
                          <span className="text-xs font-extrabold block">{lang === "ta" ? "நேரடி பணம் (Cash)" : "Cash (Admin Only)"}</span>
                        </button>
                      </div>
                    </div>

                    {/* METHOD-SPECIFIC FORM FIELDS */}
                    {paymentMethod === "bank_transfer" && (
                      <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3 font-sans animate-[fadeIn_0.3s_ease-out]">
                        <span className="font-extrabold text-[10px] text-stone-400 block uppercase">BANK RECORD DETAILS</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Bank Name (e.g., SBI, Indian Bank)"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800"
                          />
                          <input
                            type="text"
                            required
                            placeholder="UTR / Reference Number"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            className="px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800"
                          />
                          <input
                            type="date"
                            value={transferDate}
                            onChange={(e) => setTransferDate(e.target.value)}
                            className="px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3 font-sans animate-[fadeIn_0.3s_ease-out]">
                        <span className="font-extrabold text-[10px] text-stone-400 block uppercase">SECURE PAYMENT GATEWAY (CARD INFO)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="16-Digit Card Number (0000 0000 0000 0000)"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Cardholder Name"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "cash" && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 font-bold leading-relaxed">
                        ⚠️ {lang === "ta" ? "கவனம்: நேரடி ரொக்கப் பண வரவு அங்கீகரிக்கப்பட்ட சங்க பொருளாளரால் மட்டுமே பதியப்பட வேண்டும். இது ஒரு சட்டப்பூர்வமான ஆவணம் ஆகும்." : "Manual Cash Intake Note: Ensure immediate cash collection has occurred. This creates a pending/auditable ledger block requiring Treasurer confirmation."}
                      </div>
                    )}

                    {/* Remarks input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        {lang === "ta" ? "குறிப்புரைகள் (விருப்பத்தேர்வு)" : "Reference Remarks / Notes (Optional)"}
                      </label>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g. Cleared pending dues for 2026"
                        className="w-full px-4 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#b91c1c] hover:bg-red-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:bg-stone-300 shadow-md hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4.5 h-4.5 animate-spin text-amber-300 shrink-0" />
                          <span>{lang === "ta" ? "பாதுகாப்பான இணைப்பில் பரிவர்த்தனை செய்யப்படுகிறது..." : "Securing SSL Route & Dispatched Transaction..."}</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 text-amber-300 shrink-0" />
                          <span>{lang === "ta" ? `பாதுகாப்பாக ரூ. ${amount} செலுத்த` : `PROCEED SECURE PAYMENT (₹ ${amount})`}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* QR CODE SCANNING DIALOG / MODAL SIMULATOR */}
            {showQRModal && (
              <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center animate-[zoomIn_0.3s_ease-out]">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="font-black text-stone-900 text-xs uppercase tracking-widest">{lang === "ta" ? "UPI QR கட்டணத் திரை" : "TNPA OFFICIAL UPI QR"}</span>
                    <button onClick={() => setShowQRModal(false)} className="text-stone-400 hover:text-stone-900 font-black text-xs">✕</button>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col items-center">
                    {/* Generates a neat visual custom pixel-style fake QR Code with high-end SVG */}
                    <div className="w-44 h-44 bg-white p-2.5 border border-stone-200 rounded-lg flex items-center justify-center relative">
                      <svg width="150" height="150" viewBox="0 0 100 100" className="text-stone-900">
                        {/* Fake high density QR matrix pixels */}
                        <path d="M0,0 h30 v30 h-30 z M70,0 h30 v30 h-30 z M0,70 h30 v30 h-30 z" fill="currentColor" />
                        <path d="M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M10,80 h10 v10 h-10 z" fill="white" />
                        <path d="M35,10 h10 v10 h-10 z M50,20 h10 v10 h-10 z M15,40 h15 v5 h-15 z M45,45 h20 v10 h-20 z" fill="currentColor" />
                        <path d="M40,75 h30 v10 h-30 z M75,65 h15 v15 h-15 z M10,40 h5 v5 h-5 z M25,50 h10 v5 h-10 z" fill="currentColor" />
                        <path d="M60,35 h10 v10 h-10 z M80,45 h10 v5 h-10 z M45,0 v15 h5 v-15 z M60,0 h5 v10 h-5 z" fill="currentColor" />
                        {/* Union micro logo in center */}
                        <circle cx="50" cy="50" r="10" fill="#b91c1c" />
                        <text x="50" y="53" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">TNPA</text>
                      </svg>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] text-stone-400 block font-bold">{lang === "ta" ? "கட்டண விபரம் / UPI DeepLink" : "Scan using GPay, PhonePe, or BHIM"}</span>
                      <span className="font-extrabold text-stone-950 text-xs">upi://pay?pa=tnpa@ybl&pn=TNPA&am={amount}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="font-black text-[#b91c1c] text-sm block">₹ {amount}.00</span>
                    <p className="text-[11px] text-stone-500">
                      {lang === "ta" 
                        ? `குறியீடு காலாவதியாகும் நேரம்: ${Math.floor(qrCounter / 60)}:${(qrCounter % 60).toString().padStart(2, "0")} நிமிடங்கள்` 
                        : `Scan QR within next: ${Math.floor(qrCounter / 60)}:${(qrCounter % 60).toString().padStart(2, "0")} min`}
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmQRPayment}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl transition-all shadow cursor-pointer"
                  >
                    🚀 {lang === "ta" ? "பணம் செலுத்திவிட்டேன் (Verified Paid)" : "I have paid successfully"}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================= */}
        {/* TAB B: DONATION SECTOR */}
        {activeTab === "donations" && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="bg-[#b91c1c]/10 text-[#b91c1c] p-2.5 rounded-xl">
                <HeartHandshake className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 uppercase">
                  {lang === "ta" ? "சங்க கட்டிடம் & ஓவியர் நல நன்கொடைப் பிரிவு" : "TNPA Union Development & Welfare Donations"}
                </h3>
                <span className="text-xs text-stone-400">
                  Help support retired artist grants, on-duty safety harnesses, and painters school scholarship programs.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-stone-50 p-4 border border-stone-200/60 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setDonorType("individual")}
                    className={`p-3.5 border rounded-xl text-center transition-all cursor-pointer ${donorType === "individual" ? "bg-[#b91c1c] text-white border-[#b91c1c]" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                  >
                    <span className="font-extrabold text-xs block">👤 {lang === "ta" ? "தனிநபர் கொடை" : "Individual Donor"}</span>
                  </button>
                  <button
                    onClick={() => setDonorType("organization")}
                    className={`p-3.5 border rounded-xl text-center transition-all cursor-pointer ${donorType === "organization" ? "bg-[#b91c1c] text-white border-[#b91c1c]" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                  >
                    <span className="font-extrabold text-xs block">🏢 {lang === "ta" ? "நிறுவன நன்கொடை" : "Corporate / Brand"}</span>
                  </button>
                  <button
                    onClick={() => setDonorType("sponsor")}
                    className={`p-3.5 border rounded-xl text-center transition-all cursor-pointer ${donorType === "sponsor" ? "bg-[#b91c1c] text-white border-[#b91c1c]" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"}`}
                  >
                    <span className="font-extrabold text-xs block">🎗️ {lang === "ta" ? "நலத்திட்ட விளம்பரதாரர்" : "Welfare Sponsor"}</span>
                  </button>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">{lang === "ta" ? "கொடையாளர் பெயர் / நிறுவனம்" : "Donor Name / Organization *"}</label>
                      <input
                        type="text"
                        required
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="e.g. Nippon Paints TN / Ramesh G"
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">{lang === "ta" ? "நன்கொடைத் தொகை" : "Donation Amount (INR) *"}</label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="₹ Amount to support"
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">{lang === "ta" ? "நன்கொடை ஒதுக்கீடு செய்யும் பிரிவு" : "Target Cause Designation *"}</label>
                    <select
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 outline-none cursor-pointer"
                    >
                      <option value="Association General Building Construction Fund">{lang === "ta" ? "சங்க கட்டட கட்டுமான நிதியுதவி" : "Union Building Construction Fund"}</option>
                      <option value="Retired Aged Painter Pension Welfare Contribution">{lang === "ta" ? "மூத்த ஓய்வு பெற்ற ஓவியர்களுக்கான ஓய்வூதிய நிதி" : "Aged Painters Pension Pool"}</option>
                      <option value="Accidental Death Insurance Mutual Pool">{lang === "ta" ? "விபத்து காப்பீடு மற்றும் அவசர மருத்துவ நிதி" : "Painter Accident Insurance Support"}</option>
                      <option value="Children High School Arts Scholarships">{lang === "ta" ? "ஓவியர்களின் குழந்தைகளின் ஓவியக்கலை கல்வி உதவி" : "School & Arts Scholarships"}</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setPayType("donation");
                      handlePaySubmit(new Event('submit') as any);
                    }}
                    className="w-full py-3 bg-[#b91c1c] hover:bg-red-800 text-white font-black text-xs rounded-xl uppercase transition-all shadow cursor-pointer text-center"
                  >
                    🎁 {lang === "ta" ? "நன்கொடையை வழங்கி ரசீது பெறுக" : "Process Donation & Issue Appreciation Receipt"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-700" />
                  <span className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">{lang === "ta" ? "கொடையாளர் பாராட்டு பத்திரம்" : "DONOR VALOR CERTIFICATE"}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed font-sans">
                  All corporate contributions and public sponsor donations above ₹5,000 are honored with an official digital **Appreciation Certificate** signed by the State Treasurer, eligible for custom ledger tax offsets.
                </p>

                <div className="border border-amber-300 p-4 rounded-xl bg-white space-y-3 shadow-inner text-center font-serif">
                  <span className="text-[9px] text-stone-400 block tracking-widest">STATE BOARD CERTIFICATION SEAL</span>
                  <div className="text-[11px] font-black text-amber-900">Certificate of Sincere Appreciation</div>
                  <p className="text-[10px] text-stone-500 italic">
                    "This scroll recognizes Thiru. {memberName || "(Donor Name)"} for their generous patronage supporting Painters safety."
                  </p>
                  <div className="border-t border-amber-200 pt-2 text-[9px] text-stone-400">
                    R. Sakthivel | State Treasurer
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB C: RECORD EXPENSES */}
        {activeTab === "expenses" && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Coins className="w-5.5 h-5.5 text-[#b91c1c]" />
              <div>
                <h3 className="text-base font-black text-stone-900 uppercase">
                  {lang === "ta" ? "ஒவியர் சங்க மாநில செலவினப் பதிவேடு" : "Official Expenditure Cash Register"}
                </h3>
                <span className="text-xs text-stone-400">
                  Treasurer module to record office rents, printing budgets, training expenses, and emergency relief disbursements.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-4 bg-stone-50 border border-stone-200 p-5 rounded-2xl">
                <span className="font-extrabold text-[#b91c1c] text-xs uppercase tracking-wider block mb-4">
                  💸 {lang === "ta" ? "புதிய செலவினை பதிவு செய்" : "Log Cash Outflow"}
                </span>

                <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">English Ledger Title *</label>
                    <input
                      type="text"
                      required
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="e.g. Bought safety belts for Salem wing"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">தமிழ் விளக்கத் தலைப்பு (Tamil Title)</label>
                    <input
                      type="text"
                      value={expTitleTa}
                      onChange={(e) => setExpTitleTa(e.target.value)}
                      placeholder="எ.கா: சேலம் கிளைக்கு பாதுகாப்பு கயிறுகள் வாங்கப்பட்டது"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Outflow Amount *</label>
                      <input
                        type="number"
                        required
                        value={expAmount || ""}
                        onChange={(e) => setExpAmount(Number(e.target.value))}
                        placeholder="₹ Amount"
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-700">Category *</label>
                      <select
                        value={expCategory}
                        onChange={(e) => setExpCategory(e.target.value as any)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800 outline-none cursor-pointer"
                      >
                        <option value="office">Office Supplies</option>
                        <option value="event">Event Venues</option>
                        <option value="travel">Travel Allowance</option>
                        <option value="printing">Printing Materials</option>
                        <option value="training">Training Support</option>
                        <option value="relief">Emergency Relief</option>
                        <option value="other">Other Expenses</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Brief Narrative Notes</label>
                    <textarea
                      value={expRemarks}
                      onChange={(e) => setExpRemarks(e.target.value)}
                      rows={3}
                      placeholder="Audit trail notes..."
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-stone-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-stone-900 hover:bg-[#b91c1c] text-white font-black text-xs uppercase rounded-xl cursor-pointer transition-all shadow"
                  >
                    💾 Save Outflow Voucher
                  </button>
                </form>
              </div>

              {/* Expense Ledger list */}
              <div className="lg:col-span-8 space-y-4">
                <span className="font-extrabold text-stone-900 text-xs uppercase tracking-wider block">
                  📒 {lang === "ta" ? "சமீபத்திய செலவின வவுச்சர்கள்" : "ACTIVE EXPENDITURE VOUCHERS"}
                </span>

                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white text-xs">
                  <div className="max-h-[350px] overflow-y-auto divide-y divide-stone-100">
                    {expenses.map((e, idx) => (
                      <div key={`pm_exp_${e.id}_${idx}`} className="p-4 flex justify-between items-center hover:bg-stone-50 transition-all">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-red-50 text-[#b91c1c] text-[9px] font-black tracking-widest rounded uppercase">
                            {lang === "ta" ? e.categoryTa : e.category.toUpperCase()}
                          </span>
                          <span className="font-bold text-stone-900 block mt-1">
                            {lang === "ta" ? e.titleTa : e.title}
                          </span>
                          <p className="text-[10px] text-stone-500">
                            {e.date} | {e.district || "State Wide"} | By: {e.recordedBy}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-red-700 block">- ₹ {e.amount}</span>
                          <span className="text-[9px] text-stone-400 block mt-0.5">Voucher: {e.id.replace("exp_", "VCH-")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-stone-50 px-4 py-3 border-t border-stone-200 flex justify-between items-center text-xs font-bold text-stone-700">
                    <span>{lang === "ta" ? "மொத்த செலவுகள்:" : "Sum Outflow Expenditures:"}</span>
                    <span className="text-[#b91c1c] font-black">₹ {expenses.reduce((acc,e)=>acc+e.amount,0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB D: TREASURER & ADMINISTRATIVE WORKSPACE */}
        {activeTab === "treasurer" && (
          <div className="space-y-6 text-left">
            
            {/* Metrices Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-stone-400 block uppercase tracking-wider">{lang === "ta" ? "இன்றைய வசூல்" : "Today's Collection"}</span>
                <div className="text-xl font-black text-emerald-700">₹ {currentMetrics.todayCollection.toLocaleString()}</div>
                <span className="text-[9px] text-stone-400 block font-bold">⏱️ Real-time updates</span>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-stone-400 block uppercase tracking-wider">{lang === "ta" ? "இந்த மாத வசூல்" : "This Month Collection"}</span>
                <div className="text-xl font-black text-stone-900">₹ {currentMetrics.monthlyCollection.toLocaleString()}</div>
                <span className="text-[9px] text-stone-400 block font-bold">📅 August cycle active</span>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-stone-400 block uppercase tracking-wider">{lang === "ta" ? "மொத்த ஆண்டு சந்தா" : "Cumulative Yearly Collection"}</span>
                <div className="text-xl font-black text-stone-900">₹ {currentMetrics.yearlyCollection.toLocaleString()}</div>
                <span className="text-[9px] text-emerald-600 block font-bold">✓ Audited on August 4</span>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-stone-400 block uppercase tracking-wider">{lang === "ta" ? "மதிப்பிடப்பட்ட வங்கி இருப்பு" : "Estimated Reserve Fund Balance"}</span>
                <div className="text-xl font-black text-[#b91c1c]">₹ {currentMetrics.netReserve.toLocaleString()}</div>
                <span className="text-[9px] text-stone-400 block font-bold">🛡️ Secure State Account</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Approval queue */}
              <div className="lg:col-span-8 bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                      ⏳ {lang === "ta" ? "ஒப்புதல் பெற வேண்டிய கட்டணங்கள்" : "MANUAL PAYMENTS FOR STATE APPROVAL"}
                    </h4>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Bank transfers or cash payments entered by district staff awaiting treasurer verification seal.
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded font-black text-[10px]">
                    {currentMetrics.pendingCount} Dues Pending
                  </span>
                </div>

                <div className="space-y-3.5">
                  {allPayments.filter(p => p.status === "pending").length === 0 ? (
                    <div className="py-8 text-center text-stone-400 text-xs">
                      No pending payment authorization blocks. All clear!
                    </div>
                  ) : (
                    allPayments.filter(p => p.status === "pending").map((p, idx) => (
                      <div key={`pm_pnd_${p.id}_${idx}`} className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-sans">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-950">{p.memberName}</span>
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-800 text-[9px] font-bold rounded">
                              {p.paymentMethodLabel || "Pending Transfer"}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500">
                            ID: {p.memberId} | District: {p.district} | Reason: {p.paymentTypeTa}
                          </p>
                          <span className="text-[9px] text-stone-400 block">Requested: {p.paymentDate}</span>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                          <span className="font-extrabold text-stone-950 text-sm">₹ {p.amount}</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                if(confirm("Confirm receipt of funds? This issues an official serial receipt.")) {
                                  handleApprovePendingPayment(p.id);
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeletePayment(p.id)}
                              className="p-1.5 border border-stone-200 hover:bg-red-50 hover:text-[#b91c1c] text-stone-400 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* District wise collection summary list */}
              <div className="lg:col-span-4 bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
                <span className="font-extrabold text-stone-900 text-xs uppercase tracking-wider block">
                  📍 {lang === "ta" ? "மாவட்டங்கள் வாரியாக வசூல்" : "DISTRICT REVENUE SHARES"}
                </span>

                <div className="space-y-2.5 text-xs">
                  {districtLeaderboard.slice(0, 5).map((dist, idx) => (
                    <div key={`dist_lead_${dist.name}_${idx}`} className="space-y-1">
                      <div className="flex justify-between font-bold text-stone-700">
                        <span>{idx + 1}. {dist.name}</span>
                        <span>₹ {dist.total.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${Math.min(100, (dist.total / 200000) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB E: REPORTS & AUDIT LOGS SEARCH */}
        {activeTab === "reports" && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900 uppercase">
                  {lang === "ta" ? "சங்கக் கணக்குப் பதிவேடு (Ledger Audit Log)" : "TNPA Official Transaction Ledger"}
                </h3>
                <span className="text-xs text-stone-400">
                  Search through all successful receipts, donations, and events. Run advanced audits.
                </span>
              </div>

              {/* Export and download actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExportCSV("income")}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-[#b91c1c] text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>CSV Export</span>
                </button>
                <button
                  onClick={() => {
                    alert("Generating financial Excel ledger file...");
                    handleExportCSV("income");
                  }}
                  className="px-3.5 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>Excel Format</span>
                </button>
              </div>
            </div>

            {/* Ledger search filters bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={lang === "ta" ? "பெயர், ID அல்லது ரசீது மூலம் தேடுக..." : "Search name, ID, receipt..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>

              <div>
                <select
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800 outline-none cursor-pointer"
                >
                  <option value="all">{lang === "ta" ? "அனைத்து மாவட்டங்களும் (All)" : "All Districts"}</option>
                  <option value="சென்னை">சென்னை (Chennai)</option>
                  <option value="மதுரை">மதுரை (Madurai)</option>
                  <option value="கோயம்புத்தூர்">கோயம்புத்தூர் (Coimbatore)</option>
                  <option value="திருச்சிராப்பள்ளி">திருச்சிராப்பள்ளி (Trichy)</option>
                  <option value="சேலம்">சேலம் (Salem)</option>
                </select>
              </div>

              <div>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-stone-50 text-stone-800 outline-none cursor-pointer"
                >
                  <option value="all">{lang === "ta" ? "அனைத்து கணக்குகளும் (All)" : "All Payment Types"}</option>
                  <option value="membership">Membership Subscription</option>
                  <option value="renewal">ID Card Renewal</option>
                  <option value="welfare_fund">Welfare Relief Fund</option>
                  <option value="donation">Union Donation</option>
                  <option value="event">Event Admission</option>
                </select>
              </div>

              <div className="flex items-center text-[11px] text-stone-400 font-bold px-1.5">
                Filtered: {filteredLedger.length} receipts matching filters.
              </div>
            </div>

            {/* Ledger Records Table */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-4">{lang === "ta" ? "ரசீது எண்" : "Receipt No"}</th>
                      <th className="py-3 px-4">{lang === "ta" ? "உறுப்பினர் ID" : "Payer Details"}</th>
                      <th className="py-3 px-4">{lang === "ta" ? "வகை" : "Ledger Item"}</th>
                      <th className="py-3 px-4">{lang === "ta" ? "தொகை" : "Amount"}</th>
                      <th className="py-3 px-4">{lang === "ta" ? "தேதி" : "Timestamp"}</th>
                      <th className="py-3 px-4 text-center">{lang === "ta" ? "நிலை / ரசீது" : "Action / Print"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    {filteredLedger.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-stone-400">
                          No matching transaction records found in active database.
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((p, idx) => (
                        <tr key={`pm_ledg_${p.id}_${idx}`} className="hover:bg-stone-50 transition-all">
                          <td className="py-3 px-4 font-black text-stone-900">{p.receiptNo || "N/A"}</td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-bold text-stone-800 block">{p.memberName}</span>
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                {p.memberId} | 📍 {p.district}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded font-bold text-[10px]">
                              {lang === "ta" ? p.paymentTypeTa : p.paymentType.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-stone-900">₹ {p.amount}.00</td>
                          <td className="py-3 px-4 text-stone-500 text-[11px]">{p.paymentDate}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {p.status === "success" ? (
                                <>
                                  <button
                                    onClick={() => triggerPrintReceipt(p)}
                                    title="Print Invoice"
                                    className="p-1.5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => downloadReceiptTxt(p)}
                                    title="Download Txt Receipt"
                                    className="p-1.5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[9px] uppercase tracking-wide">
                                  ⏳ PENDING
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB F: GRAPHICAL ANALYTICS (SVG CHARTS) */}
        {activeTab === "analytics" && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 text-left space-y-6">
            
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900 uppercase">
                📊 {lang === "ta" ? "நிதியியல் பகுப்பாய்வு மற்றும் புள்ளிவிவரங்கள்" : "TNPA Union Financial Analytics Dashboard"}
              </h3>
              <span className="text-xs text-stone-400">
                Interactive real-time SVG charts generated dynamically from live transaction ledgers.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Revenue vs Expense Bar Chart */}
              <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50 space-y-3">
                <span className="font-extrabold text-stone-800 text-xs uppercase tracking-wider block">
                  📈 {lang === "ta" ? "வரவு மற்றும் செலவு ஒப்பீடு" : "Monthly Revenue Flows (Income vs Expense)"}
                </span>

                <div className="h-64 flex items-end justify-between px-6 pt-6 relative border-b border-l border-stone-300 font-sans text-[10px]">
                  
                  {/* Grid overlay lines */}
                  <div className="absolute inset-x-0 bottom-1/4 border-b border-dashed border-stone-200"></div>
                  <div className="absolute inset-x-0 bottom-2/4 border-b border-dashed border-stone-200"></div>
                  <div className="absolute inset-x-0 bottom-3/4 border-b border-dashed border-stone-200"></div>

                  {/* June bar */}
                  <div className="flex flex-col items-center gap-1.5 w-1/4">
                    <div className="flex gap-1.5 items-end justify-center h-44 w-full">
                      <div className="bg-emerald-600 rounded-t w-5 h-[70%]" title="Income: ₹48,000"></div>
                      <div className="bg-red-500 rounded-t w-5 h-[35%]" title="Expense: ₹22,000"></div>
                    </div>
                    <span className="font-bold text-stone-500">June 2026</span>
                  </div>

                  {/* July bar */}
                  <div className="flex flex-col items-center gap-1.5 w-1/4">
                    <div className="flex gap-1.5 items-end justify-center h-44 w-full">
                      <div className="bg-emerald-600 rounded-t w-5 h-[85%]" title="Income: ₹65,000"></div>
                      <div className="bg-red-500 rounded-t w-5 h-[50%]" title="Expense: ₹38,000"></div>
                    </div>
                    <span className="font-bold text-stone-500">July 2026</span>
                  </div>

                  {/* August (Live) bar */}
                  <div className="flex flex-col items-center gap-1.5 w-1/4">
                    <div className="flex gap-1.5 items-end justify-center h-44 w-full">
                      <div className="bg-emerald-600 rounded-t w-5 h-[95%]" title="Income: ₹125,000"></div>
                      <div className="bg-red-500 rounded-t w-5 h-[65%]" title="Expense: ₹54,000"></div>
                    </div>
                    <span className="font-black text-stone-900">August 2026 (Live)</span>
                  </div>
                </div>

                <div className="flex justify-center gap-6 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-emerald-600 rounded"></span>
                    <span>Total Subscriptions / Donation Intake</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-500 rounded"></span>
                    <span>Office, Travel, & Emergency Relief</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: SVG Concentric Donut chart for payment sources */}
              <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50 space-y-4">
                <span className="font-extrabold text-stone-800 text-xs uppercase tracking-wider block">
                  🍕 {lang === "ta" ? "நிதி ஒதுக்கீடு விபரம் (வருவாய் ஆதாரங்கள்)" : "TNPA Net Intake Streams Breakdown"}
                </span>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-4">
                  <div className="relative w-40 h-40">
                    <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform -rotate-90">
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e5e5" strokeWidth="4"></circle>
                      
                      {/* Membership subscription segment (35%) */}
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#b91c1c" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="0"></circle>
                      
                      {/* Donations segment (45%) */}
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="45 55" strokeDashoffset="-35"></circle>
                      
                      {/* Family welfare segment (20%) */}
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-80"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                      <span className="text-[10px] text-stone-400 font-bold block">TOTAL INTAKE</span>
                      <span className="text-xs font-black text-stone-900">₹4.89 L</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#b91c1c] rounded-full"></span>
                      <span className="font-bold text-stone-700">Membership Subscriptions (35%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                      <span className="font-bold text-stone-700">Special Building Donations (45%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-50 rounded-full"></span>
                      <span className="font-bold text-stone-700">Family Welfare Contributions (20%)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
