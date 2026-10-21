"use client";

import { useEffect, useState } from "react";
import {
  Bug,
  Database,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Send,
  Loader2,
  RotateCcw,
  Brain,
  Terminal,
} from "lucide-react";

const API = "http://localhost:5001/api/security";

const EXECUTED = [
  "EXECUTED",
  "EXECUTED_IN_LAB_DB",
  "FORGED_REQUEST_EXECUTED",
  "SIMULATED",
];

export default function SecurityAnalysis() {
  const [securityEnabled, setSecurityEnabled] = useState(true);

  const [loading, setLoading] = useState({
    xss: false,
    sql: false,
    csrf: false,
  });

  const [xssInput, setXssInput] = useState(
    "<script>alert('XSS ATTACK')</script>",
  );

  const [sqlUser, setSqlUser] = useState("' OR '1'='1' --");

  const [sqlPassword, setSqlPassword] = useState("anything");

  const [xssResult, setXssResult] = useState(null);
  const [sqlResult, setSqlResult] = useState(null);
  const [csrfResult, setCsrfResult] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const response = await fetch(`${API}/status`);
      const data = await response.json();

      if (typeof data.enabled === "boolean") {
        setSecurityEnabled(data.enabled);
      }
    } catch (error) {
      console.error("Status error:", error);
    }
  }

  async function toggleSecurity() {
    const enabled = !securityEnabled;

    try {
      const response = await fetch(`${API}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });

      const data = await response.json();

      if (response.ok) {
        setSecurityEnabled(data.enabled);
        clearResults();
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  }

  function clearResults() {
    setXssResult(null);
    setSqlResult(null);
    setCsrfResult(null);
  }

  async function analyzeXSS() {
    if (!xssInput.trim()) return;

    setLoading((x) => ({ ...x, xss: true }));
    setXssResult(null);

    try {
      const response = await fetch(`${API}/xss`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: xssInput,
        }),
      });

      const data = await response.json();

      setXssResult({
        ...data,
        http_status: response.status,
      });
    } catch {
      setXssResult({
        error: "Unable to connect to Flask backend.",
      });
    } finally {
      setLoading((x) => ({ ...x, xss: false }));
    }
  }

  async function analyzeSQL() {
    if (!sqlUser.trim()) return;

    setLoading((x) => ({ ...x, sql: true }));
    setSqlResult(null);

    try {
      const response = await fetch(`${API}/sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: sqlUser,
          password: sqlPassword,
        }),
      });

      const data = await response.json();

      setSqlResult({
        ...data,
        http_status: response.status,
      });
    } catch {
      setSqlResult({
        error: "Unable to connect to Flask backend.",
      });
    } finally {
      setLoading((x) => ({ ...x, sql: false }));
    }
  }

  async function analyzeCSRF() {
    setLoading((x) => ({ ...x, csrf: true }));
    setCsrfResult(null);

    try {
      const response = await fetch(`${API}/csrf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: "http://malicious-site.test",
          csrf_token: "",
        }),
      });

      const data = await response.json();

      setCsrfResult({
        ...data,
        http_status: response.status,
      });
    } catch {
      setCsrfResult({
        error: "Unable to connect to Flask backend.",
      });
    } finally {
      setLoading((x) => ({ ...x, csrf: false }));
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              <Shield size={15} />
              SECURITY ANALYSIS LAB
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Attack Analysis & Prevention
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              AI-assisted analysis of XSS, SQL Injection and CSRF attacks using
              Flask and Ollama.
            </p>
          </div>

          {/* SECURITY TOGGLE */}

          <button
            onClick={toggleSecurity}
            className={`flex items-center gap-3 rounded-2xl border bg-white px-5 py-3 shadow-sm ${
              securityEnabled ? "border-green-200" : "border-red-200"
            }`}
          >
            {securityEnabled ? (
              <ShieldCheck size={21} className="text-green-600" />
            ) : (
              <ShieldOff size={21} className="text-red-600" />
            )}

            <div className="text-left">
              <p className="text-xs font-bold">Security Protection</p>

              <p
                className={`text-[10px] font-bold ${
                  securityEnabled ? "text-green-600" : "text-red-600"
                }`}
              >
                {securityEnabled ? "ENABLED" : "DISABLED"}
              </p>
            </div>

            <div
              className={`ml-2 h-7 w-12 rounded-full p-1 ${
                securityEnabled ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white shadow transition ${
                  securityEnabled ? "translate-x-5" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* MODE */}

        <div
          className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 ${
            securityEnabled
              ? "border-green-200 bg-green-50"
              : "border-orange-200 bg-orange-50"
          }`}
        >
          {securityEnabled ? (
            <ShieldCheck size={20} className="text-green-600" />
          ) : (
            <ShieldOff size={20} className="text-orange-600" />
          )}

          <div>
            <p className="text-sm font-bold">
              {securityEnabled ? "Protection Mode" : "Attack Simulation Mode"}
            </p>

            <p className="text-xs text-slate-500">
              {securityEnabled
                ? "Security rules and AI analysis are active."
                : "The laboratory mode returns controlled attack results for analysis."}
            </p>
          </div>
        </div>

        {/* PROTECTION STATUS */}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold">Security Protection Status</h2>

          <div className="grid gap-3 md:grid-cols-3">
            <Status name="XSS Protection" enabled={securityEnabled} />

            <Status name="SQL Injection Protection" enabled={securityEnabled} />

            <Status name="CSRF Protection" enabled={securityEnabled} />
          </div>
        </div>

        {/* ATTACK TESTS */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* XSS */}

          <AttackCard
            icon={<Bug size={21} />}
            title="Cross-Site Scripting"
            description="Analyze suspicious HTML and JavaScript payloads."
          >
            <label className="mb-2 block text-xs font-bold text-slate-500">
              XSS Payload
            </label>

            <textarea
              value={xssInput}
              onChange={(e) => setXssInput(e.target.value)}
              className="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs outline-none focus:border-blue-500"
            />

            <button
              onClick={analyzeXSS}
              disabled={loading.xss}
              className="mt-3 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {loading.xss ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Analyze XSS
            </button>

            {xssResult && <Result data={xssResult} type="XSS" />}
          </AttackCard>

          {/* SQL INJECTION */}

          <AttackCard
            icon={<Database size={21} />}
            title="SQL Injection"
            description="Analyze a controlled SQL injection against the lab database."
          >
            <label className="mb-2 block text-xs font-bold text-slate-500">
              Username
            </label>

            <input
              value={sqlUser}
              onChange={(e) => setSqlUser(e.target.value)}
              className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs outline-none focus:border-blue-500"
            />

            <label className="mb-2 block text-xs font-bold text-slate-500">
              Password
            </label>

            <input
              value={sqlPassword}
              onChange={(e) => setSqlPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs outline-none focus:border-blue-500"
            />

            <button
              onClick={analyzeSQL}
              disabled={loading.sql}
              className="mt-3 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {loading.sql ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Analyze SQL Injection
            </button>

            {sqlResult && <Result data={sqlResult} type="SQL" />}
          </AttackCard>

          {/* CSRF */}

          <div className="lg:col-span-2">
            <AttackCard
              icon={<Lock size={21} />}
              title="Cross-Site Request Forgery"
              description="Analyze an untrusted request origin and CSRF-token state."
            >
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                  Simulated Origin
                </p>

                <p className="mt-1 font-mono text-sm font-semibold text-red-700">
                  http://malicious-site.test
                </p>
              </div>

              <button
                onClick={analyzeCSRF}
                disabled={loading.csrf}
                className="mt-3 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {loading.csrf ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShieldAlert size={16} />
                )}
                Analyze CSRF
              </button>

              {csrfResult && <Result data={csrfResult} type="CSRF" />}
            </AttackCard>
          </div>
        </div>

        {/* CLEAR */}

        <div className="mt-6 flex justify-center">
          <button
            onClick={clearResults}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-500 shadow-sm"
          >
            <RotateCcw size={14} />
            Clear Results
          </button>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   ATTACK CARD
============================================================ */

function AttackCard({ icon, title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div>
          <h2 className="font-bold">{title}</h2>

          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   RESULT
============================================================ */

function Result({ data, type }) {
  if (data.error) {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
        {data.error}
      </div>
    );
  }

  const blocked = data.action === "BLOCKED";

  const executed = EXECUTED.includes(data.action);

  return (
    <div
      className={`mt-4 rounded-2xl border p-4 ${
        blocked
          ? "border-red-200 bg-red-50"
          : executed
            ? "border-orange-300 bg-orange-50"
            : "border-green-200 bg-green-50"
      }`}
    >
      {/* ACTION */}

      <div className="flex items-center gap-2">
        {blocked ? (
          <ShieldAlert size={18} className="text-red-600" />
        ) : executed ? (
          <Terminal size={18} className="text-orange-600" />
        ) : (
          <ShieldCheck size={18} className="text-green-600" />
        )}

        <b
          className={
            blocked
              ? "text-red-700"
              : executed
                ? "text-orange-700"
                : "text-green-700"
          }
        >
          {blocked
            ? "ATTACK BLOCKED"
            : executed
              ? "ATTACK EXECUTED"
              : "REQUEST PROTECTED"}
        </b>
      </div>

      {/* BASIC RESULT */}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Info
          label="Attack Type"
          value={data.attack || data.vulnerability || type}
        />

        <Info label="Status" value={data.status} />

        <Info label="Risk Level" value={data.risk || data.risk_level} />

        <Info label="Action" value={data.action} />

        <Info label="Pattern" value={data.pattern_detected || "N/A"} />

        <Info label="HTTP Status" value={data.http_status || 200} />
      </div>

      {/* SQL RESULT */}

      {type === "SQL" && data.query && (
        <div className="mt-4 rounded-xl border border-orange-200 bg-white p-4">
          <div className="flex items-center gap-2 text-orange-700">
            <Terminal size={15} />
            <b className="text-xs">SQL LAB OUTPUT</b>
          </div>

          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Query
          </p>

          <pre className="mt-2 overflow-auto rounded-xl bg-slate-900 p-4 text-[11px] leading-5 text-yellow-300">
            {data.query}
          </pre>

          {data.results && (
            <>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Database Output
              </p>

              <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-slate-900 p-4 text-[11px] leading-5 text-green-400">
                {JSON.stringify(data.results, null, 2)}
              </pre>
            </>
          )}

          {typeof data.rows_returned === "number" && (
            <div className="mt-3 rounded-xl bg-orange-50 p-3 text-xs font-bold text-orange-700">
              Rows returned: {data.rows_returned}
            </div>
          )}
        </div>
      )}

      {/* XSS OUTPUT */}

      {type === "XSS" && data.payload && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Bug size={15} className="text-orange-600" />

            <b className="text-xs">XSS PAYLOAD</b>
          </div>

          <pre className="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 text-[11px] leading-5 text-green-400">
            {data.payload}
          </pre>

          <p className="mt-3 text-xs text-slate-500">
            Execution state: <b>{data.action}</b>
          </p>
        </div>
      )}

      {/* CSRF OUTPUT */}

      {type === "CSRF" && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-orange-600" />

            <b className="text-xs">CSRF REQUEST DETAILS</b>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Info
              label="Origin"
              value={data.origin || "http://malicious-site.test"}
            />

            <Info label="HTTP Response" value={data.http_status || 200} />
          </div>

          {executed && (
            <div className="mt-3 rounded-xl bg-orange-50 p-3 text-xs font-bold text-orange-700">
              Forged request processed in laboratory mode.
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          AI SECURITY ANALYSIS
      ===================================================== */}

      {data.ai_analysis && <AIAnalysis analysis={data.ai_analysis} />}

      {/* MESSAGE */}

      {data.message && (
        <div className="mt-4 rounded-xl bg-white/80 p-3 text-xs leading-5 text-slate-600">
          {data.message}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   AI ANALYSIS
============================================================ */

function AIAnalysis({ analysis }) {
  return (
    <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Brain size={16} />
        </div>

        <div>
          <p className="text-xs font-bold text-blue-800">
            AI SECURITY ANALYSIS
          </p>

          <p className="text-[10px] text-blue-500">
            Ollama-powered threat analysis
          </p>
        </div>
      </div>

      {/* AI STATUS */}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Info label="AI Model" value={analysis.ai_model} />

        <Info
          label="AI Detection"
          value={analysis.detected ? "Threat Detected" : "No Threat Detected"}
        />

        <Info label="AI Risk Level" value={analysis.risk_level} />

        <Info label="AI Attack Type" value={analysis.attack_type} />
      </div>

      {/* SUSPICIOUS PATTERN */}

      <div className="mt-3 rounded-xl bg-white p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Suspicious Pattern
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-700">
          {analysis.suspicious_pattern || "Not identified"}
        </p>
      </div>

      {/* EXPLANATION */}

      <div className="mt-2 rounded-xl bg-white p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          AI Explanation
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          {analysis.explanation || "No explanation returned."}
        </p>
      </div>

      {/* RECOMMENDATION */}

      <div className="mt-2 rounded-xl bg-white p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          AI Recommendation
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          {analysis.recommendation || "No recommendation returned."}
        </p>
      </div>

      {!analysis.ai_available && (
        <div className="mt-3 rounded-xl bg-yellow-50 p-3 text-xs text-yellow-700">
          Ollama AI analysis was unavailable. Server-side security controls
          remain active.
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

function Status({ name, enabled }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
        enabled ? "bg-green-50" : "bg-red-50"
      }`}
    >
      {enabled ? (
        <ShieldCheck size={16} className="text-green-600" />
      ) : (
        <ShieldOff size={16} className="text-red-600" />
      )}

      <span
        className={`text-xs font-semibold ${
          enabled ? "text-green-700" : "text-red-700"
        }`}
      >
        {name}
      </span>

      <span
        className={`ml-auto text-[10px] font-bold ${
          enabled ? "text-green-600" : "text-red-600"
        }`}
      >
        {enabled ? "ON" : "OFF"}
      </span>
    </div>
  );
}

/* ============================================================
   INFO
============================================================ */

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-slate-700">
        {String(value ?? "N/A")}
      </p>
    </div>
  );
}
