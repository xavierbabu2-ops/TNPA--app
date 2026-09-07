export type InChargeCategory = 
  | 'district_leader'       // மாவட்ட தலைமை (தலைவர், செயலாளர், பொருளாளர், செயல் தலைவர்)
  | 'district_executive'    // மாவட்ட பொறுப்பாளர் (துணைத் தலைவர், இணைச் செயலாளர், அமைப்புச் செயலாளர், etc.)
  | 'district_wing'         // மாவட்ட சார்பு அணி (இளைஞரணி, மகளிரணி, தொழிலாளர் நலப் பிரிவு, சட்டப் பிரிவு, IT அணி)
  | 'town_incharge'         // நகரப் பொறுப்பாளர் (நகரத் தலைவர், செயலாளர், பொருளாளர், பகுதிப் பொறுப்பாளர்)
  | 'union_incharge'        // ஒன்றியப் பொறுப்பாளர் (ஒன்றியத் தலைவர், செயலாளர், பொருளாளர்)
  | 'branch_incharge';      // பேரூர் / கிளைப் பொறுப்பாளர் (பேரூர் தலைவர், கிளைச் செயலாளர்)

export interface DistrictInChargePerson {
  id: string;
  name: string;
  nameEn?: string;
  category: InChargeCategory;
  role: string;               // e.g. "மாவட்டத் தலைவர்", "நகரச் செயலாளர்", etc.
  roleEn?: string;
  districtTa: string;         // e.g. "மதுரை"
  districtEn: string;         // e.g. "Madurai"
  districtCode: string;       // e.g. "MDU"
  taluk?: string;             // e.g. "வாடிப்பட்டி வட்டம்"
  unitType?: "district" | "town" | "union" | "wing" | "branch" | "taluk";
  unitName: string;           // e.g. "மாவட்ட தலைமை", "மயிலாப்பூர் நகரம்", "வாடிப்பட்டி ஒன்றியம்"
  unitNameEn?: string;
  phone: string;
  altPhone?: string;
  whatsapp?: string;
  aadhaar?: string;
  experienceYears?: number;
  address: string;
  photoUrl: string;
  bloodGroup?: string;
  appointedDate: string;
  appointedBy?: string;       // e.g. "மாநில தலைமை" or "மாவட்டத் தலைவர் & செயலாளர்"
  appointmentOrderNo: string; // e.g. "TNPA/MDU/2026/001"
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DistrictSuperKeyRecord {
  districtCode: string;
  districtTa: string;
  districtEn: string;
  superKey: string;
  status: 'active' | 'revoked';
  generatedAt: string;
  lastUsedAt?: string;
  authorizedPhones: string[];
  issuedToNote?: string;
}

export interface DistrictLeadership {
  president?: DistrictInChargePerson;
  secretary?: DistrictInChargePerson;
  treasurer?: DistrictInChargePerson;
}

export interface DistrictPortalOverview {
  districtCode: string;
  districtTa: string;
  districtEn: string;
  zone: string;
  superKey: string;
  presidentName?: string;
  presidentPhone?: string;
  secretaryName?: string;
  secretaryPhone?: string;
  treasurerName?: string;
  treasurerPhone?: string;
  totalDistrictExecutives: number;
  totalTownInCharges: number;
  totalUnionInCharges: number;
  totalInCharges: number;
}
