import React from "react";
import ReactMarkdown from "react-markdown";

interface ChatMarkdownProps {
  content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-a:text-brand-secondary-600 dark:prose-a:text-brand-secondary-400 hover:prose-a:text-brand-secondary-500">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
