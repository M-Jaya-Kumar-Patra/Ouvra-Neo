import { Suspense } from "react";
import LoginWrapper from "./LoginWrapper";
import { NeoLoader } from "@/components/ui/NeoLoader";

export default function Page() {
  return (
    <Suspense fallback={<NeoLoader label = "Loading..." fullScreen/>}>
      <LoginWrapper />
    </Suspense>
  );
}