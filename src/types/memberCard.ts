export type MemberCardPaymentStatus = 'unpaid' | 'pending' | 'district_approved' | 'approved' | 'rejected';

export interface MemberCardRequest {
  id: string;
  memberId: string; // User ID / Reg Number reference
  memberName: string;
  memberNameEn?: string;
  memberPhone: string;
  district: string;
  districtEn?: string;
  photoUrl?: string;
  experienceYears?: number;
  bloodGroup?: string;
  dob?: string;
  
  // Payment details
  amount: number; // default 100
  utrNumber: string; // Transaction reference / UTR
  paymentDate: string;
  paymentProofUrl?: string;
  
  // Verification lifecycle with Dual-Approval (District + Super Admin)
  status: MemberCardPaymentStatus;
  rejectionReason?: string;
  
  // District Admin Approval stage
  districtApprovedBy?: string;
  districtApprovedAt?: string;
  
  // Super Admin / State President Final Approval stage (Mandatory for card generation)
  superAdminApprovedBy?: string;
  superAdminApprovedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  
  // Card credentials (only valid when status === 'approved')
  cardNumber?: string;
  cardVerificationToken: string;
  issuedAt?: string;
  validUntil?: string;
  
  createdAt: string;
  updatedAt?: string;
}

export interface MemberCardPaymentConfig {
  upiNumber: string;
  payeeName: string;
  amount: number;
  instructionsTa?: string;
  instructionsEn?: string;
}

export const DEFAULT_MEMBER_CARD_CONFIG: MemberCardPaymentConfig = {
  upiNumber: "7010131915",
  payeeName: "Tamil Nadu Painters and Artists Welfare Association",
  amount: 100,
  instructionsTa: "PhonePe / Google Pay / Paytm அல்லது எந்த UPI app மூலமாகவும் கீழே உள்ள UPI எண்ணுக்கு ₹100 அனுப்பவும்.",
  instructionsEn: "Send ₹100 to the UPI number below using PhonePe / Google Pay / Paytm or any UPI app."
};
