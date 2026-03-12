import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Sparkles } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onSearch?: (query: string) => void;
  highlight?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onSearch, highlight }) => {
  const uriTransformer = (uri: string) => {
    if (uri.startsWith('search:') || uri.startsWith('theology-search:')) return uri;
    const protocols = ['http', 'https', 'mailto', 'tel'];
    const protocol = uri.split(':')[0].toLowerCase();
    if (protocols.includes(protocol)) return uri;
    return '';
  };

  const HighlightText = (text: string) => {
    if (!highlight || !highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <ReactMarkdown
      urlTransform={uriTransformer}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ node, ...props }) => {
          const isSearch = props.href?.startsWith('search:');
          const isTheologySearch = props.href?.startsWith('theology-search:');
          
          if ((isSearch || isTheologySearch) && onSearch) {
            const query = decodeURIComponent(props.href!.replace(/^(search:|theology-search:)/, ''));
            const fullQuery = isTheologySearch ? `theology-search:${query}` : query;
            return (
              <button
                onClick={() => onSearch(fullQuery)}
                className="text-emerald-600 font-bold hover:underline cursor-pointer inline"
              >
                {props.children}
              </button>
            );
          }
          return <a target="_blank" rel="noopener noreferrer" {...props} />;
        },
        img: ({ node, ...props }) => (
          <img 
            {...props} 
            referrerPolicy="no-referrer" 
            className="rounded-2xl shadow-lg max-w-full h-auto my-6 mx-auto block" 
          />
        ),
        div: ({ node, ...props }) => {
          if (props.className === 'outline-divider-v2') {
            return (
              <div className="my-16 space-y-4 no-print">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                  <div className="flex gap-2">
                    <Sparkles className="text-emerald-500 animate-pulse" size={18} />
                    <Sparkles className="text-emerald-500 animate-pulse delay-75" size={24} />
                    <Sparkles className="text-emerald-500 animate-pulse delay-150" size={18} />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-emerald-500 to-transparent" />
                </div>
                <div className="flex items-center gap-4 opacity-50">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-blue-500 to-transparent" />
                </div>
              </div>
            );
          }
          return <div {...props} />;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
