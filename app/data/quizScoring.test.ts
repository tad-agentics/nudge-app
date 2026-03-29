import { describe, expect, it } from "vitest";

import { QUIZ_ANSWER_PRIMARY_TYPE, scoreQuizAnswers } from "./quizScoring";

describe("scoreQuizAnswers", () => {
  it("returns one of five northstar types", () => {
    const answers = [0, 1, 2, 3, 0, 1, 2, 3];
    expect(answers.length).toBe(QUIZ_ANSWER_PRIMARY_TYPE.length);
    const type = scoreQuizAnswers(answers);
    expect(type).toMatch(
      /^(avoider|optimizer|firefighter|overloader|perfectionist)$/,
    );
  });

  it("handles all zeros", () => {
    const type = scoreQuizAnswers([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(type).toBeDefined();
  });
});
