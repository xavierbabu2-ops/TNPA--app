export type UserRole = 
  | "visitor" 
  | "member" 
  | "district_admin" 
  | "state_admin" 
  | "state_treasurer" 
  | "state_president" 
  | "super_admin";

export interface UserAccount {
  id: string;
  role: UserRole;
  name: string;
  nameEn: string;
  phone: string;
  email: string;
  district: string;
  districtEn: string;
  status: "pending" | "approved" | "rejected";
  regNumber?: string;
  photoUrl: string;
  password?: string;
  joinedAt: string;
  experienceYears?: number;
  aadhaar?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  renewalHistory?: { renewalDate: string; feePaid: number; validityUntil: string; txnId: string }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  performedBy: string;
  role: string;
  ipAddress?: string;
}

export interface WelfareApplication {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  schemeId: string;
  schemeTitle: string;
  schemeTitleEn: string;
  amount: string;
  appliedAt: string;
  status: "pending" | "approved" | "rejected" | "under_review" | "needs_correction";
  district: string;
  remarks?: string;
  correctionRemarks?: string;
  approvalDate?: string;
  photoUrl?: string;
  identityDocUrl?: string;
  addressProofUrl?: string;
  certificateUrl?: string;
  supportingDocUrl?: string;
  declarationAccepted: boolean;
  history?: { status: string; date: string; remarks: string }[];
}

export interface SystemSettings {
  allowDistrictPreliminaryApproval: boolean;
  enableAutoApproval: boolean;
  maintenanceMode: boolean;
  requiredSubscriptionAmount: number;
  aiKnowledgeBaseTa?: string;
  aiKnowledgeBaseEn?: string;
}

export interface Leader {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  phone: string;
  photoUrl: string;
  district: string;
  districtEn: string;
}

export interface NewsItem {
  id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  date: string;
  category: "news" | "circular" | "event";
  categoryTa: "செய்தி" | "சுற்றறிக்கை" | "நிகழ்வு";
  imageUrl?: string;
}

export interface WelfareScheme {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  amount: string;
  eligibility: string;
  eligibilityEn: string;
  steps: string[];
  stepsEn: string[];
}

export interface DistrictAdmin {
  id: string;
  district: string;
  districtEn: string;
  president: string;
  presidentPhone: string;
  secretary: string;
  secretaryPhone: string;
}

export interface MemberRegistration {
  id: string;
  regNumber: string;
  name: string;
  nameEn?: string;
  fatherName: string;
  dob: string;
  age?: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  aadhaar: string;
  state?: string;
  district: string;
  taluk?: string;
  villageOrTown?: string;
  pinCode?: string;
  address: string;
  profession?: string;
  occupation?: string;
  experienceYears: number;
  specialization?: string;
  photoUrl: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  additionalDocsUrl?: string;
  signatureData?: string;
  signatureType?: "drawn" | "typed";
  signatureText?: string;
  status: "pending" | "approved" | "rejected" | "under_review" | "needs_correction";
  correctionRemarks?: string;
  createdAt: string;
  renewalHistory?: { renewalDate: string; feePaid: number; validityUntil: string; txnId: string }[];
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  paymentDate: string;
  paymentType: "membership" | "donation" | "welfare_fund" | "renewal" | "event" | "training" | "other";
  paymentTypeTa: string;
  transactionId: string;
  status: "success" | "pending" | "failed";
  paymentMethod?: "upi" | "qr" | "card" | "netbanking" | "cash" | "bank_transfer";
  paymentMethodLabel?: string;
  district?: string;
  receiptNo?: string;
  remarks?: string;
  donorType?: "individual" | "organization" | "sponsor";
  approverName?: string;
  approvedAt?: string;
  dueDate?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  titleTa: string;
  amount: number;
  date: string;
  category: "office" | "event" | "travel" | "printing" | "training" | "relief" | "other";
  categoryTa: string;
  district?: string;
  recordedBy: string;
  remarks?: string;
}

export interface SystemStats {
  totalMembers: number;
  districtsActive: number;
  totalFundsRaised: number;
  welfareDisbursed: number;
  solvedCases: number;
}

export interface Task {
  id: string;
  title: string;
  titleEn: string;
  assignedTo: string;
  district: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed" | "in_progress";
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  titleEn: string;
  category: "rules" | "policies" | "materials" | "faq" | "schemes";
  content: string;
  contentEn: string;
}

