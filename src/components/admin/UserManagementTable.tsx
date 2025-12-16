"use client";
import Image from "next/image";
import { useMemo } from "react";
import { useGetUsersQuery, User } from "@/store/authApi";
import { getApiBaseUrl } from "@/lib/utils";
import { CustomTable, Column } from "@/components/admin/CustomTable";

export default function UserManagementTable() {
  const { data, isLoading, isError } = useGetUsersQuery();

  const users = useMemo(() => {
    if (!data) return [];
    return (
      data.data ??
      data.results?.data ??
      data.users ??
      []
    );
  }, [data]);

  const getImageUrl = (image: string | undefined | null) => {
    if (!image) return "/sheep.jpg";
    if (image.startsWith("http")) return image;
    const baseUrl = getApiBaseUrl();
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = image.startsWith("/") ? image.slice(1) : image;
    return `${cleanBase}/${cleanPath}`;
  };

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

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  type UserRow = User;

  const columns: Column<UserRow>[] = [
    {
      header: "SL",
      accessor: (row, index) => <span>{index + 1}.</span>,
    },
    {
      header: "Avatar",
      accessor: (row) => (
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={getImageUrl(row.avatar || row.profile_image)}
            alt={row.display_name || row.username || "User"}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ),
    },
    {
      header: "Username",
      accessor: (row) => (
        <div className="max-w-xs truncate" title={row.username || "N/A"}>
          {row.username || "N/A"}
        </div>
      ),
    },
    {
      header: "Display Name",
      accessor: (row) => (
        <div className="max-w-xs truncate" title={row.display_name || "N/A"}>
          {row.display_name || "N/A"}
        </div>
      ),
    },
    {
      header: "Email",
      accessor: (row) => (
        <div className="max-w-xs truncate" title={row.email || "N/A"}>
          {row.email || "N/A"}
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (row) => (
        <span className="capitalize">{row.role || "User"}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => {
        const isActive = row.is_active !== false; // Default to true if not specified
        return (
          <div className="flex items-center justify-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
      className: "text-center",
    },
    {
      header: "Date Joined",
      accessor: (row) => <span>{formatDate(row.date_joined)}</span>,
    },
    {
      header: "Last Login",
      accessor: (row) => <span>{formatDateTime(row.last_login)}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full p-6 border bg-black/30 backdrop-blur-sm rounded-xl border-white/20">
        <h2 className="text-2xl font-semibold text-center mb-8">All Users</h2>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-20 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 border bg-black/30 backdrop-blur-sm rounded-xl border-white/20">
      <h2 className="text-2xl font-semibold text-center mb-8">All Users</h2>

      <div className="mt-8">
        <CustomTable
          columns={columns}
          data={users}
          emptyMessage="No users found."
          isError={isError}
          errorMessage="Failed to load users. Please try again later."
        />
      </div>
    </div>
  );
}

