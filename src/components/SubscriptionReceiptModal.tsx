import React, { useRef } from "react";
import { 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  QrCode, 
  Copy, 
  Check, 
  Award,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  User,
  Sparkles
} from "lucide-react";
import { PaymentRecord } from "../types";
import { AssociationEmblemLogo, AssociationWavingFlag, TamilNaduGovtEmblemStamp } from "./UnionOfficialIdCard";

interface SubscriptionReceiptModalProps {
  receipt: PaymentRecord | null;
  onClose: () => void;
  lang: "ta" | "en";
  customLogoUrl?: string | null;
  customFlagUrl?: string | null;
}

export default function SubscriptionReceiptModal({
  receipt,
  onClose,
  lang,
  customLogoUrl,
  customFlagUrl
}: SubscriptionReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  // Format subscription period string
  const getPeriodLabel = () => {
    if (receipt.subscriptionPeriod === "1_month") return lang === "ta" ? "1 மாதம் (1 Month)" : "1 Month";
    if (receipt.subscriptionPeriod === "3_months") return lang === "ta" ? "3 மாதங்கள் (Quarterly)" : "3 Months (Quarterly)";
    if (receipt.subscriptionPeriod === "6_months") return lang === "ta" ? "6 மாதங்கள் (Half-Yearly)" : "6 Months (Half-Yearly)";
    if (receipt.subscriptionPeriod === "12_months") return lang === "ta" ? "1 வருடம் / 12 மாதங்கள் (Annual)" : "1 Year / 12 Months (Annual)";
    if (receipt.subscriptionMonthsCount) {
      return `${receipt.subscriptionMonthsCount} ${lang === "ta" ? "மாதங்கள்" : "Months"}`;
    }
    return lang === "ta" ? "நடப்பு சந்தா காலம்" : "Current Period";
  };

  // Get tier display name
  const getTierDisplay = () => {
    if (receipt.subscriptionTier === "state_leader") {
      return lang === "ta" ? "மாநில பொறுப்பாளர் சந்தா (₹60/மாதம்)" : "State Leader Subscription (₹60/mo)";
    }
    if (receipt.subscriptionTier === "district_leader") {
      return lang === "ta" ? "மாவட்ட பொறுப்பாளர் சந்தா (₹50/மாதம்)" : "District Leader Subscription (₹50/mo)";
    }
    if (receipt.subscriptionTier === "other_executive" || receipt.subscriptionTier === "general_member") {
      return lang === "ta" ? "நிர்வாகி / உறுப்பினர் சந்தா (₹50/மாதம்)" : "Executive / Member Subscription (₹50/mo)";
    }
    if (receipt.subscriptionTier === "development_fund") {
      return lang === "ta" ? "சங்க வளர்ச்சி நிதி (Union Development Fund)" : "Union Development Fund";
    }
    if (receipt.subscriptionTier === "donation") {
      return lang === "ta" ? "அன்பளிப்பு / பொது நன்கொடை (Voluntary Donation)" : "Voluntary Donation / Contribution";
    }
    return receipt.paymentTypeTa || (lang === "ta" ? "சங்க சந்தா" : "Union Subscription");
  };

  const receiptNumber = receipt.receiptNo || `TNPA-SUB-2026-${receipt.id.slice(-5).toUpperCase()}`;

  // Native Print Handler
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TNPA Official Subscription Receipt - ${receiptNumber}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', 'Noto Sans Tamil', sans-serif;
              background-color: #f8fafc;
              margin: 0;
              padding: 20px;
              color: #0f172a;
            }
            .receipt-card {
              max-width: 650px;
              margin: 0 auto;
              background: #ffffff;
              border: 3px double #b91c1c;
              border-radius: 16px;
              padding: 28px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              position: relative;
            }
            .header-banner {
              text-align: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .org-title {
              font-size: 17px;
              font-weight: 900;
              color: #b91c1c;
              margin: 4px 0;
              line-height: 1.3;
            }
            .org-subtitle {
              font-size: 12px;
              font-weight: 700;
              color: #475569;
              letter-spacing: 0.5px;
            }
            .org-motto {
              font-size: 11px;
              font-weight: 800;
              color: #d97706;
              margin-top: 4px;
            }
            .reg-badge {
              display: inline-block;
              background: #fef2f2;
              color: #991b1b;
              border: 1px solid #fecaca;
              font-size: 10px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 9999px;
              margin-top: 6px;
            }
            .receipt-badge-bar {
              display: flex;
              justify-content: space-between;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 10px 14px;
              margin-bottom: 20px;
              font-size: 12px;
            }
            .receipt-badge-bar span strong {
              color: #0f172a;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .info-table td {
              padding: 8px 12px;
              font-size: 13px;
              border-bottom: 1px solid #f1f5f9;
            }
            .info-table tr:nth-child(even) {
              background-color: #fafaf9;
            }
            .label-col {
              color: #64748b;
              font-weight: 600;
              width: 40%;
            }
            .val-col {
              color: #0f172a;
              font-weight: 700;
            }
            .amount-box {
              background: linear-gradient(135deg, #fef2f2 0%, #fffbeb 100%);
              border: 2px dashed #b91c1c;
              border-radius: 12px;
              padding: 16px;
              text-align: center;
              margin: 20px 0;
            }
            .amount-title {
              font-size: 12px;
              font-weight: 800;
              color: #991b1b;
              text-transform: uppercase;
            }
            .amount-val {
              font-size: 28px;
              font-weight: 900;
              color: #b91c1c;
              margin: 4px 0;
            }
            .signatures-row {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
            }
            .sig-block {
              width: 45%;
            }
            .sig-line {
              border-bottom: 1px solid #94a3b8;
              margin-bottom: 6px;
              height: 24px;
            }
            .sig-name {
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
            }
            .sig-role {
              font-size: 10px;
              color: #64748b;
            }
            .footer-note {
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              margin-top: 20px;
              font-style: italic;
            }
            @media print {
              body { background: white; padding: 0; }
              .receipt-card { box-shadow: none; border: 2px solid #b91c1c; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header-banner">
              <div class="org-motto">“ ஒன்று கூடுவோம், வென்று காட்டுவோம் ”</div>
              <div class="org-title">தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்</div>
              <div class="org-subtitle">TAMIL NADU PAINTERS AND ARTISTS PROGRESSIVE ASSOCIATION (TNPA²)</div>
              <div class="reg-badge">தமிழக அரசு பதிவு எண்: TNMDUJCLMDUTU-50-26-00044</div>
            </div>

            <div class="receipt-badge-bar">
              <div><strong>ரசீது எண் / Receipt No:</strong> ${receiptNumber}</div>
              <div><strong>தேதி / Date:</strong> ${receipt.paymentDate}</div>
            </div>

            <table class="info-table">
              <tr>
                <td class="label-col">உறுப்பினர் பெயர் / Payer Name:</td>
                <td class="val-col">${receipt.memberName}</td>
              </tr>
              <tr>
                <td class="label-col">உறுப்பினர் எண் / Member ID:</td>
                <td class="val-col">${receipt.memberId}</td>
              </tr>
              <tr>
                <td class="label-col">பொறுப்பு / பதவி (Designation):</td>
                <td class="val-col">${receipt.designation || receipt.payerRole || "சங்க உறுப்பினர்"}</td>
              </tr>
              <tr>
                <td class="label-col">மாவட்டம் / District Branch:</td>
                <td class="val-col">${receipt.district || "சென்னை"}</td>
              </tr>
              <tr>
                <td class="label-col">சந்தா பிரிவு / Subscription Category:</td>
                <td class="val-col" style="color: #b91c1c;">${getTierDisplay()}</td>
              </tr>
              <tr>
                <td class="label-col">சந்தா காலம் / Period:</td>
                <td class="val-col">${getPeriodLabel()}</td>
              </tr>
              <tr>
                <td class="label-col">பரிவர்த்தனை எண் / TXN ID:</td>
                <td class="val-col" style="font-family: monospace;">${receipt.transactionId}</td>
              </tr>
              <tr>
                <td class="label-col">செலுத்திய முறை / Payment Mode:</td>
                <td class="val-col">${receipt.paymentMethodLabel || "GPay UPI Online"}</td>
              </tr>
              <tr>
                <td class="label-col">பரிவர்த்தனை நிலை / Status:</td>
                <td class="val-col" style="color: #16a34a;">✅ வெற்றி (PAID & VERIFIED)</td>
              </tr>
            </table>

            <div class="amount-box">
              <div class="amount-title">செலுத்தப்பட்ட மொத்த சந்தா தொகை / Total Amount Paid</div>
              <div class="amount-val">₹${receipt.amount.toLocaleString()}.00</div>
              <div style="font-size: 11px; color: #475569; font-weight: 600;">(Indian Rupees Only)</div>
            </div>

            <div class="signatures-row">
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-name">ரா. சேவியர் பாபு (R. Xavier Babu)</div>
                <div class="sig-role">மாநில பொதுச்செயலாளர் (State Gen. Secretary)</div>
              </div>
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-name">S. மைக்கேல் ஆல்வின் (S. Michael Alvin)</div>
                <div class="sig-role">மாநில தலைவர் (State President)</div>
              </div>
            </div>

            <div class="footer-note">
              இது தமிழ்நாடு பெயிண்டர்கள் சங்கம் (TNPA²) மூலமாக தானாக உருவாக்கப்பட்ட அதிகாரப்பூர்வ கணினி ரசீது ஆகும். <br/>
              Official Computer Generated E-Receipt • No physical signature required.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    const text = `*தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் (TNPA²)*
🏛️ *அதிகாரப்பூர்வ சந்தா ரசீது*
----------------------------------------
📜 *ரசீது எண்:* ${receiptNumber}
📅 *தேதி:* ${receipt.paymentDate}
👤 *பெயர்:* ${receipt.memberName} (${receipt.memberId})
🎖️ *பொறுப்பு:* ${receipt.designation || receipt.payerRole || "சங்க உறுப்பினர்"}
📍 *மாவட்டம்:* ${receipt.district || "சென்னை"}
🏷️ *சந்தா பிரிவு:* ${getTierDisplay()}
⏱️ *சந்தா காலம்:* ${getPeriodLabel()}
💰 *செலுத்திய தொகை:* ₹${receipt.amount}
💳 *பரிவர்த்தனை ID:* ${receipt.transactionId}
✅ *நிலை:* வெற்றிகரமாக பெறப்பட்டது (PAID)
----------------------------------------
_“ஒன்று கூடுவோம், வென்று காட்டுவோம்”_
பதிவு எண்: TNMDUJCLMDUTU-50-26-00044`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  // Copy Receipt Text
  const handleCopyText = () => {
    const text = `TNPA OFFICIAL SUBSCRIPTION RECEIPT
Receipt No: ${receiptNumber}
Date: ${receipt.paymentDate}
Member: ${receipt.memberName} (${receipt.memberId})
Category: ${getTierDisplay()}
Period: ${getPeriodLabel()}
Amount Paid: ₹${receipt.amount}.00
TXN ID: ${receipt.transactionId}
Status: SUCCESS (PAID)
Association: Tamil Nadu Painters and Artists Progressive Association (Reg: TNMDUJCLMDUTU-50-26-00044)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-500/80 overflow-hidden my-6">
        
        {/* Modal Top Control Bar */}
        <div className="bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#1e1b4b] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {lang === "ta" ? "அதிகாரப்பூர்வ டிஜிட்டல் சந்தா ரசீது" : "Official Digital Subscription Receipt"}
              </h3>
              <p className="text-[11px] text-amber-300 font-mono">
                {receiptNumber}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-stone-200 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable & Visible Receipt Body */}
        <div ref={printRef} className="p-5 sm:p-7 space-y-6 text-left bg-gradient-to-b from-stone-50/50 to-white">
          
          {/* Header Branding with Official Logo and Flag */}
          <div className="relative border-b-2 border-dashed border-stone-300 pb-5">
            <div className="flex items-center justify-between gap-3">
              
              {/* Left: Official Association Logo */}
              <AssociationEmblemLogo customUrl={customLogoUrl || undefined} size="md" />

              {/* Center: Association Name & Reg Details */}
              <div className="text-center flex-1 min-w-0 px-2">
                <span className="text-[11px] font-black text-amber-700 block uppercase tracking-wider">
                  “ {lang === "ta" ? "ஒன்று கூடுவோம், வென்று காட்டுவோம்" : "Let us Unite, Let us Conquer"} ”
                </span>
                <h2 className="text-sm sm:text-base md:text-lg font-black text-[#b91c1c] leading-tight">
                  {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்" : "TN Painters and Artists Progressive Association"}
                </h2>
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-700 block uppercase tracking-tight">
                  TAMIL NADU PAINTERS ASSOCIATION (TNPA²)
                </span>
                <span className="inline-block mt-1 bg-rose-50 text-[#b91c1c] border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {lang === "ta" ? "தமிழக அரசு பதிவு எண்: TNMDUJCLMDUTU-50-26-00044" : "Govt Reg No: TNMDUJCLMDUTU-50-26-00044"}
                </span>
              </div>

              {/* Right: Official Association Flag */}
              <div className="w-14 h-11 sm:w-16 sm:h-12 shrink-0 rounded-lg overflow-hidden border border-stone-300 shadow-sm bg-stone-100 flex items-center justify-center">
                <AssociationWavingFlag customUrl={customFlagUrl || undefined} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Receipt Info Ribbon */}
          <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-800">
              <span className="font-bold text-stone-500">{lang === "ta" ? "ரசீது எண்:" : "Receipt No:"}</span>
              <span className="font-mono font-black text-[#b91c1c] bg-white px-2 py-0.5 rounded border border-stone-300 shadow-xs">
                {receiptNumber}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-800">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-bold text-stone-500">{lang === "ta" ? "தேதி:" : "Date:"}</span>
              <span className="font-semibold text-stone-900">{receipt.paymentDate}</span>
            </div>
          </div>

          {/* Detailed Member & Subscription Information Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="bg-[#b91c1c] text-white px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-between">
              <span>{lang === "ta" ? "சந்தா செலுத்திய உறுப்பினர் விபரம்" : "Subscriber & Payment Details"}</span>
              <span className="text-amber-300 font-bold">TNPA² VERIFIED</span>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2 bg-stone-50/50">
                <div>
                  <span className="text-stone-500 block text-[11px] font-medium">{lang === "ta" ? "உறுப்பினர் பெயர்" : "Payer Name"}</span>
                  <span className="font-black text-stone-900 text-sm">{receipt.memberName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-medium">{lang === "ta" ? "உறுப்பினர் எண் / பதிவு எண்" : "Member ID / Reg No"}</span>
                  <span className="font-mono font-black text-blue-700 text-sm">{receipt.memberId}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2">
                <div>
                  <span className="text-stone-500 block text-[11px] font-medium">{lang === "ta" ? "பொறுப்பு / பதவி" : "Designation / Role"}</span>
                  <span className="font-bold text-stone-800">
                    {receipt.designation || receipt.payerRole || (lang === "ta" ? "சங்க உறுப்பினர்" : "Union Member")}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-medium">{lang === "ta" ? "மாவட்டம்" : "District Branch"}</span>
                  <span className="font-bold text-stone-800">{receipt.district || "சென்னை"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2 bg-stone-50/50">
                <div>
                  <span className="text-stone-500 block text-[11px] font-medium">{lang === "ta" ? "சந்தா வகை" : "Subscription Tier"}</span>
                  <span className="font-extrabold text-[#b91c1c] text-xs">
                    {getTierDisplay()}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-medium">{lang === "ta" ? "சந்தா காலம்" : "Subscription Period"}</span>
                  <span className="font-extrabold text-stone-900">
                    {getPeriodLabel()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 p-3 gap-2">
                <div>
                  <span className="text-stone-500 block text-[11px] font-medium">{lang === "ta" ? "பரிவர்த்தனை எண் (TXN ID)" : "Transaction ID"}</span>
                  <span className="font-mono font-bold text-stone-700">{receipt.transactionId}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px] font-medium">{lang === "ta" ? "பணம் செலுத்திய முறை" : "Payment Mode"}</span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    {receipt.paymentMethodLabel || "GPay UPI Instant Transfer"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlight Amount Paid Box */}
          <div className="p-4 bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-red-500/40 rounded-2xl text-center shadow-inner relative overflow-hidden">
            <div className="text-[11px] font-black uppercase text-red-900 tracking-wider mb-1">
              {lang === "ta" ? "செலுத்தப்பட்ட மொத்த சந்தா தொகை" : "Total Subscription Amount Paid"}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#b91c1c] my-1">
              ₹{receipt.amount.toLocaleString()}.00
            </div>
            <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{lang === "ta" ? "பரிவர்த்தனை வெற்றிகரமாகப் பதியப்பட்டது (SUCCESSFUL)" : "Transaction Successfully Processed & Confirmed"}</span>
            </div>
          </div>

          {/* Seals and Leadership Signatures */}
          <div className="pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-center">
            
            {/* Gen Secretary Sign */}
            <div className="space-y-1">
              <div className="h-9 border-b border-stone-400 flex items-end justify-center pb-1">
                <span className="font-serif italic font-bold text-stone-700 text-xs text-blue-900">R. Xavier Babu</span>
              </div>
              <span className="font-bold text-[11px] text-stone-900 block leading-tight">ரா. சேவியர் பாபு</span>
              <span className="text-[9px] text-stone-500 block">மாநில பொதுச்செயலாளர்</span>
            </div>

            {/* Official Digital Seal */}
            <div className="flex flex-col items-center justify-center py-1">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#b91c1c] p-1 flex items-center justify-center bg-rose-50/50 shadow-xs">
                <div className="text-center">
                  <span className="text-[8px] font-black text-[#b91c1c] block leading-none">TNPA²</span>
                  <span className="text-[6px] font-bold text-stone-600 block uppercase mt-0.5">OFFICIAL SEAL</span>
                  <span className="text-[6px] font-mono text-amber-700 block">ESTD 1989</span>
                </div>
              </div>
            </div>

            {/* State President Sign */}
            <div className="space-y-1">
              <div className="h-9 border-b border-stone-400 flex items-end justify-center pb-1">
                <span className="font-serif italic font-bold text-stone-700 text-xs text-red-900">S. Michael Alvin</span>
              </div>
              <span className="font-bold text-[11px] text-stone-900 block leading-tight">S. மைக்கேல் ஆல்வின்</span>
              <span className="text-[9px] text-stone-500 block">மாநில தலைவர்</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-stone-400 pt-2 border-t border-stone-100">
            {lang === "ta" 
              ? "இது தமிழ்நாடு பெயிண்டர்கள் சங்கம் (TNPA²) மூலம் உருவாக்கப்பட்ட அதிகாரப்பூர்வ இ-ரசீது ஆகும்." 
              : "This is a computer generated official electronic receipt verified by TNPA² Master Node."}
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (lang === "ta" ? "நகலெடுக்கப்பட்டது!" : "Copied!") : (lang === "ta" ? "விபரங்களை நகலெடு" : "Copy Details")}</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{lang === "ta" ? "வாட்ஸ்அப் பகிர்வு" : "Share WhatsApp"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === "ta" ? "ரசீதை அச்சிடு / PDF" : "Print Receipt / PDF"}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {lang === "ta" ? "மூடுக" : "Close"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
