import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Read — Bibleway",
  description:
    "Read reflections and stories from the Bibleway community. Create a free account to access all content.",
};

export default function GatedContentPage() {
  return (
    <>
      {/* Minimal Navbar for gated content */}
      <nav className="bg-stone-50/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="block"
          >
            <img src="/bibleway-logo.png" alt="Bibleway" className="h-8 w-auto" />
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Daily Verse
            </Link>
            <Link
              href="/bible"
              className="text-primary border-b-2 border-tertiary-fixed-dim font-medium"
            >
              Bible
            </Link>
            <Link
              href="/shop"
              className="text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              Shop
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-primary">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="p-2 text-primary">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative min-h-screen">
        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-6 pt-16 pb-96">
          <header className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <span className="bg-tertiary-fixed/20 text-on-tertiary-fixed-variant px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                Reflections
              </span>
              <span className="text-on-surface-variant text-sm tracking-wide">
                March 14, 2024
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-6xl text-on-surface leading-tight mb-6 -tracking-[0.02em]">
              The Silence of the Morning Sanctuary
            </h1>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">
                  person
                </span>
              </div>
              <div>
                <p className="font-semibold text-on-surface">Elias Thorne</p>
                <p className="text-on-surface-variant text-sm">
                  Lead Contributor
                </p>
              </div>
            </div>
          </header>

          <div className="prose prose-stone prose-lg max-w-none text-on-surface leading-[1.6]">
            <p className="editorial-dropcap mb-8 text-xl text-on-surface-variant">
              There is a specific quality to the light that filters through the
              arched windows of the assembly at dawn. It is not merely
              illumination; it is a summons. For centuries, the act of gathering
              has been the cornerstone of our shared resilience, a rhythmic
              coming together that defies the fragmentation of the modern world.
            </p>
            <p className="mb-8">
              When we speak of the &ldquo;Modern Sanctuary,&rdquo; we are not
              discussing architecture. We are discussing the deliberate
              construction of space—both physical and digital—where the noise of
              the external world is silenced in favor of a deeper, more resonant
              frequency.
            </p>
            <p className="mb-8 italic font-headline text-2xl text-primary border-l-4 border-tertiary-fixed-dim pl-6 my-12">
              &ldquo;In the stillness, we find not the absence of sound, but the
              presence of meaning.&rdquo;
            </p>
            <p className="mb-8">
              The challenge we face today is one of attention. Our focus is a
              commodity, traded and bartered in the marketplaces of social
              connectivity. To reclaim it is an act of spiritual rebellion.
            </p>
            <p className="mb-8">
              Consider the way we consume wisdom in the digital age. We scroll
              through profound truths with the same thumb-flick we use for
              advertisements. We have lost the art of the pause.
            </p>
            <p>
              Each of these pillars serves as a foundation for what we are
              building here at Bibleway. But to understand them fully, one must
              first be willing to step through the threshold of commitment...
            </p>
          </div>
        </article>

        {/* ===== GATED OVERLAY ===== */}
        <div className="absolute bottom-0 left-0 w-full h-[716px] flex items-end justify-center pb-24 z-40 bg-linear-to-t from-surface via-surface/95 to-transparent">
          {/* CTA Card */}
          <div className="relative w-full max-w-xl mx-6">
            <div className="bg-surface-container-lowest rounded-xl p-10 shadow-[0_20px_40px_rgba(18,18,18,0.06)] flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-6">
                <span
                  className="material-symbols-outlined text-primary text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
              </div>
              <h2 className="font-headline text-3xl text-on-surface mb-3">
                The journey continues
              </h2>
              <p className="text-on-surface-variant mb-8 text-lg">
                Create an account to read the full story.
              </p>
              <div className="w-full space-y-4">

                <button className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-linear-to-br from-primary to-primary-container rounded-full text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  <span className="material-symbols-outlined">mail</span>
                  <span className="font-medium">Sign up with Email</span>
                </button>
              </div>
              <p className="mt-8 text-sm text-on-surface-variant">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-bold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-tertiary-fixed/10 rounded-full blur-[120px]"></div>
      </div>
    </>
  );
}
