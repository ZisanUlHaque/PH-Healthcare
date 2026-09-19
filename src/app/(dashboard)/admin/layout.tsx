import RoleGuard from "@/components/auth/role-guard";
import { ReactNode } from "react";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["ADMIN", "SUPER_ADMIN"]}>
      {children}
    </RoleGuard>
  );
}