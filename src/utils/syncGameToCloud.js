// FILE: src/utils/syncGameToCloud.js
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebase"; // ✅ Firestore instance
import { db } from "../db"; // ✅ Dexie (IndexedDB) instance

/**
 * Upload a game to Firestore and mark it as synced in IndexedDB
 * @param {string} userEmail - email of the user (used as Firestore path)
 * @param {object} gameData - game object
 */
// src/utils/syncGameToCloud.js
export async function uploadGameToCloud(uid, gameData) {
  if (!uid || !gameData.id) return;

  try {
    const updatedGameData = {
      ...gameData,
      synced: true,
      userId: uid,
    };

    await db.games.put(updatedGameData); // ✅ local Dexie
    await setDoc(doc(firestore, "users", uid, "games", gameData.id), updatedGameData); // ✅ Firestore
  } catch (err) {
    console.error("🔥 Upload failed:", err);
  }
}
