import UserManagementTable from "@/components/admin/UserManagementTable";

export default function UserManagement() {
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-semibold">User Management</h1>
      </div>

      {/* TABLE */}
      <UserManagementTable />
    </div>
  );
}

