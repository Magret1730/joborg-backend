const strongUrlKeywords = [
  "careers",
  "career",
  "jobs",
  "job",
  "greenhouse",
  "lever",
  "workday",
  "bamboohr",
  "ashby",
  "icims",
];

const strongPageKeywords = [
  "job openings",
  "open positions",
  "current openings",
  "available positions",
  "view openings",
  "join our team",
  "work with us",
  "apply now",
  "apply today",
  "employment opportunities",
  "career opportunities",
  "recruitment",
  "we are hiring",
  "now hiring",
];

const weakPageKeywords = [
  "career",
  "careers",
  "jobs",
  "hiring",
  "employment",
  "talent",
  "opportunities",
];

export type CareerPageDetectionResult = {
  isCareerPage: boolean;
  score: number;
  matchedKeywords: string[];
  reason: string;
};

export function detectCareerPage(
  url: string,
  pageText: string
): CareerPageDetectionResult {
  const lowerUrl = url.toLowerCase();
  const lowerPageText = pageText.toLowerCase();

  let score = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of strongUrlKeywords) {
    if (lowerUrl.includes(keyword)) {
      score += 3;
      matchedKeywords.push(keyword);
    }
  }

  for (const keyword of strongPageKeywords) {
    if (lowerPageText.includes(keyword)) {
      score += 4;
      matchedKeywords.push(keyword);
    }
  }

  for (const keyword of weakPageKeywords) {
    if (lowerPageText.includes(keyword)) {
      score += 1;
      matchedKeywords.push(keyword);
    }
  }

  const isCareerPage = score >= 4;

  return {
    isCareerPage,
    score,
    matchedKeywords: [...new Set(matchedKeywords)],
    reason: isCareerPage
      ? "This page appears to be a career or jobs page."
      : "This page does not appear to contain enough career-related content.",
  };
}

// const careerKeywords = [
//   "career",
//   "careers",
//   "jobs",
//   "job openings",
//   "open positions",
//   "join our team",
//   "work with us",
//   "greenhouse",
//   "lever",
//   "workday",
//   "bamboohr",
//   "ashby",
//   "icims",
//   "recruiting",
//   "vacancies",
//   "employment",
//   "opportunities",
//   "hiring",
//   "talent",
//   "recruitment",
// ];

// export function isCareerPage(url: string, pageText: string): boolean {
//   const combinedText = `${url} ${pageText}`.toLowerCase();

//   return careerKeywords.some((keyword) =>
//     combinedText.includes(keyword.toLowerCase())
//   );
// }
