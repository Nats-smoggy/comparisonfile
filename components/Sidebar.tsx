import React from 'react';
import { DocumentStructure } from '../types';
import { List, FileText } from 'lucide-react';

interface SidebarProps {
  structure: DocumentStructure[];
  activeId: string | null;
  onNavigate: (id: string) => void;
  fileName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ structure, activeId, onNavigate, fileName }) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 flex-shrink-0">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
          <List size={18} />
          <span>文档大纲</span>
        </div>
        {fileName && (
           <div className="flex items-center gap-2 text-xs text-gray-500 truncate mt-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
             <FileText size={12} />
             <span className="truncate" title={fileName}>{fileName}</span>
           </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
        {structure.length === 0 ? (
          <div className="text-sm text-gray-400 text-center mt-10 italic">
            暂未检测到大纲结构。<br/> 请上传并转换文件。
          </div>
        ) : (
          structure.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full text-left truncate text-sm py-1.5 px-2 rounded-md transition-colors
                ${activeId === item.id 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'}
              `}
              style={{
                paddingLeft: `${(item.level - 1) * 12 + 8}px`
              }}
            >
              {item.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
};