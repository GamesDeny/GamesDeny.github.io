import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin — portfolio" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text-primary font-mono flex">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
