import api from "@/lib/axios";

export interface PushSubscriptionPayload {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPublicKeyResponse {
  public_key: string;
}

export const pushNotificationsService = {
  getPublicKey: async (): Promise<string> => {
    const response = await api.get<PushPublicKeyResponse>("/notifications/push/public-key/");
    return response.data.public_key;
  },

  subscribe: async (payload: PushSubscriptionPayload): Promise<void> => {
    await api.post("/notifications/push/subscription/", payload);
  },

  unsubscribe: async (endpoint: string): Promise<void> => {
    await api.delete("/notifications/push/subscription/", {
      data: { endpoint },
    });
  },
};
