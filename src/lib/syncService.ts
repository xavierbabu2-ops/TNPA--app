import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  MemberRegistration, 
  Leader, 
  NewsItem, 
  WelfareApplication, 
  PaymentRecord,
  SystemSettings,
  GalleryPhoto,
  GalleryVideo,
  ExecutiveMember
} from "../types";

/**
 * Strips all undefined fields recursively from an object
 * to prevent Firestore "Unsupported field value: undefined" errors.
 */
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanForFirestore(item)) as any;
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export interface GlobalUnionConfig {
  id?: string;
  customLogoUrl?: string;
  customEmblemUrl?: string;
  customFlagUrl?: string;
  emergencyAlert?: string | null;
  presidentName?: string;
  secretaryName?: string;
  treasurerName?: string;
  sampleIdCardData?: {
    name?: string;
    fatherName?: string;
    occupation?: string;
    district?: string;
    phone?: string;
    bloodGroup?: string;
    regNumber?: string;
    age?: string;
    address?: string;
    photoUrl?: string;
  };
  updatedAt?: string;
  updatedBy?: string;
}

// 1. REGISTRATIONS REALTIME SYNC
export function subscribeToRegistrations(
  onUpdate: (registrations: MemberRegistration[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "registrations");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: MemberRegistration[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as MemberRegistration;
          list.push({ ...data, id: docSnap.id });
        });
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore registrations subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach registrations listener:", err);
    return () => {};
  }
}

export async function saveRegistrationToFirestore(member: MemberRegistration): Promise<boolean> {
  try {
    const docRef = doc(db, "registrations", member.id);
    const cleaned = cleanForFirestore({ ...member, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving registration to Firestore:", error);
    return false;
  }
}

// 2. UNION & ID CARD CONFIG REALTIME SYNC
export function subscribeToUnionConfig(
  onUpdate: (config: GlobalUnionConfig) => void,
  onError?: (err: any) => void
) {
  try {
    const docRef = doc(db, "union_config", "general");
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as GlobalUnionConfig);
        }
      },
      (error) => {
        console.warn("Firestore union_config subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach union_config listener:", err);
    return () => {};
  }
}

export async function saveUnionConfigToFirestore(config: Partial<GlobalUnionConfig>): Promise<boolean> {
  try {
    const docRef = doc(db, "union_config", "general");
    const cleaned = cleanForFirestore({ 
      ...config, 
      id: "general",
      updatedAt: new Date().toISOString() 
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving union config to Firestore:", error);
    return false;
  }
}

// 3. LEADERS & OFFICE BEARERS REALTIME SYNC
export function subscribeToLeaders(
  onUpdate: (leaders: Leader[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "leaders");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Leader[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as Leader), id: docSnap.id });
        });
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore leaders subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach leaders listener:", err);
    return () => {};
  }
}

export async function saveLeaderToFirestore(leader: Leader): Promise<boolean> {
  try {
    const docRef = doc(db, "leaders", leader.id);
    const cleaned = cleanForFirestore(leader);
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving leader to Firestore:", error);
    return false;
  }
}

// 4. NEWS & CIRCULARS REALTIME SYNC
export function subscribeToNews(
  onUpdate: (news: NewsItem[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "news");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: NewsItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as NewsItem), id: docSnap.id });
        });
        // Sort newest first if date exists
        list.sort((a, b) => {
          const dateA = a.date || "";
          const dateB = b.date || "";
          return dateB.localeCompare(dateA);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore news subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach news listener:", err);
    return () => {};
  }
}

export async function saveNewsToFirestore(item: NewsItem): Promise<boolean> {
  try {
    const docRef = doc(db, "news", item.id);
    const cleaned = cleanForFirestore({
      ...item,
      imageUrl: item.imageUrl || "",
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving news to Firestore:", error);
    return false;
  }
}

export async function deleteNewsFromFirestore(newsId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "news", newsId));
    return true;
  } catch (error) {
    console.warn("Error deleting news from Firestore:", error);
    return false;
  }
}

// 5. BROADCASTS REALTIME SYNC
export function subscribeToBroadcasts(
  onUpdate: (broadcasts: any[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "broadcasts");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id });
        });
        list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore broadcasts subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach broadcasts listener:", err);
    return () => {};
  }
}

