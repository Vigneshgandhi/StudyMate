"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  FileLock,
  Lock,
  Link as LinkIcon,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const providerOptions = ["all", "Ollama", "ChatGPT", "Gemini"];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    conversations: 0,
    encrypted: true,
    storage: "chat_data.json",
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [selectedChat, setSelectedChat] = useState(null);
  const [decryptingChatId, setDecryptingChatId] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchAdminData = useEffectEvent(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, chatsRes] = await Promise.all([
        apiFetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiFetch("/api/admin/chats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const statsData = await statsRes.json();
      const chatsData = await chatsRes.json();

      if (!statsRes.ok || !chatsRes.ok) {
        if ([statsRes.status, chatsRes.status].some((status) => status === 401 || status === 403)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/Login");
          return;
        }

        throw new Error(
          statsData.message || chatsData.message || "Admin access failed."
        );
      }

      setStats({
        users: statsData.users || 0,
        conversations: statsData.conversations || 0,
        encrypted: statsData.encrypted !== false,
        storage: statsData.storage || "chat_data.json",
      });
      setRecords(chatsData.chats || []);
    } catch (err) {
      setError(err.message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!token) {
      router.push("/Login");
      return;
    }

    const loadTask = setTimeout(() => {
      fetchAdminData();
    }, 0);

    return () => clearTimeout(loadTask);
  }, [router, token]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        !search ||
        String(record.id).includes(search) ||
        (record.provider || "").toLowerCase().includes(search.toLowerCase());

      const matchesProvider =
        providerFilter === "all" || record.provider === providerFilter;

      return matchesSearch && matchesProvider;
    });
  }, [records, search, providerFilter]);

  const decryptRecord = async (chatId) => {
    setDecryptingChatId(chatId);

    try {
      const res = await apiFetch(
        `/api/admin/chats/${chatId}/decrypt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to decrypt the record.");
      }

      setSelectedChat(data.chat);
    } catch (err) {
      setError(err.message || "Unable to decrypt this chat record.");
    } finally {
      setDecryptingChatId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/Login");
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9D746] text-xl font-bold text-slate-900">
              ✦
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                StudyMate
              </p>
              <h1 className="text-xl font-bold">Admin</h1>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="flex items-center gap-3 rounded-2xl bg-[#fff7d5] px-3 py-3 font-semibold text-slate-900">
              <BarChart3 size={18} />
              Dashboard
            </div>
            <div className="flex items-center gap-3 rounded-2xl px-3 py-3 text-slate-600 hover:bg-slate-50">
              <ShieldCheck size={18} />
              Security
            </div>
            <div className="flex items-center gap-3 rounded-2xl px-3 py-3 text-slate-600 hover:bg-slate-50">
              <FileLock size={18} />
              Encrypted Storage
            </div>
            <Link
              href="/admin/blog"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-slate-600 hover:bg-slate-50"
            >
              <BookOpen size={18} />
              Blog Management
            </Link>
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Lock size={16} className="text-emerald-600" />
              Encryption Status
            </div>
            <p className="text-sm text-slate-600">AES-256-GCM active</p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-10 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </aside>

        <div className="flex-1">
          <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Overview</p>
                <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9D746] text-slate-900">
                  <UserCog size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Admin</p>
                  <p className="text-sm font-semibold">StudyMate Control</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dbe6ff] bg-[#f7f9ff] px-4 py-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <LinkIcon size={17} className="text-[#4F7FE7]" />
                <span>Admin-only blog tools with Ollama drafts and review before publishing.</span>
              </div>
              <Link href="/admin/blog" className="inline-flex items-center gap-2 rounded-xl bg-[#4F7FE7] px-4 py-2 text-sm font-bold text-white hover:bg-[#416fd4]">
                <BookOpen size={16} /> Open Blog Management
              </Link>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total users"
              value={stats.users}
              icon={<Users size={18} />}
              accent="bg-[#eef4ff] text-[#2857d8]"
            />
            <StatCard
              label="Encrypted conversations"
              value={stats.conversations}
              icon={<FileLock size={18} />}
              accent="bg-[#fef3c7] text-[#b45309]"
            />
            <StatCard
              label="Encryption status"
              value={stats.encrypted ? "Active" : "Offline"}
              icon={<Shield size={18} />}
              accent="bg-[#ecfdf5] text-[#047857]"
            />
            <StatCard
              label="JSON storage"
              value={stats.storage}
              icon={<Activity size={18} />}
              accent="bg-[#f3e8ff] text-[#7c3aed]"
            />
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Secure records</p>
                <h3 className="text-2xl font-bold">Encrypted Chat Storage</h3>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID or provider"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/15 sm:w-64"
                  />
                </div>

                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#4F7FE7] focus:ring-2 focus:ring-[#4F7FE7]/15"
                >
                  {providerOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All providers" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Loading encrypted records...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                      <th className="px-4 py-3 font-semibold">ID</th>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Provider</th>
                      <th className="px-4 py-3 font-semibold">Encrypted Message</th>
                      <th className="px-4 py-3 font-semibold">Encrypted Response</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                          No encrypted records found.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record) => (
                        <tr key={record.id} className="border-t border-slate-200 align-middle">
                          <td className="px-4 py-4 text-sm font-semibold">#{record.id}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {record.user_name || "Unknown user"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {record.user_email || "Email unavailable"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{record.provider || "Unknown"}</td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            <span className="block max-w-56 truncate font-mono text-xs text-slate-500" title={record.encrypted_user_message}>
                              <Lock size={12} />
                              {record.encrypted_user_message || "No encrypted message"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            <span className="block max-w-56 truncate font-mono text-xs text-slate-500" title={record.encrypted_ai_response}>
                              <Lock size={12} />
                              {record.encrypted_ai_response || "No encrypted response"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            {record.created_at || "Encrypted timestamp"}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => decryptRecord(record.id)}
                              disabled={decryptingChatId === record.id}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#F9D746] px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#f5cf3d]"
                            >
                              {decryptingChatId === record.id ? "Decrypting..." : "Decrypt"}
                              <ArrowUpRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2857d8]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Decrypted Chat</p>
                  <h4 className="text-xl font-bold">Secure View</h4>
                </div>
              </div>

              <button
                onClick={() => setSelectedChat(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-slate-500">User</p>
                    <p className="font-semibold text-slate-900">{selectedChat.user_name || "Unknown user"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-slate-500">Email</p>
                    <p className="break-all font-semibold text-slate-900">{selectedChat.user_email || "Unavailable"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-slate-500">Provider</p>
                    <p className="font-semibold text-slate-900">{selectedChat.provider || "Unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">User Message</p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {selectedChat.user_message || "No message available"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">AI Response</p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {selectedChat.ai_response || "No response available"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Created:</span>{" "}
                {selectedChat.created_at}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedChat(null)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}>
          {icon}
        </div>
        <ArrowUpRight size={18} className="text-slate-400" />
      </div>
      <p className="mt-5 text-sm text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
    </div>
  );
}
