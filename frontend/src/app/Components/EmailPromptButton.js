import { Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";
export default function EmailPromptButton({ prompt, subject, topic }) {
  const send = async () => {
    const response = await apiFetch("http://localhost:5001/api/email/prompt", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` }, body: JSON.stringify({ prompt, subject, topic }) });
    const data = await response.json();
    window.alert(data.message || "Prompt emailed");
  };
  return <button onClick={send} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"><Mail size={16} /> Email Prompt</button>;
}
