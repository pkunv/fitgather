import {
  TypographyH1,
  TypographyH2,
  TypographyMuted,
} from "@/components/ui/typography";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QueueForm } from "./queue-form";

export const metadata: Metadata = {
  title: "Admin panel",
  description: "Admin panel for managing the fitgather application.",
};

export default async function AdminPage() {
  const { getPermissions } = getKindeServerSession();
  const permissions = await getPermissions();
  const isAdmin = permissions?.permissions.includes("spatula-queue");
  if (isAdmin !== true) {
    redirect("/");
  }
  return (
    <div className="container mx-auto max-w-2xl space-y-8 py-8">
      <div>
        <TypographyH1>Admin Panel</TypographyH1>
        <TypographyMuted>Manage the fitgather application.</TypographyMuted>
      </div>

      <div className="flex flex-col gap-6 rounded-lg border bg-card p-6">
        <TypographyH2>Add to Spatula Queue</TypographyH2>
        <QueueForm />
      </div>
    </div>
  );
}
