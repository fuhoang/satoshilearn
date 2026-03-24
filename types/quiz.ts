export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  reviewHref?: string;
  reviewLabel?: string;
}
