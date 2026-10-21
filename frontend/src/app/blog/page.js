"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import BlogCard from "../Components/BlogCard";
import FeaturedArticle from "../Components/FeaturedArticle";
import CategoryFilter from "../Components/CategoryFilter";
import ReminderForm from "../Components/ReminderForm";

const categories = [
  "all",
  "AI & Machine Learning",
  "Programming",
  "Database Systems",
  "Computer Networks",
  "Cybersecurity",
  "Study Skills",
  "Data Science",
];

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("search", search);
    fetch(`http://localhost:5001/api/blog/posts?${params}`)
      .then((response) => response.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]));
  }, [category, search]);
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9D746] text-xl font-bold">
              S
            </span>
            <span>
              <b>StudyMate</b>
              <small className="block text-xs text-slate-500">
                AI Study Assistant
              </small>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600"
          >
            <ArrowLeft size={16} /> Home
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#4F7FE7]">
            StudyMate Learning Resources
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Learn something worth remembering.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Clear explanations, practical examples, and study ideas for your
            next focused session.
          </p>
        </div>
        <div className="mt-9 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-[#4F7FE7]"
            />
          </div>
          <CategoryFilter
            categories={categories}
            value={category}
            onChange={setCategory}
          />
        </div>
        <div className="mt-10">
          <FeaturedArticle post={posts[0]} />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(1).map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        {posts.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            No published articles match your search.
          </div>
        )}
        <div className="mt-12">
          <ReminderForm />
        </div>
      </section>
    </main>
  );
}