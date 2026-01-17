import { baseApi } from "./baseApi";
import { PostItem } from "./postApi";

export interface DashboardAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    // Basic counts
    total_users: number;
    total_posts: number;
    total_communities: number;
    total_products: number;
    total_comments: number;
    total_likes: number;
    total_shares: number;
    total_engagement: number;
    
    // Post status breakdown
    post_status: {
      approved: number;
      rejected: number;
      pending: number;
      draft: number;
    };
    
    // Post type breakdown
    post_types: {
      text: number;
      media: number;
      link: number;
    };
    
    // Engagement averages
    engagement_averages: {
      avg_likes_per_post: number;
      avg_comments_per_post: number;
      avg_shares_per_post: number;
    };
    
    // Recent activity (7 days)
    recent_activity_7d: {
      new_users: number;
      new_posts: number;
      new_comments: number;
      new_likes: number;
      new_shares: number;
      new_communities: number;
      new_products: number;
    };
    
    // Recent activity (30 days)
    recent_activity_30d: {
      new_users: number;
      new_posts: number;
      new_comments: number;
      new_likes: number;
      new_shares: number;
    };
    
    // User activity
    user_activity: {
      active_users_7d: number;
      active_users_30d: number;
      verified_users: number;
      unverified_users: number;
    };
    
    // Community analytics
    community_analytics: {
      public: number;
      restricted: number;
      private: number;
      top_communities: Array<{
        id: number;
        name: string;
        title: string;
        members_count: number;
        posts_count: number;
        visibility: string;
      }>;
    };
    
    // Marketplace analytics
    marketplace_analytics: {
      published: number;
      draft: number;
      sold: number;
      unpublished: number;
      services_with_links?: number;
      top_categories?: Array<{
        category: string;
        count: number;
      }>;
    };
    
    // Activity timeline (30 days)
    activity_timeline: Array<{
      date: string;
      posts: number;
      users: number;
      likes: number;
      comments: number;
      shares: number;
    }>;
    
    // Engagement timeline (30 days)
    engagement_timeline: Array<{
      date: string;
      likes: number;
      comments: number;
      shares: number;
      total: number;
    }>;
    
    // User growth (90 days)
    user_growth: Array<{
      date: string;
      cumulative: number;
      new: number;
    }>;
    
    // Post growth (90 days)
    post_growth: Array<{
      date: string;
      cumulative: number;
      new: number;
    }>;
    
    // Top posts
    top_posts: {
      most_liked: PostItem[];
      most_commented: PostItem[];
      most_shared: PostItem[];
      most_engagement: PostItem[];
    };
  };
}

export interface PostAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    post_analytics: Array<{
      date: string;
      new: number;
    }>;
    date_range: {
      start_date: string;
      end_date: string;
      days: number;
    };
  };
}

export interface UserAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    user_analytics: Array<{
      date: string;
      new: number;
    }>;
    date_range: {
      start_date: string;
      end_date: string;
      days: number;
    };
  };
}

export interface ServiceAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    service_analytics: Array<{
      date: string;
      new: number;
    }>;
    date_range: {
      start_date: string;
      end_date: string;
      days: number;
    };
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
    getPostAnalytics: builder.query<PostAnalyticsResponse, { start_date?: string; end_date?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.start_date) searchParams.append('start_date', params.start_date);
        if (params.end_date) searchParams.append('end_date', params.end_date);
        return {
          url: `/auth/admin/post-analytics/?${searchParams.toString()}`,
          method: "GET",
        };
      },
    }),
    getUserAnalytics: builder.query<UserAnalyticsResponse, { start_date?: string; end_date?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.start_date) searchParams.append('start_date', params.start_date);
        if (params.end_date) searchParams.append('end_date', params.end_date);
        return {
          url: `/auth/admin/user-analytics/?${searchParams.toString()}`,
          method: "GET",
        };
      },
    }),
    getServiceAnalytics: builder.query<ServiceAnalyticsResponse, { start_date?: string; end_date?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.start_date) searchParams.append('start_date', params.start_date);
        if (params.end_date) searchParams.append('end_date', params.end_date);
        return {
          url: `/auth/admin/service-analytics/?${searchParams.toString()}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useGetDashboardAnalyticsQuery, useGetPostAnalyticsQuery, useGetUserAnalyticsQuery, useGetServiceAnalyticsQuery } = dashboardApi;

