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
  subcategory?: string;
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
    }),
  }),
});

export const { 
  useGetMarketplaceItemsQuery, 
  useCreateProductMutation,
  useGetMarketplaceCategoriesQuery,
} = marketplaceApi;

