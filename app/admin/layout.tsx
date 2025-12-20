import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
        <p className="text-neutral-500">Admin access required.</p>
      </div>
    );
  }

  return <div>{children}</div>;
}
