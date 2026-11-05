export type Lesson = {
  objectives: string[];
  sections: { title: string; body: string }[];
  keyPoints: { label: string; explanation: string }[];
  example: { title: string; question: string; walkthrough: string; answer: string };
  misconceptions: { claim: string; correction: string }[];
  checks: { question: string; answer: string }[];
  nextStep: string;
};
export type LessonMap = Record<string, Lesson>;
