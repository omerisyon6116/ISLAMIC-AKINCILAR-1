import { useQuery } from "@tanstack/react-query";
import { apiBasePath } from "@/lib/tenant";
import { useAuth } from "@/lib/auth";

export type NotificationItem = {
  id: string;
  type: string;
  payload: Record<string, any>;
  isRead: boolean;
  createdAt: string;
};

export function useNotifications() {
  const { isAuthenticated } = useAuth();

  const query = useQuery<{ notifications: NotificationItem[] }>({
    queryKey: ["notifications", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/notifications`, { credentials: "include" });
      if (!res.ok) throw new Error("Bildirimler alınamadı");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  return {
    notifications: query.data?.notifications ?? [],
    ...query,
  };
}
