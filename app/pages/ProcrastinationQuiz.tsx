import { useState } from "react";
import { Link } from "react-router";
import { NudgeLogo } from "~/components/NudgeLogo";
import { quizQuestions, quizResults } from "~/data/mockData";

export function ProcrastinationQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Simple result calculation - in real app would be more sophisticated
      const resultType = ["perfectionist", "overwhelmed", "avoider", "dreamer", "busy"][
        Math.floor(Math.random() * 5)
      ] as keyof typeof quizResults;
      setResult(resultType);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    const resultData = quizResults[result as keyof typeof quizResults];
    return (
      <div className="min-h-screen bg-cream px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link to="/">
              <NudgeLogo variant="light" />
            </Link>
          </div>

          <div className="bg-linen rounded-2xl p-8 mb-8">
            <h1 className="text-4xl mb-4" style={{ fontWeight: 700 }}>
              {resultData.name}
            </h1>
            <p className="text-xl text-espresso/80 mb-8 leading-relaxed">
              {resultData.description}
            </p>
            <Link
              to="/app"
              className="inline-block px-8 py-4 bg-ink text-cream rounded-2xl hover:opacity-90 transition-opacity"
              style={{ fontWeight: 600 }}
            >
              Try Nudge — built for {resultData.name}s
            </Link>
          </div>

          <button
            onClick={resetQuiz}
            className="text-stone hover:text-espresso transition-colors"
          >
            Retake quiz
          </button>

          {/* SEO Article Placeholder */}
          <div className="mt-16 prose prose-lg">
            <h2 className="text-2xl mb-4" style={{ fontWeight: 600 }}>
              Understanding Your Procrastination Type
            </h2>
            <p className="text-espresso/80 leading-relaxed mb-4">
              Everyone procrastinates, but not everyone procrastinates the same way. Understanding your procrastination type helps you build systems that work with your tendencies, not against them.
            </p>
            <p className="text-espresso/80 leading-relaxed mb-4">
              The key is recognizing that procrastination isn't laziness — it's often a mismatch between how your brain wants to work and how you're asking it to work. Tools like Nudge help bridge that gap by providing structure, reasoning, and gentle accountability.
            </p>
            <p className="text-espresso/80 leading-relaxed">
              Whether you're a perfectionist who needs permission to start imperfectly, or someone who's overwhelmed and needs clear priorities, the right system can transform how you get things done.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/">
            <NudgeLogo variant="light" />
          </Link>
          <span className="text-stone">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
        </div>

        <div className="mb-8">
          <div className="h-2 bg-linen rounded-full overflow-hidden">
            <div
              className="h-full bg-orange transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <h2 className="text-3xl mb-8" style={{ fontWeight: 600 }}>
          {question.question}
        </h2>

        <div className="space-y-4">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full p-6 bg-linen rounded-2xl text-left hover:bg-parchment transition-colors"
            >
              <p className="text-lg">{option}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}