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
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react';
import { MemberCardRequest, MemberCardPaymentConfig } from '../types/memberCard';
import { 
  getAllMemberCardRequests, 
  approveMemberCardRequest, 
  rejectMemberCardRequest, 
  getMemberCardConfig, 
  saveMemberCardConfig 
} from '../utils/memberCardStorage';

interface AdminMemberCardVerificationProps {
  currentAdminName?: string;
}

export const AdminMemberCardVerification: React.FC<AdminMemberCardVerificationProps> = ({
  currentAdminName = 'State Admin',
}) => {
  const [requests, setRequests] = useState<MemberCardRequest[]>([]);
  const [config, setConfig] = useState<MemberCardPaymentConfig>(getMemberCardConfig());
  const [activeTab, setActiveTab] = useState<'requests' | 'settings'>('requests');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rejection modal
  const [selectedForReject, setSelectedForReject] = useState<MemberCardRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Preview approved card
  const [selectedForPreview, setSelectedForPreview] = useState<MemberCardRequest | null>(null);
  
  // Config save feedback
  const [configSaved, setConfigSaved] = useState(false);

  const loadData = () => {
    setRequests(getAllMemberCardRequests());
    setConfig(getMemberCardConfig());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (id: string) => {
    const updated = approveMemberCardRequest(id, currentAdminName);
    if (updated) {
      loadData();
    }
  };

  const handleRejectSubmit = () => {
    if (!selectedForReject) return;
    const updated = rejectMemberCardRequest(selectedForReject.id, rejectReason, currentAdminName);
    if (updated) {
      setSelectedForReject(null);
      setRejectReason('');
      loadData();
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
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
      r.memberPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalAmountCollected = approvedCount * (config.amount || 100);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            நிர்வாகி கட்டண சரிபார்ப்பு முகப்பு
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Member Card Payment Verification / உறுப்பினர் அட்டை கட்டண சரிபார்ப்பு
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            உறுப்பினர்கள் செலுத்திய ₹100 UPI UTR எண்களை வங்கி அறிக்கையுடன் சரிபார்த்து அட்டையை வழங்கவும்.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            கோரிக்கைகள் ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            UPI அமைப்புகள் (Settings)
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase">நிலுவையில் உள்ளவை</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-slate-900">{pendingCount}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Pending Verification</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase">அங்கீகரிக்கப்பட்டவை</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-slate-900">{approvedCount}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Approved & Issued</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-bold uppercase">நிராகரிக்கப்பட்டவை</span>
            <XCircle className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-slate-900">{rejectedCount}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Rejected</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-xs font-bold uppercase">மொத்த வசூல்</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-indigo-600">₹{totalAmountCollected.toLocaleString('en-IN')}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Verified Card Fees</p>
        </div>
      </div>

      {/* TAB 1: REQUESTS LIST */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Name, ID, UTR, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                அனைத்தும் ({requests.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                நிலுவை ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                அங்கீகரிக்கப்பட்டவை ({approvedCount})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                நிராகரிக்கப்பட்டவை ({rejectedCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">உறுப்பினர் / Member</th>
                  <th className="py-3 px-4">தொலைபேசி / Phone</th>
                  <th className="py-3 px-4">மாவட்டம் / District</th>
                  <th className="py-3 px-4">தொகை / Amount</th>
                  <th className="py-3 px-4">UPI UTR / Reference</th>
                  <th className="py-3 px-4">தேதி / Date</th>
                  <th className="py-3 px-4">நிலை / Status</th>
                  <th className="py-3 px-4 text-center">செயல் / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {req.photoUrl ? (
                            <img
                              src={req.photoUrl}
                              alt={req.memberName}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {req.memberName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{req.memberName}</span>
                            <span className="text-[11px] font-mono text-slate-500">{req.memberId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {req.memberPhone || '-'}
                      </td>

                      {/* District */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {req.district}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{req.amount}
                      </td>

                      {/* UTR Number */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                          {req.utrNumber}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {req.paymentDate}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Pending Verification
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-sm"
                                title="Approve ₹100 Payment"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setSelectedForReject(req)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                                title="Reject Payment"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {req.status === 'approved' && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Issued ({req.cardNumber || 'Active'})
                            </span>
                          )}

                          {req.status === 'rejected' && (
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium"
                            >
                              Re-evaluate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      எந்த கட்டண கோரிக்கைகளும் கிடைக்கவில்லை (No payment requests match criteria).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURATION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              அதிகாரப்பூர்வ UPI & கட்டண கட்டமைப்பு (Payment Settings)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              சங்கத்தின் அதிகாரப்பூர்வ UPI / Payment எண்ணை மாற்றவும்.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wide">
                அதிகாரப்பூர்வ UPI / Payment Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={config.upiNumber || '7010131915'}
                onChange={(e) => setConfig({ ...config, upiNumber: e.target.value })}
                required
                placeholder="7010131915"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wide">
                பெறுநர் பெயர் / Payee Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={config.payeeName}
                onChange={(e) => setConfig({ ...config, payeeName: e.target.value })}
                required
                placeholder="Tamil Nadu Painters and Artists Welfare Association"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wide">
                உறுப்பினர் அட்டை கட்டணம் (Amount in ₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={config.amount}
                onChange={(e) => setConfig({ ...config, amount: Number(e.target.value) || 100 })}
                required
                min={1}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            {configSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன (Settings saved successfully).
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                அமைப்புகளை சேமிக்க / Save Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REJECTION MODAL */}
      {selectedForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                கட்டணத்தை நிராகரிக்க / Reject Payment
              </h3>
              <button
                onClick={() => setSelectedForReject(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <p><span className="font-bold">உறுப்பினர்:</span> {selectedForReject.memberName} ({selectedForReject.memberId})</p>
              <p><span className="font-bold">UTR எண்:</span> {selectedForReject.utrNumber}</p>
              <p><span className="font-bold">தொகை:</span> ₹{selectedForReject.amount}</p>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">
                நிராகரிப்புக்கான காரணம் / Reason for Rejection:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="எ.கா. UTR எண் வங்கி கணக்குடன் பொருந்தவில்லை / தவறான பரிவர்த்தனை எண்."
                rows={3}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedForReject(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                ரத்து / Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                நிராகரிப்பை உறுதிசெய்க / Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
