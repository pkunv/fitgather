import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function ProceedRedirectPage() {
  const session = await api.user.getSession();
  if (session === null) return redirect("/");
  await api.user.signIn();

  redirect("/");
}
