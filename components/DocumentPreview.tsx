import React from 'react';
import { FileType } from '../types';
import { FileUp, FileType as FileIcon } from 'lucide-react';

interface DocumentPreviewProps {
  file: File | null;
  fileUrl: string | null;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file, fileUrl }) => {
  const isPdf = file?.type === FileType.PDF;

  return (
    <div className="flex flex-col h-full bg-gray-100 border-r border-gray-200 w-full relative">
      <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
        原始文档预览
      </div>
      
      <div className="flex-1 overflow-hidden relative flex items-center justify-center">
        {fileUrl && isPdf ? (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full border-none bg-white"
            title="PDF Preview"
          />
        ) : fileUrl ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-sm mx-auto">
             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileIcon size={32} />
             </div>
             <h3 className="text-lg font-medium text-gray-800 mb-2">{file?.name}</h3>
             <p className="text-sm text-gray-500">
               浏览器不支持预览此文件类型。
               <br />
               但这不会影响 AI 的分析和转换功能。
             </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <FileUp size={24} />
            </div>
            <p>未选择文档</p>
          </div>
        )}
      </div>
    </div>
  );
};