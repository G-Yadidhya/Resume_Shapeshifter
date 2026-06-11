import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JobDescriptionProfile } from "@/lib/schemas";

interface JDRequirementsSummaryProps {
  jobDescription: JobDescriptionProfile;
}

export function JDRequirementsSummary({
  jobDescription,
}: JDRequirementsSummaryProps) {
  const companyLabel =
    jobDescription.company.trim() || "Company not specified";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {jobDescription.jobTitle || "Role"}
        </CardTitle>
        <CardDescription>
          {companyLabel}
          {jobDescription.seniorityLevel
            ? ` · ${jobDescription.seniorityLevel}`
            : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobDescription.requiredSkills.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Required skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {jobDescription.requiredSkills.map((skill) => (
                <Badge key={skill} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {jobDescription.preferredSkills.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Preferred skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {jobDescription.preferredSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {jobDescription.responsibilities.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Key responsibilities</h3>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              {jobDescription.responsibilities.slice(0, 6).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {jobDescription.tools.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Tools & technologies</h3>
            <div className="flex flex-wrap gap-1.5">
              {jobDescription.tools.map((tool) => (
                <Badge key={tool} variant="outline">
                  {tool}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
