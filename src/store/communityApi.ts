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

export interface CreateCommunityResponse {
  id?: number | string;
  name?: string;
  description?: string;
  message?: string;
  success?: boolean;
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
  }),
});

export const { useCreateCommunityMutation } = communityApi;

