import { MemberRegistration, OfflineMutation, OfflineDatabaseStats, DirectoryFilterParams } from "../types";
import { sampleRegistrations } from "../mockData";

const DB_NAME = "TNPA_OFFLINE_MEMBER_DB_v2";
const DB_VERSION = 2;
const STORE_MEMBERS = "members";
const STORE_MUTATIONS = "offline_mutations";
const STORE_META = "meta";

const LOCAL_STORAGE_BACKUP_KEY = "tnpa_offline_members_backup";
const LOCAL_STORAGE_MUTATIONS_KEY = "tnpa_offline_mutations_backup";
const LOCAL_STORAGE_META_KEY = "tnpa_offline_meta_backup";

// 38 Districts of Tamil Nadu for Seed Data & Validation
export const TN_ALL_DISTRICTS = [
  "சென்னை (Chennai)",
  "கோயம்புத்தூர் (Coimbatore)",
  "மதுரை (Madurai)",
  "திருச்சிராப்பள்ளி (Tiruchirappalli)",
  "சேலம் (Salem)",
  "திருநெல்வேலி (Tirunelveli)",
  "ஈரோடு (Erode)",
  "வேலூர் (Vellore)",
  "தஞ்சாவூர் (Thanjavur)",
  "திண்டுக்கல் (Dindigul)",
  "காஞ்சிபுரம் (Kanchipuram)",
  "செங்கல்பட்டு (Chengalpattu)",
  "திருவள்ளூர் (Tiruvallur)",
  "திருப்பூர் (Tiruppur)",
  "கன்னியாகுமரி (Kanyakumari)",
  "தூத்துக்குடி (Tuticorin)",
  "விருதுநகர் (Virudhunagar)",
  "சிவகங்கை (Sivaganga)",
  "ராமநாதபுரம் (Ramanathapuram)",
  "தேனி (Theni)",
  "நீலகிரி (Nilgiris)",
  "நாமக்கல் (Namakkal)",
  "கரூர் (Karur)",
  "தர்மபுரி (Dharmapuri)",
  "கிருஷ்ணகிரி (Krishnagiri)",
  "திருவண்ணாமலை (Tiruvannamalai)",
  "விழுப்புரம் (Villupuram)",
  "கள்ளக்குறிச்சி (Kallakurichi)",
  "கடலூர் (Cuddalore)",
  "பெரம்பலூர் (Perambalur)",
  "அரியலூர் (Ariyalur)",
  "நாகப்பட்டினம் (Nagapattinam)",
  "மயிலாடுதுறை (Mayiladuthurai)",
  "திருவாரூர் (Tiruvarur)",
  "புதுக்கோட்டை (Pudukkottai)",
  "தென்காசி (Tenkasi)",
  "ராணிப்பேட்டை (Ranipet)",
  "திருப்பத்தூர் (Tirupattur)"
];

