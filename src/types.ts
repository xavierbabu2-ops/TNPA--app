export type UserRole = 
  | "visitor" 
  | "member" 
  | "union_admin"
  | "district_admin" 
  | "state_admin" 
  | "judicial_admin"
  | "state_treasurer" 
  | "state_president" 
  | "super_admin";

export interface AdminPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  manage_users: boolean;
  manage_content: boolean;
  manage_livetv: boolean;
  manage_reports: boolean;
}

export interface UserAccount {
  id: string;
  role: UserRole;
  adminUsername?: string;
  name: string;
  nameEn: string;
  phone: string;
  email: string;
  district: string;
  districtEn: string;
  status: "pending" | "approved" | "rejected" | "Active" | "Suspended" | "Deactivated";
  permissions?: AdminPermissions;
  accessKeyMasked?: string;
  isPrimarySuperAdmin?: boolean;
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
  whatsappConsentStatus?: WhatsAppConsentStatus;
  whatsappConsentDate?: string;
  whatsappInviteLinkShown?: string;
  whatsappGroupName?: string;
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

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  captionEn: string;
  uploadedAt?: string;
}

export interface GalleryVideo {
  id: string;
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  duration: string;
  videoUrl?: string;
  uploadedAt?: string;
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
  cardFrontUrl?: string;
  cardBackUrl?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  additionalDocsUrl?: string;
  signatureData?: string;
  signatureType?: "drawn" | "typed";
  signatureText?: string;
  status: "pending" | "approved" | "rejected" | "under_review" | "needs_correction";
  correctionRemarks?: string;
  createdAt: string;
  cardType?: "member" | "official";
  designation?: string;
  brandEdition?: string;
  brandBanner?: string;
  renewalHistory?: { renewalDate: string; feePaid: number; validityUntil: string; txnId: string }[];
  whatsappConsentStatus?: WhatsAppConsentStatus;
  whatsappConsentDate?: string;
  whatsappInviteLinkShown?: string;
  whatsappGroupName?: string;
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
  // Subscription tier & details
  subscriptionTier?: "state_leader" | "district_leader" | "other_executive" | "general_member" | "development_fund" | "donation";
  subscriptionTierTa?: string;
  subscriptionPeriod?: "1_month" | "3_months" | "6_months" | "12_months" | "custom";
  subscriptionMonthsCount?: number;
  monthlyRate?: number;
  designation?: string;
  phone?: string;
  payerRole?: string;
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

export interface DetailedAuditRecord {
  id: string;
  action: string;
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  timestamp: string;
  editorName: string;
  editorId: string;
  userRole: string;
  adminUsername: string;
  ipAddress: string;
  contentId: string;
  memberId?: string;
  reason?: string;
  isUnauthorizedAttempt?: boolean;
}

export type OfficialEditRecord = DetailedAuditRecord;

// ============================================================================
// DISTRICT WHATSAPP GROUP JOIN SYSTEM TYPES
// ============================================================================

export type WhatsAppConsentStatus = "NOT_ASKED" | "DECLINED" | "ACCEPTED" | "JOIN_LINK_OPENED";

export interface DistrictWhatsAppGroup {
  id: string;
  district: string;           // e.g. "திருவாரூர்"
  districtEn: string;         // e.g. "Tiruvarur"
  groupName: string;          // e.g. "TNPA திருவாரூர் மாவட்ட உறுப்பினர்கள்"
  inviteLink: string;         // e.g. "https://chat.whatsapp.com/G123xExampleCode"
  status: "active" | "inactive";
  coordinatorName: string;   // e.g. "M. Selvam"
  coordinatorPhone: string;  // e.g. "+91 98765 43210"
  lastUpdated: string;
  lastUpdatedBy?: string;
}

export interface WhatsAppConsentRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  district: string;
  memberRole?: string;
  regNumber?: string;
  consentStatus: WhatsAppConsentStatus;
  consentDate: string;
  inviteLinkShown?: string;
  groupName?: string;
  lastUpdated: string;
}

export interface DistrictWhatsAppReportRow {
  district: string;
  districtEn: string;
  totalMembers: number;
  acceptedCount: number;
  declinedCount: number;
  notAskedCount: number;
  linkOpenedCount: number;
  groupStatus: "active" | "inactive" | "not_configured";
  groupName?: string;
  inviteLink?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
}

// ============================================================================
export interface OfficeBearerAnnouncement {
  id: string;
  title: string;
  titleEn: string;
  position: string; // e.g. "மாவட்ட தலைவர்" / "District President"
  district: string;
  districtEn: string;
  description: string;
  descriptionEn: string;
  lastDate: string;
  status: "active" | "closed";
  createdAt: string;
}

