"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Braces,
  Bug,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileCode2,
  Home,
  Lightbulb,
  Menu,
  MessageSquare,
  Play,
  RefreshCcw,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

const languages = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Kotlin",
  "Dart",
  "SQL",
];

const tasks = [
  {
    name: "Generate",
    icon: WandSparkles,
    text: "Create new code",
  },
  {
    name: "Explain",
    icon: Lightbulb,
    text: "Understand existing code",
  },
  {
    name: "Debug",
    icon: Bug,
    text: "Find and fix errors",
  },
  {
    name: "Refactor",
    icon: RefreshCcw,
    text: "Improve existing code",
  },
];

const examples = [
  "Create a Java program for binary search",
  "Explain this Python machine learning code",
  "Debug this C++ linked list program",
];

export default function CodingAiPage() {
  const [language, setLanguage] = useState("Python");
  const [task, setTask] = useState("Generate");
  const [request, setRequest] = useState("");

  const [languageOpen, setLanguageOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [response, setResponse] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const runCodingAI = async () => {
    if (!request.trim() || loading) return;

    setLoading(true);
    setResponse("");

    try {
      const csrf = document.cookie
        .split("; ")
        .find((row) =>
          row.startsWith("csrf_token=")
        )
        ?.split("=")[1];

      const result = await fetch(
        "http://localhost:5001/api/code-chat",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrf || "",
            Authorization:
              `Bearer ${
                localStorage.getItem("token") || ""
              }`,
          },
          body: JSON.stringify({
            message: request,
            language,
            task,
            history: [],
          }),
        }
      );

      const data = await result.json();

      if (!result.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Coding request failed"
        );
      }

      setResponse(data.message || "");
    } catch (error) {
      setResponse(
        "Unable to connect to CodeGeeX4. Make sure Ollama and Flask are running."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async () => {
    if (!response) return;

    await navigator.clipboard.writeText(
      response
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  const reset = () => {
    setRequest("");
    setResponse("");
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">

      {/* Mobile overlay */}
      {mobileMenu && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-black/25 lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-[260px]
          border-r border-slate-200
          bg-white
          shadow-sm
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileMenu
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex h-full flex-col">

          {/* Brand */}

          <div className="flex items-center justify-between border-b border-slate-100 p-5">

            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbc531]">
                <Sparkles size={20} />
              </div>

              <div>
                <h1 className="text-sm font-extrabold">
                  StudyMate
                </h1>

                <p className="text-[10px] text-slate-400">
                  AI Study Assistant
                </p>
              </div>
            </Link>

            <button
              onClick={() =>
                setMobileMenu(false)
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X size={18} />
            </button>

          </div>

          {/* Navigation */}

          <div className="p-4">

            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Workspace
            </p>

            <NavItem
              href="/"
              icon={<Home size={17} />}
              text="Home"
            />

            <NavItem
              href="/prompt-generator"
              icon={<WandSparkles size={17} />}
              text="Prompt Generator"
            />

            <NavItem
              href="/Chat"
              icon={<MessageSquare size={17} />}
              text="AI Chat"
            />

            <NavItem
              href="/CodingAi"
              icon={<Code2 size={17} />}
              text="CodingAI"
              active
            />

          </div>

          {/* Coding specialist */}

          <div className="mt-auto p-4">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-yellow-400">
                  <Braces size={18} />
                </div>

                <div>
                  <p className="text-xs font-bold">
                    CodeGeeX4
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Coding Specialist
                  </p>
                </div>

              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px] text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Local Ollama model
              </div>

            </div>

          </div>

        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="lg:ml-[260px]">

        {/* Header */}

        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setMobileMenu(true)
              }
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Development Workspace
              </p>

              <h2 className="text-sm font-bold sm:text-base">
                CodingAI
              </h2>
            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

            <Code2
              size={15}
              className="text-yellow-600"
            />

            <span className="text-xs font-semibold">
              CodeGeeX4
            </span>

            <span className="hidden text-[10px] text-slate-400 sm:inline">
              Local
            </span>

          </div>

        </header>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

          {/* Heading */}

          <div className="mb-8">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-xs font-bold text-yellow-700">
              <Sparkles size={14} />
              AI Coding Assistant
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Code smarter with CodingAI.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Generate programs, understand existing code,
              debug errors, and refactor solutions with
              CodeGeeX4.
            </p>

          </div>

          {/* Main panels */}

          <div className="grid gap-6 xl:grid-cols-[380px_1fr]">

            {/* =================================================
                REQUEST PANEL
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                  <FileCode2 size={19} />
                </div>

                <div>
                  <h2 className="text-base font-bold">
                    Coding Request
                  </h2>

                  <p className="text-[11px] text-slate-400">
                    Tell CodeGeeX4 what you need
                  </p>
                </div>

              </div>

              {/* Language */}

              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Programming Language
              </label>

              <div className="relative mb-6">

                <button
                  onClick={() =>
                    setLanguageOpen(
                      (value) => !value
                    )
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold hover:border-slate-300"
                >
                  <span>{language}</span>
                  <ChevronDown size={16} />
                </button>

                {languageOpen && (
                  <div className="absolute left-0 right-0 top-12 z-40 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">

                    {languages.map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setLanguage(item);
                            setLanguageOpen(false);
                          }}
                          className={`
                            w-full rounded-lg
                            px-3 py-2.5
                            text-left text-sm
                            ${
                              language === item
                                ? "bg-yellow-50 font-bold"
                                : "hover:bg-slate-50"
                            }
                          `}
                        >
                          {item}
                        </button>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* Task */}

              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Coding Task
              </label>

              <div className="mb-6 grid grid-cols-2 gap-2">

                {tasks.map(
                  (item) => (
                    <button
                      key={item.name}
                      onClick={() =>
                        setTask(item.name)
                      }
                      className={`
                        rounded-xl
                        border
                        p-3
                        text-left
                        transition
                        ${
                          task === item.name
                            ? "border-yellow-300 bg-yellow-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">

                        <item.icon
                          size={16}
                          className={
                            task === item.name
                              ? "text-yellow-700"
                              : "text-slate-500"
                          }
                        />

                        <span className="text-xs font-bold">
                          {item.name}
                        </span>

                      </div>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.text}
                      </p>
                    </button>
                  )
                )}

              </div>

              {/* Prompt */}

              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Your Request
              </label>

              <textarea
                value={request}
                onChange={(e) =>
                  setRequest(
                    e.target.value
                  )
                }
                placeholder={`Example:
Create a Python program to implement
a binary search tree with insertion,
search and traversal operations.`}
                className="
                  min-h-[220px]
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                  text-sm
                  leading-6
                  outline-none
                  transition
                  focus:border-yellow-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-yellow-100
                "
              />

              {/* Examples */}

              <div className="mt-4">

                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Try an example
                </p>

                <div className="space-y-2">

                  {examples.map(
                    (example) => (
                      <button
                        key={example}
                        onClick={() =>
                          setRequest(
                            example
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[11px] text-slate-500 hover:border-yellow-300 hover:bg-yellow-50"
                      >
                        {example}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* Buttons */}

              <div className="mt-5 flex gap-2">

                <button
                  onClick={runCodingAI}
                  disabled={
                    !request.trim() ||
                    loading
                  }
                  className="
                    flex flex-1
                    items-center justify-center
                    gap-2
                    rounded-xl
                    bg-[#fbc531]
                    px-4 py-3.5
                    text-sm
                    font-bold
                    text-black
                    shadow-sm
                    transition
                    hover:bg-yellow-300
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <Play size={16} />

                  {loading
                    ? "Generating..."
                    : "Run CodingAI"}
                </button>

                <button
                  onClick={reset}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  title="Reset"
                >
                  <RefreshCcw size={16} />
                </button>

              </div>

            </section>

            {/* =================================================
                RESPONSE PANEL
            ================================================= */}

            <section className="flex min-h-[720px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* Response header */}

              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-yellow-400">
                    <Braces size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      CodeGeeX4
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {language} • {task}
                    </p>
                  </div>

                </div>

                {response && (
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                  >
                    {copied ? (
                      <>
                        <Check size={13} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy
                      </>
                    )}
                  </button>
                )}

              </div>

              {/* Response */}

              <div className="flex-1 bg-[#fafafa] p-5">

                {!response &&
                  !loading && (
                    <div className="flex h-full min-h-[620px] flex-col items-center justify-center text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                        <Code2 size={30} />
                      </div>

                      <h3 className="mt-5 text-lg font-bold">
                        Your code will appear here
                      </h3>

                      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Select a programming language,
                        choose a task, describe your
                        requirement, and let CodeGeeX4
                        generate the response.
                      </p>

                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {[
                          "Generate",
                          "Explain",
                          "Debug",
                          "Refactor",
                        ].map(
                          (item) => (
                            <span
                              key={item}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-500"
                            >
                              {item}
                            </span>
                          )
                        )}
                      </div>

                    </div>
                  )}

                {loading && (
                  <div className="flex min-h-[620px] flex-col items-center justify-center text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400">
                      <Sparkles
                        size={24}
                        className="animate-pulse"
                      />
                    </div>

                    <p className="mt-5 text-sm font-bold">
                      CodeGeeX4 is thinking...
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Generating your {language} solution
                    </p>

                  </div>
                )}

                {response &&
                  !loading && (
                    <div className="min-h-[620px] overflow-auto rounded-2xl bg-[#181818] p-5 shadow-inner">

                      <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-gray-100">
                        {response}
                      </pre>

                    </div>
                  )}

              </div>

              {/* Response footer */}

              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3">

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Ollama Local AI
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Bot size={12} />
                  CodeGeeX4
                </div>

              </div>

            </section>

          </div>
        </div>
      </section>
    </main>
  );
}


/* ============================================================
   NAV ITEM
============================================================ */

function NavItem({
  href,
  icon,
  text,
  active,
}) {
  return (
    <Link
      href={href}
      className={`
        mb-1
        flex items-center
        gap-3
        rounded-xl
        px-3 py-3
        text-sm
        ${
          active
            ? "bg-[#fff7d6] font-bold text-slate-900"
            : "text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      {icon}
      {text}
    </Link>
  );
}