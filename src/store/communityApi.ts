import { baseApi } from "./baseApi";

export interface CreateCommunityRequest {
  name: string;
  description: string;
  profile_image?: File;
  cover_image?: File;
  visibility: "public" | "restricted" | "private";
  // Optional post fields for initial community post
  title?: string;
  content?: string;
  post_type?: "text" | "media" | "link";
  tags?: string[];
}

export interface UpdateCommunityRequest {
  title: string;
  description?: string;
  profile_image?: File;
  cover_image?: File;
  visibility?: "public" | "restricted" | "private";
}

export interface CreateCommunityResponse {
  id?: number | string;
  name?: string;
  description?: string;
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

export interface CommunityItem {
  id: number | string;
  name?: string;
  title?: string;
  description?: string;
  profile_image?: string | null;
  cover_image?: string | null;
  icon?: string;
  banner?: string;
  visibility?: "public" | "restricted" | "private";
  members_count?: number;
  posts_count?: number;
  created_at?: string;
  created_by?: number;
  created_by_username?: string;
  updated_at?: string;
  is_member?: boolean;
  user_role?: string;
  can_post?: boolean;
  can_manage?: boolean;
  [key: string]: unknown;
}

export interface GetMyCommunitiesResponse {
  data?: CommunityItem[];
  results?: {
    data?: CommunityItem[];
  };
  communities?: CommunityItem[];
  [key: string]: unknown;
}

export interface PopularCommunitiesResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: {
    success?: boolean;
    message?: string;
    data?: CommunityItem[];
  };
  [key: string]: unknown;
}

export interface JoinLeaveCommunityResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCommunity: builder.mutation<CreateCommunityResponse, CreateCommunityRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("visibility", data.visibility);

        // Map to post fields expected by the API
        const title = data.title ?? data.name;
        const content = data.content ?? data.description;
        const postType = data.post_type ?? "text";

        formData.append("title", title);
        formData.append("content", content);
        formData.append("post_type", postType);

        if (Array.isArray(data.tags)) {
          data.tags.forEach((tag) => formData.append("tags", tag));
        }

        if (data.profile_image) {
          formData.append("profile_image", data.profile_image);
          console.log("Added profile_image to FormData:", data.profile_image.name, data.profile_image.size);
        }
        if (data.cover_image) {
          formData.append("cover_image", data.cover_image);
          console.log("Added cover_image to FormData:", data.cover_image.name, data.cover_image.size);
        }

        // Log FormData contents for debugging
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, value.name, value.size, value.type);
          } else {
            console.log(`${key}:`, value);
          }
        }

        return {
          url: "/api/communities/",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Communities"],
    }),
    getMyCommunities: builder.query<GetMyCommunitiesResponse, void>({
      query: () => ({
        url: "/api/communities/my_communities/",
        method: "GET",
      }),
      providesTags: ["Communities"],
    }),
    updateCommunity: builder.mutation<CreateCommunityResponse, { communityName: string; data: UpdateCommunityRequest }>({
      query: ({ communityName, data }) => {
        const formData = new FormData();
        formData.append("title", data.title);
        
        if (data.description !== undefined) {
          formData.append("description", data.description);
        }
        if (data.visibility !== undefined) {
          formData.append("visibility", data.visibility);
        }
        if (data.profile_image) {
          formData.append("profile_image", data.profile_image);
          console.log("Added profile_image to FormData:", data.profile_image.name, data.profile_image.size);
        }
        if (data.cover_image) {
          formData.append("cover_image", data.cover_image);
          console.log("Added cover_image to FormData:", data.cover_image.name, data.cover_image.size);
        }

        // Log FormData contents for debugging
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, value.name, value.size, value.type);
          } else {
            console.log(`${key}:`, value);
          }
        }

        return {
          url: `/api/communities/${communityName}/`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["Communities"],
    }),
    getPopularCommunities: builder.query<PopularCommunitiesResponse, void>({
      query: () => ({
        url: "/api/communities/popular/",
        method: "GET",
      }),
      providesTags: ["Communities"],
    }),
    joinCommunity: builder.mutation<JoinLeaveCommunityResponse, string>({
      query: (communityName) => ({
        url: `/api/communities/${communityName}/join/`,
        method: "POST",
      }),
      invalidatesTags: ["Communities"],
    }),
    leaveCommunity: builder.mutation<JoinLeaveCommunityResponse, string>({
      query: (communityName) => ({
        url: `/api/communities/${communityName}/leave/`,
        method: "POST",
      }),
      invalidatesTags: ["Communities"],
    }),
    deleteCommunity: builder.mutation<{ success?: boolean; message?: string; [key: string]: unknown }, string>({
      query: (communityName) => ({
        url: `/api/communities/${communityName}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Communities"],
    }),
  }),
});

export const { 
  useCreateCommunityMutation, 
  useGetMyCommunitiesQuery, 
  useUpdateCommunityMutation,
  useGetPopularCommunitiesQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useDeleteCommunityMutation,
} = communityApi;

