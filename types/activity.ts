export interface LessonCompletionRecord {
  lessonSlug: string;
  lessonTitle: string;
  completedAt: string;
}

export interface QuizAttemptRecord {
  lessonSlug: string;
  lessonTitle: string;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  attemptedAt: string;
}

export interface TutorPromptRecord {
  prompt: string;
  repliedAt: string;
  responsePreview: string | null;
  topic: string | null;
}

export type ConversionEventType =
  | "locked_view"
  | "upgrade_click"
  | "checkout_start"
  | "checkout_complete";

export interface ConversionEventRecord {
  eventType: ConversionEventType;
  occurredAt: string;
  plan: "pro_monthly" | "pro_yearly" | null;
  source: string;
  targetSlug: string;
  targetTitle: string;
}

export interface LearningHistory {
  lessonCompletions: LessonCompletionRecord[];
  quizAttempts: QuizAttemptRecord[];
  tutorPrompts: TutorPromptRecord[];
  conversionEvents: ConversionEventRecord[];
}
