import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function Page() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return <LoginClient />;
}