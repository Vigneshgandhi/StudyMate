"use client";

import {
  Sparkles,
  Brain,
  MessageSquareText,
  WandSparkles,
  ShieldCheck,
  GraduationCap,
  Code2,
  Cpu,
  LockKeyhole,
  ArrowRight,
  CheckCircle2,
  Mail,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AboutPage() {
  const [feedback, setFeedback] = useState({
    category: "General feedback",
    subject: "",
    message: "",
  });
  const [feedbackState, setFeedbackState] = useState({
    loading: false,
    message: "",
    error: false,
  });

  const submitFeedback = async (event) => {
    event.preventDefault();
    setFeedbackState({ loading: true, message: "", error: false });

    try {
      const response = await fetch("http://localhost:5001/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(feedback),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send feedback.");
      }

      setFeedback({ category: "General feedback", subject: "", message: "" });
      setFeedbackState({ loading: false, message: data.message, error: false });
    } catch (error) {
      setFeedbackState({
        loading: false,
        message: error.message || "Unable to send feedback.",
        error: true,
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">

      {/* NAVBAR */}
      <header className="h-[82px] bg-white border-b border-gray-200 flex items-center justify-between px-8 lg:px-14 sticky top-0 z-50">

        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#fbc52b] flex items-center justify-center">
            <Sparkles size={23} strokeWidth={2.5} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              StudyMate
            </h1>
            <p className="text-xs text-gray-500">
              AI Study Assistant
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-9 text-sm font-medium">
          <Link
            href="/"
            className="text-gray-600 hover:text-[#111827] transition"
          >
            Home
          </Link>

          <Link
            href="/prompt-generator"
            className="text-gray-600 hover:text-[#111827] transition"
          >
            Prompt Generator
          </Link>

          <Link
            href="/Chat"
            className="text-gray-600 hover:text-[#111827] transition"
          >
            AI Chat
          </Link>

          <Link
            href="/about"
            className="text-[#111827] font-semibold"
          >
            About
          </Link>
        </nav>

        <Link
          href="/prompt-generator"
          className="hidden sm:flex items-center gap-2 bg-[#fbc52b] hover:bg-[#f5b900] px-5 py-3 rounded-xl font-semibold transition"
        >
          Get Started
          <ArrowRight size={17} />
        </Link>
      </header>


      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-16">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-300 bg-yellow-50 text-yellow-700 text-sm font-medium mb-7">
              <Sparkles size={16} />
              About StudyMate
            </div>

            <h2 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Learn smarter.
              <br />

              <span className="text-[#eab308]">
                Study better.
              </span>
            </h2>

            <p className="mt-7 text-lg leading-8 text-gray-600 max-w-xl">
              StudyMate is an AI-powered study assistant designed to help
              university students understand concepts, generate personalized
              study prompts, and interact with AI tutors in a simple learning
              environment.
            </p>

            <div className="flex flex-wrap gap-4 mt-9">

              <Link
                href="/prompt-generator"
                className="flex items-center gap-2 bg-[#fbc52b] hover:bg-[#f5b900] px-6 py-3.5 rounded-xl font-semibold transition"
              >
                Generate Study Prompts
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/Chat"
                className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-6 py-3.5 rounded-xl font-semibold transition"
              >
                Try AI Chat
                <MessageSquareText size={18} />
              </Link>

            </div>

          </div>


          {/* HERO CARD */}
          <div className="relative">

            <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-7">

              <div className="flex items-center justify-between border-b border-gray-100 pb-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Brain className="text-yellow-600" size={21} />
                  </div>

                  <div>
                    <p className="font-semibold">
                      StudyMate AI
                    </p>
                    <p className="text-xs text-gray-500">
                      Personal Learning Assistant
                    </p>
                  </div>

                </div>

                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Ready
                </span>

              </div>


              <div className="py-7">

                <p className="text-xs uppercase tracking-[0.2em] font-bold text-yellow-600 mb-3">
                  Personalized Learning
                </p>

                <h3 className="text-2xl font-bold mb-3">
                  Learn Machine Learning
                </h3>

                <p className="text-gray-500 leading-7">
                  StudyMate adapts learning prompts according to the student's
                  subject, topic, level, goal, available study time, and
                  preferred learning style.
                </p>

              </div>


              <div className="grid grid-cols-2 gap-3">

                {[
                  ["Concept Understanding", Brain],
                  ["Exam Preparation", GraduationCap],
                  ["Step-by-Step Learning", WandSparkles],
                  ["Practice Questions", CheckCircle2],
                ].map(([title, Icon]) => (

                  <div
                    key={title}
                    className="border border-gray-200 rounded-2xl p-4 bg-gray-50"
                  >

                    <Icon
                      size={19}
                      className="text-yellow-600 mb-3"
                    />

                    <p className="text-sm font-semibold">
                      {title}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* WHAT IS STUDYMATE */}
      <section className="bg-white border-y border-gray-200">

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">

          <div className="max-w-3xl">

            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-600 mb-3">
              What is StudyMate?
            </p>

            <h2 className="text-3xl lg:text-4xl font-bold">
              An intelligent learning environment for university students.
            </h2>

            <p className="mt-5 text-gray-600 leading-8 text-lg">
              StudyMate combines AI-powered prompt generation and interactive
              AI chat into one platform. Instead of providing the same learning
              experience to every student, the system uses the student's
              learning requirements to create personalized interactions.
            </p>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">

        <div className="text-center max-w-2xl mx-auto mb-14">

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-600 mb-3">
            Core Features
          </p>

          <h2 className="text-3xl lg:text-4xl font-bold">
            Everything students need for AI-assisted learning.
          </h2>

          <p className="mt-4 text-gray-500 leading-7">
            StudyMate provides focused tools for generating useful prompts,
            learning through conversation, and protecting sensitive data.
          </p>

        </div>


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <FeatureCard
            icon={WandSparkles}
            title="AI Prompt Generator"
            text="Generate personalized prompts based on subject, topic, academic level, learning goal, study duration, and learning style."
          />

          <FeatureCard
            icon={MessageSquareText}
            title="AI Study Chat"
            text="Continue learning through an interactive conversation with the selected local AI model."
          />

          <FeatureCard
            icon={Brain}
            title="Personalized Learning"
            text="Learning interactions can be adapted to the student's preferred way of understanding and practicing concepts."
          />

          <FeatureCard
            icon={GraduationCap}
            title="University Focused"
            text="The platform is designed around university-level subjects, examinations, assignments, and technical learning."
          />

          <FeatureCard
            icon={LockKeyhole}
            title="Data Encryption"
            text="Sensitive conversation data can be encrypted before being stored in the application's backend storage."
          />

          <FeatureCard
            icon={Cpu}
            title="Local AI Processing"
            text="StudyMate can use locally hosted Ollama models, allowing AI processing to run through the local development environment."
          />

        </div>

      </section>


      {/* WORKFLOW */}
      <section className="bg-[#111827] text-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">

          <div className="text-center mb-14">

            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400 mb-3">
              How StudyMate Works
            </p>

            <h2 className="text-3xl lg:text-4xl font-bold">
              From study goal to AI learning.
            </h2>

          </div>


          <div className="grid md:grid-cols-4 gap-6">

            <Step
              number="01"
              icon={GraduationCap}
              title="Choose Your Topic"
              text="Enter the subject and topic you want to study."
            />

            <Step
              number="02"
              icon={WandSparkles}
              title="Generate Prompts"
              text="StudyMate creates different learning approaches."
            />

            <Step
              number="03"
              icon={MessageSquareText}
              title="Start AI Chat"
              text="Select an AI option and continue learning through conversation."
            />

            <Step
              number="04"
              icon={CheckCircle2}
              title="Learn & Practice"
              text="Understand concepts, practice questions, and revise efficiently."
            />

          </div>

        </div>

      </section>


      {/* TECHNOLOGY */}
      <section className="bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">

          <div className="grid lg:grid-cols-2 gap-14 items-center">

            <div>

              <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-600 mb-3">
                Technology
              </p>

              <h2 className="text-3xl lg:text-4xl font-bold">
                Built with modern web and AI technologies.
              </h2>

              <p className="mt-5 text-gray-600 leading-8">
                StudyMate uses a React-based frontend and Flask backend to
                provide a modular architecture. AI functionality can be
                connected through locally hosted Ollama models, while
                encryption mechanisms provide an additional layer for stored
                application data.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-4">

              <TechCard
                icon={Code2}
                title="React.js"
                text="Frontend"
              />

              <TechCard
                icon={Cpu}
                title="Ollama"
                text="Local AI"
              />

              <TechCard
                icon={Code2}
                title="Flask"
                text="Backend API"
              />

              <TechCard
                icon={LockKeyhole}
                title="Encryption"
                text="Data Security"
              />

            </div>

          </div>

        </div>

      </section>


      {/* FEEDBACK */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4c7] text-yellow-700">
              <Mail size={23} />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-600">
              Help us improve
            </p>
            <h2 className="mt-3 text-3xl font-bold lg:text-4xl">
              Share your StudyMate experience.
            </h2>
            <p className="mt-5 max-w-lg leading-8 text-gray-600">
              Tell us what is working, what could be clearer, or what would make your study sessions better.
              Your feedback goes directly to the StudyMate team.
            </p>
            <div className="mt-7 flex items-center gap-3 text-sm text-gray-500">
              <ShieldCheck size={18} className="text-green-600" />
              Your message is sent securely from the backend.
            </div>
          </div>

          <form onSubmit={submitFeedback} className="rounded-3xl border border-gray-200 bg-[#f8fafc] p-6 shadow-sm md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Feedback type
                <select
                  value={feedback.category}
                  onChange={(event) => setFeedback({ ...feedback, category: event.target.value })}
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 font-normal outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/15"
                >
                  <option>General feedback</option>
                  <option>Bug report</option>
                  <option>Feature request</option>
                  <option>Study experience</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Subject
                <input
                  required
                  value={feedback.subject}
                  onChange={(event) => setFeedback({ ...feedback, subject: event.target.value })}
                  placeholder="How can we help?"
                  className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 font-normal outline-none placeholder:text-gray-400 focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/15"
                />
              </label>
            </div>
            <label className="mt-5 block text-sm font-semibold text-gray-700">
              Your feedback
              <textarea
                required
                maxLength={5000}
                rows={6}
                value={feedback.message}
                onChange={(event) => setFeedback({ ...feedback, message: event.target.value })}
                placeholder="Write your feedback here..."
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 font-normal leading-7 outline-none placeholder:text-gray-400 focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/15"
              />
            </label>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-sm ${feedbackState.error ? "text-red-600" : "text-green-700"}`}>
                {feedbackState.message}
              </p>
              <button
                disabled={feedbackState.loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F7FE7] px-6 py-3.5 font-semibold text-white transition hover:bg-[#416fd4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={17} />
                {feedbackState.loading ? "Sending..." : "Send feedback"}
              </button>
            </div>
          </form>
        </div>
      </section>


      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">

        <div className="bg-[#fbc52b] rounded-3xl px-8 lg:px-16 py-14 flex flex-col lg:flex-row items-center justify-between gap-8">

          <div>

            <h2 className="text-3xl font-bold">
              Ready to study smarter?
            </h2>

            <p className="mt-2 text-gray-800">
              Create personalized AI study prompts and start learning.
            </p>

          </div>

          <Link
            href="/prompt-generator"
            className="flex items-center gap-2 bg-[#111827] text-white px-7 py-4 rounded-xl font-semibold hover:bg-gray-800 transition whitespace-nowrap"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white">

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-[#fbc52b] flex items-center justify-center">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="font-bold">
                StudyMate
              </p>
              <p className="text-xs text-gray-500">
                AI Study Assistant
              </p>
            </div>

          </div>

          <p className="text-sm text-gray-500">
            StudyMate • AI-assisted university learning
          </p>

        </div>

      </footer>

    </main>
  );
}


/* -------------------------------------------------- */
/* COMPONENTS */
/* -------------------------------------------------- */

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all">

      <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center mb-5">
        <Icon
          size={21}
          className="text-yellow-700"
        />
      </div>

      <h3 className="text-lg font-bold mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 leading-6">
        {text}
      </p>

    </div>
  );
}


function Step({ number, icon: Icon, title, text }) {
  return (
    <div className="border border-gray-700 bg-gray-900 rounded-2xl p-6">

      <div className="flex items-center justify-between mb-6">

        <div className="w-11 h-11 rounded-xl bg-yellow-400 text-gray-900 flex items-center justify-center">
          <Icon size={21} />
        </div>

        <span className="text-sm font-bold text-gray-500">
          {number}
        </span>

      </div>

      <h3 className="text-lg font-bold mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-400 leading-6">
        {text}
      </p>

    </div>
  );
}


function TechCard({ icon: Icon, title, text }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">

      <Icon
        size={21}
        className="text-yellow-600 mb-4"
      />

      <h3 className="font-bold">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        {text}
      </p>

    </div>
  );
}