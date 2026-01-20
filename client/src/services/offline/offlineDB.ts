import { openDB } from "idb";

export const dbPromise = openDB("medsync-db", 1, {
  upgrade(db) {
    db.createObjectStore("actions", { keyPath: "id" });
  },
});