// Rich default members seed generator for Tamil Nadu districts
function generateSeedMembers(): MemberRegistration[] {
  const seed: MemberRegistration[] = [...sampleRegistrations];

  const districtSeeds = [
    { district: "சென்னை", name: "மு. ரவிக்குமார்", nameEn: "M. Ravikumar", phone: "9840112233", exp: 12, spec: "Exterior & Texture Painting", blood: "O+" },
    { district: "கோயம்புத்தூர்", name: "கே. வேலுச்சாமி", nameEn: "K. Veluchamy", phone: "9842223344", exp: 15, spec: "Commercial Spray Coating", blood: "A+" },
    { district: "மதுரை", name: "பி. அழகர்சாமி", nameEn: "P. Alagarsamy", phone: "9843334455", exp: 9, spec: "Traditional Artistic Murals", blood: "B+" },
    { district: "திருச்சிராப்பள்ளி", name: "எஸ். முகமது அலி", nameEn: "S. Mohamed Ali", phone: "9844445566", exp: 14, spec: "Interior Luxury Painting & PU Polish", blood: "AB+" },
    { district: "சேலம்", name: "வி. சண்முகம்", nameEn: "V. Shanmugam", phone: "9845556677", exp: 7, spec: "Waterproofing & Epoxy Coatings", blood: "O-" },
    { district: "திருநெல்வேலி", name: "டி. இசக்கிபாண்டி", nameEn: "T. Isakkipandi", phone: "9846667788", exp: 11, spec: "Building Restoration & Exterior", blood: "A-" },
    { district: "ஈரோடு", name: "ஆர். பழனிவேல்", nameEn: "R. Palanivel", phone: "9847778899", exp: 18, spec: "Industrial & Structural Steel Painting", blood: "B+" },
    { district: "வேலூர்", name: "ஜி. பிரகாஷ்", nameEn: "G. Prakash", phone: "9848889900", exp: 6, spec: "Wood Polish & Duco Finish", blood: "O+" },
    { district: "தஞ்சாவூர்", name: "எம். கலியபெருமாள்", nameEn: "M. Kaliyaperumal", phone: "9849990011", exp: 20, spec: "Temple Art, Gold Leafing & Heritage Painting", blood: "A+" },
    { district: "திண்டுக்கல்", name: "என். சின்னையா", nameEn: "N. Chinnaiah", phone: "9840001122", exp: 10, spec: "Residential & Emulsion Painting", blood: "B-" },
    { district: "திருப்பூர்", name: "கே. கார்த்திகேயன்", nameEn: "K. Karthikeyan", phone: "9841112233", exp: 8, spec: "Factory Floor Epoxy & Spraying", blood: "O+" },
    { district: "கன்னியாகுமரி", name: "ஜெ. ஆரோக்கியராஜ்", nameEn: "J. Arokkiyaraj", phone: "9842223344", exp: 13, spec: "Weatherproof Exterior Coating", blood: "A+" }
  ];

  districtSeeds.forEach((item, index) => {
    const num = (index + 36).toString().padStart(4, "0");
    seed.push({
      id: `reg_offline_${index + 3}`,
      regNumber: `TNP-2026-${num}`,
      name: item.name,
      nameEn: item.nameEn,
      fatherName: "சுப்பிரமணியன்",
      dob: "1988-06-12",
      gender: "ஆண் (Male)",
      bloodGroup: item.blood,
      phone: item.phone,
      aadhaar: `XXXX-XXXX-${1000 + index}`,
      district: item.district,
      address: `${item.district} நகராட்சி பகுதி, தமிழ்நாடு`,
      experienceYears: item.exp,
      specialization: item.spec,
      photoUrl: `https://images.unsplash.com/photo-${1500000000000 + index * 500000}?auto=format&fit=crop&q=80&w=150&h=150`,
      status: "approved",
      createdAt: "2026-08-01T00:00:00Z"
    });
  });

  return seed;
}

let activeIDB: IDBDatabase | null = null;
let activeIDBPromise: Promise<IDBDatabase> | null = null;

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // Clean up reference if browser puts page in background
      if (activeIDB) {
        try {
          activeIDB.close();
        } catch {}
        activeIDB = null;
        activeIDBPromise = null;
      }
    }
  });
}

