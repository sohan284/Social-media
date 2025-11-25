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
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation, useSetCredentialsMutation, useLoginMutation } = authApi;

