"use client";

import { Suspense } from "react";
import CampaignResponsesContent from "./CampaignResponsesContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CampaignResponsesContent />
    </Suspense>
  );
}