// Open or create IndexedDB Database with upgrade & resilient connection lifecycle support
function openIndexedDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(new Error("IndexedDB is not supported in this environment"));
  }

  // If we already have a valid, non-closing database connection, reuse it
  if (activeIDB) {
    return Promise.resolve(activeIDB);
  }

  if (activeIDBPromise) {
    return activeIDBPromise;
  }

  activeIDBPromise = new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = request.result;

        // 1. Members Store
        if (!db.objectStoreNames.contains(STORE_MEMBERS)) {
          const memberStore = db.createObjectStore(STORE_MEMBERS, { keyPath: "id" });
          memberStore.createIndex("regNumber", "regNumber", { unique: false });
          memberStore.createIndex("district", "district", { unique: false });
          memberStore.createIndex("status", "status", { unique: false });
          memberStore.createIndex("phone", "phone", { unique: false });
          memberStore.createIndex("name", "name", { unique: false });
        }

        // 2. Mutations Queue Store
        if (!db.objectStoreNames.contains(STORE_MUTATIONS)) {
          const mutationStore = db.createObjectStore(STORE_MUTATIONS, { keyPath: "id" });
          mutationStore.createIndex("synced", "synced", { unique: false });
          mutationStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // 3. Metadata Store
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        activeIDB = db;
        activeIDBPromise = null;

        db.onversionchange = () => {
          try {
            db.close();
          } catch {}
          activeIDB = null;
          activeIDBPromise = null;
        };

        db.onclose = () => {
          activeIDB = null;
          activeIDBPromise = null;
        };

        db.onerror = () => {
          activeIDB = null;
          activeIDBPromise = null;
        };

        resolve(db);
      };

      request.onerror = () => {
        activeIDB = null;
        activeIDBPromise = null;
        reject(request.error || new Error("Failed to open IndexedDB"));
      };

      request.onblocked = () => {
        activeIDB = null;
        activeIDBPromise = null;
        reject(new Error("IndexedDB opening was blocked by other tab"));
      };
    } catch (openErr) {
      activeIDB = null;
      activeIDBPromise = null;
      reject(openErr);
    }
  });

  return activeIDBPromise;
}

/**
 * Initialize and seed the offline database if empty.
 */
export async function initOfflineDatabase(): Promise<void> {
  try {
    const db = await openIndexedDB();
    const count = await getMembersCountFromIDB(db);

    if (count === 0) {
      console.log("[Offline Database] Initializing local database with member seed...");
      const seeds = generateSeedMembers();
      await bulkSaveMembersToIDB(db, seeds);
      await saveMetaToIDB(db, "last_synced_at", new Date().toISOString());
      await saveMetaToIDB(db, "total_members_count", 45620);
      
      // Update local storage backup
      try {
        localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(seeds));
      } catch (e) {}

      // Inform Service Worker to cache snapshot
      notifyServiceWorkerToCacheSnapshot(seeds);
    }
  } catch (err) {
    console.warn("[Offline Database] IndexedDB init fallback to LocalStorage:", err);
    // LocalStorage fallback
    if (!localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY)) {
      const seeds = generateSeedMembers();
      try {
        localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(seeds));
        localStorage.setItem(LOCAL_STORAGE_META_KEY, JSON.stringify({ last_synced: new Date().toISOString() }));
      } catch (e) {}
    }
  }
}

// Helpers for IndexedDB Operations
function getMembersCountFromIDB(db: IDBDatabase): Promise<number> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_MEMBERS, "readonly");
      const store = tx.objectStore(STORE_MEMBERS);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

function bulkSaveMembersToIDB(db: IDBDatabase, members: MemberRegistration[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_MEMBERS, "readwrite");
      const store = tx.objectStore(STORE_MEMBERS);
      members.forEach((m) => store.put(m));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    } catch (e) {
      reject(e);
    }
  });
}

function saveMetaToIDB(db: IDBDatabase, key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, "readwrite");
      const store = tx.objectStore(STORE_META);
      store.put({ key, value });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

function getMetaFromIDB(db: IDBDatabase, key: string): Promise<any> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, "readonly");
      const store = tx.objectStore(STORE_META);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Retrieve members from local offline database with filtering & search.
 */
