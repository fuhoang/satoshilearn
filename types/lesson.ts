export interface LessonMeta {
  slug: string;
  title: string;
  summary: string;
  duration: string;
  order: number;
  section?: string;
}

export interface Lesson extends LessonMeta {
  body: string;
}
