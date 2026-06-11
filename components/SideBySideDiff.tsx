import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BulletChangeCard } from "@/components/BulletChangeCard";
import type { TailoredResume } from "@/lib/schemas";

interface SideBySideDiffProps {
  tailored: TailoredResume;
}

export function SideBySideDiff({ tailored }: SideBySideDiffProps) {
  const hasExperience = tailored.tailoredExperience.length > 0;
  const hasProjects = (tailored.tailoredProjects?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {tailored.tailoredSummary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{tailored.tailoredSummary}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Experience bullets</CardTitle>
          <CardDescription>
            Original vs tailored wording with change explanations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasExperience ? (
            <p className="text-muted-foreground text-sm">
              No experience entries to compare.
            </p>
          ) : (
            tailored.tailoredExperience.map((entry) => (
              <section key={`${entry.company}-${entry.title}`} className="space-y-3">
                <div>
                  <h3 className="font-medium">{entry.title}</h3>
                  <p className="text-muted-foreground text-sm">{entry.company}</p>
                </div>
                <div className="space-y-3">
                  {entry.bullets.map((bullet, idx) => (
                    <BulletChangeCard
                      key={`${entry.company}-${idx}`}
                      bullet={bullet}
                      unchanged={bullet.original === bullet.tailored}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </CardContent>
      </Card>

      {hasProjects && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {tailored.tailoredProjects!.map((project) => (
              <section key={project.name} className="space-y-3">
                <h3 className="font-medium">{project.name}</h3>
                <div className="space-y-3">
                  {project.bullets.map((bullet, idx) => (
                    <BulletChangeCard
                      key={`${project.name}-${idx}`}
                      bullet={bullet}
                      unchanged={bullet.original === bullet.tailored}
                    />
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
