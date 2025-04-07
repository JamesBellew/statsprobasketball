// FILE: src/utils/syncGameToCloud.js
import { doc as firestoreDoc, setDoc } from "firebase/firestore"; // ✅ aliasing for clarity
import { firestore } from "../firebase"; // ✅ Firestore instance
import { db } from "../db"; // ✅ Dexie (IndexedDB) instance

/**
 * Upload a game to Firestore and mark it as synced in IndexedDB
 * @param {string} uid - Firebase Auth UID
 * @param {object} gameData - game object
 */
export async function uploadGameToCloud(uid, gameData) {
  if (!uid || !gameData.id) return;

  try {
    const updatedGameData = {
      ...gameData,
      synced: true,
      userId: uid,
    };

    // ✅ Save locally
    await db.games.put(updatedGameData);

    // ✅ Save to Firestore under correct UID path
    const ref = firestoreDoc(firestore, "users", uid, "games", gameData.id);
    await setDoc(ref, updatedGameData);

    console.log("✅ Game uploaded to Firestore!");
  } catch (err) {
    console.error("🔥 Upload failed:", err);
  }
}
