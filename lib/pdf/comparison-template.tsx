import React from "react";
import type { TailoringRun } from "@/lib/schemas";
import { diffBullets } from "./diff-bullets";

type Props = { run: TailoringRun };

export default function ComparisonTemplate({ run }: Props) {
  return (
    <div style={{ fontFamily: "Inter, Roboto, system-ui, sans-serif", padding: 24 }}>
      <header style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>{run.jobDescription.jobTitle ?? "Job Comparison"}</h1>
        <div style={{ color: "#666", fontSize: 12 }}>{new Date(run.createdAt).toLocaleString()}</div>
      </header>

      <section style={{ margin: "12px 0" }}>
        <strong>Scores</strong>
        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
          <div style={{ padding: 8, background: "#f3f4f6", borderRadius: 6 }}>
            <div style={{ fontSize: 12, color: "#444" }}>Original</div>
            <div style={{ fontSize: 18 }}>{run.originalScore.overallScore}</div>
          </div>
          <div style={{ padding: 8, background: "#ecfdf5", borderRadius: 6 }}>
            <div style={{ fontSize: 12, color: "#444" }}>Tailored</div>
            <div style={{ fontSize: 18 }}>{run.tailoredScore.overallScore}</div>
          </div>
        </div>
      </section>

      <section style={{ margin: "16px 0" }}>
        <strong>Job Requirements Summary</strong>
        <div style={{ marginTop: 6, fontSize: 12 }}>
          <div><strong>Title:</strong> {run.jobDescription.jobTitle}</div>
          {run.jobDescription.requiredSkills?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <strong>Required Skills:</strong> {run.jobDescription.requiredSkills.join(", ")}
            </div>
          )}
          {run.jobDescription.preferredSkills?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <strong>Preferred Skills:</strong> {run.jobDescription.preferredSkills.join(", ")}
            </div>
          )}
          {run.jobDescription.responsibilities?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <strong>Key Responsibilities:</strong>
              <ul style={{ margin: "4px 0 0 18px" }}>
                {run.jobDescription.responsibilities.slice(0, 5).map((r, i) => (
                  <li key={i} style={{ fontSize: 11 }}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {run.gaps?.gaps && run.gaps.gaps.length > 0 && (
        <section style={{ margin: "16px 0" }}>
          <strong>Gap Analysis</strong>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6, fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th style={{ textAlign: "left", padding: "4px" }}>Skill Gap</th>
                <th style={{ textAlign: "left", padding: "4px" }}>Importance</th>
                <th style={{ textAlign: "left", padding: "4px" }}>Suggested Action</th>
              </tr>
            </thead>
            <tbody>
              {run.gaps.gaps.slice(0, 8).map((g, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "4px" }}>{g.name ?? "Unknown"}</td>
                  <td style={{ padding: "4px" }}>{g.importance ?? "N/A"}</td>
                  <td style={{ padding: "4px" }}>{g.suggestedAction ?? "Review in detail"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <main style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <h2 style={{ fontSize: 14 }}>Original Resume</h2>
          {run.tailored?.tailoredExperience?.map((exp, i) => (
            <div key={`orig-${i}`} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{exp.title ?? exp.company}</div>
              <ul style={{ margin: "6px 0 0 14px" }}>
                {exp.bullets.map((b, bi) => (
                  <li key={bi} style={{ marginBottom: 4 }}>{b.original}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <h2 style={{ fontSize: 14 }}>Tailored Resume</h2>
          {run.tailored?.tailoredExperience?.map((exp, i) => (
            <div key={`tail-${i}`} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{exp.title ?? exp.company}</div>
              <ul style={{ margin: "6px 0 0 14px" }}>
                {diffBullets(exp.bullets).map((b, bi) => (
                  <li
                    key={bi}
                    style={{
                      marginBottom: 4,
                      background: b.changed ? "#FEF3C7" : "transparent",
                      padding: b.changed ? "2px 4px" : undefined,
                    }}
                  >
                    {b.tailored}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ marginTop: 20, fontSize: 11, color: "#666" }}>
        <div>Disclaimer: Tailored suggestions are generated to improve alignment with the job description. Review for truthfulness before export.</div>
      </footer>
    </div>
  );
}
/** Side-by-side comparison PDF template — Phase 3 */
export {};
