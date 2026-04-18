import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  // This happens instantly on the server
  redirect("/dashboard");
}