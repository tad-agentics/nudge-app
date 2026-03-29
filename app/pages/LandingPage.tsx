import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";

import { NudgeLogo } from "~/components/NudgeLogo";
import { useInstallPrompt } from "~/hooks/useInstallPrompt";
import { APP_START_PATH } from "~/lib/constants";
import { faqItems, testimonials } from "~/data/mockData";

function PrimaryCta({
  isStandalone,
  className,
  size = "md",
}: {
  isStandalone: boolean;
  className?: string;
  size?: "md" | "lg";
}) {
  const sizeCls =
    size === "lg"
      ? "inline-block px-8 py-4 rounded-2xl text-lg"
      : "inline-block px-8 py-4 rounded-2xl";
  if (isStandalone) {
    return (
      <Link
        to={APP_START_PATH}
        className={`${sizeCls} bg-ink text-cream hover:opacity-90 transition-opacity ${className ?? ""}`}
        style={{ fontWeight: 600 }}
      >
        Open Nudge
      </Link>
    );
  }
  return (
    <Link
      to={APP_START_PATH}
      className={`${sizeCls} bg-ink text-cream hover:opacity-90 transition-opacity ${className ?? ""}`}
      style={{ fontWeight: 600 }}
    >
      Get Nudge Free
    </Link>
  );
}

export function LandingPage() {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { canPromptInstall, promptInstall, isIOS, isStandalone } =
    useInstallPrompt();

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const structuredData = useMemo(() => {
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    const appJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Nudge",
      description:
        "Nudge prioritizes your tasks, explains its reasoning, and proposes a daily plan on your calendar.",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    };

    return [faqJsonLd, appJsonLd];
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {structuredData.map((doc, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(doc) }}
        />
      ))}

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12">
          <NudgeLogo variant="light" />
        </div>

        <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="mb-6 text-5xl" style={{ fontWeight: 800 }}>
              The app that plans your day — and tells you why.
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-espresso/80">
              Nudge prioritizes your tasks, explains its reasoning, and proposes
              a daily plan on your calendar. You approve it in 10 seconds. Then
              just start.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryCta isStandalone={isStandalone} />
              {canPromptInstall ? (
                <button
                  type="button"
                  className="inline-block rounded-2xl border-2 border-ink px-6 py-3 text-ink hover:bg-ink hover:text-cream transition-colors"
                  style={{ fontWeight: 600 }}
                  onClick={() => void promptInstall()}
                >
                  Install app
                </button>
              ) : null}
            </div>
            {isIOS && !isStandalone ? (
              <p className="mt-4 text-sm text-stone">
                On iPhone: tap <strong>Share</strong> →{" "}
                <strong>Add to Home Screen</strong> to install Nudge.
              </p>
            ) : null}
            <p className="mt-4 text-sm text-stone">
              Free forever for 5 tasks · Upgrade for calendar scheduling · Works
              in any browser.
            </p>
          </div>

          <figure className="space-y-4">
            <img
              src="/og-image.png"
              alt="Nudge product preview — Do next task with time and rationale"
              className="w-full rounded-2xl shadow-2xl"
              loading="eager"
              fetchPriority="high"
              width={1200}
              height={630}
            />
            <figcaption className="sr-only">
              Example Do next card: prioritized task with scheduled time and
              short rationale.
            </figcaption>
          </figure>
        </div>

        <div className="mb-24 border-t border-parchment pt-12">
          <p className="mb-2 text-center text-lg text-espresso">
            Users complete 2.4x more tasks in their first week
          </p>
          <p className="mb-6 text-center text-sm text-stone">
            Join thousands of tasks planned and completed with Nudge.
          </p>
          <p className="text-center text-xs font-medium uppercase tracking-wide text-stone">
            As featured in <span className="text-espresso/50">(coming soon)</span>
          </p>
        </div>

        <div className="mb-24">
          <h2 className="mb-16 text-center text-4xl" style={{ fontWeight: 700 }}>
            Why Nudge
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-linen p-6">
              <h3 className="mb-3 text-xl" style={{ fontWeight: 600 }}>
                One trusted “Do next”
              </h3>
              <p className="text-espresso/80 leading-relaxed">
                Nudge picks a single next action from your whole list and explains
                why it matters — no endless reordering.
              </p>
            </div>
            <div className="rounded-2xl bg-linen p-6">
              <h3 className="mb-3 text-xl" style={{ fontWeight: 600 }}>
                Approve-before-write calendar
              </h3>
              <p className="text-espresso/80 leading-relaxed">
                Morning plan previews time blocks around your real meetings; nothing
                hits your calendar until you tap approve.
              </p>
            </div>
            <div className="rounded-2xl bg-linen p-6">
              <h3 className="mb-3 text-xl" style={{ fontWeight: 600 }}>
                Built for avoidance patterns
              </h3>
              <p className="text-espresso/80 leading-relaxed">
                Repeat skips tighten the plan — smaller steps, better slots, and
                kinder copy so tasks don’t rot at the bottom.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="mb-16 text-center text-4xl" style={{ fontWeight: 700 }}>
            How it works
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-2xl" style={{ fontWeight: 600 }}>
                Dump everything.
              </h3>
              <p className="leading-relaxed text-espresso/80">
                Type, speak, or paste your tasks. Nudge structures them instantly —
                action type, effort, deadline, dependencies.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-2xl" style={{ fontWeight: 600 }}>
                Your day is planned.
              </h3>
              <p className="leading-relaxed text-espresso/80">
                Nudge prioritizes your tasks and schedules them on your Google or
                Apple Calendar around your meetings. Hard tasks go in your peak
                hours. Quick wins fill the gaps.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-2xl" style={{ fontWeight: 600 }}>
                Calendar pings, you start.
              </h3>
              <p className="leading-relaxed text-espresso/80">
                When the time comes, your calendar notification fires. Tap it,
                Nudge opens the right app — email, browser, phone — and you're
                doing the task. Tap &quot;Done&quot; and the next one is already
                waiting.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="mb-16 text-center text-4xl" style={{ fontWeight: 700 }}>
            What people say
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="rounded-2xl bg-linen p-6">
                <p className="mb-4 leading-relaxed text-espresso">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-stone">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-24">
          <h2 className="mb-16 text-center text-4xl" style={{ fontWeight: 700 }}>
            Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-linen">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i ? (
                  <div className="px-6 pb-4">
                    <p className="leading-relaxed text-espresso/80">
                      {item.answer}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <PrimaryCta isStandalone={isStandalone} size="lg" />
        </div>
      </section>

      {showStickyBar ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-ink px-6 py-4 text-cream shadow-2xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p className="font-semibold">Start getting things done</p>
            <PrimaryCta
              isStandalone={isStandalone}
              className="!bg-cream !text-ink rounded-full px-6 py-2"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
