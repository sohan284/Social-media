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

export interface PostAuthor {
  avatar?: string;
  name?: string;
  username?: string;
}

export interface PostItem {
  id: number | string;
  title?: string;
  content?: string;
  media?: string[];
  media_file?: string[];
  tags?: string[];
  created_at?: string;
  user_name?: string;
  username?: string;
  author?: PostAuthor;
  likes_count?: number;
  is_liked?: boolean;
  comments_count?: number;
  [key: string]: unknown;
}

export interface GetPostsResponse {
  data?: PostItem[];
  results?: {
    data?: PostItem[];
  };
  posts?: PostItem[];
}

export interface CommentAuthor {
  id?: number | string;
  username?: string;
  avatar?: string;
  display_name?: string;
}

export interface CommentItem {
  id: number | string;
  content: string;
  created_at: string;
  author?: CommentAuthor;
  user?: CommentAuthor;
  username?: string;
  user_name?: string;
  avatar?: string;
  parent?: number | string | null;
  replies?: CommentItem[];
  post?: number | string;
  [key: string]: unknown;
}

export interface GetCommentsResponse {
  data?: CommentItem[];
  results?: CommentItem[];
  comments?: CommentItem[];
  [key: string]: unknown;
}

export interface CreateCommentRequest {
  post: number | string;
  content: string;
  parent?: number | string;
}

export interface CreateCommentResponse {
  id?: number | string;
  content?: string;
  created_at?: string;
  author?: CommentAuthor;
  user?: CommentAuthor;
  username?: string;
  user_name?: string;
  avatar?: string;
  parent?: number | string | null;
  post?: number | string;
  message?: string;
  success?: boolean;
  [key: string]: unknown;
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
        console.log(formData);
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
    getNewsFeed: builder.query<GetPostsResponse, void>({
      query: () => ({
        url: "/api/posts/news_feed/",
        method: "GET",
      }),
    }),
    likePost: builder.mutation<
      { success: boolean; likes_count: number; is_liked: boolean; id?: number | string; like_id?: number | string; data?: { id?: number | string; like_id?: number | string } },
      { postId: number | string; isLiked: boolean }
    >({
      query: ({ postId }) => ({
        url: `/api/likes/`,
        method: "POST",
        body: { post: postId },
      }),
      async onQueryStarted({ postId, isLiked }, { dispatch, queryFulfilled }) {
        // Helper function to update post in query cache
        const updatePostInCache = (draft: GetPostsResponse) => {
          const updatePost = (posts: PostItem[] | undefined) => {
            if (!posts) return;
            const post = posts.find((p) => p.id === postId);
            if (post) {
              const wasLiked = post.is_liked || false;
              post.is_liked = !wasLiked;
              post.likes_count = (post.likes_count || 0) + (wasLiked ? -1 : 1);
            }
          };
          if (draft.posts) updatePost(draft.posts);
          if (draft.data) updatePost(draft.data);
          if (draft.results) updatePost(draft.results.data);
        };

        // Optimistic updates
        const patchResults = [
          dispatch(postApi.util.updateQueryData("getNewsFeed", undefined, updatePostInCache)),
          dispatch(postApi.util.updateQueryData("getMyPosts", undefined, updatePostInCache)),
        ];

        try {
          const result = await queryFulfilled;
          const responseData = result.data;

          // If unliking, delete the like using ID from response
          if (isLiked === false) {
            const likeId = responseData?.data?.id || responseData?.data?.like_id || responseData.id || responseData.like_id;
            
            if (likeId) {
              const { getStoredAccessToken } = await import("@/lib/auth");
              const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://socialmedia.lumivancelabs.com/";
              
              await fetch(`${baseUrl}api/likes/${likeId}/`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${getStoredAccessToken() || ""}`,
                  "Content-Type": "application/json",
                },
              }).catch((error) => console.error("Failed to delete like:", error));
            }
          }
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),
    getComments: builder.query<GetCommentsResponse, number | string>({
      query: (postId) => ({
        url: `/api/comments/?post=${postId}`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [{ type: 'Comments' as const, id: postId }],
    }),
    createComment: builder.mutation<CreateCommentResponse, CreateCommentRequest>({
      query: (data) => ({
        url: "/api/comments/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { post }) => [{ type: 'Comments' as const, id: post }],
      async onQueryStarted({ post }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          
          // Update the post's comment count
          const updatePostCommentCount = (draft: GetPostsResponse) => {
            const updatePost = (posts: PostItem[] | undefined) => {
              if (!posts) return;
              const postItem = posts.find((p) => p.id === post);
              if (postItem) {
                postItem.comments_count = (postItem.comments_count || 0) + 1;
              }
            };
            if (draft.posts) updatePost(draft.posts);
            if (draft.data) updatePost(draft.data);
            if (draft.results) updatePost(draft.results.data);
          };

          dispatch(postApi.util.updateQueryData("getNewsFeed", undefined, updatePostCommentCount));
          dispatch(postApi.util.updateQueryData("getMyPosts", undefined, updatePostCommentCount));
          
        } catch {
          // Error already handled
        }
      },
    }),
    updateComment: builder.mutation<CreateCommentResponse, { commentId: number | string; content: string; postId: number | string }>({
      query: ({ commentId, content }) => ({
        url: `/api/comments/${commentId}/`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Comments' as const, id: postId }],
    }),
    deleteComment: builder.mutation<void, { commentId: number | string; postId: number | string }>({
      query: ({ commentId }) => ({
        url: `/api/comments/${commentId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Comments' as const, id: postId }],
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          
          // Update the post's comment count
          const updatePostCommentCount = (draft: GetPostsResponse) => {
            const updatePost = (posts: PostItem[] | undefined) => {
              if (!posts) return;
              const postItem = posts.find((p) => p.id === postId);
              if (postItem && postItem.comments_count && postItem.comments_count > 0) {
                postItem.comments_count = postItem.comments_count - 1;
              }
            };
            if (draft.posts) updatePost(draft.posts);
            if (draft.data) updatePost(draft.data);
            if (draft.results) updatePost(draft.results.data);
          };

          dispatch(postApi.util.updateQueryData("getNewsFeed", undefined, updatePostCommentCount));
          dispatch(postApi.util.updateQueryData("getMyPosts", undefined, updatePostCommentCount));
          
        } catch {
          // Error already handled
        }
      },
    }),
    followUser: builder.mutation<{ success?: boolean; message?: string; id?: number | string; following_id?: number | string; [key: string]: unknown }, { userId: number | string }>({
      query: ({ userId }) => ({
        url: `/api/follows/user_profile/?user_id=${userId}`,
        method: "POST",
        body: { following: 0 },
      }),
    }),
    unfollowUser: builder.mutation<{ success?: boolean; message?: string; [key: string]: unknown }, { followingId: number | string }>({
      query: ({ followingId }) => ({
        url: `/api/follows/${followingId}/`,
        method: "DELETE",
        body: { following: 0 },
      }),
    }),
  }),
});

export const { 
  useCreatePostMutation, 
  useGetMyPostsQuery, 
  useGetNewsFeedQuery, 
  useLikePostMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = postApi;