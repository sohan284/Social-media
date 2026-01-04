import { getApiBaseUrl } from "@/lib/utils";
import { baseApi } from "./baseApi";

export interface CreatePostRequest {
  title: string;
  content?: string;
  tags?: string[];
  link?: string;
  media_files?: File[];
  post_type: "media" | "text" | "link";
  community?: number | string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
  link?: string;
  media_files?: File[];
  post_type?: "media" | "text" | "link";
  community?: number | string;
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
  results?: PostItem[] | {
    data?: PostItem[];
  };
  posts?: PostItem[];
  count?: number;
  next?: string | null;
  previous?: string | null;
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

export interface FollowItem {
  id?: number | string;
  following?: number | string;
  follower?: number | string;
  following_name?: string;
  follower_name?: string;
  follower_avatar?: string | null;
  follower_about?: string | null;
  following_avatar?: string | null;
  following_about?: string | null;
  user?: number | string;
  created_at?: string;
  [key: string]: unknown;
}

export interface GetFollowersResponse {
  data?: FollowItem[];
  results?: {
    data?: FollowItem[];
  };
  [key: string]: unknown;
}

export interface UserSuggestion {
  id?: number | string;
  username?: string;
  avatar?: string | null;
  about?: string | null;
  display_name?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_following?: boolean;
  follow_id?: number | string | null;
  [key: string]: unknown;
}

export interface GetSuggestionsResponse {
  data?: UserSuggestion[];
  results?: {
    data?: UserSuggestion[];
  };
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
        if (Array.isArray(data.tags) && data.tags.length > 0) {
          formData.append("tags", JSON.stringify(data.tags));
        }
        if (Array.isArray(data.media_files)) {
          data.media_files.forEach((file) =>
            formData.append("media_files", file)
          );
        }
        if (data.community !== undefined) {
          formData.append("community", data.community.toString());
        }
        console.log(formData);
        formData.append("post_type", data.post_type.toString());
        return {
          url: "/api/posts/",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Communities"],
    }),
    updatePost: builder.mutation<CreatePostResponse, { postId: number | string; data: UpdatePostRequest }>({
      query: ({ postId, data }) => {
        const formData = new FormData();
        if (data.title) {
          formData.append("title", data.title);
        }
        if (typeof data.content === "string") {
          formData.append("content", data.content);
        }
        if (typeof data.link === "string" && data.link.trim().length > 0) {
          formData.append("link", data.link);
        }
        if (Array.isArray(data.tags) && data.tags.length > 0) {
          formData.append("tags", JSON.stringify(data.tags));
        }
        if (Array.isArray(data.media_files)) {
          data.media_files.forEach((file) =>
            formData.append("media_files", file)
          );
        }
        if (data.community !== undefined) {
          formData.append("community", data.community.toString());
        }
        if (data.post_type) {
          formData.append("post_type", data.post_type.toString());
        }
        return {
          url: `/api/posts/${postId}/`,
          method: "PATCH",
          body: formData,
        };
      },
      async onQueryStarted({ postId, data }, { dispatch, queryFulfilled }) {
        // Optimistically update post in cache
        const updatePostInCache = (draft: GetPostsResponse) => {
          const updatePost = (posts: PostItem[] | undefined) => {
            if (!posts) return;
            const post = posts.find((p) => p.id === postId);
            if (post) {
              if (data.title) post.title = data.title;
              if (data.content !== undefined) post.content = data.content;
              if (data.tags) post.tags = data.tags;
              if (data.link) post.link = data.link;
            }
          };
          if (draft.posts) updatePost(draft.posts);
          if (draft.data) updatePost(draft.data);
          if (draft.results) {
            if (Array.isArray(draft.results)) {
              updatePost(draft.results);
            } else if (draft.results.data) {
              updatePost(draft.results.data);
            }
          }
        };

        const patchResults = [
          dispatch(postApi.util.updateQueryData("getNewsFeed", undefined, updatePostInCache)),
          dispatch(postApi.util.updateQueryData("getMyPosts", undefined, updatePostInCache)),
        ];

        try {
          await queryFulfilled;
          // Invalidate Communities cache if post status might have changed
          dispatch(postApi.util.invalidateTags(["Communities"]));
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: ["Communities"],
    }),
    deletePost: builder.mutation<void, { postId: number | string }>({
      query: ({ postId }) => ({
        url: `/api/posts/${postId}/`,
        method: "DELETE",
      }),
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        // Optimistically remove post from cache
        const removePostFromCache = (draft: GetPostsResponse) => {
          const removePost = (posts: PostItem[] | undefined) => {
            if (!posts) return;
            const index = posts.findIndex((p) => p.id === postId);
            if (index !== -1) {
              posts.splice(index, 1);
            }
          };
          if (draft.posts) removePost(draft.posts);
          if (draft.data) removePost(draft.data);
          if (draft.results) {
            if (Array.isArray(draft.results)) {
              removePost(draft.results);
            } else if (draft.results.data) {
              removePost(draft.results.data);
            }
          }
        };

        const patchResults = [
          dispatch(postApi.util.updateQueryData("getNewsFeed", undefined, removePostFromCache)),
          dispatch(postApi.util.updateQueryData("getMyPosts", undefined, removePostFromCache)),
          dispatch(postApi.util.updateQueryData("getAllPosts", undefined, removePostFromCache)),
          dispatch(postApi.util.updateQueryData("getRejectedPosts", undefined, removePostFromCache)),
        ];

        try {
          await queryFulfilled;
          // Invalidate queries to refetch and ensure data is up to date
          dispatch(postApi.util.invalidateTags([{ type: 'UserProfile' }]));
          // Invalidate Communities cache to update posts_count
          dispatch(postApi.util.invalidateTags(["Communities"]));
          // Also directly refetch queries to ensure instant update
          dispatch(postApi.endpoints.getMyPosts.initiate(undefined, { forceRefetch: true }));
          dispatch(postApi.endpoints.getAllPosts.initiate(undefined, { forceRefetch: true }));
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),
    getMyPosts: builder.query<GetPostsResponse, void>({
      query: () => ({
        url: "/api/posts/my_posts/",
        method: "GET",
      }),
      providesTags: () => [{ type: 'UserProfile' }],
    }),
    getNewsFeed: builder.query<GetPostsResponse, void>({
      query: () => ({
        url: "/api/posts/news_feed/",
        method: "GET",
      }),
    }),
    getAllPosts: builder.query<GetPostsResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && typeof params === 'object') {
          if (params.page) searchParams.append('page', params.page.toString());
          if (params.limit) searchParams.append('limit', params.limit.toString());
        }
        const queryString = searchParams.toString();
        return {
          url: `/api/posts/${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      providesTags: ["UserProfile"],
    }),
    getRejectedPosts: builder.query<GetPostsResponse, void>({
      query: () => ({
        url: "/api/posts/?status=rejected",
        method: "GET",
      }),
      providesTags: ["UserProfile"],
    }),
    getCommunityPosts: builder.query<GetPostsResponse, string>({
      query: (communityName) => ({
        url: `/api/posts/community_posts/?community=${communityName}`,
        method: "GET",
      }),
    }),
    getPostById: builder.query<{ success?: boolean; message?: string; data?: PostItem }, number | string>({
      query: (postId) => ({
        url: `/api/posts/${postId}/`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [{ type: 'UserProfile', id: postId }],
    }),
    approvePost: builder.mutation<{ success?: boolean; message?: string; data?: PostItem }, { postId: number | string }>({
      query: ({ postId }) => ({
        url: `/api/posts/${postId}/approve/`,
        method: "POST",
      }),
      invalidatesTags: () => [{ type: 'UserProfile' }],
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
          if (draft.results) {
            if (Array.isArray(draft.results)) {
              updatePost(draft.results);
            } else if (draft.results.data) {
              updatePost(draft.results.data);
            }
          }
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
              
              const baseUrl = getApiBaseUrl();
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
            if (draft.results) {
              if (Array.isArray(draft.results)) {
                updatePost(draft.results);
              } else if (draft.results.data) {
                updatePost(draft.results.data);
              }
            }
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
            if (draft.results) {
              if (Array.isArray(draft.results)) {
                updatePost(draft.results);
              } else if (draft.results.data) {
                updatePost(draft.results.data);
              }
            }
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
        url: `/api/follows/`,
        method: "POST",
        body: { following: userId },
      }),
      invalidatesTags: () => [{ type: 'Followers' }],
    }),
    unfollowUser: builder.mutation<{ success?: boolean; message?: string; [key: string]: unknown }, { followingId: number | string }>({
      query: ({ followingId }) => ({
        url: `/api/follows/${followingId}/`,
        method: "DELETE",
        body: { following: 0 },
      }),
      invalidatesTags: () => [{ type: 'Followers' }],
    }),
    getFollowing: builder.query<GetFollowersResponse, void>({
      query: () => ({
        url: `/api/follows/?following=true`,
        method: "GET",
      }),
      providesTags: () => [{ type: 'Followers' }],
    }),
    getFollowers: builder.query<GetFollowersResponse, void>({
      query: () => ({
        url: `/api/follows/?followers=true`,
        method: "GET",
      }),
      providesTags: () => [{ type: 'Followers' }],
    }),
    getSuggestions: builder.query<GetSuggestionsResponse, void>({
      query: () => ({
        url: `/api/follows/suggestions/`,
        method: "GET",
      }),
      providesTags: () => [{ type: 'Followers' }],
    }),
    reportPost: builder.mutation<{ success?: boolean; message?: string; data?: unknown }, { postId: number | string; reason: string; description?: string }>({
      query: ({ postId, reason, description }) => ({
        url: `/api/post-reports/`,
        method: "POST",
        body: { post: postId, reason, description },
      }),
    }),
    getPostReports: builder.query<{ data?: PostReportItem[]; results?: { data?: PostReportItem[] } }, void>({
      query: () => ({
        url: `/api/post-reports/`,
        method: "GET",
      }),
      providesTags: () => [{ type: 'PostReports' }],
    }),
    reviewReport: builder.mutation<{ success?: boolean; message?: string; data?: PostReportItem }, { reportId: number | string; status: 'reviewed' | 'resolved' | 'dismissed' }>({
      query: ({ reportId, status }) => ({
        url: `/api/post-reports/${reportId}/review/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: () => [{ type: 'PostReports' }, { type: 'UnifiedReports' }],
    }),
    getUnifiedReports: builder.query<{ 
      data?: UnifiedReportItem[]; 
      results?: UnifiedReportItem[] | { data?: UnifiedReportItem[] };
      count?: number; 
      success?: boolean; 
      message?: string 
    }, void>({
      query: () => ({
        url: `/api/reports/all/`,
        method: "GET",
      }),
      providesTags: () => [{ type: 'UnifiedReports' }],
    }),
    reviewUnifiedReport: builder.mutation<{ success?: boolean; message?: string; data?: unknown }, { reportId: number | string; reportType: 'post' | 'user'; status: 'reviewed' | 'resolved' | 'dismissed' }>({
      query: ({ reportId, reportType, status }) => {
        if (reportType === 'post') {
          return {
            url: `/api/post-reports/${reportId}/review/`,
            method: "PATCH",
            body: { status },
          };
        } else {
          return {
            url: `/api/chat/reports/${reportId}/update/`,
            method: "PATCH",
            body: { status },
          };
        }
      },
      invalidatesTags: () => [{ type: 'PostReports' }, { type: 'UserReports' }, { type: 'UnifiedReports' }],
    }),
  }),
});

