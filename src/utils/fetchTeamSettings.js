import { firestore } from "../firebase";
import { doc as firestoreDoc, getDoc } from "firebase/firestore";
import { db } from "../db";

export const fetchTeamSettings = async (user) => {
  let settings = null;
  if (user) {
    const ref = firestoreDoc(firestore, "users", user.uid, "settings", "preferences");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      settings = snap.data();
    }
  } else {
    settings = await db.settings.get("preferences");
  }

  return settings;
};
