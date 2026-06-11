import { readFileSync } from "fs";
import { join } from "path";

const FIXTURES_DIR = join(process.cwd(), "fixtures");

function readFixture(filename: string): string {
  return readFileSync(join(FIXTURES_DIR, filename), "utf-8");
}

/** Server-side: read sample files from fixtures/ */
export function getSampleResumeText(): string {
  return readFixture("sample-resume.txt");
}

export function getSampleJobDescriptionText(): string {
  return readFixture("sample-jd.txt");
}
