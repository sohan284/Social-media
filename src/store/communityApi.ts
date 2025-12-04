import { baseApi } from "./baseApi";

export interface CreateCommunityRequest {
  name: string;
  description: string;
  banner?: File;
  icon?: File;
  visibility: "public" | "restricted" | "private";
  // Optional post fields for initial community post
  title?: string;
  content?: string;
  post_type?: "text" | "media" | "link";
  tags?: string[];
}

export interface UpdateCommunityRequest {
  name: string;
  description?: string;
  banner?: File;
  icon?: File;
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
  description?: string;
  icon?: string;
  banner?: string;
  visibility?: "public" | "restricted" | "private";
  members_count?: number;
  posts_count?: number;
  created_at?: string;
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

        if (data.banner) {
          formData.append("banner", data.banner);
        }
        if (data.icon) {
          formData.append("icon", data.icon);
        }

        return {
          url: "/api/communities/",
          method: "POST",
          body: formData,
        };
      },
    }),
    getMyCommunities: builder.query<GetMyCommunitiesResponse, void>({
      query: () => ({
        url: "/api/communities/my_communities/",
        method: "GET",
      }),
    }),
    updateCommunity: builder.mutation<CreateCommunityResponse, { communityName: string; data: UpdateCommunityRequest }>({
      query: ({ communityName, data }) => {
        const formData = new FormData();
        formData.append("name", data.name);
        
        if (data.description !== undefined) {
          formData.append("description", data.description);
        }
        if (data.visibility !== undefined) {
          formData.append("visibility", data.visibility);
        }
        if (data.banner) {
          formData.append("banner", data.banner);
        }
        if (data.icon) {
          formData.append("icon", data.icon);
        }

        return {
          url: `/api/communities/${communityName}/`,
          method: "PATCH",
          body: formData,
        };
      },
    }),
  }),
});

export const { useCreateCommunityMutation, useGetMyCommunitiesQuery, useUpdateCommunityMutation } = communityApi;

