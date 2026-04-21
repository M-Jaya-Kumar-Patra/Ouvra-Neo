import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";
import { unstable_noStore as noStore } from "next/cache";

export default async function LoginWrapper() {
  noStore(); // ✅ required

  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return <LoginClient />;
}