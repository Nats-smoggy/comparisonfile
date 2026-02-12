import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, Loader2, RefreshCw } from 'lucide-react';
import { ProcessingState } from '../types';

interface MarkdownViewerProps {
  markdown: string;
  processingState: ProcessingState;
  onCopy: () => void;
  onDownload: () => void;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ 
  markdown, 
  processingState, 
  onCopy, 
  onDownload 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new content arrives
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [markdown]);

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* Header Actions */}
      <div className="h-10 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide bg-blue-50 px-2 py-1 rounded">
          转换结果
        </span>
        <div className="flex items-center gap-2">
            <button 
                onClick={onCopy}
                disabled={!markdown}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                title="复制到剪贴板"
            >
                <Copy size={16} />
            </button>
            <button 
                onClick={onDownload}
                disabled={!markdown}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
            >
                <Download size={14} />
                <span>导出</span>
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-8 relative"
      >
        {processingState.isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">正在分析文档...</p>
            {processingState.progress > 0 && (
                 <p className="text-xs text-gray-400 mt-2">已完成 {processingState.progress}%</p>
            )}
          </div>
        ) : processingState.error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <RefreshCw size={24} />
            </div>
            <p className="font-medium">分析失败</p>
            <p className="text-sm mt-2 text-gray-500 max-w-xs text-center">{processingState.error}</p>
          </div>
        ) : !markdown ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <p className="text-lg">等待上传文件...</p>
          </div>
        ) : (
          <div className="prose prose-sm prose-slate max-w-none">
            {/* We map the markdown headers to IDs for linking from sidebar */}
            <ReactMarkdown
               components={{
                 h1: ({node, ...props}) => {
                    const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-') || '';
                    return <h1 id={id} {...props} />;
                 },
                 h2: ({node, ...props}) => {
                    const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-') || '';
                    return <h2 id={id} {...props} />;
                 },
                 h3: ({node, ...props}) => {
                    const id = props.children?.toString().toLowerCase().replace(/\s+/g, '-') || '';
                    return <h3 id={id} {...props} />;
                 },
               }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};