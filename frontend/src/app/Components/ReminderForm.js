"use client";
import { useState } from "react";
import { Bell } from "lucide-react";

export default function ReminderForm() {
  const [form, setForm] = useState({ subject: "", topic: "", reminder_datetime: "" });
  const [message, setMessage] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const response = await fetch("http://localhost:5001/api/reminders", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` }, body: JSON.stringify(form) });
    const data = await response.json();
    setMessage(data.message || "Reminder saved");
    if (response.ok) setForm({ subject: "", topic: "", reminder_datetime: "" });
  };
  return <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-[#F3E3C6] p-3"><Bell size={18} /></div><div><h3 className="font-bold">Study Reminder</h3><p className="text-sm text-slate-500">Get a reminder by email at study time.</p></div></div><div className="grid gap-4 md:grid-cols-3"><input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4F7FE7]" /><input required placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4F7FE7]" /><input required type="datetime-local" value={form.reminder_datetime} onChange={(e) => setForm({ ...form, reminder_datetime: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4F7FE7]" /></div><button className="mt-4 rounded-xl bg-[#4F7FE7] px-5 py-3 font-bold text-white">Set Reminder</button>{message && <p className="mt-3 text-sm text-slate-600">{message}</p>}</form>;
}
