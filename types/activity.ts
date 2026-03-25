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

export interface LearningHistory {
  lessonCompletions: LessonCompletionRecord[];
  quizAttempts: QuizAttemptRecord[];
}
