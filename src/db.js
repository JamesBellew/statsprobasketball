// db.js
import Dexie from "dexie";

export const db = new Dexie("GameStatsDB");

db.version(1).stores({
  lineouts: "++id, name", // you can add additional indexes as needed
  // ... other tables, e.g., games
});
