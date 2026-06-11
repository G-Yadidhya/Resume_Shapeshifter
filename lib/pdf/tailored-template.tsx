import React from "react";
import type { TailoringRun } from "@/lib/schemas";

type Props = { run: TailoringRun };

export default function TailoredTemplate({ run }: Props) {
  return (
    <div style={{ fontFamily: "Inter, Roboto, system-ui, sans-serif", padding: 24 }}>
      <header style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Tailored Resume</h1>
        <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>For: {run.jobDescription.jobTitle}</div>
        <div style={{ color: "#999", fontSize: 10, marginTop: 2 }}>Generated: {new Date(run.createdAt).toLocaleString()}</div>
      </header>

      <section style={{ marginTop: 12 }}>
        <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, borderBottom: "1px solid #ccc", paddingBottom: 4 }}>Professional Experience</h2>
        {run.tailored?.tailoredExperience?.map((exp, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{exp.company}</div>
            <div style={{ fontStyle: "italic", color: "#555", fontSize: 11 }}>{exp.title}</div>
            <ul style={{ marginTop: 4, marginLeft: 18, marginBottom: 0 }}>
              {exp.bullets.map((b, bi) => (
                <li key={bi} style={{ marginBottom: 4, fontSize: 11, lineHeight: 1.4 }}>{b.tailored}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {run.resume.education && run.resume.education.length > 0 && (
        <section style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, borderBottom: "1px solid #ccc", paddingBottom: 4 }}>Education</h2>
          {run.resume.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 6, fontSize: 11 }}>
              <strong>{edu.institution}</strong> — {edu.degree} {edu.field ? `in ${edu.field}` : ""}
            </div>
          ))}
        </section>
      )}

      <div style={{ marginTop: 16, fontSize: 9, color: "#999", borderTop: "1px solid #eee", paddingTop: 8 }}>
        <strong>Score Improvement:</strong> {run.originalScore.overallScore} → {run.tailoredScore.overallScore}
      </div>
      <footer style={{ marginTop: 8, fontSize: 10, color: "#666", lineHeight: 1.4 }}>
        <div><strong>Disclaimer:</strong> This tailored resume was generated to improve alignment with the job description. Review all content for accuracy and truthfulness before submission.</div>
      </footer>
    </div>
  );
}
