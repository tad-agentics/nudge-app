import type { QuizTypeId } from "~/data/mockData";

/**
 * Per northstar §7c — one primary type signal per answer (8 questions × 4 options).
 * Tie-break: index order in `TIE_BREAK`.
 */
export const QUIZ_ANSWER_PRIMARY_TYPE: QuizTypeId[][] = [
  // Q1 When do you typically start working on a task?
  ["overloader", "optimizer", "firefighter", "avoider"],
  // Q2 How do you feel about your to-do list?
  ["optimizer", "overloader", "avoider", "perfectionist"],
  // Q3 What usually stops you from starting?
  ["perfectionist", "firefighter", "perfectionist", "avoider"],
  // Q4 How do you decide what to work on?
  ["firefighter", "avoider", "optimizer", "overloader"],
  // Q5 When you're stuck, what helps you most?
  ["perfectionist", "firefighter", "avoider", "avoider"],
  // Q6 How often do you reschedule tasks?
  ["optimizer", "firefighter", "firefighter", "overloader"],
  // Q7 Relationship with deadlines?
  ["optimizer", "firefighter", "firefighter", "avoider"],
  // Q8 After completing a task, you usually feel:
  ["optimizer", "avoider", "perfectionist", "overloader"],
];

const TIE_BREAK: QuizTypeId[] = [
  "avoider",
  "optimizer",
  "firefighter",
  "overloader",
  "perfectionist",
];

export function scoreQuizAnswers(answerIndices: number[]): QuizTypeId {
  const tallies: Record<QuizTypeId, number> = {
    avoider: 0,
    optimizer: 0,
    firefighter: 0,
    overloader: 0,
    perfectionist: 0,
  };

  for (let q = 0; q < answerIndices.length; q++) {
    const opt = answerIndices[q];
    const row = QUIZ_ANSWER_PRIMARY_TYPE[q];
    if (!row || opt < 0 || opt >= row.length) continue;
    const type = row[opt];
    tallies[type] += 1;
  }

  let best: QuizTypeId = "avoider";
  let max = -1;
  for (const id of TIE_BREAK) {
    const n = tallies[id];
    if (n > max) {
      max = n;
      best = id;
    }
  }
  return best;
}
