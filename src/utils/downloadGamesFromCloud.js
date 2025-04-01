// FILE: src/utils/downloadGamesFromCloud.js
import { getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase"; // ✅ Firestore instance
import { db } from "../db"; // ✅ Dexie DB

export async function downloadGamesFromCloud(userId) {
  try {
    const snapshot = await getDocs(collection(firestore, `users/${userId}/games`));
    const allGames = snapshot.docs.map(doc => doc.data());

    // 🔒 Optional safety check
    const filteredGames = allGames.filter(game => game.userId === userId);

    for (let game of filteredGames) {
      await db.games.put(game);
    }

    console.log("✅ Downloaded cloud games into IndexedDB");
  } catch (error) {
    console.error("❌ Failed to download cloud games:", error);
  }
}
