import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Settings, 
  Save, 
  CreditCard, 
  User, 
  Phone, 
  MapPin, 
  Check, 
  X, 
  ShieldCheck, 
  ShieldAlert,
  Lock,
  Crown,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Eye,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MemberCardRequest, MemberCardPaymentConfig } from '../types/memberCard';
import { UserAccount } from '../types';
import { 
  getAllMemberCardRequests, 
  approveMemberCardRequest,
  districtApproveMemberCardRequest,
  superAdminApproveMemberCardRequest,
  rejectMemberCardRequest, 
  getMemberCardConfig, 
  saveMemberCardConfig 
} from '../utils/memberCardStorage';

interface AdminMemberCardVerificationProps {
  currentAdminName?: string;
  currentUser?: UserAccount | null;
  isSuperAdmin?: boolean;
  lang?: 'ta' | 'en';
}

export const AdminMemberCardVerification: React.FC<AdminMemberCardVerificationProps> = ({
  currentAdminName = 'Admin',
  currentUser,
  isSuperAdmin,
  lang = 'ta'
}) => {
  const isAuthorizedSuperAdmin = 
    isSuperAdmin === true || 
    currentUser?.role === 'super_admin' || 
    currentUser?.role === 'state_admin' ||
    currentUser?.role === 'state_president' ||
    currentUser?.isPrimarySuperAdmin === true;

  const isDistrictAdmin = currentUser?.role === 'district_admin';

  const [requests, setRequests] = useState<MemberCardRequest[]>([]);
  const [config, setConfig] = useState<MemberCardPaymentConfig>(getMemberCardConfig());
  const [activeTab, setActiveTab] = useState<'requests' | 'settings'>('requests');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'district_approved' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rejection modal
  const [selectedForReject, setSelectedForReject] = useState<MemberCardRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Feedback toast
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [configSaved, setConfigSaved] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const loadData = () => {
    setRequests(getAllMemberCardRequests());
    setConfig(getMemberCardConfig());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // 1. District Admin Approval
  const handleDistrictApprove = (id: string) => {
    const adminLabel = currentUser?.name ? `${currentUser.name} (${currentUser.district || 'District'})` : currentAdminName;
    const updated = districtApproveMemberCardRequest(id, adminLabel);
    if (updated) {
      loadData();
      showFeedback('✅ மாவட்ட அட்மின் ஒப்புதல் அளிக்கப்பட்டது! சூப்பர் அட்மின் இறுதி ஒப்புதலுக்கு அனுப்பப்பட்டுள்ளது.');
    }
  };

  // 2. Super Admin Final Approval
  const handleSuperAdminApprove = (id: string) => {
    const adminLabel = currentUser?.name ? `${currentUser.name} (Super Admin)` : currentAdminName;
    const updated = superAdminApproveMemberCardRequest(id, adminLabel);
    if (updated) {
      loadData();
      showFeedback('✅ சூப்பர் அட்மின் இறுதி ஒப்புதல் வழங்கப்பட்டு கார்டு அதிகாரப்பூர்வமாக உருவாக்கப்பட்டது!');
    }
  };

  // Direct approval fallback
  const handleDirectApprove = (id: string) => {
    const updated = approveMemberCardRequest(id, currentAdminName, isAuthorizedSuperAdmin, isDistrictAdmin);
    if (updated) {
      loadData();
      showFeedback(
        isAuthorizedSuperAdmin
          ? '✅ சூப்பர் அட்மின் இறுதி ஒப்புதல் வழங்கப்பட்டது!'
          : '✅ மாவட்ட அட்மின் ஒப்புதல் அளிக்கப்பட்டது!'
      );
    }
  };

  const handleRejectSubmit = () => {
    if (!selectedForReject) return;
    const updated = rejectMemberCardRequest(selectedForReject.id, rejectReason, currentAdminName);
    if (updated) {
      setSelectedForReject(null);
      setRejectReason('');
      loadData();
      showFeedback('⚠️ கோரிக்கை நிராகரிக்கப்பட்டது.');
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedSuperAdmin) {
      setPermissionError(
        lang === 'ta'
          ? '❌ அனுமதி மறுக்கப்பட்டது: உறுப்பினர் அட்டை கட்டணங்களை திருத்துவதற்கு சூப்பர் அட்மினுக்கு மட்டுமே அதிகாரம் உண்டு.'
          : '❌ Access Denied: Only Super Admin has the exclusive authority to modify member card fees.'
      );
      return;
    }
    setPermissionError(null);
    saveMemberCardConfig(config);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = 
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.memberNameEn && r.memberNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.utrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.memberPhone.includes(searchTerm) ||
      (r.district && r.district.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const districtApprovedCount = requests.filter(r => r.status === 'district_approved').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalAmountCollected = (approvedCount + districtApprovedCount) * (config.amount || 100);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed top-6 right-6 z-50 bg-[#800000] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce text-xs sm:text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 text-yellow-300" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 rounded-3xl shadow-xl border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>இருபடி கட்டண & அடையாள அட்டை ஒப்புதல் (Dual-Stage Approval Pipeline)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            உறுப்பினர் அட்டை கட்டண சரிபார்ப்பு & ஒப்புதல்
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm">
            மாவட்ட அட்மின் சரிபார்த்து ஒப்புதல் அளித்தாலும், சூப்பர் அட்மின் இறுதி ஒப்புதல் அளித்தவுடன் மட்டுமே அட்டை உருவாக்கப்படும்.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-2xl border border-stone-700 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#C00000] text-white shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            கோரிக்கைகள் ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#C00000] text-white shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>UPI அமைப்புகள்</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Metric 1: Pending */}
        <div className="bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-black uppercase">1. புதிய நிலுவை</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-stone-900">{pendingCount}</span>
          <p className="text-[10px] text-stone-500 mt-0.5">மாவட்ட ஆய்வுக்கு</p>
        </div>

        {/* Metric 2: District Approved */}
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm bg-amber-50/30">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-black uppercase">2. மாவட்ட ஒப்புதல்</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-amber-900">{districtApprovedCount}</span>
          <p className="text-[10px] text-amber-700 mt-0.5">சூப்பர் அட்மின் ஒப்புதலுக்கு</p>
        </div>

        {/* Metric 3: Fully Approved / Issued */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-sm bg-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-black uppercase">3. அட்டை வழங்கப்பட்டது</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-emerald-800">{approvedCount}</span>
          <p className="text-[10px] text-emerald-600 mt-0.5">Approved & Download Ready</p>
        </div>

        {/* Metric 4: Total Collection */}
        <div className="bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-[#800000] mb-1">
            <span className="text-[11px] font-black uppercase">மொத்த வசூல்</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-[#800000]">₹{totalAmountCollected.toLocaleString('en-IN')}</span>
          <p className="text-[10px] text-stone-500 mt-0.5">₹100 Card Fees</p>
        </div>

      </div>

      {/* TAB 1: REQUESTS LIST */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl overflow-hidden space-y-4 p-5 sm:p-6">
          
          {/* Workflow Explanation Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-stone-800">
                <strong>அனுமதி விதிமுறை:</strong> மாவட்ட அட்மின் ஒப்புதல் அளித்த பிறகு, <strong>சூப்பர் அட்மின் (Super Admin)</strong> இறுதி ஒப்புதல் அளித்தவுடன் மட்டுமே கார்டு எண் உருவாக்கப்பட்டு பயனர் பதிவிறக்கம் செய்ய முடியும்.
              </span>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl font-bold text-stone-800 flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>புதுப்பி (Refresh)</span>
            </button>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="பெயர், எண், UTR, தொலைபேசி, மாவட்டம்..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs focus:outline-none focus:border-[#C00000] focus:ring-1 focus:ring-[#C00000] text-stone-900 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                அனைத்தும் ({requests.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                புதியவை ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('district_approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'district_approved' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                மாவட்ட ஒப்புதல் ({districtApprovedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                அட்டை வழங்கப்பட்டவை ({approvedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                நிராகரிப்பு ({rejectedCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border-2 border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 uppercase tracking-wider font-black border-b-2 border-stone-200">
                <tr>
                  <th className="py-3 px-4">உறுப்பினர் / Member</th>
                  <th className="py-3 px-4">மாவட்டம் / District</th>
                  <th className="py-3 px-4">UPI UTR / Reference</th>
                  <th className="py-3 px-4">தொகை</th>
                  <th className="py-3 px-4">தேதி</th>
                  <th className="py-3 px-4">ஒப்புதல் நிலை (Stage)</th>
                  <th className="py-3 px-4 text-center">நிர்வாகி செயல்முறை (Approval Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                      
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {req.photoUrl ? (
                            <img
                              src={req.photoUrl}
                              alt={req.memberName}
                              className="w-10 h-10 rounded-xl object-cover border-2 border-stone-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#C00000] font-black flex items-center justify-center text-sm shadow-inner">
                              {req.memberName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-black text-stone-900 block leading-tight text-sm">
                              {req.memberName}
                            </span>
                            <span className="text-[11px] font-mono text-stone-500 font-bold">
                              {req.memberId}
                            </span>
                            {req.memberPhone && (
                              <span className="text-[10px] text-stone-400 block font-mono">
                                📞 {req.memberPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4 text-stone-800 font-bold">
                        <span className="px-2 py-0.5 bg-stone-100 rounded-md border border-stone-200">
                          {req.district}
                        </span>
                      </td>

                      {/* UTR Number */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 text-xs">
                          {req.utrNumber}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black text-stone-900">
                        ₹{req.amount}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-stone-500 text-[11px] whitespace-nowrap">
                        {req.paymentDate}
                      </td>

                      {/* Status Badge with Dual-Stage Indicators */}
                      <td className="py-3.5 px-4">
                        {req.status === 'approved' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              அட்டை உருவாக்கப்பட்டது
                            </span>
                            <div className="text-[9.5px] text-stone-500 font-mono">
                              {req.cardNumber || 'Active'}
                            </div>
                          </div>
                        )}

                        {req.status === 'district_approved' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <ShieldCheck className="w-3 h-3 text-amber-700" />
                              மாவட்ட ஒப்புதல் முடிந்தது
                            </span>
                            <div className="text-[9px] text-amber-700 font-semibold">
                              சூப்பர் அட்மின் ஒப்புதலுக்குக் காத்திருக்கிறது
                            </div>
                          </div>
                        )}

                        {req.status === 'pending' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300 animate-pulse">
                              <Clock className="w-3 h-3 text-yellow-700" />
                              புதிய நிலுவை (Pending)
                            </span>
                            <div className="text-[9px] text-stone-500">
                              மாவட்ட ஆய்வு தேவை
                            </div>
                          </div>
                        )}

                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            நிராகரிக்கப்பட்டது
                          </span>
                        )}
                      </td>

                      {/* Actions: Distinct District Admin and Super Admin Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                          
                          {/* Stage 1: District Approval (For pending items) */}
                          {req.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDistrictApprove(req.id)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-[10px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                title="மாவட்ட அட்மின் சரிபார்த்து ஒப்புதல் அளிக்க"
                              >
                                <Building2 className="w-3 h-3" />
                                <span>1. மாவட்ட ஒப்புதல்</span>
                              </button>

                              {/* Super Admin can also issue direct final clearance */}
                              {isAuthorizedSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleSuperAdminApprove(req.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                  title="சூப்பர் அட்மின் நேரடி இறுதி ஒப்புதல்"
                                >
                                  <Crown className="w-3 h-3" />
                                  <span>நேரடி கார்டு வழங்கல்</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedForReject(req)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-[10px] transition-colors border border-rose-200 cursor-pointer"
                                title="நிராகரிக்க"
                              >
                                நிராகரி
                              </button>
                            </>
                          )}

                          {/* Stage 2: Super Admin Final Approval (For district approved items) */}
                          {req.status === 'district_approved' && (
                            <>
                              {isAuthorizedSuperAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => handleSuperAdminApprove(req.id)}
                                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                                  title="சூப்பர் அட்மின் இறுதி ஒப்புதல் அளித்து கார்டு உருவாக்குக"
                                >
                                  <Crown className="w-3.5 h-3.5 text-yellow-300" />
                                  <span>2. சூப்பர் அட்மின் இறுதி ஒப்புதல் (Generate Card)</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  சூப்பர் அட்மின் ஒப்புதலுக்கு அனுப்பப்பட்டுள்ளது
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedForReject(req)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-[10px] transition-colors border border-rose-200 cursor-pointer"
                              >
                                நிராகரி
                              </button>
                            </>
                          )}

                          {/* Stage 3: Already Issued */}
                          {req.status === 'approved' && (
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              பதிவிறக்கம் தயார் ({req.cardNumber || 'Active'})
                            </span>
                          )}

                          {/* Rejected: Option to re-evaluate */}
                          {req.status === 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleDistrictApprove(req.id)}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              மீண்டும் பரிசீலி
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      எந்த கட்டண கோரிக்கைகளும் கிடைக்கவில்லை (No payment requests match criteria).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: UPI PAYMENT CONFIGURATION */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          
          <div className="border-b border-stone-200 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C00000] text-white flex items-center justify-center font-black">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                உறுப்பினர் அட்டை UPI & கட்டண அமைப்புகள்
              </h3>
              <p className="text-xs text-stone-500">
                உறுப்பினர்கள் பணம் செலுத்த வேண்டிய UPI எண் மற்றும் கட்டணத் தொகையை திருத்தவும்.
              </p>
            </div>
          </div>

          {permissionError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{permissionError}</span>
            </div>
          )}

          {configSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>✅ UPI அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டது!</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4">
            
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-700 block">
                அட்டை கட்டணத் தொகை (Amount in INR) :
              </label>
              <input
                type="number"
                value={config.amount || 100}
                onChange={(e) => setConfig({ ...config, amount: Number(e.target.value) })}
                disabled={!isAuthorizedSuperAdmin}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 text-sm focus:outline-none focus:border-[#C00000]"
              />
            </div>

            {/* UPI Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-700 block">
                Google Pay / PhonePe / Paytm எண் (UPI Number) :
              </label>
              <input
                type="text"
                value={config.upiNumber || '7010131915'}
                onChange={(e) => setConfig({ ...config, upiNumber: e.target.value })}
                disabled={!isAuthorizedSuperAdmin}
                placeholder="7010131915"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 text-sm focus:outline-none focus:border-[#C00000]"
              />
            </div>

            {/* UPI ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-700 block">
                UPI ID (Virtual Payment Address) :
              </label>
              <input
                type="text"
                value={config.upiId || '7010131915@ybl'}
                onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                disabled={!isAuthorizedSuperAdmin}
                placeholder="7010131915@ybl"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 text-sm focus:outline-none focus:border-[#C00000]"
              />
            </div>

            {/* Save Button */}
            {isAuthorizedSuperAdmin ? (
              <button
                type="submit"
                className="w-full py-3 bg-[#C00000] hover:bg-red-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>அமைப்புகளை சேமிக்க (Save Settings)</span>
              </button>
            ) : (
              <div className="p-3 bg-stone-100 rounded-xl text-stone-500 text-xs text-center font-bold">
                🔒 சூப்பர் அட்மினுக்கு மட்டுமே அமைப்புகளை மாற்ற அனுமதி உண்டு.
              </div>
            )}

          </form>

        </div>
      )}

      {/* REJECTION MODAL */}
      {selectedForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-black text-stone-900 text-sm">
                கட்டண கோரிக்கையை நிராகரிக்க
              </h4>
              <button
                type="button"
                onClick={() => setSelectedForReject(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600">
              உறுப்பினர்: <strong className="text-stone-900">{selectedForReject.memberName}</strong> ({selectedForReject.memberId})
              <br />
              UTR: <strong className="font-mono text-indigo-600">{selectedForReject.utrNumber}</strong>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-700 block">
                நிராகரிப்புக்கான காரணம் (Reason) :
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="எ.கா: UTR எண் வங்கி அறிக்கையுடன் பொருந்தவில்லை / தவறான UTR எண்."
                rows={3}
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#C00000]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedForReject(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
              >
                ரத்து
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow"
              >
                நிராகரிப்பை உறுதிசெய்
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
