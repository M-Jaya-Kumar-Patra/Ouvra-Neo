import { Suspense } from "react";
import RegisterWrapper from "./RegisterWrapper";
import { NeoLoader } from "@/components/ui/NeoLoader";

export default function Page() {
  return (
    <Suspense fallback={<NeoLoader label = "Loading..." fullScreen/>}>
      <RegisterWrapper />
    </Suspense>
  );
}