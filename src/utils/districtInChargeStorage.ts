import { ALL_38_TAMILNADU_DISTRICTS } from "../data/initialExecutives";
import { 
  DistrictInChargePerson, 
  DistrictSuperKeyRecord, 
  DistrictPortalOverview, 
  DistrictLeadership 
} from "../types/districtPortals";
import { db } from "../lib/firebase";
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { cleanForFirestore } from "../lib/syncService";

const STORAGE_KEY_INCHARGES = "tnpa_district_incharges_v3";
const STORAGE_KEY_SUPERKEYS = "tnpa_district_superkeys_v3";

// Default avatar placeholder (used only when a real person is registered without an uploaded photo)
export const DEFAULT_EXEC_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300"
];

/**
 * Filter to strictly identify and eliminate any generated or imaginary in-charge data
 */
export function isFakeInCharge(p: any): boolean {
  if (!p) return true;
  const id = String(p.id || "");
  const name = String(p.name || "");
  const nameEn = String(p.nameEn || "").toLowerCase();

  // Known fake IDs generated previously
  if (
    id.startsWith("dist_leader_") ||
    id.startsWith("dist_exec_") ||
    id.startsWith("town_incharge_") ||
    id.startsWith("union_incharge_")
  ) {
    return true;
  }

  // Artificial placeholder names
  const fakeNames = [
    "ஆர். பாஸ்கரன்", "பி. நடராஜன்", "எம். வீரபாண்டி", "எஸ். வெங்கடேசன்", "ஆர். ஈஸ்வரன்",
    "எஸ். கார்த்திகேயன்", "கே. குமார்", "எம். பழனிசாமி", "பி. முத்துக்கிருஷ்ணன்",
    "எம். ரமேஷ்", "டி. முனுசாமி", "ஆர். கார்த்திக்", "எஸ். பாபு", "கே. அசோகன்",
    "ஜி. சதிஷ்", "பி. மோகன்", "வி. தினேஷ்", "ஆர். அருண்", "எஸ். சண்முகம்",
    "கே. தங்கவேல்", "ஏ. பாலகிருஷ்ணன்", "எஸ். ரமேஷ் குமார்", "எம். முருகன்",
    "கே. விஜயகுமார்", "எம். பழனிச்சாமி", "எஸ். முத்துராமலிங்கம்", "பி. அன்பழகன்"
  ];
  if (fakeNames.includes(name.trim())) return true;

  // Fake patterns where title/role was concatenated inside the name (e.g., "கே. சென்னை தலைவர்")
  if (
    name.endsWith("தலைவர்") ||
    name.endsWith("செயலாளர்") ||
    name.endsWith("பொருளாளர்") ||
    name.endsWith("துணைத் தலைவர்") ||
    name.endsWith("ஒன்றியச் செயலாளர்") ||
    name.endsWith("நகரத் தலைவர்") ||
    nameEn.endsWith("president") ||
    nameEn.endsWith("secretary") ||
    nameEn.endsWith("treasurer")
  ) {
    return true;
  }

  return false;
}

// Generate official Super Key for a district
export function generateDefaultSuperKey(code: string, phoneSuffix: string = "2026"): string {
  return `TNPA-${code.toUpperCase()}-KEY-${phoneSuffix}`;
}

// Generate initial Super Key records for all 38 districts (keys for official district access)
function buildInitialDistrictSuperKeys(): DistrictSuperKeyRecord[] {
  return ALL_38_TAMILNADU_DISTRICTS.map((dist) => {
    const code = dist.code.toUpperCase();
    return {
      districtCode: code,
      districtTa: dist.ta,
      districtEn: dist.en,
      superKey: generateDefaultSuperKey(code),
      status: "active",
      generatedAt: "2026-01-01T00:00:00.000Z",
      authorizedPhones: [],
      issuedToNote: `${dist.ta} மாவட்ட அதிகாரப்பூர்வ நிர்வாக சாவி (Official District Admin Key)`
    };
  });
}

// Clean any cached mock data and load only genuine in-charges
export function loadAllDistrictInCharges(): DistrictInChargePerson[] {
  try {
    // Clear old legacy keys that contained mock data
    try {
      localStorage.removeItem("tnpa_district_incharges_v2");
    } catch {
      // ignore
    }

    const raw = localStorage.getItem(STORAGE_KEY_INCHARGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(p => !isFakeInCharge(p));
        localStorage.setItem(STORAGE_KEY_INCHARGES, JSON.stringify(clean));
        return clean;
      }
    }
  } catch (e) {
    console.error("Error loading district incharges:", e);
  }

  // NO FAKE INITIAL PERSONS - empty list by default
  return [];
}

