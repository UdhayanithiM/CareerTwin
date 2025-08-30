// lib/services/analysisService.ts

// Define the structure for our analysis results
export interface AnalysisResult {
  sentiment: { name: string; text: string };
  skills: { name: string; value: number }[];
  tip: string;
}

// A simple dictionary of keywords related to different skills/traits
const skillKeywords: Record<string, string[]> = {
  "Problem Solving": ["solution", "resolved", "issue", "fixed", "challenge", "optimize"],
  "Teamwork": ["team", "collaborated", "together", "helped", "colleague", "group"],
  "Leadership": ["led", "managed", "organized", "initiative", "project", "responsible"],
};

// A simple function to analyze the text based on keywords
export function analyzeText(fullText: string): Partial<AnalysisResult> {
  const updatedSkills: { name: string; value: number }[] = [];
  const textInLowerCase = fullText.toLowerCase();

  for (const skill in skillKeywords) {
    const keywords = skillKeywords[skill];
    const count = keywords.reduce((acc, keyword) => {
      // Count occurrences of each keyword
      return acc + (textInLowerCase.split(keyword).length - 1);
    }, 0);

    // Simple scoring logic: more keywords = higher score (capped at 100)
    const score = Math.min(100, count * 15);
    updatedSkills.push({ name: skill, value: score });
  }

  // We can add more logic here for sentiment and tips later.
  // For now, we just return the updated skill scores.
  return {
    skills: updatedSkills,
  };
}
