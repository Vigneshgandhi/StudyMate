"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!name || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(
        "/api/register",
        {
          method: "POST",

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage("Account created successfully!");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        router.push("/Login");
      }, 1000);

    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <header className="h-20 border-b border-gray-100 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">

          <a href="/" className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-[#F9D746] flex items-center justify-center">
              <span className="text-xl font-bold text-[#111111]">
                ✦
              </span>
            </div>

            <span className="text-xl font-bold tracking-tight text-[#111111]">
              StudyMate
            </span>

          </a>

          <p className="text-sm text-gray-500">
            Already have an account?

            <a
              href="/Login"
              className="ml-2 font-semibold text-[#111111] underline underline-offset-4"
            >
              Sign in
            </a>
          </p>

        </div>
      </header>


      {/* Main */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">

        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="hidden lg:block">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3E3C6] text-sm font-medium text-[#111111]">

              <span className="w-2 h-2 rounded-full bg-[#F9D746]" />

              AI-powered learning

            </div>

            <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-[#111111]">
              Start your
              <br />
              smarter
              <span className="text-[#4F7FE7]"> study journey.</span>
            </h1>

            <p className="mt-6 max-w-md text-gray-600 leading-7">
              Create your StudyMate account and get access to an
              intelligent study companion designed to help you learn,
              practice, and prepare better.
            </p>


            {/* Benefits */}
            <div className="mt-8 space-y-4">

              <Benefit
                icon="✦"
                title="Personal AI Tutor"
                text="Understand difficult concepts with AI-powered explanations."
                color="#F9D746"
              />

              <Benefit
                icon="✓"
                title="Smart Study Tools"
                text="Create notes, quizzes, flashcards, and study plans."
                color="#F3E3C6"
              />

              <Benefit
                icon="→"
                title="Learn at Your Pace"
                text="Build a personalized learning experience around you."
                color="#4F7FE7"
              />

            </div>

          </div>


          {/* Register Card */}
          <div className="w-full max-w-md mx-auto">

            <div className="border border-gray-200 rounded-2xl bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">

              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-7">

                <div className="w-12 h-12 rounded-xl bg-[#F9D746] flex items-center justify-center">

                  <span className="text-2xl font-bold">
                    ✦
                  </span>

                </div>

              </div>


              {/* Heading */}
              <div className="text-center">

                <h2 className="text-3xl font-bold tracking-tight text-[#111111]">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Start your personalized learning journey
                </p>

              </div>


              {/* Form */}
              <form
                onSubmit={handleRegister}
                className="mt-8 space-y-5"
              >

                {/* Name */}
                <div>

                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-[#111111] mb-2"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-[#111111] placeholder:text-gray-500 outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/20 transition"
                  />

                </div>


                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-[#111111] mb-2"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-[#111111] placeholder:text-gray-500 outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/20 transition"
                  />

                </div>


                {/* Password */}
                <div>

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#111111] mb-2"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-300 bg-white text-[#111111] placeholder:text-gray-500 outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/20 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#111111]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>


                {/* Terms */}
                <div className="flex items-start gap-3">

                  <input
                    id="terms"
                    type="checkbox"
                    className="mt-1 w-4 h-4 accent-[#4F7FE7]"
                  />

                  <label
                    htmlFor="terms"
                    className="text-sm leading-5 text-gray-600"
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      className="font-semibold text-[#111111] underline underline-offset-2"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="font-semibold text-[#111111] underline underline-offset-2"
                    >
                      Privacy Policy
                    </a>.
                  </label>

                </div>


                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-[#4F7FE7] text-[#111111] font-bold hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account →"}
                </button>


                {/* Backend Message */}
                {message && (
                  <p className="text-center text-sm text-gray-600">
                    {message}
                  </p>
                )}

              </form>


              {/* Divider */}
              <div className="flex items-center gap-4 my-7">

                <div className="flex-1 h-px bg-gray-200" />

                <span className="text-xs text-gray-400">
                  OR
                </span>

                <div className="flex-1 h-px bg-gray-200" />

              </div>


              {/* Google */}
              <button
                type="button"
                className="w-full h-12 rounded-lg border border-gray-300 bg-white text-[#111111] font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-3"
              >

                <span className="text-lg font-bold">
                  G
                </span>

                Continue with Google

              </button>


              {/* Login */}
              <p className="mt-7 text-center text-sm text-gray-500">

                Already have an account?

                <a
                  href="/Login"
                  className="ml-1 font-semibold text-[#111111] underline underline-offset-4"
                >
                  Sign in
                </a>

              </p>

            </div>


            {/* Security note */}
            <div className="mt-5 flex justify-center items-center gap-2 text-xs text-gray-500">

              <span>🔒</span>

              <span>
                Your information is securely protected.
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* Footer */}
      <footer className="border-t border-gray-100 py-5">

        <p className="text-center text-xs text-gray-400">
          © 2026 StudyMate. Learn smarter.
        </p>

      </footer>

    </main>
  );
}


/* Benefit Component */

function Benefit({ icon, title, text, color }) {
  return (
    <div className="flex items-start gap-4">

      <div
        className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-[#111111]"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

      <div>

        <h3 className="font-semibold text-[#111111]">
          {title}
        </h3>

        <p className="mt-1 text-sm text-gray-500 leading-5">
          {text}
        </p>

      </div>

    </div>
  );
}