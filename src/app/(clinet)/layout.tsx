import HomeLayout from "../../../components/Layouts/HomeLayout";
import ProtectedLayout from "../../../components/Layouts/ProtectedLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={["user"]} fallbackRedirect="/dashboard">
      <HomeLayout>{children}</HomeLayout>
    </ProtectedLayout>
  );
}