// Load Super Keys for 38 districts
export function loadAllDistrictSuperKeys(): DistrictSuperKeyRecord[] {
  try {
    // Clear old legacy keys
    try {
      localStorage.removeItem("tnpa_district_superkeys_v2");
    } catch {
      // ignore
    }

    const raw = localStorage.getItem(STORAGE_KEY_SUPERKEYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Clean any fake phone numbers from keys
        const cleanedKeys = parsed.map((k: DistrictSuperKeyRecord) => ({
          ...k,
          authorizedPhones: (k.authorizedPhones || []).filter(p => !p.startsWith("984000"))
        }));
        return cleanedKeys;
      }
    }
  } catch (e) {
    console.error("Error loading district super keys:", e);
  }

  const initial = buildInitialDistrictSuperKeys();
  try {
    localStorage.setItem(STORAGE_KEY_SUPERKEYS, JSON.stringify(initial));
  } catch (e) {
    console.error("Error saving initial district super keys:", e);
  }
  return initial;
}

// Save all in-charges to local storage (only real records)
export function saveAllDistrictInCharges(incharges: DistrictInChargePerson[]): void {
  try {
    const cleanOnly = incharges.filter(p => !isFakeInCharge(p));
    localStorage.setItem(STORAGE_KEY_INCHARGES, JSON.stringify(cleanOnly));
  } catch (e) {
    console.error("Error saving district incharges:", e);
  }
}

// Save all Super Keys to local storage
export function saveAllDistrictSuperKeys(keys: DistrictSuperKeyRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUPERKEYS, JSON.stringify(keys));
  } catch (e) {
    console.error("Error saving district super keys:", e);
  }
}

// Get 38 districts overview statistics (calculated strictly from genuine registered in-charges)
export function getDistrictsOverviewList(
  incharges: DistrictInChargePerson[],
  superKeys: DistrictSuperKeyRecord[]
): DistrictPortalOverview[] {
  const validIncharges = incharges.filter(p => !isFakeInCharge(p));
  const keysMap = new Map<string, string>();
  superKeys.forEach(k => keysMap.set(k.districtCode.toUpperCase(), k.superKey));

  return ALL_38_TAMILNADU_DISTRICTS.map((dist) => {
    const code = dist.code.toUpperCase();
    const distIncharges = validIncharges.filter(
      i => i.districtCode.toUpperCase() === code || i.districtTa === dist.ta
    );

    const pres = distIncharges.find(i => i.category === "district_leader" && i.role.includes("தலைவர்"));
    const sec = distIncharges.find(i => i.category === "district_leader" && i.role.includes("செயலாளர்"));
    const tres = distIncharges.find(i => i.category === "district_leader" && i.role.includes("பொருளாளர்"));

    const distExecCount = distIncharges.filter(i => i.category === "district_executive").length;
    const townCount = distIncharges.filter(i => i.category === "town_incharge").length;
    const unionCount = distIncharges.filter(i => i.category === "union_incharge").length;

    return {
      districtCode: code,
      districtTa: dist.ta,
      districtEn: dist.en,
      zone: dist.zone,
      superKey: keysMap.get(code) || generateDefaultSuperKey(code),
      presidentName: pres?.name,
      presidentPhone: pres?.phone,
      secretaryName: sec?.name,
      secretaryPhone: sec?.phone,
      treasurerName: tres?.name,
      treasurerPhone: tres?.phone,
      totalDistrictExecutives: distExecCount,
      totalTownInCharges: townCount,
      totalUnionInCharges: unionCount,
      totalInCharges: distIncharges.length
    };
  });
}

// Get in-charges for a specific district (strictly genuine records)
export function getInChargesForDistrict(
  districtCode: string,
  allIncharges: DistrictInChargePerson[]
): {
  leadership: DistrictLeadership;
  districtExecutives: DistrictInChargePerson[];
  districtWings: DistrictInChargePerson[];
  townInCharges: DistrictInChargePerson[];
  unionInCharges: DistrictInChargePerson[];
} {
  const code = districtCode.toUpperCase();
  const validIncharges = allIncharges.filter(p => !isFakeInCharge(p));
  const districtList = validIncharges.filter(
    i => i.districtCode.toUpperCase() === code
  );

  const president = districtList.find(i => i.category === "district_leader" && i.role.includes("தலைவர்"));
  const secretary = districtList.find(i => i.category === "district_leader" && i.role.includes("செயலாளர்"));
  const treasurer = districtList.find(i => i.category === "district_leader" && i.role.includes("பொருளாளர்"));

  const districtExecutives = districtList.filter(
    i => i.category === "district_executive" || (i.category === "district_leader" && i !== president && i !== secretary && i !== treasurer)
  );
  const districtWings = districtList.filter(i => i.category === "district_wing");
  const townInCharges = districtList.filter(i => i.category === "town_incharge" || i.category === "branch_incharge");
  const unionInCharges = districtList.filter(i => i.category === "union_incharge");

  return {
    leadership: { president, secretary, treasurer },
    districtExecutives,
    districtWings,
    townInCharges,
    unionInCharges
  };
}

