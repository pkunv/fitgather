import { api } from "@/trpc/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function ProceedRedirectPage() {
  // We directly use Kinde Auth function instead of tRPC calls
  // to return ctx.session for better response time.
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated === null) return redirect("/");
  await api.user.signIn();

  redirect("/");
}
