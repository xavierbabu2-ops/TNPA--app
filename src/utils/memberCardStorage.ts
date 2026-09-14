import { MemberCardRequest, MemberCardPaymentConfig, DEFAULT_MEMBER_CARD_CONFIG } from '../types/memberCard';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, getDocs } from 'firebase/firestore';

const STORAGE_KEY_REQUESTS = 'tnpa_member_card_requests_v1';
const STORAGE_KEY_CONFIG = 'tnpa_member_card_config_v1';
export const CARD_REQUESTS_EVENT = 'tnpa_card_requests_updated';

// In-memory cache
let cachedRequests: MemberCardRequest[] | null = null;

// Initial sample mock data if empty
const INITIAL_REQUESTS: MemberCardRequest[] = [];

// Initialize Firestore listener for real-time sync across devices and sessions
let isListenerAttached = false;
export function initMemberCardFirestoreListener() {
  if (isListenerAttached || typeof window === 'undefined') return;
  isListenerAttached = true;

  try {
    const colRef = collection(db, 'member_card_requests');
    onSnapshot(colRef, (snapshot) => {
      const serverRequests: MemberCardRequest[] = [];
      snapshot.forEach((d) => {
        serverRequests.push(d.data() as MemberCardRequest);
      });

      if (serverRequests.length > 0) {
        // Merge with any locally saved requests
        const local = getLocalRequests();
        const mergedMap = new Map<string, MemberCardRequest>();
        local.forEach((r) => mergedMap.set(r.id, r));
        serverRequests.forEach((r) => mergedMap.set(r.id, r));
        
        const merged = Array.from(mergedMap.values()).sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        cachedRequests = merged;
        try {
          localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(merged));
        } catch (e) {
          console.error(e);
        }
        window.dispatchEvent(new CustomEvent(CARD_REQUESTS_EVENT, { detail: merged }));
      }
    }, (err) => {
      console.warn('Firestore member_card_requests onSnapshot warning:', err);
    });
  } catch (e) {
    console.warn('Could not attach Firestore listener for member_card_requests:', e);
  }
}

// Auto start listener
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initMemberCardFirestoreListener();
  }, 100);
}

function getLocalRequests(): MemberCardRequest[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load member card requests:', e);
  }
  return INITIAL_REQUESTS;
}

export function subscribeToMemberCardRequests(callback: (requests: MemberCardRequest[]) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<MemberCardRequest[]>;
    callback(custom.detail || getAllMemberCardRequests());
  };
  window.addEventListener(CARD_REQUESTS_EVENT, handler);
  // Also call immediately
  callback(getAllMemberCardRequests());
  return () => {
    window.removeEventListener(CARD_REQUESTS_EVENT, handler);
  };
}

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
    // Also sync config to Firestore union_config
    const docRef = doc(db, 'union_config', 'member_card_settings');
    setDoc(docRef, config, { merge: true }).catch((err) => {
      console.warn('Failed to sync member_card_settings to Firestore:', err);
    });
  } catch (e) {
    console.error('Failed to save member card config:', e);
  }
}

export function getAllMemberCardRequests(): MemberCardRequest[] {
  if (cachedRequests) return cachedRequests;
  const list = getLocalRequests();
  cachedRequests = list;
  return list;
}

export function getMemberCardRequestByMemberId(memberId: string): MemberCardRequest | null {
  if (!memberId) return null;
  const requests = getAllMemberCardRequests();
  const cleanId = String(memberId).trim().toLowerCase();
  return requests.find(r => 
    (r.memberId && String(r.memberId).trim().toLowerCase() === cleanId) ||
    (r.id && String(r.id).trim().toLowerCase() === cleanId) ||
    (r.cardNumber && String(r.cardNumber).trim().toLowerCase() === cleanId) ||
    (r.memberPhone && String(r.memberPhone).trim() === cleanId)
  ) || null;
}

export function getMemberCardRequestByToken(token: string): MemberCardRequest | null {
  const requests = getAllMemberCardRequests();
  return requests.find(r => r.cardVerificationToken === token || r.cardNumber === token || r.id === token) || null;
}

export function saveMemberCardRequest(request: MemberCardRequest): void {
  const requests = [...getAllMemberCardRequests()];
  const index = requests.findIndex(r => r.id === request.id || r.memberId === request.memberId);
  
  const updatedReq = {
    ...request,
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    requests[index] = { ...requests[index], ...updatedReq };
  } else {
    requests.unshift(updatedReq);
  }
  
  cachedRequests = requests;
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving requests to localStorage:', e);
  }

  // Sync to Firestore
  try {
    const docRef = doc(db, 'member_card_requests', updatedReq.id);
    setDoc(docRef, updatedReq, { merge: true }).catch((err) => {
      console.warn('Failed to write member_card_request to Firestore:', err);
    });
  } catch (err) {
    console.warn('Firestore write error:', err);
  }

  window.dispatchEvent(new CustomEvent(CARD_REQUESTS_EVENT, { detail: requests }));
}

export function approveMemberCardRequest(
  requestId: string, 
  adminName: string, 
  isSuperAdmin: boolean = false,
  isDistrictAdmin: boolean = false
): MemberCardRequest | null {
  const requests = [...getAllMemberCardRequests()];
  const index = requests.findIndex(r => r.id === requestId);
  if (index < 0) return null;

  const req = { ...requests[index] };
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

  requests[index] = req;
  cachedRequests = requests;
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error(e);
  }

  // Sync to Firestore
  try {
    const docRef = doc(db, 'member_card_requests', req.id);
    setDoc(docRef, req, { merge: true }).catch((err) => {
      console.warn('Failed to update member_card_request in Firestore:', err);
    });
  } catch (err) {
    console.warn('Firestore update error:', err);
  }

  window.dispatchEvent(new CustomEvent(CARD_REQUESTS_EVENT, { detail: requests }));
  return req;
}

export function districtApproveMemberCardRequest(requestId: string, districtAdminName: string): MemberCardRequest | null {
  return approveMemberCardRequest(requestId, districtAdminName, false, true);
}

export function superAdminApproveMemberCardRequest(requestId: string, superAdminName: string): MemberCardRequest | null {
  return approveMemberCardRequest(requestId, superAdminName, true, false);
}

export function rejectMemberCardRequest(requestId: string, reason: string, adminName: string): MemberCardRequest | null {
  const requests = [...getAllMemberCardRequests()];
  const index = requests.findIndex(r => r.id === requestId);
  if (index < 0) return null;

  const req = { ...requests[index] };
  req.status = 'rejected';
  req.rejectionReason = reason || 'Payment UTR number could not be verified in association bank account.';
  req.approvedBy = adminName;
  req.updatedAt = new Date().toISOString();

  requests[index] = req;
  cachedRequests = requests;
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error(e);
  }

  // Sync to Firestore
  try {
    const docRef = doc(db, 'member_card_requests', req.id);
    setDoc(docRef, req, { merge: true }).catch((err) => {
      console.warn('Failed to reject member_card_request in Firestore:', err);
    });
  } catch (err) {
    console.warn('Firestore update error:', err);
  }

  window.dispatchEvent(new CustomEvent(CARD_REQUESTS_EVENT, { detail: requests }));
  return req;
}

