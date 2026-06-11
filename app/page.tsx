import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  "Explainable match scores before and after tailoring",
  "Gap analysis with honest suggested actions",
  "Side-by-side bullet rewrites with reasons",
  "Exportable proof PDF (coming in Phase 3)",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-16">
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Resume Shapeshifter
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Tailor your resume to any job description
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance">
          Truthful bullet rewrites, match scoring, and gap analysis — so you can
          apply with confidence, not fabrication.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/tailor?demo=1">
              Run demo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/tailor">Start tailoring</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Paste your resume and a job listing, then review tailored bullets
            side by side with scores and gaps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-center text-xs">
        Phase 1 prototype — uses mock analysis data. No API key required.
      </p>
    </main>
  );
}