export async function getOfflineMembers(params?: DirectoryFilterParams): Promise<{
  members: MemberRegistration[];
  total: number;
  isOffline: boolean;
  dataSource: "indexedDB" | "localStorage" | "network";
}> {
  let allMembers: MemberRegistration[] = [];
  let dataSource: "indexedDB" | "localStorage" | "network" = "indexedDB";

  try {
    const db = await openIndexedDB();
    allMembers = await new Promise<MemberRegistration[]>((resolve, reject) => {
      const tx = db.transaction(STORE_MEMBERS, "readonly");
      const store = tx.objectStore(STORE_MEMBERS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[Offline Database] Reading from localStorage fallback:", err);
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      allMembers = raw ? JSON.parse(raw) : generateSeedMembers();
      dataSource = "localStorage";
    } catch {
      allMembers = generateSeedMembers();
      dataSource = "localStorage";
    }
  }

  if (allMembers.length === 0) {
    allMembers = generateSeedMembers();
  }

  // Apply filters
  let filtered = allMembers;

  if (params?.district && params.district !== "all") {
    const cleanDist = params.district.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.district.toLowerCase().includes(cleanDist) ||
        (cleanDist.includes(m.district.toLowerCase()))
    );
  }

  if (params?.status && params.status !== "all") {
    filtered = filtered.filter((m) => m.status === params.status);
  }

  if (params?.bloodGroup && params.bloodGroup !== "all") {
    filtered = filtered.filter((m) => m.bloodGroup === params.bloodGroup);
  }

  if (params?.searchQuery && params.searchQuery.trim()) {
    const q = params.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.nameEn && m.nameEn.toLowerCase().includes(q)) ||
        m.regNumber.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.district.toLowerCase().includes(q) ||
        (m.specialization && m.specialization.toLowerCase().includes(q))
    );
  }

  const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;

  return {
    members: filtered,
    total: filtered.length,
    isOffline,
    dataSource
  };
}

/**
 * Get single member record by ID or registration number from local offline storage.
 */
export async function getOfflineMemberById(idOrReg: string): Promise<MemberRegistration | null> {
  if (!idOrReg) return null;
  const clean = idOrReg.trim().toLowerCase();

  try {
    const db = await openIndexedDB();
    const all = await new Promise<MemberRegistration[]>((resolve) => {
      const tx = db.transaction(STORE_MEMBERS, "readonly");
      const store = tx.objectStore(STORE_MEMBERS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const found = all.find(
      (m) => m.id.toLowerCase() === clean || m.regNumber.toLowerCase() === clean || m.phone === clean
    );
    if (found) return found;
  } catch (e) {}

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (raw) {
      const list: MemberRegistration[] = JSON.parse(raw);
      return (
        list.find(
          (m) => m.id.toLowerCase() === clean || m.regNumber.toLowerCase() === clean || m.phone === clean
        ) || null
      );
    }
  } catch (e) {}

  return null;
}

/**
 * Save or update member in local storage immediately, queueing mutation for server sync.
 */
export async function saveMemberLocally(
  member: MemberRegistration,
  isNew: boolean = false
): Promise<MemberRegistration> {
  const memberToSave: MemberRegistration = {
    ...member,
    id: member.id || `reg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    regNumber:
      member.regNumber ||
      `TNP-2026-${Math.floor(1000 + Math.random() * 9000).toString()}`,
    createdAt: member.createdAt || new Date().toISOString()
  };

  // 1. Write to IndexedDB
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_MEMBERS, "readwrite");
      const store = tx.objectStore(STORE_MEMBERS);
      store.put(memberToSave);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("[Offline Database] Saving to LocalStorage:", e);
  }

  // 2. Write to LocalStorage backup
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    let list: MemberRegistration[] = raw ? JSON.parse(raw) : generateSeedMembers();
    const idx = list.findIndex((m) => m.id === memberToSave.id);
    if (idx >= 0) {
      list[idx] = memberToSave;
    } else {
      list.unshift(memberToSave);
    }
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(list));
  } catch (e) {}

  // 3. Queue offline mutation for background server sync
  await queueOfflineMutation(
    isNew ? "create_member" : "update_member",
    memberToSave,
    memberToSave.id
  );

  dispatchOfflineDatabaseEvent();
  return memberToSave;
}

/**
 * Queue a mutation (create, update, approve) to the offline mutation queue.
 */
export async function queueOfflineMutation(
  action: OfflineMutation["action"],
  data: any,
  entityId: string
): Promise<OfflineMutation> {
  const mutation: OfflineMutation = {
    id: `mut_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    action,
    entityId,
    data,
    retryCount: 0,
    synced: false
  };

  // Save to IndexedDB
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_MUTATIONS, "readwrite");
      const store = tx.objectStore(STORE_MUTATIONS);
      store.put(mutation);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {}

  // Save to LocalStorage queue backup
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MUTATIONS_KEY) || "[]";
    const q: OfflineMutation[] = JSON.parse(raw);
    q.push(mutation);
    localStorage.setItem(LOCAL_STORAGE_MUTATIONS_KEY, JSON.stringify(q));
  } catch (e) {}

  dispatchOfflineDatabaseEvent();

  // Try background sync if browser supports it
  if (typeof window !== "undefined" && "serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && "sync" in reg) {
        await (reg as any).sync.register("sync-member-updates");
      }
    } catch (syncErr) {
      // SyncManager not supported or denied
    }
  }

  // If online right now, attempt immediate background flush
  if (typeof navigator !== "undefined" && navigator.onLine) {
    setTimeout(() => {
      syncPendingMutationsToServer().catch(() => {});
    }, 500);
  }

  return mutation;
}

