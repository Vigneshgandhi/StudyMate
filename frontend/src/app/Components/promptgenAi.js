"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EmailPromptButton from "./EmailPromptButton";

const API = "http://localhost:5001";

export default function PromptGenAI() {
  const router = useRouter();

  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examples = [
    "Create a prompt to learn Python OOP for my university exam.",
    "Create a prompt for understanding database normalization with examples.",
    "Create a prompt that generates a 7-day study plan for machine learning.",
  ];

  const generatePrompt = async () => {
    if (!input.trim()) {
      setError("Tell us what prompt you want to generate.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(
        `${API}/api/generate-custom-prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request: input.trim(),
            provider,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to generate prompt."
        );
      }

      setResult(data.prompt);

    } catch (err) {
      console.error(err);
      setError(
        err.message ||
        "Unable to connect to the AI service."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(result);
  };

  const useExample = (example) => {
    setInput(example);
    setError("");
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

            <b className="text-xl">
              StudyMate
            </b>

          </button>

          <button
            onClick={() => router.push("/prompt-generator")}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Study Prompt Fan
          </button>

        </div>

      </header>


      {/* MAIN */}

      <section className="mx-auto max-w-5xl px-6 py-16">

        {/* INTRO */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="rounded-full bg-[#F3E3C6] px-4 py-2 text-xs font-bold">
            AI PROMPT GENERATOR
          </span>

          <h1 className="mt-7 text-4xl font-bold leading-tight md:text-6xl">

            What prompt do you

            <br />

            <span className="text-[#4F7FE7]">
              want to create?
            </span>

          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-gray-500 leading-7">

            Describe what you want the AI to generate.
            StudyMate will turn your idea into a clear,
            detailed and effective AI prompt.

          </p>

        </div>


        {/* CHAT STYLE INPUT */}

        <div className="mx-auto mt-12 max-w-4xl">

          <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-[0_15px_50px_rgba(0,0,0,0.06)]">

            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder="Describe the prompt you want to generate..."
              rows={7}
              className="w-full resize-none rounded-2xl px-5 py-4 text-base leading-7 outline-none placeholder:text-gray-400"
            />


            {/* INPUT FOOTER */}

            <div className="flex flex-col gap-4 border-t border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">

                <span className="text-xs font-semibold text-gray-400">
                  Generate with
                </span>

                <button
                  onClick={() => setProvider("gemini")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    provider === "gemini"
                      ? "bg-[#F9D746] text-[#111]"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  G Gemini
                </button>

                <button
                  onClick={() => setProvider("openai")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    provider === "openai"
                      ? "bg-[#F9D746] text-[#111]"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  ✦ ChatGPT
                </button>

              </div>


              <button
                onClick={generatePrompt}
                disabled={loading}
                className="rounded-xl bg-[#4F7FE7] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#416FD4] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Creating..."
                  : "Generate Prompt →"}

              </button>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="mt-4 rounded-xl bg-[#F3E3C6] px-5 py-4 text-center text-sm">
              {error}
            </div>

          )}

        </div>


        {/* EXAMPLES */}

        {!result && !loading && (

          <div className="mx-auto mt-10 max-w-4xl">

            <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
              Try an example
            </p>

            <div className="grid gap-3 md:grid-cols-3">

              {examples.map((example, index) => (

                <button
                  key={index}
                  onClick={() => useExample(example)}
                  className="rounded-2xl border border-gray-200 p-4 text-left text-sm leading-6 text-gray-600 transition hover:border-[#4F7FE7] hover:bg-[#F7F9FF]"
                >
                  {example}
                </button>

              ))}

            </div>

          </div>

        )}


        {/* LOADING */}

        {loading && (

          <div className="mx-auto mt-12 max-w-3xl text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-[#F9D746] animate-spin">

              <div className="h-8 w-8 rounded-full bg-[#F9D746]" />

            </div>

            <p className="mt-6 font-semibold">
              Building your prompt...
            </p>

            <p className="mt-2 text-sm text-gray-400">
              {provider === "gemini"
                ? "Google Gemini"
                : "ChatGPT"}{" "}
              is creating your prompt.
            </p>

          </div>

        )}


        {/* RESULT */}

        {result && !loading && (

          <section className="mx-auto mt-14 max-w-4xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <span className="text-xs font-bold tracking-widest text-[#4F7FE7]">
                  GENERATED PROMPT
                </span>

                <h2 className="mt-2 text-2xl font-bold">
                  Your AI-ready prompt
                </h2>

              </div>

              <span className="rounded-full bg-[#F3E3C6] px-4 py-2 text-xs font-bold">
                {provider === "gemini"
                  ? "Gemini"
                  : "ChatGPT"}
              </span>

            </div>


            <div className="rounded-3xl border border-gray-200 bg-[#FAF9F6] p-7">

              <div className="prompt-markdown text-sm leading-8 text-gray-700">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h3 className="mb-4 text-xl font-bold text-gray-900">{children}</h3>,
                    h2: ({ children }) => <h4 className="mb-3 mt-6 text-lg font-bold text-gray-900">{children}</h4>,
                    h3: ({ children }) => <h5 className="mb-2 mt-5 font-bold text-gray-900">{children}</h5>,
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                    code: ({ children }) => <code className="rounded bg-gray-200 px-1.5 py-0.5 text-[0.9em] text-gray-900">{children}</code>,
                    pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm leading-6 text-gray-100">{children}</pre>,
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>

              <div className="mt-7 flex flex-wrap gap-3 border-t border-gray-200 pt-5">

                <button
                  onClick={copyPrompt}
                  className="rounded-xl bg-[#4F7FE7] px-6 py-3 text-sm font-bold text-white hover:bg-[#416FD4]"
                >
                  Copy Prompt
                </button>

                <EmailPromptButton
                  prompt={result}
                  subject="StudyMate Generated Prompt"
                  topic={input}
                />

                <button
                  onClick={() => setInput(result)}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold hover:bg-gray-50"
                >
                  Edit Prompt
                </button>

                <button
                  onClick={() => {
                    setResult("");
                    setInput("");
                  }}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold hover:bg-gray-50"
                >
                  Create Another
                </button>

              </div>

            </div>

          </section>

        )}

      </section>

    </main>
  );
}