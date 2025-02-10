// db.js
import Dexie from "dexie";

export const db = new Dexie("MyAppDatabase");

// Define your database schema including the games table.
// If you already have a version(1), you may need to bump the version number.
db.version(1).stores({
  lineouts: "id, name, players",
  games: "id, opponentName, venue, actions, lineout, timestamp" // Add the games table
});
