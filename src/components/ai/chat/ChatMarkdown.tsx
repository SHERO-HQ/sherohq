import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMarkdownProps {
  content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="text-[13px] leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-2 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-2 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          a: ({ node, ...props }) => <a className="text-brand-secondary-600 dark:text-brand-secondary-400 hover:underline hover:text-brand-secondary-500 font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5" {...props} />,
          h4: ({ node, ...props }) => <h4 className="font-bold text-slate-900 dark:text-white mt-2 mb-1" {...props} />,
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");
            return isInline ? (
              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[12px] font-mono text-brand-secondary-600 dark:text-brand-secondary-400" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-slate-900 text-slate-50 p-3 rounded overflow-x-auto text-[12px] font-mono mb-2 mt-1">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