/**
 * Retrieve all pending un-synced offline mutations.
 */
export async function getPendingMutations(): Promise<OfflineMutation[]> {
  try {
    const db = await openIndexedDB();
    const muts = await new Promise<OfflineMutation[]>((resolve) => {
      const tx = db.transaction(STORE_MUTATIONS, "readonly");
      const store = tx.objectStore(STORE_MUTATIONS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
    return muts.filter((m) => !m.synced);
  } catch {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_MUTATIONS_KEY);
      if (raw) {
        const q: OfflineMutation[] = JSON.parse(raw);
        return q.filter((m) => !m.synced);
      }
    } catch {}
    return [];
  }
}

/**
 * Sync all pending offline mutations to the server once connectivity is available.
 */
export async function syncPendingMutationsToServer(): Promise<{
  syncedCount: number;
  failedCount: number;
  errors: string[];
}> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { syncedCount: 0, failedCount: 0, errors: ["Network is offline"] };
  }

  const pending = await getPendingMutations();
  if (pending.length === 0) {
    return { syncedCount: 0, failedCount: 0, errors: [] };
  }

  console.log(`[Offline Sync] Synchronizing ${pending.length} offline mutations with server...`);
  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  try {
    const response = await fetch("/api/members/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mutations: pending })
    });

    if (response.ok) {
      const result = await response.json();
      // Mark all as synced or clear mutation store
      const db = await openIndexedDB();
      const tx = db.transaction(STORE_MUTATIONS, "readwrite");
      const store = tx.objectStore(STORE_MUTATIONS);
      for (const m of pending) {
        m.synced = true;
        store.delete(m.id);
      }

      // Update LocalStorage queue
      try {
        localStorage.setItem(LOCAL_STORAGE_MUTATIONS_KEY, "[]");
      } catch (e) {}

      // Update meta
      await saveMetaToIDB(db, "last_synced_at", new Date().toISOString());

      syncedCount = pending.length;
      console.log(`[Offline Sync] Successfully synced ${syncedCount} records to server.`);
    } else {
      failedCount = pending.length;
      errors.push(`Server returned status ${response.status}`);
    }
  } catch (netErr: any) {
    failedCount = pending.length;
    errors.push(netErr?.message || "Network sync failed");
  }

  dispatchOfflineDatabaseEvent();
  return { syncedCount, failedCount, errors };
}

/**
 * Fetch latest database snapshot from server and update local IndexedDB cache.
 */
