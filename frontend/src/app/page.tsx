import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const CARDS = [
  { emoji: "🎁", label: "Treats",    desc: "Track who owes the next treat", gradient: "from-fuchsia-500/10 to-rose-500/10",    border: "border-fuchsia-500/20" },
  { emoji: "🧾", label: "Expenses",  desc: "Split bills with no drama",     gradient: "from-violet-500/10 to-fuchsia-500/10", border: "border-violet-500/20" },
  { emoji: "🤝", label: "Udhar",      desc: "Keep track of who lent what",   gradient: "from-rose-500/10 to-orange-500/10",     border: "border-rose-500/20" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent tracking-tight">
              Treatz
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container flex flex-col items-center text-center pt-20 pb-16 md:pt-32 md:pb-24 relative">
          {/* Glow blobs */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
          <div className="absolute top-20 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5 px-4 py-1.5 text-sm text-fuchsia-600 dark:text-fuchsia-400">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
              Private circles for friend groups
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
              Your squad.{" "}
              <span className="bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
                Your money.
              </span>
              <br />No awkward talk.
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Treatz keeps your friend group's treats, expenses, and loans sorted — privately, in real time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="gap-2 text-base px-8 shadow-lg shadow-fuchsia-500/20" asChild>
                <Link href="/signup">
                  Join for Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 3 feature cards */}
        <section className="container pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {CARDS.map(({ emoji, label, desc, gradient, border }) => (
              <div
                key={label}
                className={`rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200`}
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-bold text-base mb-1">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="container pb-20">
          <div className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 p-10 text-center text-white shadow-xl shadow-fuchsia-500/20 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black mb-3">
              Baaki sab baad mein — treats pehle. 🎁
            </h2>
            <p className="text-white/80 mb-6 text-sm">
              Pick a username and invite your squad in under a minute.
            </p>
            <Button size="lg" variant="secondary" className="gap-2 font-bold" asChild>
              <Link href="/signup">
                Create Your Account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-5 text-center text-xs text-muted-foreground">
        Treatz — Built for friend groups 🤝
      </footer>
    </div>
  );
}
