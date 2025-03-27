// src/utils/syncGameToCloud.js
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

import { db } from "../firebase"; // ✅ Now this works



export async function uploadGameToCloud(userId, gameData) {
    if (!userId || !gameData.id) {
      console.error("❌ Missing userId or game ID", { userId, gameId: gameData.id });
      return;
    }
  
    try {
      console.log("🔥 Uploading to Firestore:", {
        userId,
        gameId: gameData.id,
        gameData,
      });
  
      const docRef = doc(db, "users", userId, "games", gameData.id);
      await setDoc(docRef, gameData);
  
      console.log("✅ Successfully uploaded to Firestore");
    } catch (error) {
      console.error("❌ Failed Firestore upload:", error);
    }
  }
  

export const fetchGamesFromCloud = async (userId) => {
  if (!userId) return [];

  const gamesRef = collection(firestore, "users", userId, "games");
  const snapshot = await getDocs(gamesRef);
  return snapshot.docs.map(doc => doc.data());
};