export async function saveBroadcastToFirestore(broadcast: any): Promise<boolean> {
  try {
    const docRef = doc(db, "broadcasts", broadcast.id || `bc_${Date.now()}`);
    const cleaned = cleanForFirestore({ 
      ...broadcast, 
      createdAt: broadcast.createdAt || new Date().toISOString() 
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving broadcast to Firestore:", error);
    return false;
  }
}

export async function deleteBroadcastFromFirestore(broadcastId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "broadcasts", broadcastId));
    return true;
  } catch (error) {
    console.warn("Error deleting broadcast from Firestore:", error);
    return false;
  }
}

// 6. GALLERY PHOTOS & VIDEOS REALTIME SYNC
export function subscribeToGalleryPhotos(
  onUpdate: (photos: GalleryPhoto[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "gallery_photos");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: GalleryPhoto[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as GalleryPhoto);
        });
        list.sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));
        // Always broadcast update to state (even when empty or after deletions)
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore gallery photos subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach gallery photos listener:", err);
    return () => {};
  }
}

export async function saveGalleryPhotoToFirestore(photo: GalleryPhoto): Promise<boolean> {
  try {
    const docRef = doc(db, "gallery_photos", photo.id);
    const cleaned = cleanForFirestore({ 
      ...photo, 
      captionEn: photo.captionEn || photo.caption,
      uploadedAt: photo.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString() 
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving photo to Firestore:", error);
    return false;
  }
}

export async function deleteGalleryPhotoFromFirestore(photoId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "gallery_photos", photoId));
    return true;
  } catch (error) {
    console.warn("Error deleting photo from Firestore:", error);
    return false;
  }
}

export async function clearAllGalleryPhotosFromFirestore(): Promise<boolean> {
  try {
    const colRef = collection(db, "gallery_photos");
    const snap = await getDocs(colRef);
    for (const docSnap of snap.docs) {
      await deleteDoc(docSnap.ref);
    }
    return true;
  } catch (err) {
    console.warn("Error clearing gallery photos:", err);
    return false;
  }
}

export function subscribeToGalleryVideos(
  onUpdate: (videos: GalleryVideo[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "gallery_videos");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: GalleryVideo[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as GalleryVideo);
        });
        list.sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));
        // Always broadcast update to state (even when empty or after deletions)
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore gallery videos subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach gallery videos listener:", err);
    return () => {};
  }
}

export async function saveGalleryVideoToFirestore(video: GalleryVideo): Promise<boolean> {
  try {
    const docRef = doc(db, "gallery_videos", video.id);
    const cleaned = cleanForFirestore({ 
      ...video, 
      titleEn: video.titleEn || video.title,
      desc: video.desc || "",
      descEn: video.descEn || video.desc || "",
      duration: video.duration || "05:00",
      uploadedAt: video.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString() 
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving video to Firestore:", error);
    return false;
  }
}

export async function deleteGalleryVideoFromFirestore(videoId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "gallery_videos", videoId));
    return true;
  } catch (error) {
    console.warn("Error deleting video from Firestore:", error);
    return false;
  }
}

export async function clearAllGalleryVideosFromFirestore(): Promise<boolean> {
  try {
    const colRef = collection(db, "gallery_videos");
    const snap = await getDocs(colRef);
    for (const docSnap of snap.docs) {
      await deleteDoc(docSnap.ref);
    }
    return true;
  } catch (err) {
    console.warn("Error clearing gallery videos:", err);
    return false;
  }
}

// 7. WELFARE APPLICATIONS REALTIME SYNC
export function subscribeToWelfareApplications(
  onUpdate: (apps: WelfareApplication[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "welfare_applications");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: WelfareApplication[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as WelfareApplication), id: docSnap.id });
        });
        list.sort((a, b) => (b.appliedAt || "").localeCompare(a.appliedAt || ""));
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore welfare_applications subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach welfare_applications listener:", err);
    return () => {};
  }
}

export async function saveWelfareApplicationToFirestore(app: WelfareApplication): Promise<boolean> {
  try {
    const docRef = doc(db, "welfare_applications", app.id);
    const cleaned = cleanForFirestore({
      ...app,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving welfare application to Firestore:", error);
    return false;
  }
}

export async function deleteWelfareApplicationFromFirestore(appId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "welfare_applications", appId));
    return true;
  } catch (error) {
    console.warn("Error deleting welfare application from Firestore:", error);
    return false;
  }
}

