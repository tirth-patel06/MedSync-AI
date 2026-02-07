import {dbPromise} from "./offlineDB";

export type OfflineAction = {
  id: string;
  type: string;
  payload: unknown;
  createdAt: number;
  status: "pending" | "syncing" | "failed";
};

export async function enqueueAction(action: OfflineAction): Promise<void> {
  const db = await dbPromise;
  await db.put("actions", action);
}

export async function getAllActions(): Promise<OfflineAction[]> {
  const db = await dbPromise;
  return db.getAll("actions");
}

export async function removeAction(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete("actions", id);
}
