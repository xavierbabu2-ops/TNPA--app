import React, { useState } from "react";
import { 
  User, 
  Award, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Printer, 
  Upload, 
  MapPin, 
  FileText,
  BadgeAlert,
  Send,
  Sparkles,
  Search
} from "lucide-react";
import { UserAccount, WelfareApplication, PaymentRecord, WelfareScheme } from "../types";
import { initialWelfareSchemes } from "../mockData";

interface MemberDashboardProps {
  lang: "ta" | "en";
  member: UserAccount;
  welfareApps: WelfareApplication[];
  onAddWelfareApp: (newApp: WelfareApplication) => void;
  payments: PaymentRecord[];
  onAddPayment: (newPay: PaymentRecord) => void;
  onUpdateProfile: (updatedProfile: UserAccount) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function MemberDashboard({
  lang,
  member,
  welfareApps,
  onAddWelfareApp,
  payments,
  onAddPayment,
  onUpdateProfile,
  onAddAuditLog
}: MemberDashboardProps) {
  const [memberTab, setMemberTab] = useState<"id_card" | "welfare_schemes" | "my_dues" | "update_profile">("id_card");
  
  // Profile Form state
  const [phone, setPhone] = useState(member.phone);
  const [email, setEmail] = useState(member.email);
  const [address, setAddress] = useState(member.address || "");
  const [exp, setExp] = useState(member.experienceYears || 5);
  const [photo, setPhoto] = useState(member.photoUrl);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Welfare Scheme Apply Form state
  const [selectedScheme, setSelectedScheme] = useState<WelfareScheme>(initialWelfareSchemes[0]);
  const [welfareRemarks, setWelfareRemarks] = useState("");
  const [isApplyingWelfare, setIsApplyingWelfare] = useState(false);

  // Subscription Pay state
  const [isPayingSub, setIsPayingSub] = useState(false);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!phone.trim()) {
      setErrorMsg(lang === "ta" ? "கைபேசி எண் காலியாக இருக்கக் கூடாது!" : "Phone number cannot be empty!");
      return;
    }

    const updated: UserAccount = {
      ...member,
      phone,
      email,
      address,
      experienceYears: Number(exp),
      photoUrl: photo
    };

    onUpdateProfile(updated);
    setSuccessMsg(lang === "ta" ? "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : "Profile successfully updated!");
    onAddAuditLog("Member Profile Updated", `Member ${member.nameEn} updated their contact details.`);
  };

  // Submit welfare board scheme application
  const handleApplyWelfare = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplyingWelfare(true);

