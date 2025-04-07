// FILE: src/utils/downloadGamesFromCloud.js
import { getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase"; // ✅ Firestore instance
import { db } from "../db"; // ✅ Dexie DB
export async function downloadGamesFromCloud(uid) {
  if (!uid) return;

  try {
    const snapshot = await getDocs(collection(firestore, `users/${uid}/games`));
    const allGames = snapshot.docs.map(doc => doc.data());

    for (let game of allGames) {
      // ✅ Force overwrite with synced + userId
      await db.games.put({
        ...game,
        synced: true,
        userId: uid,
      });
    }

    console.log("✅ Downloaded cloud games into IndexedDB");
  } catch (error) {
    console.error("❌ Failed to download cloud games:", error);
  }
}