// 8. PAYMENTS & SUBSCRIPTIONS REALTIME SYNC
export function subscribeToPayments(
  onUpdate: (payments: PaymentRecord[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "payments");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: PaymentRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as PaymentRecord), id: docSnap.id });
        });
        list.sort((a, b) => (b.paymentDate || "").localeCompare(a.paymentDate || ""));
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore payments subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach payments listener:", err);
    return () => {};
  }
}

export async function savePaymentToFirestore(payment: PaymentRecord): Promise<boolean> {
  try {
    const docRef = doc(db, "payments", payment.id);
    const cleaned = cleanForFirestore({
      ...payment,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving payment to Firestore:", error);
    return false;
  }
}

// 9. GRIEVANCES & SUPPORT PETITIONS REALTIME SYNC
export function subscribeToGrievances(
  onUpdate: (grievances: any[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "grievances");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id });
        });
        list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore grievances subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach grievances listener:", err);
    return () => {};
  }
}

export async function saveGrievanceToFirestore(grievance: any): Promise<boolean> {
  try {
    const docRef = doc(db, "grievances", grievance.id || `grv_${Date.now()}`);
    const cleaned = cleanForFirestore({
      ...grievance,
      createdAt: grievance.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving grievance to Firestore:", error);
    return false;
  }
}

// 10. EXECUTIVES HIERARCHY REALTIME SYNC (State, District, Zone, Area/Union)
export function subscribeToExecutives(
  onUpdate: (executives: ExecutiveMember[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, "executives");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: ExecutiveMember[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as ExecutiveMember), id: docSnap.id });
        });
        onUpdate(list);
      },
      (error) => {
        console.warn("Firestore executives subscription error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn("Failed to attach executives listener:", err);
    return () => {};
  }
}

export async function saveExecutiveToFirestore(executive: ExecutiveMember): Promise<boolean> {
  try {
    const docRef = doc(db, "executives", executive.id);
    const cleaned = cleanForFirestore(executive);
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving executive to Firestore:", error);
    return false;
  }
}

export async function deleteExecutiveFromFirestore(executiveId: string): Promise<boolean> {
  try {
    const docRef = doc(db, "executives", executiveId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.warn("Error deleting executive from Firestore:", error);
    return false;
  }
}

// 11. INITIAL SEEDING HELPER (Only if cloud database is empty)
export async function seedInitialFirestoreData(
  initialRegs: MemberRegistration[],
  initialLeadersList: Leader[],
  initialNewsList: NewsItem[]
) {
  try {
    // Check if registrations already exist
    const regsSnap = await getDocs(collection(db, "registrations"));
    if (regsSnap.empty) {
      for (const reg of initialRegs) {
        await setDoc(doc(db, "registrations", reg.id), reg, { merge: true });
      }
    }

    // Check if leaders exist
    const leadersSnap = await getDocs(collection(db, "leaders"));
    if (leadersSnap.empty) {
      for (const leader of initialLeadersList) {
        await setDoc(doc(db, "leaders", leader.id), leader, { merge: true });
      }
    }

    // Check if news exist
    const newsSnap = await getDocs(collection(db, "news"));
    if (newsSnap.empty) {
      for (const item of initialNewsList) {
        await setDoc(doc(db, "news", item.id), item, { merge: true });
      }
    }

    // Initialize global union config if missing
    const configSnap = await getDoc(doc(db, "union_config", "general"));
    if (!configSnap.exists()) {
      await setDoc(doc(db, "union_config", "general"), {
        id: "general",
        emergencyAlert: "அவசர அறிவிப்பு: தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் மாநில ஒருங்கிணைப்பு மையம் நேரலையில் உள்ளது.",
        presidentName: "மாநிலத் தலைவர்",
        secretaryName: "மாநில பொதுச்செயலாளர்",
        treasurerName: "மாநில பொருளாளர்",
        updatedAt: new Date().toISOString(),
        updatedBy: "System Boot"
      });
    }
  } catch (err) {
    console.warn("Firestore initial seeding skipped:", err);
  }
}
