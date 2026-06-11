import type {
  JobDescriptionProfile,
  ResumeProfile,
  TailoredResume,
} from "@/lib/schemas";

export function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
}

export function includesTerm(text: string, term: string) {
  const normalizedText = ` ${normalizeText(text)} `;
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return false;
  return normalizedText.includes(` ${normalizedTerm} `);
}

export function resumeToSearchText(resume: ResumeProfile | TailoredResume) {
  if ("experience" in resume) {
    return [
      resume.summary,
      resume.skills.join(" "),
      resume.experience
        .flatMap((entry) => [entry.company, entry.title, ...entry.bullets])
        .join(" "),
      resume.projects
        .flatMap((project) => [
          project.name,
          project.description,
          ...project.technologies,
          ...project.bullets,
        ])
        .join(" "),
      resume.education
        .flatMap((entry) => [entry.institution, entry.degree, entry.field])
        .join(" "),
      resume.certifications
        .flatMap((entry) => [entry.name, entry.issuer])
        .join(" "),
    ].join(" ");
  }

  return [
    resume.tailoredSummary,
    resume.tailoredSkills.join(" "),
    resume.tailoredExperience
      .flatMap((entry) => [
        entry.company,
        entry.title,
        ...entry.bullets.flatMap((bullet) => [
          bullet.original,
          bullet.tailored,
          ...bullet.keywordsAddressed,
        ]),
      ])
      .join(" "),
    resume.tailoredProjects
      ?.flatMap((project) => [
        project.name,
        ...project.bullets.flatMap((bullet) => [
          bullet.original,
          bullet.tailored,
          ...bullet.keywordsAddressed,
        ]),
      ])
      .join(" ") ?? "",
  ].join(" ");
}

export function requiredTerms(jobDescription: JobDescriptionProfile) {
  return uniqueTerms([
    ...jobDescription.requiredSkills,
    ...jobDescription.tools,
  ]);
}

export function preferredTerms(jobDescription: JobDescriptionProfile) {
  return uniqueTerms(jobDescription.preferredSkills);
}

export function uniqueTerms(terms: string[]) {
  const seen = new Set<string>();
  return terms
    .map((term) => term.trim())
    .filter((term) => {
      const key = normalizeText(term);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
