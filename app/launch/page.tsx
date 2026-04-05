"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#59021a", "#781c2e", "#D4A574", "#ffb2b9", "#a13b4b", "#ffdadc", "#4a7c59", "#5b9bd5"];
    const pieces: { x: number; y: number; w: number; h: number; color: string; vy: number; vx: number; rot: number; vr: number }[] = [];

    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 14 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 3 + 1.5,
        vx: (Math.random() - 0.5) * 2,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 8,
      });
    }

    let animId: number;
    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        if (p.y > canvas!.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas!.width;
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

export default function LaunchPage() {
  const [show, setShow] = useState(false);
  const [verse, setVerse] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [launched, setLaunched] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);

  const verses = [
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
    { text: "The Lord is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  ];

  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);
  useEffect(() => { const t = setInterval(() => setVerse(v => (v + 1) % verses.length), 5000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (countdown <= 0) { setLaunched(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      <Confetti />

      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center transition-all duration-1000 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        {!launched ? (
          <>
            {/* Countdown */}
            <p className="text-sm uppercase tracking-[0.3em] text-on-surface-variant/60 mb-6 font-medium">Launching in</p>
            <div className="text-8xl sm:text-9xl font-headline text-primary mb-6 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
              {countdown}
            </div>
            <div className="w-48 h-1.5 rounded-full bg-surface-container-high overflow-hidden mb-8">
              <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear" style={{ width: `${((10 - countdown) / 10) * 100}%` }} />
            </div>
          </>
        ) : (
          <>
            {/* Cross icon */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-bounce" style={{ animationDuration: "2s" }}>
              <span className="text-4xl">&#10013;</span>
            </div>

            {/* Main headline */}
            <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl text-on-surface mb-4 tracking-tight">
              We&apos;re <span className="text-primary">Live</span> &#127881;
            </h1>

            <p className="text-lg sm:text-xl text-on-surface-variant max-w-xl mb-8 leading-relaxed">
              Bibleway is here. A new way to read Scripture, grow in faith, and walk together as a community.
            </p>
          </>
        )}

        {/* Animated verse — always visible */}
        <div className="h-24 flex items-center justify-center mb-10 max-w-lg">
          <div key={verse} className="text-center animate-in fade-in duration-700">
            <p className="text-primary/80 italic text-sm sm:text-base mb-1">&ldquo;{verses[verse].text}&rdquo;</p>
            <p className="text-xs text-on-surface-variant/50 font-medium">{verses[verse].ref}</p>
          </div>
        </div>

        {/* CTAs — only after launch */}
        {launched && <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <Link
            href="/register"
            className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-primary/30 hover:opacity-90 transition-all press-effect"
          >
            Join the Journey
          </Link>
          <Link
            href="/landing"
            className="text-on-surface-variant hover:text-primary px-6 py-4 rounded-2xl font-medium text-base transition-colors"
          >
            Learn More
          </Link>
        </div>}

        {/* Stats */}
        {launched && <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-center mb-12">
          <div>
            <p className="text-3xl sm:text-4xl font-headline text-on-surface">2000+</p>
            <p className="text-xs text-on-surface-variant/60 uppercase tracking-widest mt-1">Bible Versions</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-headline text-on-surface">20+</p>
            <p className="text-xs text-on-surface-variant/60 uppercase tracking-widest mt-1">Languages</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-headline text-primary">&#x221E;</p>
            <p className="text-xs text-on-surface-variant/60 uppercase tracking-widest mt-1">Faith</p>
          </div>
        </div>}

        {/* Footer */}
        <p className="text-[10px] text-on-surface-variant/30 uppercase tracking-[0.3em]">
          Bibleway &middot; {new Date().getFullYear()}
        </p>
      </div>

      {/* Congrats popup */}
      {launched && !popupDismissed && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-10 max-w-md w-full mx-4 text-center editorial-shadow border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="relative">
              <p className="text-5xl mb-4">&#127881;&#127881;&#127881;</p>
              <h2 className="font-headline text-3xl sm:text-4xl text-on-surface mb-3">Congratulations!</h2>
              <p className="text-on-surface-variant leading-relaxed mb-2">
                Bibleway is officially live!
              </p>
              <p className="text-on-surface-variant/70 text-sm leading-relaxed mb-8">
                Thank you for being part of this journey. Together, we&apos;re building a community rooted in faith, love, and the Word of God.
              </p>
              <button
                onClick={() => setPopupDismissed(true)}
                className="bg-primary text-on-primary px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-primary/30 hover:opacity-90 transition-all press-effect w-full sm:w-auto"
              >
                Let&apos;s Go! &#10024;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
