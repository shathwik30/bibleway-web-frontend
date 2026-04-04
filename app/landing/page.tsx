"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Icon helper                                                        */
/* ------------------------------------------------------------------ */
function MSIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook using Intersection Observer                     */
/* ------------------------------------------------------------------ */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature data                                                       */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    icon: "menu_book",
    title: "Bible Reading",
    description: "Read Scripture in 2000+ translations with text-to-speech, highlights, notes, and bookmarks. Translate any chapter into 20+ languages instantly.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: "forum",
    title: "Social Feed",
    description: "Share your faith journey. Post reflections, prayer requests, and encouragement. React with faith-themed emojis.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: "chat",
    title: "Real-time Chat",
    description: "Connect with believers worldwide. Send stickers, translate messages, and build meaningful relationships.",
    color: "bg-tertiary/10 text-on-surface",
  },
  {
    icon: "extension",
    title: "Bible Games",
    description: "Learn Scripture through fun -- crossword puzzles, quizzes, and find-the-difference challenges.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: "shopping_bag",
    title: "Shop",
    description: "Access exclusive Christian content, devotionals, and digital resources.",
    color: "bg-secondary/10 text-secondary",
  },
];

/* ------------------------------------------------------------------ */
/*  Stats data                                                         */
/* ------------------------------------------------------------------ */
const STATS = [
  { value: "2000+", label: "Bible Translations" },
  { value: "20+", label: "Languages" },
  { value: "4", label: "Bible Games" },
  { value: "Real-time", label: "Chat" },
];

/* ------------------------------------------------------------------ */
/*  Steps data                                                         */
/* ------------------------------------------------------------------ */
const STEPS = [
  { icon: "person_add", title: "Sign Up", description: "Create your free account in seconds." },
  { icon: "explore", title: "Explore", description: "Read the Bible, play games, and discover content." },
  { icon: "group", title: "Connect", description: "Join the community, chat, and grow together." },
];

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */
const TESTIMONIALS = [
  {
    quote: "I finally have a daily rhythm -- the audio devotionals are beautiful.",
    author: "Mark",
    role: "Daily reader",
  },
  {
    quote: "My kids love the Bible games and the family reading prompts.",
    author: "Priya",
    role: "Parent",
  },
  {
    quote: "The prayer community responded and supported our family -- it felt real.",
    author: "Samuel",
    role: "Community member",
  },
];

/* ================================================================== */
/*  Landing Page                                                       */
/* ================================================================== */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ========== Header ========== */}
      <header className="sticky top-0 z-50 w-full glass-header border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/landing" className="flex items-center">
            <img
              src="/landing/logo.png"
              alt="Bibleway"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-on-surface text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-primary text-on-primary text-sm font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Toggle menu"
          >
            <MSIcon name={mobileMenuOpen ? "close" : "menu"} className="text-2xl text-on-surface" />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant/20 bg-surface px-4 py-4 space-y-2">
            <Link
              href="/login"
              className="block w-full text-center py-3 rounded-lg border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="block w-full text-center py-3 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start Free
            </Link>
          </div>
        )}
      </header>

      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-24 lg:py-36 text-center relative">
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-on-surface mb-6">
            Your faith journey,{" "}
            <span className="text-primary">beautifully designed.</span>
          </h1>

          <p className="text-lg lg:text-xl text-on-surface-variant max-w-xl mx-auto leading-relaxed mb-10">
            Bible reading, prayer community, and spiritual growth — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-primary text-on-primary px-8 py-3.5 rounded-xl font-medium text-base hover:opacity-90 transition-opacity press-effect"
            >
              Start Free
            </Link>
            <Link
              href="/read/de4e12af7f28f599-02/GEN.1"
              className="inline-flex items-center justify-center border border-outline-variant text-on-surface px-8 py-3.5 rounded-xl font-medium text-base hover:bg-surface-container transition-colors press-effect"
            >
              Explore Bible
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Stats Bar ========== */}
      <RevealSection>
        <section className="border-y border-outline-variant/20 bg-surface-container-low">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="font-headline text-3xl lg:text-4xl text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-on-surface-variant">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ========== Features ========== */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">
                Everything for your spiritual life
              </h2>
              <p className="text-on-surface-variant max-w-lg mx-auto">
                One app to read, reflect, connect, and grow.
              </p>
            </div>
          </RevealSection>

          <div className="space-y-16 lg:space-y-24">
            {FEATURES.map((feature, i) => (
              <RevealSection key={feature.title}>
                <div
                  className={`flex flex-col ${
                    i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  } items-center gap-8 lg:gap-16`}
                >
                  {/* Icon container */}
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-2xl ${feature.color} flex items-center justify-center`}>
                      <MSIcon name={feature.icon} className="text-4xl lg:text-5xl" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className={`flex-1 ${i % 2 === 0 ? "lg:text-left" : "lg:text-right"} text-center`}>
                    <h3 className="font-headline text-2xl lg:text-3xl text-on-surface mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-on-surface-variant leading-relaxed max-w-lg mx-auto lg:mx-0">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== How It Works ========== */}
      <section className="py-20 lg:py-28 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">
                Three simple steps
              </h2>
            </div>
          </RevealSection>

          <RevealSection>
            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <div key={step.title} className="text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary">
                    <MSIcon name={step.icon} className="text-2xl" />
                  </div>
                  <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
                    Step {i + 1}
                  </div>
                  <h3 className="font-headline text-xl text-on-surface">{step.title}</h3>
                  <p className="text-on-surface-variant text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ========== Testimonials ========== */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">
                Stories from our community
              </h2>
            </div>
          </RevealSection>

          <RevealSection>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.author}
                  className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow border border-outline-variant/10"
                >
                  <MSIcon name="format_quote" className="text-3xl text-primary/30 mb-3 block" />
                  <p className="text-on-surface leading-relaxed mb-6">
                    {t.quote}
                  </p>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{t.author}</p>
                    <p className="text-xs text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ========== Final CTA ========== */}
      <RevealSection>
        <section className="py-20 lg:py-28 bg-surface-container-low">
          <div className="max-w-2xl mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">
              Start your journey today
            </h2>
            <p className="text-on-surface-variant mb-10 max-w-md mx-auto">
              Join thousands of believers growing in faith together.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-primary text-on-primary px-10 py-4 rounded-xl font-medium text-lg hover:opacity-90 transition-opacity press-effect"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </RevealSection>

      {/* ========== Footer ========== */}
      <footer className="border-t border-outline-variant/20 bg-surface-container">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/landing" className="flex items-center">
              <img
                src="/landing/logo.png"
                alt="Bibleway"
                className="h-8 w-auto object-contain"
              />
            </Link>

            <nav className="flex flex-wrap justify-center gap-6 text-sm text-on-surface-variant">
              <Link href="/bible" className="hover:text-primary transition-colors">Bible</Link>
              <Link href="/games" className="hover:text-primary transition-colors">Games</Link>
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            </nav>

            <p className="text-xs text-on-surface-variant/60">
              &copy; {new Date().getFullYear()} Linchpin Soft Solutions Pvt Ltd
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