export interface PostReportItem {
  id?: number | string;
  reporter?: number | string | {
    id?: number | string;
    username?: string;
    display_name?: string;
    avatar?: string;
  };
  reporter_name?: string;
  reporter_id?: number | string;
  post?: number | string;
  post_id?: number | string;
  post_title?: string;
  post_author?: string;
  reason?: string;
  description?: string;
  status?: string;
  reviewed_by?: number | string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface UnifiedReportItem extends PostReportItem {
  report_type?: 'post' | 'user';
  type_label?: string;
  // User report specific fields
  reported_user?: {
    id?: number | string;
    username?: string;
    display_name?: string;
    avatar?: string;
  };
  reported_user_id?: number | string;
  admin_notes?: string;
}

export const { 
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetMyPostsQuery, 
  useGetNewsFeedQuery,
  useGetAllPostsQuery,
  useGetRejectedPostsQuery,
  useGetCommunityPostsQuery,
  useLikePostMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowingQuery,
  useGetFollowersQuery,
  useGetSuggestionsQuery,
  useReportPostMutation,
  useGetPostReportsQuery,
  useReviewReportMutation,
  useGetUnifiedReportsQuery,
  useReviewUnifiedReportMutation,
  useGetPostByIdQuery,
  useApprovePostMutation,
} = postApi;