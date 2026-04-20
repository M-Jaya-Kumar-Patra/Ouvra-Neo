import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RegisterClient from "./RegisterClient";

export default async function Page() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return <RegisterClient />;
}