export interface OfficeBearerApplication {
  id: string;
  announcementId?: string;
  applicantName: string;
  applicantPhone: string;
  district: string;
  districtEn: string;
  targetPosition: string;
  membershipYears: number; // எத்தனை வருடங்களாக சங்கத்தில் உறுப்பினராக உள்ளனர்
  districtAchievements: string; // அவர்கள் மாவட்டத்தில் அவர்கள் செய்த சிறப்புகள்
  memberRegNumber?: string;
  appliedAt: string;
  status: "pending" | "approved" | "rejected";
  superAdminRemarks?: string;
}

// SELF-HEALING & AUTO-RECOVERY SYSTEM TYPES
// ============================================================================

export type HealthStatus = "healthy" | "degraded" | "critical" | "offline";

export interface SubsystemHealth {
  id: string;
  name: string;
  nameTa: string;
  category: "frontend" | "backend" | "database" | "auth" | "media" | "network" | "payment";
  status: HealthStatus;
  responseTimeMs: number;
  lastChecked: string;
  lastSuccess: string;
  lastError?: string;
  availability: number; // percentage e.g. 99.9
  details?: Record<string, any>;
}

export interface BreadcrumbItem {
  time: string;
  category: "ui" | "navigation" | "network" | "storage" | "auth" | "media" | "system";
  message: string;
  data?: any;
}

export interface RootCauseAnalysis {
  suspectedCause: string;
  suspectedCauseTa: string;
  confidence: number; // 0.0 - 1.0
  isKnownPattern: boolean;
  affectedDependencies: string[];
  mitigationStrategy: string;
  mitigationStrategyTa: string;
  requiresAdminApproval: boolean;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  module: string;
  moduleTa: string;
  severity: "low" | "medium" | "high" | "critical";
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  fingerprint: string;
  breadcrumbs: BreadcrumbItem[];
  rootCauseAnalysis: RootCauseAnalysis;
  autoFixAttempted: boolean;
  autoFixType?: string;
  autoFixDetails?: string;
  autoFixDetailsTa?: string;
  fixStatus: "pending" | "resolved" | "rolled_back" | "failed" | "requires_admin_approval";
  attemptsCount: number;
  backupSnapshotId?: string;
  adminActionRequired?: boolean;
  adminActionTaken?: string;
  adminResolvedBy?: string;
  resolvedAt?: string;
}

export interface StateBackupSnapshot {
  id: string;
  timestamp: string;
  reason: string;
  scope: "local_storage" | "form_draft" | "session_state" | "network_queue" | "system_config";
  payload: string; // serialized JSON
  checksum: string;
  restorable: boolean;
}

export interface SelfHealingStatusSummary {
  systemOverallHealth: HealthStatus;
  subsystems: SubsystemHealth[];
  activeIncidentsCount: number;
  autoResolvedTodayCount: number;
  pendingAdminApprovalCount: number;
  lastAutoHealTimestamp?: string;
  circuitBreakerStatus: "CLOSED" | "HALF_OPEN" | "OPEN";
}

export interface LegalAdvisor {
  id: string;
  name: string;
  nameEn: string;
  designation: string;
  designationEn: string;
  barCouncilRegNo: string;
  court: string;
  courtEn: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  officeAddress: string;
  district: string;
  districtEn: string;
  specialization: string;
  specializationEn: string;
  experienceYears: number;
  photoUrl: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  emergencyAvailable: boolean;
  notes?: string;
}

export interface LegalConsultationRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  memberDistrict: string;
  caseType: "accident_compensation" | "labor_dispute" | "police_complaint" | "contract_dispute" | "general_legal_advice";
  caseTypeTa: string;
  description: string;
  status: "pending" | "assigned" | "in_progress" | "resolved";
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  advisorRemarks?: string;
  createdAt: string;
}

export interface SuperKeyProfile {
  phone: string;
  superKey: string;
  maskedKey: string;
  adminName: string;
  role: string;
  updatedAt: string;
}

export interface OfflineMutation {
  id: string;
  timestamp: string;
  action: "create_member" | "update_member" | "update_status" | "approve_registration" | "pay_dues";
  entityId: string;
  data: any;
  retryCount: number;
  synced: boolean;
  error?: string;
}

export interface OfflineDatabaseStats {
  totalCachedMembers: number;
  totalDistricts: number;
  lastSyncedAt: string | null;
  pendingMutationsCount: number;
  isOnline: boolean;
  storageType: "indexedDB" | "localStorage";
  cacheSizeKb?: number;
}

export interface DirectoryFilterParams {
  district?: string;
  searchQuery?: string;
  status?: string;
  bloodGroup?: string;
  profession?: string;
}

