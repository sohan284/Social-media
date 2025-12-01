import { baseApi } from "./baseApi";

export interface NotificationItem {
  id: number | string;
  sender?: number | string;
  sender_name?: string;
  notification_type?: string;
  post?: number | string;
  post_title?: string;
  comment?: number | string;
  created_at?: string;
  is_read?: boolean;
  [key: string]: unknown;
}

export interface MarkNotificationReadRequest {
  is_read: boolean;
}

export interface GetNotificationsResponse {
  data?: NotificationItem[];
  results?: {
    data?: NotificationItem[];
  };
  notifications?: NotificationItem[];
  [key: string]: unknown;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<GetNotificationsResponse, void>({
      query: () => ({
        url: "/api/notifications/",
        method: "GET",
      }),
    }),
    markNotificationAsRead: builder.mutation<
      NotificationItem,
      { notificationId: number | string }
    >({
      query: ({ notificationId }) => ({
        url: `/api/notifications/${notificationId}/`,
        method: "PATCH",
        body: { is_read: true },
      }),
      async onQueryStarted({ notificationId }, { dispatch, queryFulfilled }) {
        // Optimistically update the notification in cache
        const patchResult = dispatch(
          notificationApi.util.updateQueryData(
            "getNotifications",
            undefined,
            (draft) => {
              const updateNotification = (
                notifications: NotificationItem[] | undefined
              ) => {
                if (!notifications) return;
                const notification = notifications.find(
                  (n) => n.id === notificationId
                );
                if (notification) {
                  notification.is_read = true;
                }
              };

              if (draft.data) updateNotification(draft.data);
              if (draft.notifications) updateNotification(draft.notifications);
              if (draft.results?.data)
                updateNotification(draft.results.data);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} = notificationApi;