// Verify District Super Key
export function verifyDistrictSuperKey(
  districtCode: string,
  keyInput: string,
  superKeys: DistrictSuperKeyRecord[]
): boolean {
  if (!keyInput) return false;
  const cleanInput = keyInput.trim().toUpperCase();
  const code = districtCode.toUpperCase();

  // Master override for Super Admin
  if (cleanInput === "TNPA-SUPERKEY-2026-XAVIER-9840048200" || cleanInput === "TNPA-SUPERADMIN-2026") {
    return true;
  }

  const record = superKeys.find(k => k.districtCode.toUpperCase() === code);
  if (!record) {
    const defaultKey = generateDefaultSuperKey(code);
    return cleanInput === defaultKey.toUpperCase();
  }

  return record.status === "active" && record.superKey.trim().toUpperCase() === cleanInput;
}

// Save a new or updated incharge to local state and Firestore (only genuine records)
export async function persistInChargePerson(
  person: DistrictInChargePerson,
  currentList: DistrictInChargePerson[]
): Promise<DistrictInChargePerson[]> {
  if (isFakeInCharge(person)) {
    console.warn("Blocked attempt to persist fake person:", person.name);
    return currentList;
  }

  const existingIdx = currentList.findIndex(p => p.id === person.id);
  let updatedList: DistrictInChargePerson[];
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = person;
  } else {
    updatedList = [person, ...currentList];
  }

  saveAllDistrictInCharges(updatedList);

  // Sync to Firestore
  try {
    const ref = doc(db, "district_executives", person.id);
    await setDoc(ref, cleanForFirestore(person));
  } catch (err) {
    console.warn("Firestore sync warning for district_executives:", err);
  }

  return updatedList;
}

// Delete an incharge
export async function removeInChargePerson(
  id: string,
  currentList: DistrictInChargePerson[]
): Promise<DistrictInChargePerson[]> {
  const updatedList = currentList.filter(p => p.id !== id);
  saveAllDistrictInCharges(updatedList);

  try {
    const ref = doc(db, "district_executives", id);
    await deleteDoc(ref);
  } catch (err) {
    console.warn("Firestore delete warning for district_executives:", err);
  }

  return updatedList;
}

// Update or generate new Super Key for a district
export async function updateDistrictSuperKey(
  districtCode: string,
  newSuperKey: string,
  currentKeys: DistrictSuperKeyRecord[]
): Promise<DistrictSuperKeyRecord[]> {
  const code = districtCode.toUpperCase();
  const existingIdx = currentKeys.findIndex(k => k.districtCode.toUpperCase() === code);
  let updated: DistrictSuperKeyRecord[];

  const distObj = ALL_38_TAMILNADU_DISTRICTS.find(d => d.code.toUpperCase() === code);

  if (existingIdx >= 0) {
    updated = [...currentKeys];
    updated[existingIdx] = {
      ...updated[existingIdx],
      superKey: newSuperKey.trim(),
      generatedAt: new Date().toISOString()
    };
  } else {
    const newRecord: DistrictSuperKeyRecord = {
      districtCode: code,
      districtTa: distObj?.ta || code,
      districtEn: distObj?.en || code,
      superKey: newSuperKey.trim(),
      status: "active",
      generatedAt: new Date().toISOString(),
      authorizedPhones: []
    };
    updated = [...currentKeys, newRecord];
  }

  saveAllDistrictSuperKeys(updated);

  try {
    const ref = doc(db, "district_super_keys", code);
    const rec = updated.find(k => k.districtCode.toUpperCase() === code);
    if (rec) {
      await setDoc(ref, cleanForFirestore(rec));
    }
  } catch (err) {
    console.warn("Firestore sync warning for district_super_keys:", err);
  }

  return updated;
}

/**
 * Clean any legacy fake or imaginary records from Firestore database
 */
export async function purgeFakeInChargesFromFirestore(): Promise<number> {
  try {
    const colRef = collection(db, "district_executives");
    const snapshot = await getDocs(colRef);
    let deletedCount = 0;
    const promises: Promise<void>[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (isFakeInCharge({ ...data, id: docSnap.id })) {
        promises.push(deleteDoc(doc(db, "district_executives", docSnap.id)));
        deletedCount++;
      }
    });

    if (promises.length > 0) {
      await Promise.all(promises);
      console.log(`Successfully purged ${deletedCount} fake records from Firestore.`);
    }
    return deletedCount;
  } catch (err) {
    console.warn("Firestore purge error:", err);
    return 0;
  }
}
