import { baseApi } from "./baseApi";

export interface MarketplaceSubcategory {
  id: number;
  name: string;
}

export interface MarketplaceCategory {
  id: number;
  name: string;
  subcategories: MarketplaceSubcategory[];
}

export interface GetMarketplaceCategoriesResponse {
  success?: boolean;
  message?: string;
  data?: MarketplaceCategory[];
  results?: {
    data?: MarketplaceCategory[];
  };
  [key: string]: unknown;
}

export interface MarketplaceItem {
  id: number | string;
  title?: string;
  description?: string;
  price?: number | string;
  image?: string;
  images?: string[];
  category?: string;
  category_name?: string;
  subcategory?: string;
  subcategory_name?: string;
  sub_category_name?: string;
  seller?: {
    id?: number | string;
    username?: string;
    display_name?: string;
    avatar?: string;
  };
  created_at?: string;
  updated_at?: string;
  condition?: string;
  location?: string;
  [key: string]: unknown;
}

export interface GetMarketplaceItemsResponse {
  data?: MarketplaceItem[];
  results?: {
    data?: MarketplaceItem[];
  };
  items?: MarketplaceItem[];
  [key: string]: unknown;
}

export interface CreateProductRequest {
  name: string;
  image: File;
  price: string;
  condition: string;
  status: "draft" | "published";
  sub_category: number;
  color?: string;
  description?: string;
  location?: string;
}

export interface CreateProductResponse {
  id?: number | string;
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

export interface CreateMarketplaceCategoryRequest {
  name: string;
}

export interface CreateMarketplaceCategoryResponse {
  success: boolean;
  message: string;
  data?: MarketplaceCategory;
  [key: string]: unknown;
}

export interface UpdateMarketplaceCategoryRequest {
  id: number;
  name: string;
}

export interface CreateMarketplaceSubcategoryRequest {
  category: number;
  name: string;
}

export interface CreateMarketplaceSubcategoryResponse {
  success: boolean;
  message: string;
  data?: MarketplaceSubcategory;
  [key: string]: unknown;
}

export interface UpdateMarketplaceSubcategoryRequest {
  id: number;
  name: string;
  category?: number;
}

export const marketplaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMarketplaceItems: builder.query<GetMarketplaceItemsResponse, { category?: string; subcategory?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.category) {
          queryParams.append("category", params.category);
        }
        if (params?.subcategory) {
          queryParams.append("subcategory", params.subcategory);
        }
        const queryString = queryParams.toString();
        return {
          url: `/api/marketplace/items/${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
    }),
    createProduct: builder.mutation<CreateProductResponse, CreateProductRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("image", data.image);
        formData.append("price", data.price);
        formData.append("condition", data.condition);
        formData.append("status", data.status);
        formData.append("sub_category", data.sub_category.toString());
        if (data.color) {
          formData.append("color", data.color);
        }
        if (data.description) {
          formData.append("description", data.description);
        }
        if (data.location) {
          formData.append("location", data.location);
        }
        return {
          url: "/api/marketplace/items/",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: () => [{ type: 'Followers' }],
    }),
    getMarketplaceCategories: builder.query<GetMarketplaceCategoriesResponse, void>({
      query: () => ({
        url: "/api/marketplace/categories",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),
    createMarketplaceCategory: builder.mutation<CreateMarketplaceCategoryResponse, CreateMarketplaceCategoryRequest>({
      query: (data) => ({
        url: "/api/marketplace/categories/",
        method: "POST",
        body: { name: data.name },
      }),
      invalidatesTags: ["Categories"],
    }),
    updateMarketplaceCategory: builder.mutation<CreateMarketplaceCategoryResponse, UpdateMarketplaceCategoryRequest>({
      query: (data) => ({
        url: `/api/marketplace/categories/${data.id}/`,
        method: "PUT",
        body: { name: data.name },
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteMarketplaceCategory: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/api/marketplace/categories/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
    createMarketplaceSubcategory: builder.mutation<CreateMarketplaceSubcategoryResponse, CreateMarketplaceSubcategoryRequest>({
      query: (data) => ({
        url: "/api/marketplace/subcategories/",
        method: "POST",
        body: {
          category: data.category,
          name: data.name,
        },
      }),
      invalidatesTags: ["Categories"],
    }),
    updateMarketplaceSubcategory: builder.mutation<CreateMarketplaceSubcategoryResponse, UpdateMarketplaceSubcategoryRequest>({
      query: (data) => ({
        url: `/api/marketplace/subcategories/${data.id}/`,
        method: "PUT",
        body: {
          name: data.name,
          ...(data.category && { category: data.category }),
        },
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteMarketplaceSubcategory: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/api/marketplace/subcategories/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const { 
  useGetMarketplaceItemsQuery, 
  useCreateProductMutation,
  useGetMarketplaceCategoriesQuery,
  useCreateMarketplaceCategoryMutation,
  useUpdateMarketplaceCategoryMutation,
  useDeleteMarketplaceCategoryMutation,
  useCreateMarketplaceSubcategoryMutation,
  useUpdateMarketplaceSubcategoryMutation,
  useDeleteMarketplaceSubcategoryMutation,
} = marketplaceApi;

