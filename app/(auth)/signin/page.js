import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
