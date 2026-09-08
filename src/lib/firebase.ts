import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import config from "../../firebase-applet-config.json";

const app = getApps().length === 0 ? initializeApp(config) : getApp();

/**
 * Configure Firestore using initializeFirestore with persistent multi-tab cache
 * and experimentalForceLongPolling to eliminate "Could not reach Cloud Firestore backend"
 * and WebChannel stream disconnects that occur in sandboxed iframes and cloud containers.
 */
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      experimentalForceLongPolling: true,
    },
    config.firestoreDatabaseId
  );
} catch {
  try {
    firestoreDb = initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      config.firestoreDatabaseId
    );
  } catch {
    firestoreDb = getFirestore(app, config.firestoreDatabaseId);
  }
}

export const db = firestoreDb;
export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isPermissionDenied = errMsg.toLowerCase().includes("permission") || errMsg.toLowerCase().includes("missing or insufficient");

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isPermissionDenied) {
    console.error("Firestore Permission Error: ", JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn(`Firestore [${operationType}] on ${path || "unknown"}:`, errMsg);
  }
}

/**
 * Validate connection to Firestore as mandated by Firebase skill
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error: any) {
    const msg = String(error?.message || error || "");
    if (
      msg.includes("the client is offline") ||
      msg.includes("offline") ||
      msg.includes("unavailable") ||
      msg.includes("could not be completed") ||
      msg.includes("Could not reach")
    ) {
      // Gracefully handle transient network offline mode
      console.info("Firestore operating in offline cache mode.");
    }
  }
}

if (typeof window !== "undefined") {
  // Check connection gracefully after app render has settled
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 4000);
}


