import { baseApi } from "./baseApi";
import { PostItem } from "./postApi";

export interface DashboardAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    total_users: number;
    total_posts: number;
    total_communities: number;
    post_status: {
      approved: number;
      rejected: number;
      pending: number;
      draft: number;
    };
    recent_activity: {
      new_users_7d: number;
      new_posts_7d: number;
    };
    activity_timeline: Array<{
      date: string;
      posts: number;
      users: number;
    }>;
    top_posts: PostItem[];
  };
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query<DashboardAnalyticsResponse, void>({
      query: () => ({
        url: "/auth/admin/dashboard-analytics/",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDashboardAnalyticsQuery } = dashboardApi;

