 "use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useGetUsersQuery, User, useBlockUserMutation, useUnblockUserMutation, useDeleteUserMutation } from "@/store/authApi";
import { CustomTable, Column } from "@/components/admin/CustomTable";
import { IoPersonOutline } from "react-icons/io5";
import { getApiBaseUrl } from "@/lib/utils";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { Ban, Trash2, UserCheck } from "lucide-react";

export default function UserManagementTable() {
  const { data, isLoading, isError } = useGetUsersQuery();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users = useMemo(() => {
    if (!data) return [];
    return (
      data.data ??
      data.results?.data ??
      data.users ??
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

  const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    const baseUrl = getApiBaseUrl();
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = avatar.startsWith("/") ? avatar.slice(1) : avatar;
    return `${cleanBase}/${cleanPath}`;
  };

  const handleBlockUser = async () => {
    if (!selectedUser?.id) return;
    try {
      const result = await blockUser({ userId: selectedUser.id }).unwrap();
      if (result.success) {
        toast.success(result.message || "User blocked successfully");
        setBlockDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.error || error?.message || "Failed to block user");
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedUser?.id) return;
    try {
      const result = await unblockUser({ userId: selectedUser.id }).unwrap();
      if (result.success) {
        toast.success(result.message || "User unblocked successfully");
        setUnblockDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.error || error?.message || "Failed to unblock user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?.id) return;
    try {
      const result = await deleteUser({ userId: selectedUser.id }).unwrap();
      if (result.success) {
        toast.success(result.message || "User deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.error || error?.message || "Failed to delete user");
    }
  };

  type UserRow = User;

  const columns: Column<UserRow>[] = [
    {
      header: "SL",
      accessor: (_row, index) => <span>{index + 1}.</span>,
    },
    {
      header: "Avatar",
      accessor: (row) => {
        const avatarUrl = getAvatarUrl((row as { avatar?: string | null }).avatar);
        return (
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-slate-800 flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={row.display_name || row.username || "User"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <IoPersonOutline className="w-6 h-6 text-white" />
            )}
          </div>
        );
      },
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
        <div className="max-w-xs truncate" title={row.display_name || row.username || "N/A"}>
          {row.display_name || row.username || "N/A"}
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
      accessor: (row) => <span>{formatDate((row as { date_joined?: string }).date_joined)}</span>,
    },
    {
      header: "Posts",
      accessor: (row) => <span>{(row as { posts_count?: number }).posts_count ?? 0}</span>,
    },
    {
      header: "Interests",
      accessor: (row) => <span>{(row as { interests_count?: number }).interests_count ?? 0}</span>,
    },
    {
      header: "Actions",
      accessor: (row) => {
        const isActive = row.is_active !== false;
        const isAdmin = row.role === 'admin';
        const userRow = row as User & { id?: number | string };
        
        return (
          <div className="flex items-center gap-2 justify-center">
            {isActive ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(row);
                  setBlockDialogOpen(true);
                }}
                disabled={isAdmin}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors ${
                  isAdmin
                    ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                    : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                }`}
                title={isAdmin ? "Cannot block admin users" : "Block User"}
              >
                <Ban className="w-4 h-4" />
                Block
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(row);
                  setUnblockDialogOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors flex items-center gap-1.5 text-sm"
                title="Unblock User"
              >
                <UserCheck className="w-4 h-4" />
                Unblock
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(row);
                setDeleteDialogOpen(true);
              }}
              disabled={isAdmin}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors ${
                isAdmin
                  ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                  : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
              }`}
              title={isAdmin ? "Cannot delete admin users" : "Delete User"}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        );
      },
      className: "text-center",
    },
  ];

  if (isLoading) {
    return (
      <div>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-semibold text-center text-white mb-8">All Users</h2>
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
        title="All Users"
        columns={columns}
        data={users}
        emptyMessage="No users found."
        isError={isError}
        errorMessage="Failed to load users. Please try again later."
      />
      
      {/* Block User Confirmation Dialog */}
      <ConfirmDialog
        open={blockDialogOpen}
        title="Block User"
        description={`Are you sure you want to block ${selectedUser?.username || "this user"}? They will not be able to access the platform.`}
        confirmLabel="Block User"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleBlockUser}
        onCancel={() => {
          setBlockDialogOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Unblock User Confirmation Dialog */}
      <ConfirmDialog
        open={unblockDialogOpen}
        title="Unblock User"
        description={`Are you sure you want to unblock ${selectedUser?.username || "this user"}? They will be able to access the platform again.`}
        confirmLabel="Unblock User"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={handleUnblockUser}
        onCancel={() => {
          setUnblockDialogOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to permanently delete ${selectedUser?.username || "this user"}? This action cannot be undone and will delete all associated data.`}
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}

