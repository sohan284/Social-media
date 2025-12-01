import React from "react";
import ProtectedLayout from "../../../../components/Layouts/ProtectedLayout";
import AdminLayout from "../../../../components/Layouts/AdminLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout allowedRoles={["admin"]} fallbackRedirect="/">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedLayout>
  );
}