    setTimeout(() => {
      const newApp: WelfareApplication = {
        id: `w_claim_${Date.now()}`,
        memberId: member.regNumber || member.id,
        memberName: member.name,
        memberPhone: member.phone,
        schemeId: selectedScheme.id,
        schemeTitle: selectedScheme.title,
        schemeTitleEn: selectedScheme.titleEn,
        amount: selectedScheme.amount,
        appliedAt: new Date().toLocaleDateString(),
        status: "pending",
        district: member.district,
        remarks: welfareRemarks,
        declarationAccepted: true,
        history: [
          { status: "pending", date: new Date().toLocaleDateString(), remarks: "Application created through Member portal." }
        ]
      };

      onAddWelfareApp(newApp);
      onAddAuditLog(
        "Welfare Application Submitted",
        `Claim of ${selectedScheme.amount} for ${selectedScheme.titleEn} submitted by ${member.nameEn}.`
      );
      setWelfareRemarks("");
      setIsApplyingWelfare(false);
      alert(
        lang === "ta"
          ? "உங்கள் நலத்திட்ட உதவி கோரிக்கை விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!"
          : "Your welfare grant claim has been registered in our database! Tracking id generated."
      );
    }, 1200);
  };

  // Pay membership dues
  const handlePayMembershipSub = () => {
    setIsPayingSub(true);
    
    setTimeout(() => {
      const transactionId = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
      const newPay: PaymentRecord = {
        id: `pay_${Date.now()}`,
        memberId: member.regNumber || "TNP-PENDING",
        memberName: member.name,
        amount: 500,
        paymentDate: new Date().toLocaleString(),
        paymentType: "membership",
        paymentTypeTa: "உறுப்பினர் கட்டணம்",
        transactionId,
        status: "success"
      };

      onAddPayment(newPay);

      // Append renewal history entry
      const currentRenewalHistory = member.renewalHistory || [];
      const newRenewal = {
        renewalDate: new Date().toLocaleDateString(),
        feePaid: 500,
        validityUntil: `31st Dec ${new Date().getFullYear() + 1}`,
        txnId: transactionId
      };

      const updatedMember: UserAccount = {
        ...member,
        renewalHistory: [...currentRenewalHistory, newRenewal]
      };

      onUpdateProfile(updatedMember);

      onAddAuditLog(
        "Paid Membership Dues & Renewed",
        `Subscription amount Rs. 500 paid online. Validity extended until ${newRenewal.validityUntil}. Txn: ${transactionId}`
      );
      setIsPayingSub(false);
      alert(
        lang === "ta"
          ? "உங்கள் ஆண்டுச் சந்தா வெற்றிகரமாக செலுத்தப்பட்டு உறுப்பினர் அட்டை புதுப்பிக்கப்பட்டது!"
          : "Yearly subscription dues cleared and membership validity successfully extended!"
      );
    }, 1500);
  };

  // Download digital receipt helper
  const handleDownloadReceipt = (record: PaymentRecord) => {
    const text = `
==================================================
  தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம்
          TAMIL NADU PAINTERS ASSOCIATION
==================================================
ரசீது எண் (Receipt ID): ${record.id}
தேதி (Date): ${record.paymentDate}
உறுப்பினர் ID: ${record.memberId}
பெயர் (Name): ${record.memberName}
கட்டண வகை (Type): ${record.paymentTypeTa} (${record.paymentType})
செலுத்திய தொகை (Paid): Rs. ${record.amount}.00
பரிவர்த்தனை ID (TXN ID): ${record.transactionId}
==================================================
ஒன்று கூடுவோம், வென்று காட்டுவோம் - நன்றி!
==================================================
    `;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sub_Receipt_${record.transactionId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Track welfare applications of this member
  const memberClaims = welfareApps.filter(
    (app) => app.memberId === (member.regNumber || member.id)
  );

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-[550px] animate-[fadeIn_0.5s_ease-out]">
      
      {/* MEMBER NAVIGATION COLUMN */}
      <div className="bg-stone-900 text-stone-100 p-5 flex flex-col justify-between border-r border-stone-800">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center p-3 border-b border-stone-800">
            <img 
              src={member.photoUrl} 
              alt="Avatar" 
              className="h-20 w-16 object-cover rounded-xl border-2 border-amber-500 shadow-md mb-2" 
            />
            <span className="font-extrabold text-sm block">
              {lang === "ta" ? member.name : member.nameEn}
            </span>
            <span className="text-[10px] font-mono text-yellow-300 font-bold block mt-1">
              {member.regNumber || "ID Pending Approval"}
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setMemberTab("id_card")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                memberTab === "id_card" ? "bg-[#b91c1c] text-white" : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>{lang === "ta" ? "எனது உறுப்பினர் அட்டை" : "Digital ID Card"}</span>
            </button>

            <button
              onClick={() => setMemberTab("welfare_schemes")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                memberTab === "welfare_schemes" ? "bg-[#b91c1c] text-white" : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{lang === "ta" ? "நலவாரிய விண்ணப்பங்கள்" : "Welfare Applications"}</span>
            </button>

            <button
              onClick={() => setMemberTab("my_dues")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                memberTab === "my_dues" ? "bg-[#b91c1c] text-white" : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{lang === "ta" ? "எனது சந்தா / ரசீதுகள்" : "My Dues & Receipts"}</span>
            </button>

            <button
              onClick={() => setMemberTab("update_profile")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                memberTab === "update_profile" ? "bg-[#b91c1c] text-white" : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{lang === "ta" ? "சுயவிவரம் திருத்த" : "Update Profile"}</span>
            </button>
          </nav>
        </div>

        <div className="p-3 bg-stone-800 rounded-xl text-[10px] text-stone-400">
          📍 Association: <span className="text-amber-400 font-extrabold uppercase">TNP MEMBER</span>
        </div>
      </div>

      {/* MEMBER WORKSPACE COLUMN */}
      <div className="col-span-3 p-6 bg-white overflow-y-auto">
        
        {/* TAB 1: DIGITAL ID CARD VIEW */}
        {memberTab === "id_card" && (
          <div className="space-y-6 text-left flex flex-col items-center">
            <div className="w-full border-b pb-2.5">
              <h3 className="text-base font-black text-stone-900 uppercase">
                {lang === "ta" ? "உங்கள் டிஜிட்டல் சங்க உறுப்பினர் அட்டை" : "YOUR DIGITAL MEMBERSHIP CREDENTIALS"}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === "ta" ? "இந்த அட்டை வர்ணம் பூசும் தொழிலாளர் அரசு சலுகைகளைப் பெற பயன்படும்." : "Present this credentials to local welfare inspectors for premium identification."}
              </p>
            </div>

            {/* Red / Gold ID Card */}
            <div className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-amber-500 shadow-2xl bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#1e1b4b] text-white p-5 flex flex-col relative">
              <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-3">
                <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center relative p-0.5 shrink-0">
                  <div className="absolute inset-0 border border-dotted border-amber-400 rounded-full animate-spin [animation-duration:15s]" />
                  <span className="text-[10px] text-[#991b1b] font-black">TNP</span>
                </div>
                <div className="flex-1">
                  <span className="text-[7px] uppercase font-bold text-amber-300 block tracking-widest leading-none">
                    ஒன்று கூடுவோம், வென்று காட்டுவோம்
                  </span>
                  <span className="text-[9px] font-black block leading-tight">
                    T.N. PAINTERS & ARTISTS ASSOCIATION
                  </span>
                  <span className="text-[6px] text-stone-200 block leading-none">
                    Reg No: TNMDUJCLMDUTU-50-26-00044
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 flex-1 mb-3">
                <div className="flex flex-col items-center">
                  <img 
                    src={member.photoUrl} 
                    alt="Photo" 
                    className="h-20 w-16 object-cover rounded-lg border border-amber-300 shadow" 
                  />
                  <span className="text-[8px] text-amber-300 font-bold mt-1.5 uppercase bg-white/10 px-1.5 py-0.5 rounded">
                    {member.bloodGroup || "O+"}
                  </span>
                </div>

                <div className="col-span-2 space-y-1.5 text-left text-xs">
                  <div>
                    <span className="text-[7px] text-amber-200 uppercase block tracking-wider leading-none">Name / பெயர்:</span>
                    <span className="text-[11px] font-extrabold text-white block truncate">{member.name}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-amber-200 uppercase block tracking-wider leading-none">ID Number / எண்:</span>
                    <span className="text-[10px] font-mono font-bold text-yellow-300 block">{member.regNumber || "WAITING APPROVAL"}</span>
                  </div>
                  <div>
                    <span className="text-[7px] text-amber-200 uppercase block tracking-wider leading-none">District / மாவட்டம்:</span>
                    <span className="text-[9px] text-white block font-semibold">{member.district}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/20 pt-2 shrink-0 text-[6px] text-amber-200">
                <div className="text-left space-y-0.5">
                  <span>Phone / கைபேசி: {member.phone}</span>
                  <br />
                  <span>Aadhaar: {member.aadhaar || "Verified"}</span>
                  <br />
                  <span>Verified Date: {member.joinedAt.split("T")[0]}</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-6 w-16 bg-white/25 rounded flex items-center justify-center font-mono text-[7px] text-amber-300 border border-white/10 select-none">
                    [ AUTHORISED ]
                  </div>
                  <span className="text-[5px] text-amber-300 uppercase font-black mt-0.5">GENERAL SECRETARY</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span>{lang === "ta" ? "அடையாள அட்டை அச்சிடு" : "Print ID Card"}</span>
            </button>
          </div>
        )}

        {/* TAB 2: WELFARE SCHEMES CLAIM & TRACK STATUS */}
        {memberTab === "welfare_schemes" && (
          <div className="space-y-6 text-left">
            <div className="border-b pb-2.5">
              <h3 className="text-base font-black text-stone-900 uppercase">
                {lang === "ta" ? "சங்க நல நிதி விண்ணப்பம் மற்றும் கண்காணிப்பு" : "WELFARE CLAIMS & STATUS TRACKER"}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === "ta" ? "விபத்து காப்பீடு, ஓய்வூதியம், மற்றும் திருமண நிதியுதவி விண்ணப்பிக்கவும்." : "Request emergency grants. Track review status from Pending to Treasurer disbursement."}
              </p>
            </div>

            {/* Claims History Tracker */}
            <div>
              <span className="font-extrabold text-xs text-stone-800 block mb-3">
                {lang === "ta" ? "விண்ணப்பங்களின் தற்போதைய நிலை" : "My Active Claims Status Tracker"}
              </span>

              {memberClaims.length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl border text-center text-xs text-stone-400">
                  {lang === "ta" ? "விண்ணப்பங்கள் எதுவும் சமர்ப்பிக்கப்படவில்லை." : "No welfare board claims submitted yet."}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {memberClaims.map((claim, idx) => (
                    <div key={`m_claim_${claim.id}_${idx}`} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-stone-800 block">{claim.schemeTitleEn}</span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">Applied on: {claim.appliedAt} | Claim: {claim.amount}</span>
                      </div>
                      
                      <div className="text-right">
                        {claim.status === "pending" && (
                          <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-black text-[9px] animate-pulse">
                            ● PENDING REVIEW
                          </span>
                        )}
                        {claim.status === "approved" && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-[9px]">
                            ✓ DISBURSED BY TREASURY
                          </span>
                        )}
                        {claim.status === "rejected" && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full font-black text-[9px]">
                            ✕ REJECTED
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Apply Form */}
            <form onSubmit={handleApplyWelfare} className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
              <span className="font-extrabold text-xs text-stone-800 block flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{lang === "ta" ? "புதிய நலத்திட்ட விண்ணப்பம் சமர்ப்பிக்க" : "Submit New Welfare Board Application"}</span>
              </span>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">நலத்திட்டம் (Select Welfare Scheme) *</label>
                  <select
                    value={selectedScheme.id}
                    onChange={(e) => {
                      const matched = initialWelfareSchemes.find((s) => s.id === e.target.value);
                      if (matched) setSelectedScheme(matched);
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-white cursor-pointer"
                  >
                    {initialWelfareSchemes.map((s, idx) => (
                      <option key={`m_sch_${s.id}_${idx}`} value={s.id}>{lang === "ta" ? s.title : s.titleEn} ({s.amount})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">விவரங்கள் / விளக்கங்கள் (Brief Remarks) *</label>
                  <textarea
                    required
                    rows={2.5}
                    value={welfareRemarks}
                    onChange={(e) => setWelfareRemarks(e.target.value)}
                    placeholder={lang === "ta" ? "குடும்ப சூழ்நிலை, அரசு ஆவணங்கள் மற்றும் வங்கித் தகவல்..." : "Briefly state the reason for claim. Banks details, marriage date details..."}
                    className="w-full p-3 border rounded-xl bg-white resize-none"
                  />
                </div>

                <div className="border border-dashed border-stone-200 p-3 rounded-xl bg-white text-[11px] text-stone-500">
                  📎 Attach copy of Aadhaar Card, FIR (if accident), or marriage invitation cards. File upload verified automatically.
                </div>
              </div>

              <button
                type="submit"
                disabled={isApplyingWelfare}
                className="px-5 py-2.5 bg-stone-900 hover:bg-[#b91c1c] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-stone-300"
              >
                {isApplyingWelfare ? "Processing..." : "Submit Claim for Review"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MEMBER SUBSCRIPTION PAY & LEDGER */}
        {memberTab === "my_dues" && (
          <div className="space-y-6 text-left">
            <div className="border-b pb-2.5">
              <h3 className="text-base font-black text-stone-900 uppercase">
                {lang === "ta" ? "ஆண்டு சந்தா மற்றும் நன்கொடை வரலாறு" : "UNION SUBSCRIPTION LEDGER"}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === "ta" ? "உங்கள் உறுப்பினர் நிலையை சரிபார்த்து சந்தா நிலுவைகளைச் செலுத்தவும்." : "Clear active dues instantly. Generate printable digital PDF receipts."}
              </p>
            </div>

            {/* Dues Alert Card */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center text-xs">
              <div className="space-y-1 text-left">
                <span className="font-extrabold text-stone-950 block">Yearly Membership Fee Status</span>
                <span className="text-[10px] text-stone-500 block">
                  Subscription period valid up to: <strong className="text-[#b91c1c]">{member.renewalHistory && member.renewalHistory.length > 0 ? member.renewalHistory[member.renewalHistory.length - 1].validityUntil : `31st Dec ${new Date().getFullYear()}`}</strong>
                </span>
              </div>
              <button
                onClick={handlePayMembershipSub}
                disabled={isPayingSub}
                className="px-4 py-2 bg-stone-950 text-white rounded-lg font-bold hover:bg-stone-800 cursor-pointer disabled:bg-stone-300 shadow-sm"
              >
                {isPayingSub ? "Processing secure line..." : "Pay Rs. 500 Online"}
              </button>
            </div>

            {/* Renewal History Logs */}
            <div className="space-y-3 pb-4 border-b border-stone-100">
              <span className="font-extrabold text-xs text-stone-800 block">
                {lang === "ta" ? "உறுப்பினர் புதுப்பித்தல் வரலாறு" : "Membership Validity Renewal Logs"}
              </span>

              {!member.renewalHistory || member.renewalHistory.length === 0 ? (
                <div className="p-3 bg-stone-50 rounded-xl border border-dashed text-center text-[11px] text-stone-400">
                  {lang === "ta" ? "முந்தைய புதுப்பித்தல் விவரங்கள் இல்லை (தற்போது செயலில் உள்ளது)." : "No validity renewal records present. Active registration holds standard validity."}
                </div>
              ) : (
                <div className="space-y-2">
                  {member.renewalHistory.map((ren, index) => (
                    <div key={index} className="p-3 border border-stone-150 rounded-xl bg-white flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-stone-800 block">{lang === "ta" ? `புதுப்பித்தல் #${index + 1}` : `Renewal #${index + 1}`}</span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">
                          {lang === "ta" ? `நாள்: ${ren.renewalDate} | வரை செல்லுபடியாகும்: ` : `Date: ${ren.renewalDate} | Validity: `}
                          <strong className="text-emerald-700">{ren.validityUntil}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-900 font-extrabold block">₹{ren.feePaid}</span>
                        <span className="text-[9px] font-mono text-stone-400">{ren.txnId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Payments History */}
            <div className="space-y-3">
              <span className="font-extrabold text-xs text-stone-800 block">
                {lang === "ta" ? "எனது செலுத்தல் ரசீதுகள்" : "My Transaction Receipts Log"}
              </span>

              {payments.filter((p) => p.memberName === member.name).length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl border text-center text-xs text-stone-400">
                  {lang === "ta" ? "கட்டணப் பதிவுகள் எதுவும் இல்லை." : "No previous payments registered."}
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.filter((p) => p.memberName === member.name).map((pay, idx) => (
                    <div key={`m_pay_${pay.id}_${idx}`} className="p-3.5 border border-stone-200 rounded-xl bg-stone-50 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-stone-800 block">₹{pay.amount}.00</span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">{pay.paymentDate} | {pay.transactionId}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold rounded text-[9px]">
                          {pay.paymentTypeTa} (SUCCESS)
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadReceipt(pay)}
                        className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-bold flex items-center gap-1 hover:bg-stone-50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: UPDATE PROFILE CONTACT DETAILS */}
        {memberTab === "update_profile" && (
          <div className="space-y-6 text-left">
            <div className="border-b pb-2.5">
              <h3 className="text-base font-black text-stone-900 uppercase">
                {lang === "ta" ? "தொழிலாளர் சுயவிவரத் தகவல்கள் திருத்தம்" : "UPDATE MEMBER CONTACT BIO"}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === "ta" ? "முகவரி அல்லது கைபேசி எண் மாற்றினால் இங்கு உடனடியாக புதுப்பிக்கவும்." : "Modify active address, update years of experience, or swap display avatars."}
              </p>
            </div>

            {errorMsg && <div className="p-3 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs">{errorMsg}</div>}
            {successMsg && <div className="p-3 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs">{successMsg}</div>}

            <form onSubmit={handleSaveProfile} className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">கைபேசி எண் (Active Phone) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">மின்னஞ்சல் (Active Email) *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">தொழில் அனுபவம் (Years of Painting Exp) *</label>
                  <input
                    type="number"
                    required
                    value={exp}
                    onChange={(e) => setExp(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">சுயவிவரப் புகைப்படம் (Profile URL)</label>
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">தற்போதைய வீட்டு முகவரி (Home Address) *</label>
                <textarea
                  required
                  rows={2.5}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-white resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-sm"
              >
                Save Updated Biography
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
