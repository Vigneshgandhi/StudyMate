"use client";

import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  WandSparkles,
  Brain,
  BookOpen,
  Target,
  Clock3,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl font-bold text-slate-900 shadow-sm">
              S
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                StudyMate
              </h1>
              <p className="text-xs text-slate-500">
                AI Study Assistant
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="font-semibold text-slate-900"
            >
              Home
            </Link>

            <Link
              href="/prompt-generator"
              className="text-slate-500 transition hover:text-slate-900"
            >
              Prompt Generator
            </Link>

            <Link
              href="/Chat"
              className="text-slate-500 transition hover:text-slate-900"
            >
              AI Chat
            </Link>

            <Link
              href="/blog"
              className="text-slate-500 transition hover:text-slate-900"
            >
              Blog
            </Link>

            <Link
              href="/About"
              className="text-slate-500 transition hover:text-slate-900"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/Login"
              className="hidden rounded-xl px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Login
            </Link>

            <Link
              href="/prompt-generator"
              className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-900 shadow-sm transition hover:bg-yellow-300"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </header>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
              <Sparkles size={16} />
              AI-powered learning for students
            </div>

            <h2 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-6xl">
              Study smarter.
              <br />
              <span className="text-yellow-500">
                Learn better.
              </span>
            </h2>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              StudyMate helps university students transform their
              study goals into personalized AI prompts and interactive
              learning conversations.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/prompt-generator"
                className="group flex items-center gap-3 rounded-xl bg-yellow-400 px-6 py-4 font-bold text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:bg-yellow-300"
              >
                <WandSparkles size={20} />
                Generate Study Prompts
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/Chat"
                className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <MessageSquare size={20} />
                Start AI Chat
              </Link>
            </div>

            {/* Features */}
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-yellow-500"
                />
                Personalized learning
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-yellow-500"
                />
                AI-powered assistance
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-yellow-500"
                />
                University focused
              </span>
            </div>
          </div>

          {/* ================= HERO VISUAL ================= */}
          <div className="relative">
            <div className="relative mx-auto max-w-xl">

              {/* Main Card */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-xl">

                {/* Window Header */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">

                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400" />
                      <span className="h-3 w-3 rounded-full bg-green-400" />
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Sparkles size={15} />
                      StudyMate AI
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6">

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">
                      Personalized Study
                    </p>

                    <h3 className="mt-3 text-2xl font-black text-slate-900">
                      Learn Machine Learning
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Based on your level, learning style and study goals.
                    </p>

                    {/* Prompt Fan */}
                    <div className="relative mx-auto mt-8 h-64 max-w-md">

                      <PromptCard
                        number="01"
                        title="Concept"
                        className="left-1 top-2 -rotate-12"
                      />

                      <PromptCard
                        number="02"
                        title="Exam Prep"
                        className="left-8 top-28 -rotate-3"
                      />

                      <PromptCard
                        number="03"
                        title="Step-by-Step"
                        className="bottom-0 left-12 -rotate-6"
                      />

                      <PromptCard
                        number="04"
                        title="Real World"
                        className="right-1 top-2 rotate-12"
                      />

                      <PromptCard
                        number="05"
                        title="Practice"
                        className="right-8 top-28 rotate-3"
                      />

                      <PromptCard
                        number="06"
                        title="Revision"
                        className="bottom-0 right-12 rotate-6"
                      />

                      {/* Center */}
                      <div className="absolute left-1/2 top-1/2 z-20 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-8 border-white bg-yellow-400 text-center shadow-xl">
                        <div>
                          <Sparkles
                            size={20}
                            className="mx-auto mb-1"
                          />
                          <span className="text-xs font-black">
                            AI PROMPTS
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-center text-sm font-semibold text-yellow-700">
                  Six personalized learning approaches generated by AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-600">
              StudyMate Features
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Everything you need to study effectively
            </h2>

            <p className="mt-4 text-slate-600">
              Turn your learning requirements into structured,
              personalized AI-assisted study sessions.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <FeatureCard
              icon={<WandSparkles size={23} />}
              title="Prompt Generator"
              description="Describe what you want to learn and generate structured prompts designed for university-level study."
              href="/prompt-generator"
            />

            <FeatureCard
              icon={<MessageSquare size={23} />}
              title="AI Study Chat"
              description="Continue your learning through an interactive conversation with your selected AI model."
              href="/Chat"
            />

            <FeatureCard
              icon={<Brain size={23} />}
              title="Personalized Learning"
              description="Adapt explanations and study activities according to your subject, level, goals and learning style."
              href="/prompt-generator"
            />

          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-600">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">
              From study goal to learning session
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">

            <StepCard
              number="01"
              icon={<Target size={23} />}
              title="Define Your Goal"
              description="Enter your subject, topic, current knowledge level, learning goal, available study time and preferred learning style."
            />

            <StepCard
              number="02"
              icon={<Sparkles size={23} />}
              title="Generate Prompts"
              description="StudyMate uses AI to create six different learning approaches including concepts, exams, examples, practice and revision."
            />

            <StepCard
              number="03"
              icon={<MessageSquare size={23} />}
              title="Start Learning"
              description="Select a generated prompt and continue your learning through the interactive AI Study Chat."
            />

          </div>
        </div>
      </section>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">
                Built For Students
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                One study assistant for different learning situations.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-300">
                StudyMate can support students when they are learning a
                new concept, preparing for examinations, solving
                problems or revising important topics.
              </p>

              <Link
                href="/prompt-generator"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-yellow-300"
              >
                Start Studying
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <DarkFeature
                icon={<BookOpen />}
                title="Concept Learning"
                text="Understand difficult academic concepts with structured explanations."
              />

              <DarkFeature
                icon={<GraduationCap />}
                title="Exam Preparation"
                text="Generate study prompts focused on examinations and important topics."
              />

              <DarkFeature
                icon={<Lightbulb />}
                title="Practical Examples"
                text="Connect academic concepts with real-world and industry examples."
              />

              <DarkFeature
                icon={<Clock3 />}
                title="Quick Revision"
                text="Create focused revision prompts when study time is limited."
              />

            </div>
          </div>
        </div>
      </section>
      <section className="bg-yellow-400">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-yellow-400">
            <Sparkles size={26} />
          </div>

          <h2 className="mt-6 text-3xl font-black text-slate-950 md:text-4xl">
            Ready to study smarter?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-700">
            Create personalized study prompts and start an AI-powered
            learning session with StudyMate.
          </p>

          <div className="mt-8 flex justify-center gap-4">

            <Link
              href="/prompt-generator"
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-slate-800"
            >
              Generate Prompts
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/Chat"
              className="flex items-center gap-2 rounded-xl border border-slate-950/20 bg-white px-6 py-4 font-bold text-slate-950 transition hover:bg-slate-50"
            >
              Open AI Chat
            </Link>

          </div>
        </div>
      </section>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 font-bold text-slate-900">
              S
            </div>

            <span>
              © {new Date().getFullYear()} StudyMate
            </span>
          </div>

          <div className="flex gap-6">
            <Link
              href="/about"
              className="transition hover:text-slate-900"
            >
              About
            </Link>

            <Link
              href="/prompt-generator"
              className="transition hover:text-slate-900"
            >
              Prompt Generator
            </Link>

            <Link
              href="/Chat"
              className="transition hover:text-slate-900"
            >
              AI Chat
            </Link>
          </div>

        </div>
      </footer>

    </main>
  );
}

function PromptCard({ number, title, className }) {
  return (
    <div
      className={`absolute h-24 w-36 rounded-2xl border border-slate-300 bg-white p-3 shadow-lg ${className}`}
    >
      <span className="inline-flex h-6 w-7 items-center justify-center rounded-md bg-yellow-100 text-[10px] font-black text-yellow-700">
        {number}
      </span>

      <p className="mt-2 text-xs font-bold text-slate-800">
        {title}
      </p>

      <div className="mt-2 space-y-1">
        <div className="h-1.5 w-20 rounded-full bg-slate-200" />
        <div className="h-1.5 w-14 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-yellow-300 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 transition group-hover:bg-yellow-400 group-hover:text-slate-950">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-500">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-900">
        Explore
        <ChevronRight
          size={17}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-slate-950">
          {icon}
        </div>

        <span className="text-sm font-black text-slate-300">
          {number}
        </span>

      </div>

      <h3 className="mt-6 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-500">
        {description}
      </p>

    </div>
  );
}

function DarkFeature({
  icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition hover:bg-white/[0.09]">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-slate-950">
        {icon}
      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>

    </div>
  );
}