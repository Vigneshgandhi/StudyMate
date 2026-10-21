import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogContent({ content }) {
  return <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-[#4F7FE7] prose-p:leading-8"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div>;
}
