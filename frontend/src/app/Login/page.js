"use client";
import { apiFetch } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(
        "/api/login",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid email or password.");
        return;
      }

      // Store authentication data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const user = data.user || JSON.parse(localStorage.getItem("user") || "{}")

      if (user.role === "admin") {
        router.push("/admin");
        return;
      }

      // Move to Prompt Generator
      router.push("/prompt-generator");

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

          {/* Logo */}
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
            Don't have an account?

            <a
              href="/Register"
              className="ml-2 font-semibold text-[#111111] underline underline-offset-4"
            >
              Create account
            </a>
          </p>

        </div>
      </header>


      {/* Main */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">

        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">


          {/* LEFT SIDE */}
          <div className="hidden lg:block">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3E3C6] text-sm font-medium text-[#111111]">

              <span className="w-2 h-2 rounded-full bg-[#F9D746]" />

              Welcome back

            </div>


            <h1 className="mt-7 text-5xl font-bold leading-tight tracking-tight text-[#111111]">

              Continue your
              <br />

              <span className="text-[#4F7FE7]">
                learning journey.
              </span>

            </h1>


            <p className="mt-6 max-w-md text-gray-600 leading-7">
              Sign in to access your personalized AI study assistant,
              saved notes, quizzes, flashcards, and study progress.
            </p>


            {/* AI Preview */}
            <div className="mt-10 border border-gray-200 rounded-2xl p-5 max-w-md">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-[#F9D746] flex items-center justify-center">
                  ✦
                </div>

                <div>
                  <p className="font-semibold text-sm text-[#111111]">
                    StudyMate AI
                  </p>

                  <p className="text-xs text-gray-400">
                    Your personal study companion
                  </p>
                </div>

              </div>


              <div className="mt-5 bg-gray-50 rounded-xl p-4">

                <p className="text-xs text-gray-400">
                  Today's suggestion
                </p>

                <p className="mt-2 text-sm font-medium text-[#111111]">
                  Review the concepts you studied yesterday.
                </p>

                <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">

                  <div
                    className="h-full bg-[#F9D746] rounded-full"
                    style={{ width: "72%" }}
                  />

                </div>

                <p className="mt-2 text-xs text-gray-400">
                  72% of today's goal completed
                </p>

              </div>

            </div>

          </div>


          {/* LOGIN CARD */}
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
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Sign in to continue learning
                </p>

              </div>


              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="mt-8 space-y-5"
              >


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
                    autoComplete="email"
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-[#111111] placeholder:text-gray-500 outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/20 transition"
                  />

                </div>


                {/* Password */}
                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-[#111111]"
                    >
                      Password
                    </label>

                    <a
                      href="/forgot-password"
                      className="text-xs font-semibold text-[#111111] underline underline-offset-4"
                    >
                      Forgot password?
                    </a>

                  </div>


                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full h-12 px-4 pr-16 rounded-lg border border-gray-300 bg-white text-[#111111] placeholder:text-gray-500 outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/20 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#111111]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>


                {/* Remember */}
                <div className="flex items-center gap-3">

                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 accent-[#4F7FE7]"
                  />

                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600"
                  >
                    Remember me
                  </label>

                </div>


                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-[#4F7FE7] text-[#111111] font-bold hover:bg-[#416fd4] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing In..." : "Sign In →"}
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


              {/* Google Login */}
              <button
                type="button"
                className="w-full h-12 rounded-lg border border-gray-300 bg-white text-[#111111] font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-3"
              >

                <span className="text-lg font-bold">
                  G
                </span>

                Continue with Google

              </button>


              {/* Register */}
              <p className="mt-7 text-center text-sm text-gray-500">

                New to StudyMate?

                <a
                  href="/Register"
                  className="ml-1 font-semibold text-[#111111] underline underline-offset-4"
                >
                  Create an account
                </a>

              </p>

            </div>


            {/* Security */}
            <div className="mt-5 flex justify-center items-center gap-2 text-xs text-gray-500">

              <span>🔒</span>

              <span>
                Your account information is securely protected.
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