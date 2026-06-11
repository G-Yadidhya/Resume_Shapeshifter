import { z } from "zod";

const scoreField = z.number().min(0).max(100);

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export const ImportanceSchema = z.enum(["high", "medium", "low"]);
export const TailoringRunStatusSchema = z.enum([
  "pending",
  "complete",
  "failed",
]);

export const ContactInfoSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().optional(),
  website: z.string().optional(),
});

export const ExperienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()),
});

export const ProjectEntrySchema = z.object({
  name: z.string(),
  description: z.string().default(""),
  bullets: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

export const EducationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().default(""),
  endDate: z.string().default(""),
});

export const CertificationEntrySchema = z.object({
  name: z.string(),
  issuer: z.string().default(""),
  date: z.string().default(""),
});

export const ResumeProfileSchema = z.object({
  contact: ContactInfoSchema,
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceEntrySchema).default([]),
  projects: z.array(ProjectEntrySchema).default([]),
  education: z.array(EducationEntrySchema).default([]),
  certifications: z.array(CertificationEntrySchema).default([]),
  rawText: z.string().optional(),
});

export const JobDescriptionProfileSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  seniorityLevel: z.string().default(""),
  domainSignals: z.array(z.string()).default([]),
});

export const MatchScoreSchema = z.object({
  overallScore: scoreField,
  skillCoverageScore: scoreField,
  responsibilityAlignmentScore: scoreField,
  keywordScore: scoreField,
  seniorityScore: scoreField,
  criticalMissingRequirements: z.array(z.string()).default([]),
  explanation: z.string(),
});

export const TailoredBulletSchema = z.object({
  original: z.string(),
  tailored: z.string(),
  changeReason: z.string(),
  keywordsAddressed: z.array(z.string()).default([]),
  confidence: ConfidenceSchema,
  riskFlag: z.string().nullable().optional().default(null),
});

export const TailoredExperienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  bullets: z.array(TailoredBulletSchema),
});

export const TailoredProjectEntrySchema = z.object({
  name: z.string(),
  bullets: z.array(TailoredBulletSchema),
});

export const TailoredResumeSchema = z.object({
  tailoredSummary: z.string(),
  tailoredSkills: z.array(z.string()).default([]),
  tailoredExperience: z.array(TailoredExperienceEntrySchema).default([]),
  tailoredProjects: z.array(TailoredProjectEntrySchema).optional(),
});

export const GapSchema = z.object({
  name: z.string(),
  importance: ImportanceSchema,
  jdEvidence: z.string(),
  resumeEvidence: z.string(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
});

export const GapAnalysisSchema = z.object({
  gaps: z.array(GapSchema).default([]),
});

export const TailoringRunSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  resume: ResumeProfileSchema,
  jobDescription: JobDescriptionProfileSchema,
  originalScore: MatchScoreSchema,
  tailoredScore: MatchScoreSchema,
  gaps: GapAnalysisSchema,
  tailored: TailoredResumeSchema,
  status: TailoringRunStatusSchema,
   guardrailWarnings: z.array(z.string()).default([]),
   blockedForExport: z.boolean().default(false),
   exportUrls: z
     .object({
       tailoredPdf: z.string().optional(),
       comparisonPdf: z.string().optional(),
     })
     .optional(),
});

export const TailorRequestSchema = z.object({
  resume: z.object({
    type: z.literal("text"),
    content: z.string(),
  }),
  jobDescription: z.string(),
});

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;
export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;
export type JobDescriptionProfile = z.infer<typeof JobDescriptionProfileSchema>;
export type MatchScore = z.infer<typeof MatchScoreSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export type TailoredBullet = z.infer<typeof TailoredBulletSchema>;
export type TailoredExperienceEntry = z.infer<
  typeof TailoredExperienceEntrySchema
>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
export type Gap = z.infer<typeof GapSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;
export type TailoringRun = z.infer<typeof TailoringRunSchema>;
export type TailorRequest = z.infer<typeof TailorRequestSchema>;
