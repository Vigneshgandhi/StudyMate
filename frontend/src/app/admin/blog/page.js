"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePenLine, Sparkles, Trash2, X } from "lucide-react";

const empty = {
  title: "",
  slug: "",
  category: "Study Skills",
  excerpt: "",
  content: "",
  author: "StudyMate Team",
  status: "draft",
};
const api = "http://localhost:5001";

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [draftInput, setDraftInput] = useState({
    topic: "",
    audience: "University students",
    level: "Beginner",
    category: "AI & Machine Learning",
    mainPoints: "",
    examples: "",
  });
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const load = async () => {
    const response = await fetch(`${api}/api/admin/blog`, { headers });
    if (response.status === 401 || response.status === 403) {
      router.push("/Login");
      return;
    }
    const data = await response.json();
    setPosts(data.posts || []);
  };
  useEffect(() => {
    const loadTask = setTimeout(() => {
      if (!token) router.push("/Login");
      else load();
    }, 0);
    return () => clearTimeout(loadTask);
  }, [token, router]);
  const save = async (event) => {
    event.preventDefault();
    const response = await fetch(
      `${api}/api/admin/blog${editing ? `/${editing}` : ""}`,
      { method: editing ? "PUT" : "POST", headers, body: JSON.stringify(form) },
    );
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Unable to save article");
      return;
    }
    setForm(empty);
    setEditing(null);
    setError("");
    load();
  };
  const remove = async (id) => {
    await fetch(`${api}/api/admin/blog/${id}`, { method: "DELETE", headers });
    load();
  };
  const status = async (id, action) => {
    await fetch(`${api}/api/admin/blog/${id}/${action}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ notifyStudents: action === "publish" }),
    });
    load();
  };
  const generate = async () => {
    if (!draftInput.topic.trim()) {
      setError("Enter a topic before generating a blog draft.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const response = await fetch(`${api}/api/admin/blog/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify(draftInput),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Draft generation failed");
      setForm({ ...empty, ...data.draft, status: "draft" });
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to Ollama. Make sure Ollama is running.",
      );
    } finally {
      setGenerating(false);
    }
  };
  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-black">Blog Management</h1>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold"
          >
            Back to dashboard
          </button>
        </div>
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Sparkles size={18} className="text-[#4F7FE7]" />
                <h2 className="text-xl font-bold">Generate with Ollama</h2>
              </div>
              <div className="space-y-3">
                {Object.keys(draftInput).map((key) => (
                  <input
                    key={key}
                    value={draftInput[key]}
                    onChange={(e) =>
                      setDraftInput({ ...draftInput, [key]: e.target.value })
                    }
                    placeholder={key}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4F7FE7]"
                  />
                ))}
              </div>
              <button
                onClick={generate}
                disabled={generating}
                className="mt-4 rounded-xl bg-[#4F7FE7] px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating
                  ? "Generating with Ollama..."
                  : "Generate editable draft"}
              </button>
            </div>
            <form
              onSubmit={save}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editing ? "Edit article" : "New article"}
                </h2>
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setForm(empty);
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {["title", "slug", "category", "author", "excerpt"].map(
                  (key) => (
                    <input
                      key={key}
                      required={key !== "excerpt"}
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      placeholder={key}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4F7FE7]"
                    />
                  ),
                )}
                <textarea
                  required
                  rows={10}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="content (Markdown supported)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#4F7FE7]"
                />
              </div>
              <button className="mt-4 rounded-xl bg-[#F9D746] px-4 py-3 font-bold">
                {editing ? "Save changes" : "Save draft"}
              </button>
            </form>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold">All posts</h2>
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-bold">{post.title}</p>
                    <p className="text-sm text-slate-500">
                      {post.category} · {post.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setEditing(post.id);
                        setForm(post);
                      }}
                      className="rounded-lg border p-2"
                      title="Edit"
                    >
                      <FilePenLine size={16} />
                    </button>
                    <button
                      onClick={() =>
                        status(
                          post.id,
                          post.status === "published" ? "unpublish" : "publish",
                        )
                      }
                      className="rounded-lg bg-[#F3E3C6] px-3 py-2 text-sm font-bold"
                    >
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => remove(post.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <p className="py-10 text-center text-slate-500">
                  No articles yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
