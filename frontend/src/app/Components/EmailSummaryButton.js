import { Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function EmailSummaryButton({ subject, topic, summary, keyPoints = [], nextSteps = [] }) {
  const send = async () => {
    const response = await apiFetch("http://localhost:5001/api/email/study-summary", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` }, body: JSON.stringify({ subject, topic, summary, keyPoints, nextSteps }) });
    const data = await response.json();
    window.alert(data.message || "Study summary emailed");
  };
  return <button onClick={send} className="inline-flex items-center gap-2 rounded-xl bg-[#F9D746] px-4 py-2 text-sm font-bold text-slate-900 hover:bg-[#f5cf3d]"><Mail size={16} /> Email Study Summary</button>;
}
