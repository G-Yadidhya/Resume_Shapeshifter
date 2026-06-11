/** Guardrail validator — Phase 4 */
import type {
	JobDescriptionProfile,
	ResumeProfile,
	TailoredResume,
} from "@/lib/schemas";
import { detectFlaggedBullets, detectLowConfidenceBullets, detectNewCompanies, detectNewCertifications, detectNewDegrees } from "@/lib/guardrails/detectors";
import { checkKeywordDensity } from "@/lib/guardrails/keyword-density";
import { traceMetrics } from "@/lib/guardrails/metric-tracer";

export interface GuardrailsResult {
	/** Hard violations that block export */
	blockingViolations: string[];
	/** Warnings that don't block but require acknowledgment */
	warnings: string[];
	/** Whether export is blocked */
	blockedForExport: boolean;
}

export class GuardrailsService {
	/**
	 * Run all guardrails checks
	 * Returns violations and warnings
	 */
	validate(
		original: ResumeProfile,
		tailored: TailoredResume,
		jd: JobDescriptionProfile
	): GuardrailsResult {
		const blockingViolations: string[] = [];
		const warnings: string[] = [];

		// Rule 1: New companies → BLOCK
		const newCompanies = detectNewCompanies(original, tailored);
		blockingViolations.push(...newCompanies);

		// Rule 2: New degrees/certifications → BLOCK
		const newDegrees = detectNewDegrees(original, tailored);
		blockingViolations.push(...newDegrees);

		const newCerts = detectNewCertifications(original, tailored);
		blockingViolations.push(...newCerts);

// Rule 3: Flagged bullets → WARNING (review before export)
	const flaggedBulletWarnings = detectFlaggedBullets(tailored);
	warnings.push(...flaggedBulletWarnings);

		// Rule 4: Missing metrics → WARNING
		const { warnings: metricWarnings } = traceMetrics(original, tailored);
		warnings.push(...metricWarnings);

		// Rule 5: Low confidence bullets → WARNING
		const lowConfidence = detectLowConfidenceBullets(tailored);
		warnings.push(...lowConfidence);

		// Rule 6: Keyword density → WARNING
		const densityWarnings = checkKeywordDensity(tailored, jd);
		warnings.push(...densityWarnings);

		return {
			blockingViolations,
			warnings,
			blockedForExport: blockingViolations.length > 0,
		};
	}
}
