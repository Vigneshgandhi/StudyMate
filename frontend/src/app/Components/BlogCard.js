import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

export default function BlogCard({ post }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span className="rounded-full bg-[#F3E3C6] px-3 py-1 text-slate-700">{post.category}</span>
        <span className="flex items-center gap-1"><Clock3 size={14} /> {post.reading_time || "5 min read"}</span>
      </div>
      <h3 className="mt-5 text-xl font-bold text-slate-900">{post.title}</h3>
      <p className="mt-3 flex-1 leading-7 text-slate-600">{post.excerpt}</p>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
        <span>{post.author} · {new Date(post.created_at).toLocaleDateString()}</span>
        <Link href={`/blog/${post.slug}`} className="flex items-center gap-2 font-bold text-[#4F7FE7]">Read Article <ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}
