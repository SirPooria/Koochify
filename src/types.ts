export interface UserImmigrationProfile {
  fullName: string;
  age: number;
  maritalStatus: "single" | "married" | "married_with_children" | "";
  education: "diploma" | "associate" | "bachelor" | "master" | "phd" | "";
  fieldOfStudy: string;
  gpa: string;
  workExperienceYears: number;
  jobTitle: string;
  englishLevel: "none" | "basic" | "intermediate" | "advanced" | "ielts_5_6" | "ielts_6_7" | "ielts_7_plus" | "";
  otherLanguages: string;
  budgetTomans: "under_500m" | "500m_1_5b" | "1_5b_4b" | "above_4b" | "";
  immigrationCategoryPreference: "any" | "work" | "study" | "investment" | "startup_entrepreneur" | "artists_athletes" | "";
  destinationPriorities: string[];
  interestedCountries: string[]; // Countries the user prefers
  militaryStatus: "completed" | "educational_exemption" | "not_completed_no_exemption" | "exempt_or_female" | ""; // New field
  academicPapersCount: "none" | "1_2" | "3_plus" | ""; // For study migration
  academicRefLetters: "yes" | "no" | ""; // For study migration
  workStage: "just_started" | "has_cv" | "has_linkedin" | "applied_interviews" | "has_offer" | ""; // For work migration
  languageExamRegistered: "yes" | "no" | "preparing" | ""; // For tracking language timeline
  customNotes: string;
}

export interface RecommendedDestination {
  country: string;
  visaType: string;
  matchPercentage: number;
  successRate: number;
  summary: string;
  durationMonths: string;
  difficultyLevel: string;
}

export interface AIImmigrationResult {
  destinations: RecommendedDestination[];
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
  overallLawyerVerdict: string;
}
