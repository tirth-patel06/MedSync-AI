import { isOnline } from "../network/network";
import { enqueueAction, type OfflineAction } from "../offline/actionQueue";

interface ApiClientParams {
  url: string;
  method: string;
  body: unknown;
  actionType: string;
}

export async function apiClient({
  url,
  method,
  body,
  actionType,
}: ApiClientParams) {
  // OFFLINE → capture intent
  if (!isOnline()) {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type: actionType,
      payload: body,
      createdAt: Date.now(),
      status: "pending",
    };

    await enqueueAction(action);

    return {
      offline: true,
    };
  }

  // ONLINE → normal API call
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
