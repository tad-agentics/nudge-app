import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { NudgeLogo } from "~/components/NudgeLogo";
import {
  quizQuestions,
  quizResults,
  type QuizTypeId,
} from "~/data/mockData";
import { scoreQuizAnswers } from "~/data/quizScoring";
import { APP_START_PATH } from "~/lib/constants";

const STORAGE_KEY = "nudge-quiz-progress-v1";
const VALID_RESULT_HASH = new Set<string>(Object.keys(quizResults));

type StoredProgress = {
  currentQuestion: number;
  answers: number[];
};

function readStored(): StoredProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredProgress;
    if (
      typeof parsed.currentQuestion !== "number" ||
      !Array.isArray(parsed.answers)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(s: StoredProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function clearStored() {
  localStorage.removeItem(STORAGE_KEY);
}

function readHashType(): QuizTypeId | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace(/^#/, "").trim();
  if (VALID_RESULT_HASH.has(raw)) {
    return raw as QuizTypeId;
  }
  return null;
}

function ResultCta({ ctaPlural }: { ctaPlural: string }) {
  return (
    <Link
      to={APP_START_PATH}
      className="inline-block rounded-2xl bg-ink px-8 py-4 text-cream transition-opacity hover:opacity-90"
      style={{ fontWeight: 600 }}
    >
      Try Nudge — built for {ctaPlural}
    </Link>
  );
}

export function ProcrastinationQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizTypeId | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromHash = readHashType();
    if (fromHash) {
      setResult(fromHash);
      setHydrated(true);
      return;
    }
    const stored = readStored();
    if (stored && stored.currentQuestion >= 0 && stored.answers.length > 0) {
      if (stored.answers.length >= quizQuestions.length) {
        setAnswers(stored.answers);
        setResult(scoreQuizAnswers(stored.answers));
        clearStored();
      } else {
        setCurrentQuestion(stored.currentQuestion);
        setAnswers(stored.answers);
      }
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((q: number, ans: number[]) => {
    writeStored({ currentQuestion: q, answers: ans });
  }, []);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      persist(nextQ, newAnswers);
    } else {
      const type = scoreQuizAnswers(newAnswers);
      setResult(type);
      clearStored();
      const url = `${window.location.pathname}${window.location.search}#${type}`;
      window.history.replaceState(null, "", url);
    }
  };

  const resetQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    clearStored();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

  const shareResult = useCallback(async (typeId: QuizTypeId) => {
    const data = quizResults[typeId];
    const url = `${window.location.origin}/quiz#${typeId}`;
    const title = `${data.name} — procrastination type`;
    const text = `${data.name}: ${data.description.slice(0, 200)}…`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied — paste anywhere to share.");
    } catch {
      toast.error("Could not copy — select and copy the address bar.");
    }
  }, []);

  const resultData = useMemo(
    () => (result ? quizResults[result] : null),
    [result],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone/30 border-t-orange" />
      </div>
    );
  }

  if (result && resultData) {
    return (
      <div className="min-h-screen bg-cream px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <Link to="/">
              <NudgeLogo variant="light" />
            </Link>
          </div>

          <div className="mb-8 rounded-2xl bg-linen p-8">
            <h1 className="mb-4 text-4xl" style={{ fontWeight: 700 }}>
              {resultData.name}
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-espresso/80">
              {resultData.description}
            </p>
            <div className="mb-6 flex flex-wrap gap-3">
              <ResultCta ctaPlural={resultData.ctaPlural} />
              <button
                type="button"
                onClick={() => void shareResult(result)}
                className="inline-block rounded-2xl border-2 border-ink px-6 py-3 text-ink transition-colors hover:bg-ink hover:text-cream"
                style={{ fontWeight: 600 }}
              >
                Share result
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={resetQuiz}
            className="text-stone transition-colors hover:text-espresso"
          >
            Retake quiz
          </button>

          <article className="mt-16 space-y-4 text-espresso/80">
            <h2 className="text-2xl text-espresso" style={{ fontWeight: 600 }}>
              What type of procrastinator am I?
            </h2>
            <p className="leading-relaxed">
              People ask that question because procrastination rarely looks the same
              from the outside. Some of us delay because a task feels emotionally
              heavy — a call we do not want to make, feedback we fear, or a decision
              that still feels ambiguous. Others lean on organizing and planning
              because motion feels safer than starting real work. Some of us only
              move when a deadline catches fire, while important-but-not-urgent work
              quietly piles up. Still others say yes until the list is so long that
              choosing anything feels impossible. And many of us stall because we
              worry the output will not be good enough, so we wait for a version of
              ourselves who can do it “properly.”
            </p>
            <p className="leading-relaxed">
              A short quiz cannot replace self-knowledge, but it can give you a
              label that makes the pattern easier to talk about — and to work with.
              The goal is not shame; it is clarity. When you know whether you are
              dodging discomfort, optimizing instead of executing, living in
              urgency, drowning in volume, or holding out for perfect conditions,
              you can pick tools that match how you actually behave, not how you
              wish you behaved.
            </p>
            <h3 className="pt-2 text-xl text-espresso" style={{ fontWeight: 600 }}>
              Why a quiz helps with “procrastination quiz” searches
            </h3>
            <p className="leading-relaxed">
              Searching for a procrastination quiz usually means someone is stuck in
              a loop: they want change, but generic advice has not stuck. Structured
              questions help because they mirror the forks people hit in real life —
              urgency versus importance, comfort versus discomfort, planning versus
              doing, volume versus focus, perfection versus progress. If your result
              resonates, it is a starting point for a system. If it does not, retake
              the quiz after a few weeks; stress and workload shift which mode shows
              up most often.
            </p>
            <p className="leading-relaxed">
              Nudge is built for people who are tired of static lists that never
              tell them what to do first. It prioritizes your tasks, explains its
              reasoning in plain language, and proposes a daily plan you approve
              before anything lands on your calendar — so notifications mean
              something, and “Do next” is a decision you can trust.
            </p>
            <p className="leading-relaxed">
              If you are comparing apps, look for three things: a single next
              action (not an infinite inbox), explanations you can sanity-check
              (not a black box), and calendar integration that respects your
              attention (approve-before-write, not silent reshuffles). Those
              criteria cut through feature parity and get you back to execution
              faster than another template or color-coded tag ever will.
            </p>
          </article>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/">
            <NudgeLogo variant="light" />
          </Link>
          <span className="text-stone">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
        </div>

        <div className="mb-8">
          <div className="h-2 overflow-hidden rounded-full bg-linen">
            <div
              className="h-full bg-orange transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <h2 className="mb-8 text-3xl" style={{ fontWeight: 600 }}>
          {question.question}
        </h2>

        <div className="space-y-4">
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(i)}
              className="w-full rounded-2xl bg-linen p-6 text-left transition-colors hover:bg-parchment"
            >
              <p className="text-lg">{option}</p>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-stone">
          <Link to="/" className="text-orange underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
