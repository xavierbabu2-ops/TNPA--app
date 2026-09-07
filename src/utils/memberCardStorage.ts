import { MemberCardRequest, MemberCardPaymentConfig, DEFAULT_MEMBER_CARD_CONFIG } from '../types/memberCard';

const STORAGE_KEY_REQUESTS = 'tnpa_member_card_requests_v1';
const STORAGE_KEY_CONFIG = 'tnpa_member_card_config_v1';

// Initial sample mock data if empty
const INITIAL_REQUESTS: MemberCardRequest[] = [];

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

export function approveMemberCardRequest(
  requestId: string, 
  adminName: string, 
  isSuperAdmin: boolean = false,
  isDistrictAdmin: boolean = false
): MemberCardRequest | null {
  const requests = getAllMemberCardRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) return null;

  const nowString = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  if (isSuperAdmin) {
    // Super Admin / State President Final Approval - Unlocks Card Generation & Download
    const districtCode = (req.districtEn || req.district || 'TN').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    req.status = 'approved';
    req.superAdminApprovedBy = adminName;
    req.superAdminApprovedAt = nowString;
    req.approvedBy = adminName;
    req.approvedAt = nowString;
    if (!req.cardNumber) {
      req.cardNumber = `TNPA-CARD-${districtCode}-${randomNum}`;
    }
    if (!req.cardVerificationToken) {
      req.cardVerificationToken = `TNPA-VERIFY-${req.memberId || randomNum}-${Date.now().toString(36).toUpperCase()}`;
    }
    req.issuedAt = new Date().toISOString().split('T')[0];
    req.validUntil = '31-12-2027';
    req.updatedAt = new Date().toISOString();
  } else {
    // District Admin Approval - Needs Super Admin final confirmation before card can be generated
    req.status = 'district_approved';
    req.districtApprovedBy = adminName;
    req.districtApprovedAt = nowString;
    req.updatedAt = new Date().toISOString();
  }

  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  return req;
}

export function districtApproveMemberCardRequest(requestId: string, districtAdminName: string): MemberCardRequest | null {
  return approveMemberCardRequest(requestId, districtAdminName, false, true);
}

export function superAdminApproveMemberCardRequest(requestId: string, superAdminName: string): MemberCardRequest | null {
  return approveMemberCardRequest(requestId, superAdminName, true, false);
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
