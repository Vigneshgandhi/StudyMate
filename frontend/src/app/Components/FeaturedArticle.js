import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export default function FeaturedArticle({ post }) {
  if (!post) return null;
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-[#fff7d5] shadow-sm">
      <div className="grid gap-8 p-7 md:grid-cols-[1.2fr_0.8fr] md:p-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#4F7FE7]">Featured resource</span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{post.title}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-700">{post.excerpt}</p>
          <Link href={`/blog/${post.slug}`} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#4F7FE7] px-5 py-3 font-bold text-white transition hover:bg-[#416fd4]">Read Article <ArrowRight size={17} /></Link>
        </div>
        <div className="flex min-h-44 items-center justify-center rounded-2xl border border-yellow-200 bg-white/70 text-[#4F7FE7]"><BookOpen size={66} strokeWidth={1.4} /></div>
      </div>
    </article>
  );
}
