import { baseApi } from "./baseApi";

export interface CreatePostRequest {
  title: string;
  content?: string;
  tags?: string[];
  link?: string;
  media_files?: File[];
  post_type: "media" | "text" | "link";
}

export interface CreatePostResponse {
  id?: number | string;
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}



export interface PostItem {
  id: number | string;
  title?: string;
  content?: string;
  media?: string[];
  tags?: string[];
  created_at?: string;
}

export interface GetPostsResponse {
  data?: PostItem[];
  results?: PostItem[];
  posts?: PostItem[];
}

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<CreatePostResponse, CreatePostRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append("title", data.title);
        if (typeof data.content === "string") {
          formData.append("content", data.content);
        }
        if (typeof data.link === "string" && data.link.trim().length > 0) {
          formData.append("link", data.link);
        }
        if (Array.isArray(data.tags)) {
          data.tags.forEach((tag) => formData.append("tags", tag));
        }
        if (Array.isArray(data.media_files)) {
          data.media_files.forEach((file) =>
            formData.append("media_files", file)
          );
        }
        formData.append("post_type", data.post_type.toString());
        return {
          url: "/api/posts/",
          method: "POST",
          body: formData,
        };
      },
    }),
    getMyPosts: builder.query<GetPostsResponse, void>({
      query: () => ({
        url: "/api/posts/my_posts/",
        method: "GET",
      }),
    }),
  }),
});

export const { useCreatePostMutation, useGetMyPostsQuery } = postApi;

