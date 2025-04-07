import Dexie from "dexie";

export const db = new Dexie("MyAppDatabase");

db.version(2).stores({
  lineouts: "id, name, players",
  games: "id, opponentName, venue, actions, lineout, opponentScore, timestamp",
  settings: "id" // ✅ Add this line!
});
