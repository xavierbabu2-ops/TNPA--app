import { MemberCardRequest, MemberCardPaymentConfig, DEFAULT_MEMBER_CARD_CONFIG } from '../types/memberCard';

const STORAGE_KEY_REQUESTS = 'tnpa_member_card_requests_v1';
const STORAGE_KEY_CONFIG = 'tnpa_member_card_config_v1';

// Initial sample mock data if empty
const INITIAL_REQUESTS: MemberCardRequest[] = [
  {
    id: 'MCR-2026-001',
    memberId: 'TNP-2026-0001',
    memberName: 'மு. சக்திவேல்',
    memberNameEn: 'M. Sakthivel',
    memberPhone: '9842189420',
    district: 'சென்னை',
    districtEn: 'Chennai',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    experienceYears: 12,
    bloodGroup: 'O+',
    amount: 100,
    utrNumber: '428910293812',
    paymentDate: '2026-08-10 11:30 AM',
    status: 'approved',
    approvedBy: 'Super Admin (State Treasurer)',
    approvedAt: '2026-08-10 01:15 PM',
    cardNumber: 'TNPA-CARD-CHE-0001',
    cardVerificationToken: 'TNPA-VERIFY-0001-SAKTHI',
    issuedAt: '2026-08-10',
    validUntil: '31-12-2027',
    createdAt: '2026-08-10T06:00:00.000Z'
  },
  {
    id: 'MCR-2026-002',
    memberId: 'TNP-2026-0042',
    memberName: 'ஆர். ராஜேஷ்',
    memberNameEn: 'R. Rajesh',
    memberPhone: '9840192831',
    district: 'மதுரை',
    districtEn: 'Madurai',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    experienceYears: 8,
    bloodGroup: 'B+',
    amount: 100,
    utrNumber: '519284729104',
    paymentDate: '2026-08-14 09:45 AM',
    status: 'pending',
    cardVerificationToken: 'TNPA-VERIFY-0042-RAJESH',
    createdAt: '2026-08-14T04:15:00.000Z'
  }
];

export function getMemberCardConfig(): MemberCardPaymentConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load member card config:', e);
  }
  return DEFAULT_MEMBER_CARD_CONFIG;
}

export function saveMemberCardConfig(config: MemberCardPaymentConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save member card config:', e);
  }
}

export function getAllMemberCardRequests(): MemberCardRequest[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load member card requests:', e);
  }
  // Initialize default
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
}

export function getMemberCardRequestByMemberId(memberId: string): MemberCardRequest | null {
  const requests = getAllMemberCardRequests();
  return requests.find(r => r.memberId === memberId) || null;
}

export function getMemberCardRequestByToken(token: string): MemberCardRequest | null {
  const requests = getAllMemberCardRequests();
  return requests.find(r => r.cardVerificationToken === token || r.cardNumber === token || r.id === token) || null;
}

export function saveMemberCardRequest(request: MemberCardRequest): void {
  const requests = getAllMemberCardRequests();
  const index = requests.findIndex(r => r.id === request.id || r.memberId === request.memberId);
  
  if (index >= 0) {
    requests[index] = { ...requests[index], ...request, updatedAt: new Date().toISOString() };
  } else {
    requests.unshift(request);
  }
  
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
}

export function approveMemberCardRequest(requestId: string, adminName: string): MemberCardRequest | null {
  const requests = getAllMemberCardRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) return null;

  const districtCode = (req.districtEn || req.district || 'TN').substring(0, 3).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  req.status = 'approved';
  req.approvedBy = adminName;
  req.approvedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  req.cardNumber = `TNPA-CARD-${districtCode}-${randomNum}`;
  req.cardVerificationToken = `TNPA-VERIFY-${req.memberId || randomNum}-${Date.now().toString(36).toUpperCase()}`;
  req.issuedAt = new Date().toISOString().split('T')[0];
  req.validUntil = '31-12-2027';
  req.updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  return req;
}

export function rejectMemberCardRequest(requestId: string, reason: string, adminName: string): MemberCardRequest | null {
  const requests = getAllMemberCardRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) return null;

  req.status = 'rejected';
  req.rejectionReason = reason || 'Payment UTR number could not be verified in association bank account.';
  req.approvedBy = adminName;
  req.updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  return req;
}
