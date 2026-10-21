"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiFetch } from "@/lib/api";
import PromptGenAI from "../Components/promptgenAi";
import EmailPromptButton from "../Components/EmailPromptButton";

const types = [
  "Concept Understanding",
  "Exam Preparation",
  "Step-by-Step Learning",
  "Practical Examples",
  "Practice Questions",
  "Quick Revision",
];

const positions = ["top", "tr", "br", "bottom", "bl", "tl"];

export default function PromptGenerator() {
  const router = useRouter();

  const [form, setForm] = useState({
    subject: "",
    topic: "",
    level: "",
    goal: "",
    duration: "",
    learningStyle: "",
    aiProvider: "",
  });

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/Login");
    const params = new URLSearchParams(window.location.search);
    setForm((current) => ({
      ...current,
      subject: params.get("subject") || current.subject,
      topic: params.get("topic") || current.topic,
    }));
  }, [router]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectAI = (provider) => setForm({ ...form, aiProvider: provider });

  const generate = async (e) => {
    e.preventDefault();
    setMsg("");
    setPrompts([]);

    if (Object.values(form).some((x) => !x)) {
      setMsg("Please complete all required details and select an AI.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/api/generate-prompts", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Generation failed.");

      if (!data.prompts || data.prompts.length !== 6)
        throw new Error("AI did not return exactly 6 prompts.");

      setPrompts(data.prompts);

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setMsg(err.message || "Unable to connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text, i) => {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/Login");
  };

  return (
    <main className="min-h-screen bg-white text-[#111]">
      {/* HEADER */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9D746] text-xl">
              ✦
            </span>
            <b className="text-xl">StudyMate</b>
          </button>

          <button onClick={logout} className="text-sm font-semibold underline">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        {/* INTRO */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full bg-[#F3E3C6] px-4 py-2 text-xs font-bold">
            AI STUDY ASSISTANT
          </span>

          <h1 className="mt-6 text-4xl font-bold md:text-5xl">
            What do you want to <span className="text-[#4F7FE7]">study?</span>
          </h1>

          <p className="mt-5 text-gray-500">
            Tell us what you want to learn and we'll create six personalized
            ways to study it with AI.
          </p>
        </div>

        {/* FORM */}
        <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-gray-200 p-7 shadow-sm md:p-9">
          <div className="mb-8 flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F9D746] font-bold">
              01
            </span>

            <div>
              <b>Tell us about your study</b>
              <p className="text-xs text-gray-400">
                Give us enough context to personalize your prompts.
              </p>
            </div>
          </div>

          <form onSubmit={generate} className="space-y-6">
            {/* SUBJECT */}
            <Input
              name="subject"
              label="What subject do you want to study?"
              placeholder="Example: Computer Networks"
              value={form.subject}
              change={change}
            />

            {/* TOPIC */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                What exactly do you want to study? *
              </label>

              <textarea
                name="topic"
                rows="3"
                value={form.topic}
                onChange={change}
                placeholder="Example: OSI model, TCP/IP, routing protocols..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/20"
              />
            </div>

            {/* SELECTS */}
            <div className="grid gap-5 md:grid-cols-2">
              <Select
                name="level"
                label="Current level"
                value={form.level}
                change={change}
                options={["Beginner", "Intermediate", "Advanced"]}
              />

              <Select
                name="goal"
                label="Main study goal"
                value={form.goal}
                change={change}
                options={[
                  "Understand the concept",
                  "Prepare for exam",
                  "Quick revision",
                  "Practice questions",
                  "Build practical knowledge",
                ]}
              />

              <Select
                name="duration"
                label="Available study time"
                value={form.duration}
                change={change}
                options={[
                  "15 minutes",
                  "30 minutes",
                  "1 hour",
                  "2 hours",
                  "More than 2 hours",
                ]}
              />

              <Select
                name="learningStyle"
                label="Preferred learning style"
                value={form.learningStyle}
                change={change}
                options={[
                  "Simple explanations",
                  "Examples",
                  "Step-by-step",
                  "Visual learning",
                  "Questions and practice",
                ]}
              />
            </div>

            {/* AI SELECTION */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Choose your AI tutor *</p>

                {form.aiProvider && (
                  <span className="text-xs font-semibold text-[#4F7FE7]">
                    Selected: {form.aiProvider}
                  </span>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* GEMINI */}
                <button
                  type="button"
                  onClick={() => selectAI("Gemini")}
                  className={`
                    flex items-center gap-4 rounded-2xl border p-4 text-left
                    transition
                    ${
                      form.aiProvider === "Gemini"
                        ? "border-[#4F7FE7] bg-[#F7F9FF] ring-2 ring-[#4F7FE7]/20"
                        : "border-gray-200 hover:border-[#4F7FE7]"
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-12 w-12 items-center justify-center rounded-xl
                      font-bold
                      ${
                        form.aiProvider === "Gemini"
                          ? "bg-[#F9D746]"
                          : "bg-[#F3E3C6]"
                      }
                    `}
                  >
                    G
                  </span>

                  <div className="flex-1">
                    <b className="text-sm">Google Gemini</b>

                    <p className="mt-1 text-xs text-gray-400">
                      Great for explanations and examples
                    </p>
                  </div>

                  {form.aiProvider === "Gemini" && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4F7FE7] text-xs text-white">
                      ✓
                    </span>
                  )}
                </button>

                {/* CHATGPT */}
                <button
                  type="button"
                  onClick={() => selectAI("ChatGPT")}
                  className={`
                    flex items-center gap-4 rounded-2xl border p-4 text-left
                    transition
                    ${
                      form.aiProvider === "ChatGPT"
                        ? "border-[#4F7FE7] bg-[#F7F9FF] ring-2 ring-[#4F7FE7]/20"
                        : "border-gray-200 hover:border-[#4F7FE7]"
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-12 w-12 items-center justify-center rounded-xl
                      font-bold
                      ${
                        form.aiProvider === "ChatGPT"
                          ? "bg-[#F9D746]"
                          : "bg-[#F3E3C6]"
                      }
                    `}
                  >
                    AI
                  </span>

                  <div className="flex-1">
                    <b className="text-sm">ChatGPT</b>

                    <p className="mt-1 text-xs text-gray-400">
                      Great for tutoring and practice
                    </p>
                  </div>

                  {form.aiProvider === "ChatGPT" && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4F7FE7] text-xs text-white">
                      ✓
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* GENERATE */}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#4F7FE7] py-4 font-bold transition hover:bg-[#416FD4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? `Creating prompts with ${form.aiProvider}...`
                : "Generate 6 Study Prompts →"}
            </button>

            {msg && (
              <div className="rounded-xl bg-[#F3E3C6] p-4 text-center text-sm">
                {msg}
              </div>
            )}
          </form>
        </div>

        {/* ================================================= */}
        {/* FAN RESULT */}
        {/* ================================================= */}

        {prompts.length === 6 && (
          <section id="results" className="mt-24">
            <div className="text-center">
              <span className="text-xs font-bold tracking-widest text-[#4F7FE7]">
                SIX LEARNING APPROACHES
              </span>

              <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                Your study prompt fan
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                Generated using {form.aiProvider} for {form.topic}.
              </p>
            </div>

            {/* FAN */}
            <div className="fan">
              <div className="ring" />

              {/* CENTER HUB */}
              <div className="hub">
                <span className="text-3xl">✦</span>

                <b>StudyMate</b>

                <small>{form.aiProvider}</small>
              </div>

              {/* PROMPTS */}
              {prompts.map((p, i) => {
                const text = typeof p === "string" ? p : p?.prompt || "";

                return (
                  <div key={i} className={`card ${positions[i]}`}>
                    <div className="flex justify-between">
                      <span className="num">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <small>STUDY PROMPT</small>
                    </div>

                    <b className="mt-4 block text-[#4F7FE7]">{types[i]}</b>

                    <div className="mt-3 text-sm leading-6 text-gray-600">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc space-y-1 pl-5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal space-y-1 pl-5">
                              {children}
                            </ol>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-gray-900">
                              {children}
                            </strong>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    </div>

                    <button
                      onClick={() => copy(text, i)}
                      className="mt-4 w-full rounded-xl border py-2 text-xs font-bold hover:bg-gray-50"
                    >
                      {copied === i ? "✓ Copied" : "Copy Prompt"}
                    </button>

                    <EmailPromptButton
                      prompt={text}
                      subject={form.subject}
                      topic={form.topic}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </section>

      {/* FAN CSS */}
      <style jsx>{`
        .fan {
          position: relative;
          width: 100%;
          max-width: 1100px;
          height: 700px;
          margin: 50px auto;
        }

        .ring {
          position: absolute;
          width: 500px;
          height: 500px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border: 1px dashed #e5e7eb;
          border-radius: 50%;
        }

        .hub {
          position: absolute;
          z-index: 30;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 155px;
          height: 155px;
          border-radius: 50%;
          background: #f9d746;
          border: 9px solid white;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .hub small {
          margin-top: 5px;
          font-size: 8px;
          letter-spacing: 2px;
          color: #555;
          text-transform: uppercase;
        }

        .card {
          position: absolute;
          z-index: 10;
          width: 310px;
          min-height: 270px;
          padding: 22px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
          transition: 0.35s;
        }

        .card:hover {
          z-index: 50;
          transform: scale(1.04) rotate(0deg) !important;
          box-shadow: 0 25px 55px rgba(0, 0, 0, 0.12);
        }

        .num {
          display: flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #f9d746;
          font-weight: bold;
          font-size: 13px;
        }

        .top {
          left: 50%;
          top: 0;
          transform: translateX(-50%) rotate(-8deg);
        }

        .tr {
          right: 0;
          top: 110px;
          transform: rotate(10deg);
        }

        .br {
          right: 0;
          bottom: 60px;
          transform: rotate(7deg);
        }

        .bottom {
          left: 50%;
          bottom: 0;
          transform: translateX(-50%) rotate(8deg);
        }

        .bl {
          left: 0;
          bottom: 60px;
          transform: rotate(-7deg);
        }

        .tl {
          left: 0;
          top: 110px;
          transform: rotate(-10deg);
        }

        @media (max-width: 900px) {
          .fan {
            height: auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .ring,
          .hub {
            display: none;
          }

          .card {
            position: relative;
            width: 100%;
            min-height: 0;
            left: auto;
            right: auto;
            top: auto;
            bottom: auto;
            transform: none !important;
          }
        }

        @media (max-width: 600px) {
          .fan {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <section>
        <PromptGenAI />
      </section>
    </main>
  );
}

/* INPUT */

function Input({ name, label, placeholder, value, change }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label} *</label>

      <input
        name={name}
        value={value}
        onChange={change}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/20"
      />
    </div>
  );
}

/* SELECT */

function Select({ name, label, value, change, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label} *</label>

      <select name={name}
        value={value}
        onChange={change}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/20"
      >
        <option value="">Select {label.toLowerCase()}</option>

        {options.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </div>
  );
}
