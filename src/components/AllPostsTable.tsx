"use client";
import { useMemo } from "react";
import { useGetAllPostsQuery, PostItem } from "@/store/postApi";
import { CustomTable, Column } from "@/components/admin/CustomTable";
import { getApiBaseUrl } from "@/lib/utils";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";

export default function AllPostsTable() {
  const { data, isLoading, isError } = useGetAllPostsQuery();

  const posts = useMemo(() => {
    if (!data) return [];
    return (
      data.data ??
      data.results?.data ??
      data.posts ??
      []
    );
  }, [data]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getImageUrl = (image: string | undefined) => {
    if (!image) return "/sheep.jpg";
    if (image.startsWith("http")) return image;
    const baseUrl = getApiBaseUrl();
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = image.startsWith("/") ? image.slice(1) : image;
    return `${cleanBase}/${cleanPath}`;
  };

  type PostRow = PostItem;

  const columns: Column<PostRow>[] = [
    {
      header: "SL",
      accessor: (row, index) => <span>{index + 1}.</span>,
    },
    {
      header: "Post Head",
      accessor: (row) => (
        <div className="max-w-xs truncate" title={row.title || "N/A"}>
          {row.title || "N/A"}
        </div>
      ),
    },
    {
      header: "Author",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.author?.avatar || row.media?.[0] ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={getImageUrl(row.author?.avatar || row.media?.[0])}
                alt={row.author?.name || row.author?.username || row.username || "User"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <span className="max-w-xs truncate">
            {row.author?.name || row.author?.username || row.username || row.user_name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Post Date",
      accessor: (row) => <span>{formatDate(row.created_at)}</span>,
    },
    {
      header: "Status",
      accessor: (row) => {
        const status = (row as { status?: string }).status || "pending";
        const statusColors: Record<string, { bg: string; text: string }> = {
          approved: { bg: "bg-green-500/20", text: "text-green-300" },
          rejected: { bg: "bg-red-500/20", text: "text-red-300" },
          pending: { bg: "bg-yellow-500/20", text: "text-yellow-300" },
        };
        const colors = statusColors[status.toLowerCase()] || statusColors.pending;
        return (
          <div className="flex items-center justify-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        );
      },
      className: "text-center",
    },
    {
      header: "Likes",
      accessor: (row) => (
        <span className="text-center">{row.likes_count || 0}</span>
      ),
      className: "text-center",
    },
    {
      header: "Comments",
      accessor: (row) => (
        <span className="text-center">{row.comments_count || 0}</span>
      ),
      className: "text-center",
    },
    {
      header: "Actions",
      accessor: (_row) => (
        <div className="flex items-center justify-center space-x-3">
          <button
            className="p-2 cursor-pointer text-blue-400 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Edit post"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 cursor-pointer text-red-500 rounded-lg bg-white/10 hover:bg-white/20 transition"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: "text-center",
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full p-6 border bg-black/30 backdrop-blur-sm rounded-xl border-white/20">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-semibold text-center text-white mb-8">All Posts</h2>
        </div>
        <div className="animate-pulse space-y-4 mt-8">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-20 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <CustomTable
        title="All Posts"
        columns={columns}
        data={posts}
        emptyMessage="No posts found."
        isError={isError}
        errorMessage="Failed to load posts. Please try again later."
      />
    </div>
  );
}
