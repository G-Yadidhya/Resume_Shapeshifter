import { Suspense } from "react";

import { TailorWizard } from "@/components/TailorWizard";

function TailorWizardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading tailor wizard…</p>
    </div>
  );
}

export default function TailorPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<TailorWizardFallback />}>
        <TailorWizard />
      </Suspense>
    </main>
  );
}
