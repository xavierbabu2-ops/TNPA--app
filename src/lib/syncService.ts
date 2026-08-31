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
  GalleryVideo 
} from "../types";

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
        if (list.length > 0) {
          onUpdate(list);
        }
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
    await setDoc(docRef, { ...member, updatedAt: new Date().toISOString() }, { merge: true });
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
    await setDoc(docRef, { 
      ...config, 
      id: "general",
      updatedAt: new Date().toISOString() 
    }, { merge: true });
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
        if (list.length > 0) {
          onUpdate(list);
        }
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
    await setDoc(docRef, leader, { merge: true });
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
        if (list.length > 0) {
          onUpdate(list);
        }
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
    await setDoc(docRef, item, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving news to Firestore:", error);
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
        if (list.length > 0) {
          onUpdate(list);
        }
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
    await setDoc(docRef, { ...broadcast, createdAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.warn("Error saving broadcast to Firestore:", error);
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
        if (list.length > 0) {
          onUpdate(list);
        }
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
    await setDoc(docRef, { ...photo, updatedAt: new Date().toISOString() }, { merge: true });
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
        if (list.length > 0) {
          onUpdate(list);
        }
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
    await setDoc(docRef, { ...video, updatedAt: new Date().toISOString() }, { merge: true });
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

// 7. INITIAL SEEDING HELPER (Only if cloud database is empty)
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
