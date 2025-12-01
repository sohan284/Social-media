import { baseApi } from "./baseApi";

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message?: string;
  success?: boolean;
  // Add other response fields as needed based on your API
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface VerifyOtpResponse {
  message?: string;
  success?: boolean;
  // Add other response fields as needed based on your API
}

export interface SetCredentialsRequest {
  email: string;
  username: string;
  password: string;
}

export interface SetCredentialsResponse {
  message?: string;
  success?: boolean;
  token?: string;
  tokens?: {
    access: string;
    refresh: string;
  };
  // Add other response fields as needed based on your API
}

export interface LoginRequest {
  email_or_username: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  success?: boolean;
  token?: string;
  tokens?: {
    access: string;
    refresh: string;
  };
  user?: {
    id?: string | number;
    email?: string;
    username?: string;
    role?: string;
    [key: string]: unknown;
  };
  // Add other response fields as needed based on your API
}

export interface UserProfile {
  id?: string | number;
  email?: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  avatar?: string;
  display_name?: string | null;
  about?: string | null;
  social_link?: string | null;
  cover_photo?: string | null;
  [key: string]: unknown;
}

export interface UserProfileResponse {
  data: UserProfile;
  message?: string;
}

export interface UpdateUserProfileRequest {
  display_name?: string;
  about?: string;
  social_link?: string;
  avatar?: File | null;
  cover_photo?: File | null;
  subcategory_ids?: number[];
}

export interface Subcategory {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

export interface CategoriesResponse {
  data: Category[];
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation<SendOtpResponse, SendOtpRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append("email", data.email);
        
        return {
          url: "/auth/send-otp/",
          method: "POST",
          body: formData,
        };
      },
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("code", data.code);
        
        return {
          url: "/auth/verify-otp/",
          method: "POST",
          body: formData,
        };
      },
    }),
    setCredentials: builder.mutation<SetCredentialsResponse, SetCredentialsRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("username", data.username);
        formData.append("password", data.password);
        
        return {
          url: "/auth/set-credentials/",
          method: "POST",
          body: formData,
        };
      },
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append("email_or_username", data.email_or_username);
        formData.append("password", data.password);
        
        return {
          url: "/auth/login/",
          method: "POST",
          body: formData,
        };
      },
    }),
    getCurrentUserProfile: builder.query<UserProfileResponse, void>({
      query: () => ({
        url: "/auth/user-profiles/me/",
        method: "GET",
      }),
      providesTags: ["UserProfile"],
    }),
    updateUserProfile: builder.mutation<UserProfileResponse, UpdateUserProfileRequest>({
      query: (data) => {
        const hasFileUploads = Boolean(data.avatar || data.cover_photo);
        const payload: Record<string, unknown> = {};

        if (typeof data.display_name !== "undefined") {
          payload.display_name = data.display_name;
        }
        if (typeof data.about !== "undefined") {
          payload.about = data.about;
        }
        if (typeof data.social_link !== "undefined") {
          payload.social_link = data.social_link;
        }
        if (data.subcategory_ids && data.subcategory_ids.length > 0) {
          payload.subcategories = data.subcategory_ids;
        }

        if (!hasFileUploads) {
          return {
            url: "/auth/user-profiles/update_me/",
            method: "PATCH",
            body: payload,
          };
        }

        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item.toString()));
          } else if (typeof value !== "undefined") {
            formData.append(key, String(value));
          }
        });

        if (data.avatar) {
          formData.append("avatar", data.avatar);
        }
        if (data.cover_photo) {
          formData.append("cover_photo", data.cover_photo);
        }

        return {
          url: "/auth/user-profiles/update_me/",
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["UserProfile"],
    }),
    getCategories: builder.query<CategoriesResponse, void>({
      query: () => ({
        url: "/api/categories/",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSetCredentialsMutation,
  useLoginMutation,
  useUpdateUserProfileMutation,
  useGetCategoriesQuery,
} = authApi;

export const useGetCurrentUserProfileQuery = (
  arg?: void,
  options?: Parameters<typeof authApi.endpoints.getCurrentUserProfile.useQuery>[1]
) => authApi.endpoints.getCurrentUserProfile.useQuery(arg, options);

