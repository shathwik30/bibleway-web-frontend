"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function MSIcon({ name, className = "", filled }: { name: string; className?: string; filled?: boolean }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
      title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <MSIcon name={resolvedTheme === "dark" ? "light_mode" : "dark_mode"} className="text-[20px]" />
    </button>
  );
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); observer.unobserve(el); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`scroll-reveal ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const HERO_FEATURES = [
  { icon: "menu_book", label: "Bible Reading" },
  { icon: "headphones", label: "Audio Bible" },
  { icon: "school", label: "Guided Study" },
  { icon: "forum", label: "Community" },
];

const MAIN_FEATURES = [
  {
    icon: "groups",
    title: "Faith-Driven Community & Fellowship",
    description: "Connect with fellow believers around the world in a safe, Christ-centered space. Chat with friends, share testimonies, post reflections, and walk together in faith through every season of life.",
    image: "/landing/Faith-Driven Community & Fellowship.jpg",
  },
  {
    icon: "volunteer_activism",
    title: "Prayer Requests & Spiritual Support",
    description: "Share your burdens, joys, and hopes with a global Christian family. Receive prayers when you need them most and strengthen your faith through collective prayer.",
    image: "/landing/Prayer Requests & Spiritual Support.jpg",
  },
  {
    icon: "auto_stories",
    title: "Smart Bible Reading Experience",
    description: "Experience Scripture like never before. Highlight meaningful verses, listen with read-aloud audio, save personal notes, and bookmark chapters that speak to your heart.",
    image: "/landing/Smart Bible Reading Experience.jpg",
  },
  {
    icon: "family_restroom",
    title: "Faith for Every Stage of Life",
    description: "BibleWay uniquely delivers Scripture tailored to your life stage. From children and teens to five stages of adulthood and seniors — receive guidance designed for your real-life challenges.",
    image: "/landing/Faith for Every Stage of Life.jpg",
  },
  {
    icon: "search",
    title: "Powerful Global Bible Search",
    description: "Find exactly what you're looking for in seconds. Search by word, verse, chapter, Bible version, or language — everything under your fingertips with just one click.",
    image: "/landing/Powerful Global Bible Search.jpg",
  },
  {
    icon: "movie",
    title: "Animated Segregated Bible Stories",
    description: "Bring Scripture to life through powerful visual storytelling. Explore age-wise, segregated Bible content enriched with meaningful animations and cinematic visuals — designed to help you understand God's Word more deeply.",
    image: "/landing/Animated Segregated Bible Stories.jpg",
  },
];

const EXTRA_FEATURES = [
  {
    icon: "video_call",
    title: "Video Calls with Translation",
    description: "Connect face-to-face with believers worldwide. Built-in real-time translation breaks language barriers.",
  },
  {
    icon: "call",
    title: "Audio & Group Calls",
    description: "Crystal-clear audio calls for prayer circles, Bible study discussions, and fellowship on the go.",
  },
  {
    icon: "extension",
    title: "Faith-Based Games",
    description: "Bible trivia, word puzzles, and interactive quizzes — grow your knowledge while having fun.",
  },
  {
    icon: "share",
    title: "Social Media Posting",
    description: "Share reflections, verse graphics, and testimonies directly from BibleWay to inspire your community.",
  },
];

const COMPACT_FEATURES = [
  { icon: "menu_book", title: "Bible Reader", desc: "Multi-version text, verse anchors, cross-references, night/read modes." },
  { icon: "edit_note", title: "Notes & Highlights", desc: "Color-coded highlights, linked notes, export & sharing." },
  { icon: "headphones", title: "Audio Bible", desc: "Multiple narrators, speed control, chapter navigation, offline downloads." },
  { icon: "volunteer_activism", title: "Prayer Requests", desc: "Private/anonymous options, moderation, follow-ups." },
  { icon: "history_edu", title: "Testimonies", desc: "Media uploads, moderation, curated testimonials." },
  { icon: "calendar_month", title: "Study Plans", desc: "Age-segmented plans, daily reminders, progress tracking." },
  { icon: "groups", title: "Community Groups", desc: "Join moderated groups, events & RSVPs." },
  { icon: "download", title: "Downloads & Offline", desc: "Audio packs, reading packs, and translation packs." },
  { icon: "video_call", title: "Video Calls", desc: "1-on-1 & group video calls with real-time translation." },
  { icon: "call", title: "Audio Calls", desc: "Crystal-clear audio calls for prayer circles and fellowship." },
  { icon: "extension", title: "Faith-Based Games", desc: "Bible trivia, word puzzles, and interactive quizzes." },
  { icon: "share", title: "Social Posting", desc: "Share reflections, verses, and testimonies with your community." },
];

const VISION_PILLARS = [
  { icon: "trending_up", title: "Grow Daily", desc: "Encourage daily engagement with short, meaningful practices." },
  { icon: "school", title: "Learn Deeply", desc: "Provide trusted commentaries, study guides, and simplified explanations." },
  { icon: "favorite", title: "Serve Compassionately", desc: "Enable prayer support, testimony sharing, and community care." },
];

const STEPS = [
  { icon: "person_add", title: "Get Started", description: "Create your free account and choose a reading pace." },
  { icon: "menu_book", title: "Engage", description: "Read daily, highlight verses, and add short journal notes." },
  { icon: "group", title: "Connect", description: "Join a study group, send prayer requests, and listen to guided devotionals." },
];

const TESTIMONIALS = [
  { quote: "I finally have a daily rhythm — the audio devotionals are beautiful.", author: "Mark", detail: "34", avatar: "M" },
  { quote: "My kids love the children's study plans and the family reading prompts.", author: "Priya", detail: "Parent", avatar: "P" },
  { quote: "The prayer team responded and supported our family — it felt real.", author: "Samuel", detail: "Member", avatar: "S" },
];

/* ================================================================== */
/*  Landing Page                                                       */
/* ================================================================== */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-x-hidden">
      {/* ═══════════ Header ═══════════ */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "glass-header border-b border-outline-variant/20 shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/landing" className="flex items-center">
            <img src="/bibleway-logo.png" alt="Bibleway" className="h-10 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="text-on-surface text-sm font-medium px-4 py-2 rounded-lg hover:bg-surface-container transition-colors">Sign in</Link>
            <Link href="/register" className="bg-primary text-on-primary text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm shadow-primary/20">Start Free</Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-surface-container transition-colors" aria-label="Toggle menu">
              <MSIcon name={mobileMenuOpen ? "close" : "menu"} className="text-2xl text-on-surface" />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant/20 bg-surface/95 backdrop-blur-xl px-4 py-4 space-y-2">
            <Link href="/login" className="block w-full text-center py-3 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
            <Link href="/register" className="block w-full text-center py-3 rounded-xl bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity" onClick={() => setMobileMenuOpen(false)}>Start Free</Link>
          </div>
        )}
      </header>

      {/* ═══════════ Hero ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary/[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-16 sm:pt-20 lg:pt-28 pb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <MSIcon name="auto_awesome" className="text-sm" filled />
            Faith, Life & Community
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl lg:text-7xl leading-[1.05] tracking-tight text-on-surface mb-6">
            Step Into the{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">Way of God</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/15 rounded-full -z-0" />
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-4">
            A peaceful path to explore Scripture through reflection, audio, and guided study — with a community built in faith.
          </p>

          <p className="text-sm text-on-surface-variant/60 mb-10">
            No subscription needed — begin your journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-all shadow-lg shadow-primary/20 press-effect"
            >
              <MSIcon name="arrow_forward" className="text-lg" />
              Begin Your Journey
            </Link>
            <Link
              href="/read/de4e12af7f28f599-02/GEN.1"
              className="inline-flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-8 py-4 rounded-xl font-semibold text-base hover:bg-surface-container transition-colors press-effect"
            >
              <MSIcon name="auto_stories" className="text-lg" />
              Explore Bible
            </Link>
          </div>

          {/* Quick feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {HERO_FEATURES.map((f) => (
              <div key={f.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest border border-outline-variant/15 text-sm text-on-surface-variant">
                <MSIcon name={f.icon} className="text-base text-primary" />
                {f.label}
              </div>
            ))}
          </div>

          {/* Scripture quote */}
          <blockquote className="max-w-md mx-auto">
            <p className="italic text-on-surface-variant/70 text-sm leading-relaxed">
              &ldquo;Let the Word be a light to your path.&rdquo;
            </p>
            <cite className="text-xs text-on-surface-variant/50 not-italic mt-1 block">— Psalm 119:105</cite>
          </blockquote>
        </div>
      </section>

      {/* ═══════════ Discover – Intro ═══════════ */}
      <RevealSection>
        <section className="py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">
              Discover BibleWay
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl mx-auto">
              More than an app. BibleWay is a living Christian ecosystem — built to guide, support, and grow believers at every stage of life.
            </p>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ Main Features (with images) ═══════════ */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 space-y-12 lg:space-y-16">
          {MAIN_FEATURES.map((feature, i) => (
            <RevealSection key={feature.title}>
              <div className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-stretch gap-0 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden editorial-shadow hover:shadow-lg transition-shadow duration-500`}>
                <div className="lg:w-[45%] w-full aspect-video lg:aspect-auto overflow-hidden">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
                </div>
                <div className="lg:w-[55%] flex flex-col justify-center p-8 lg:p-12">
                  <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mb-4 shrink-0">
                    <MSIcon name={feature.icon} className="text-2xl text-primary" />
                  </div>
                  <h3 className="font-headline text-2xl lg:text-3xl text-on-surface mb-3">{feature.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════ Extra Features (icon grid) ═══════════ */}
      <RevealSection>
        <section className="py-16 lg:py-24 bg-surface-container-lowest">
          <div className="max-w-5xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-3">And so much more</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {EXTRA_FEATURES.map((f) => (
                <div key={f.title} className="bg-surface rounded-xl border border-outline-variant/10 p-6 hover:border-primary/20 hover:shadow-md transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MSIcon name={f.icon} className="text-xl text-primary" />
                  </div>
                  <h4 className="font-headline text-lg text-on-surface mb-2">{f.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ Vision ═══════════ */}
      <RevealSection>
        <section className="py-20 lg:py-28">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">Our Vision</div>
            <h2 className="font-headline text-3xl lg:text-5xl text-on-surface mb-4">
              One Bible. One Community.{" "}
              <span className="text-primary">One Journey of Faith.</span>
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed mb-14">
              Bible Way exists to make Scripture accessible, understandable, and relevant. We help you build lasting spiritual rhythms by combining faithful resources, human connection, and technology that honors your privacy and dignity.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {VISION_PILLARS.map((v) => (
                <div key={v.title} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <MSIcon name={v.icon} className="text-2xl text-primary" />
                  </div>
                  <h3 className="font-headline text-xl text-on-surface mb-2">{v.title}</h3>
                  <p className="text-sm text-on-surface-variant max-w-xs">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ How It Works ═══════════ */}
      <RevealSection>
        <section className="py-20 lg:py-28 bg-surface-container-lowest">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">How it works</div>
              <h2 className="font-headline text-3xl lg:text-4xl text-on-surface">Three simple steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              {STEPS.map((step, i) => (
                <div key={step.title} className="text-center space-y-4 relative">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20 relative z-10">
                    <MSIcon name={step.icon} className="text-2xl" />
                  </div>
                  <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Step {i + 1}</div>
                  <h3 className="font-headline text-xl text-on-surface">{step.title}</h3>
                  <p className="text-on-surface-variant text-sm max-w-xs mx-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ Full Feature Grid ═══════════ */}
      <RevealSection>
        <section className="py-20 lg:py-28">
          <div className="max-w-5xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">Features</div>
              <h2 className="font-headline text-3xl lg:text-4xl text-on-surface">Everything you need</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {COMPACT_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/20 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MSIcon name={f.icon} className="text-lg text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface text-sm mb-1">{f.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ Testimonials ═══════════ */}
      <RevealSection>
        <section className="py-20 lg:py-28 bg-surface-container-lowest">
          <div className="max-w-5xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">Testimonials</div>
              <h2 className="font-headline text-3xl lg:text-4xl text-on-surface">Stories from our community</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="bg-surface rounded-2xl p-7 border border-outline-variant/10 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <MSIcon key={star} name="star" className="text-sm text-yellow-500" filled />
                    ))}
                  </div>
                  <p className="text-on-surface leading-relaxed mb-6 text-[15px]">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold flex items-center justify-center">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{t.author}</p>
                      <p className="text-xs text-on-surface-variant">{t.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ Final CTA ═══════════ */}
      <RevealSection>
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-40%] left-[30%] w-[50vw] h-[50vw] bg-primary/[0.05] rounded-full blur-[100px]" />
          </div>
          <div className="max-w-2xl mx-auto px-4 lg:px-8 text-center relative">
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-10 sm:p-14 editorial-shadow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MSIcon name="church" className="text-3xl text-primary" filled />
              </div>
              <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">Start your journey today</h2>
              <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
                Join thousands of believers growing in faith together. Free forever — no credit card required.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-10 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 press-effect"
              >
                Create Free Account
                <MSIcon name="arrow_forward" className="text-lg" />
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="border-t border-outline-variant/10 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/landing" className="flex items-center">
              <img src="/bibleway-logo.png" alt="Bibleway" className="h-8 w-auto object-contain" />
            </Link>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-on-surface-variant">
              <Link href="/bible" className="hover:text-primary transition-colors">Bible</Link>
              <Link href="/games" className="hover:text-primary transition-colors">Games</Link>
              <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            </nav>
            <p className="text-xs text-on-surface-variant/60">&copy; {new Date().getFullYear()} Linchpin Soft Solutions Pvt Ltd</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
