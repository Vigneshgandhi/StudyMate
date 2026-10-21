export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button key={category} onClick={() => onChange(category)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${value === category ? "border-[#4F7FE7] bg-[#4F7FE7] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#4F7FE7]"}`}>
          {category === "all" ? "All topics" : category}
        </button>
      ))}
    </div>
  );
}
