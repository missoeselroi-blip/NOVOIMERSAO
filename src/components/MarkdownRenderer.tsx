import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Sparkles } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { cn } from '../types';

interface MarkdownRendererProps {
  content: string;
  onSearch?: (query: string) => void;
  highlight?: string;
  title?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onSearch, highlight, title }) => {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
    dyslexic: 'font-dyslexic',
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const uriTransformer = (uri: string) => {
    if (uri.startsWith('search:') || uri.startsWith('theology-search:')) return uri;
    const protocols = ['http', 'https', 'mailto', 'tel'];
    const protocol = uri.split(':')[0].toLowerCase();
    if (protocols.includes(protocol)) return uri;
    return '';
  };

  return (
    <div className="relative group/markdown">
      <div 
        className={cn(
          "markdown-content prose dark:prose-invert max-w-none transition-all duration-300",
          fontClasses[fontFamily],
          sizeClasses[fontSize]
        )}
        style={{ lineHeight }}
      >
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
                className="text-emerald-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
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
      </div>
    </div>
  );
};

export default MarkdownRenderer;
