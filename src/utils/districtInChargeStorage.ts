import { ALL_38_TAMILNADU_DISTRICTS } from "../data/initialExecutives";
import { 
  DistrictInChargePerson, 
  DistrictSuperKeyRecord, 
  DistrictPortalOverview, 
  DistrictLeadership 
} from "../types/districtPortals";
import { db } from "../lib/firebase";
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from "firebase/firestore";
import { cleanForFirestore } from "../lib/syncService";

const STORAGE_KEY_INCHARGES = "tnpa_district_incharges_v3";
const STORAGE_KEY_SUPERKEYS = "tnpa_district_superkeys_v3";

// Default avatar placeholder (used only when a real person is registered without an uploaded photo)
export const DEFAULT_EXEC_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300"
];

/**
 * Filter to validate in-charge records.
 * CRITICAL: Never reject or delete legitimate user-registered executives.
 */
export function isFakeInCharge(p: any): boolean {
  if (!p || typeof p !== "object") return true;
  const name = String(p.name || "").trim();
  // Valid as long as name is provided
  if (!name) return true;
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

// Real-time Firestore subscription for 38 Districts In-Charges & Executives
export function subscribeToDistrictInCharges(
  onUpdate: (incharges: DistrictInChargePerson[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, "district_executives");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: DistrictInChargePerson[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DistrictInChargePerson;
          if (data && data.name) {
            list.push({ ...data, id: docSnap.id });
          }
        });
        // Keep local cache up-to-date with Firestore cloud
        try {
          localStorage.setItem(STORAGE_KEY_INCHARGES, JSON.stringify(list));
        } catch (e) {
          console.warn("Could not cache incharges to localStorage:", e);
        }
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore district_executives subscription warning:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach district_executives listener:", err);
    return () => {};
  }
}

// Direct async fetch from Firestore (guarantees latest cloud data even before subscription triggers)
export async function fetchDistrictInChargesFromFirestore(): Promise<DistrictInChargePerson[]> {
  try {
    const colRef = collection(db, "district_executives");
    const snapshot = await getDocs(colRef);
    const list: DistrictInChargePerson[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DistrictInChargePerson;
      if (data && data.name) {
        list.push({ ...data, id: docSnap.id });
      }
    });
    if (list.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_INCHARGES, JSON.stringify(list));
      } catch (e) {}
    }
    return list;
  } catch (err) {
    console.warn("Error fetching district_executives from Firestore:", err);
    return loadAllDistrictInCharges();
  }
}

// Clean any cached mock data and load only genuine in-charges
export function loadAllDistrictInCharges(): DistrictInChargePerson[] {
  try {
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
        return clean;
      }
    }
  } catch (e) {
    console.error("Error loading district incharges:", e);
  }

  return [];
}

// Real-time Firestore subscription for District Super Keys
export function subscribeToDistrictSuperKeys(
  onUpdate: (keys: DistrictSuperKeyRecord[]) => void
): () => void {
  try {
    const colRef = collection(db, "district_super_keys");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const remoteKeys: DistrictSuperKeyRecord[] = [];
        snapshot.forEach((docSnap) => {
          remoteKeys.push(docSnap.data() as DistrictSuperKeyRecord);
        });
        if (remoteKeys.length > 0) {
          const current = loadAllDistrictSuperKeys();
          const merged = current.map(localKey => {
            const found = remoteKeys.find(r => r.districtCode.toUpperCase() === localKey.districtCode.toUpperCase());
            return found || localKey;
          });
          saveAllDistrictSuperKeys(merged);
          onUpdate(merged);
        }
      },
      (err) => console.warn("Super keys subscription warning:", err)
    );
  } catch (err) {
    return () => {};
  }
}

// Load Super Keys for 38 districts
export function loadAllDistrictSuperKeys(): DistrictSuperKeyRecord[] {
  try {
    try {
      localStorage.removeItem("tnpa_district_superkeys_v2");
    } catch {
      // ignore
    }

    const raw = localStorage.getItem(STORAGE_KEY_SUPERKEYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
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

// Save a new or updated incharge to local state and Firestore (permanently persisted)
export async function persistInChargePerson(
  person: DistrictInChargePerson,
  currentList: DistrictInChargePerson[]
): Promise<DistrictInChargePerson[]> {
  if (isFakeInCharge(person)) {
    console.warn("Blocked attempt to persist invalid person:", person?.name);
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

  // 1. Immediate local save
  saveAllDistrictInCharges(updatedList);

  // 2. Persistent save to Firestore "district_executives"
  try {
    const ref = doc(db, "district_executives", person.id);
    await setDoc(ref, cleanForFirestore(person), { merge: true });
  } catch (err) {
    console.error("Critical: Firestore sync error for district_executives:", err);
    throw err;
  }

  // 3. Mirror to central "executives" collection in Firestore
  try {
    const isDistrictLeader = person.category === "district_leader" || person.category === "district_executive" || person.category === "district_wing";
    const execRef = doc(db, "executives", person.id);
    const execData = {
      id: person.id,
      name: person.name,
      nameEn: person.nameEn || "",
      level: isDistrictLeader ? "district" : "union_area",
      role: person.role,
      district: person.districtTa,
      districtEn: person.districtEn,
      phone: person.phone,
      photoUrl: person.photoUrl,
      appointedDate: person.appointedDate,
      status: person.status,
      unitType: person.unitType,
      unitName: person.unitName,
      notes: person.notes || `ஆணை எண்: ${person.appointmentOrderNo}`,
      appointedBy: person.appointedBy || "மாநில தலைமை"
    };
    await setDoc(execRef, cleanForFirestore(execData), { merge: true });
  } catch (err) {
    console.warn("Mirroring to executives collection warning:", err);
  }

  // Notify any active UI listeners
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tnpa_incharges_changed", { detail: updatedList }));
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

  try {
    const execRef = doc(db, "executives", id);
    await deleteDoc(execRef);
  } catch (err) {
    console.warn("Firestore delete warning for executives:", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tnpa_incharges_changed", { detail: updatedList }));
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
      await setDoc(ref, cleanForFirestore(rec), { merge: true });
    }
  } catch (err) {
    console.warn("Firestore sync warning for district_super_keys:", err);
  }

  return updated;
}

/**
 * Safeguard: Never delete any user records from Firestore.
 */
export async function purgeFakeInChargesFromFirestore(): Promise<number> {
  // Always return 0 to prevent any accidental deletion of user data
  return 0;
}
