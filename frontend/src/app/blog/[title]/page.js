"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  WandSparkles,
} from "lucide-react";
import BlogContent from "../../Components/BlogContent";

export default function BlogArticlePage() {
  const { title } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  useEffect(() => {
    if (title)
      fetch(`http://localhost:5001/api/blog/posts/${title}`)
        .then((response) => response.json())
        .then((data) => setPost(data.post || null));
  }, [title]);
  if (!post)
    return (
      <main className="min-h-screen bg-white p-10 text-center text-slate-500">
        Loading article...
      </main>
    );
  const articleContext = `I just read the article '${post.title}'. Help me understand this topic further using simple explanations, examples, and practice questions.`;
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600"
          >
            <ArrowLeft size={16} /> All articles
          </Link>
          <span className="font-bold">StudyMate</span>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-6 py-14">
        <span className="rounded-full bg-[#F3E3C6] px-3 py-1 text-sm font-semibold">
          {post.category}
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
          <span>{post.author}</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          <span>{post.reading_time || "5 min read"}</span>
        </div>
        <p className="mt-8 text-xl leading-9 text-slate-600">{post.excerpt}</p>
        <div className="mt-10">
          <BlogContent content={post.content} />
        </div>
        <div className="mt-12 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2">
          <button
            onClick={() =>
              router.push(
                `/prompt-generator?subject=${encodeURIComponent(post.category)}&topic=${encodeURIComponent(post.title)}`,
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-[#4F7FE7] px-5 py-3 font-bold text-white"
          >
            <WandSparkles size={17} /> Generate Study Prompt{" "}
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() =>
              router.push(`/Chat?context=${encodeURIComponent(articleContext)}`)
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800"
          >
            <MessageSquare size={17} /> Ask StudyMate AI
          </button>
        </div>
      </article>
    </main>
  );
}
