// utils/cleanForFirestore.js
export function cleanForFirestore(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  