export async function fetchAndCacheServerDatabase(): Promise<{ success: boolean; count: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { success: false, count: 0 };
  }

  try {
    const res = await fetch("/api/members/database/snapshot");
    if (res.ok) {
      const data = await res.json();
      if (data && data.members && Array.isArray(data.members)) {
        const db = await openIndexedDB();
        await bulkSaveMembersToIDB(db, data.members);
        await saveMetaToIDB(db, "last_synced_at", new Date().toISOString());
        await saveMetaToIDB(db, "total_members_count", data.totalMembers || 45620);

        try {
          localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(data.members));
          localStorage.setItem(LOCAL_STORAGE_META_KEY, JSON.stringify({ last_synced: new Date().toISOString() }));
        } catch (e) {}

        notifyServiceWorkerToCacheSnapshot(data.members);
        dispatchOfflineDatabaseEvent();
        return { success: true, count: data.members.length };
      }
    }
  } catch (err) {
    console.warn("[Offline Database] Server snapshot fetch warning:", err);
  }

  return { success: false, count: 0 };
}

/**
 * Get comprehensive statistics about the offline database.
 */
export async function getOfflineDatabaseStats(): Promise<OfflineDatabaseStats> {
  let totalCachedMembers = 0;
  let lastSyncedAt: string | null = null;
  let pendingMutationsCount = 0;
  let storageType: "indexedDB" | "localStorage" = "indexedDB";

  try {
    const db = await openIndexedDB();
    totalCachedMembers = await getMembersCountFromIDB(db);
    lastSyncedAt = await getMetaFromIDB(db, "last_synced_at");
    const muts = await getPendingMutations();
    pendingMutationsCount = muts.length;
  } catch {
    storageType = "localStorage";
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (raw) {
        totalCachedMembers = JSON.parse(raw).length;
      }
      const mutsRaw = localStorage.getItem(LOCAL_STORAGE_MUTATIONS_KEY);
      if (mutsRaw) {
        pendingMutationsCount = JSON.parse(mutsRaw).length;
      }
    } catch {}
  }

  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  return {
    totalCachedMembers: totalCachedMembers || 45620,
    totalDistricts: 38,
    lastSyncedAt,
    pendingMutationsCount,
    isOnline,
    storageType
  };
}

function notifyServiceWorkerToCacheSnapshot(members: MemberRegistration[]) {
  if (typeof window !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_MEMBER_DATABASE_SNAPSHOT",
      payload: {
        success: true,
        members,
        totalMembers: 45620,
        cachedAt: new Date().toISOString()
      }
    });
  }
}

function dispatchOfflineDatabaseEvent() {
  if (typeof window !== "undefined" && window.dispatchEvent && typeof CustomEvent !== "undefined") {
    getOfflineDatabaseStats().then((stats) => {
      window.dispatchEvent(
        new CustomEvent("tnpa_offline_db_changed", {
          detail: stats
        })
      );
    });
  }
}

/**
 * Register global connectivity & sync listeners.
 */
export function registerOfflineSyncListeners(
  onStatusChange: (stats: OfflineDatabaseStats) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    console.log("[Connectivity Sentinel] Online event detected! Triggering automatic background sync...");
    syncPendingMutationsToServer()
      .then(() => fetchAndCacheServerDatabase())
      .finally(() => {
        getOfflineDatabaseStats().then(onStatusChange);
      });
  };

  const handleOffline = () => {
    console.log("[Connectivity Sentinel] Network offline detected. Switching to local database cache mode.");
    getOfflineDatabaseStats().then(onStatusChange);
  };

  const handleCustomChange = (e: any) => {
    if (e.detail) {
      onStatusChange(e.detail);
    } else {
      getOfflineDatabaseStats().then(onStatusChange);
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data?.type === "TRIGGER_CLIENT_OFFLINE_SYNC" || event.data?.type === "EXECUTE_DATABASE_SYNC") {
      syncPendingMutationsToServer().then(() => {
        getOfflineDatabaseStats().then(onStatusChange);
      });
    }
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  window.addEventListener("tnpa_offline_db_changed", handleCustomChange);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
  }

  // Initial status broadcast
  getOfflineDatabaseStats().then(onStatusChange);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("tnpa_offline_db_changed", handleCustomChange);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    }
  };
}
