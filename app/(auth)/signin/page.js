import { Suspense } from "react";
import SignInContent from "./SignInContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
