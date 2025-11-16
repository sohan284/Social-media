import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your base API URL
// const baseUrl = "http://localhost:4000/api";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: [],
});

export const { useQuery, useMutation } = baseApi as any;