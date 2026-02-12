import React, { useState, useEffect, useCallback } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DocumentPreview } from './components/DocumentPreview';
import { MarkdownViewer } from './components/MarkdownViewer';
import { convertDocumentToMarkdown } from './services/geminiService';
import { DocumentStructure, ProcessingState } from './types';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [structure, setStructure] = useState<DocumentStructure[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
  });

  // Handle file URL creation/cleanup
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const extractStructure = useCallback((md: string) => {
    const lines = md.split('\n');
    const newStructure: DocumentStructure[] = [];
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        newStructure.push({ level, text, id });
      }
    });
    setStructure(newStructure);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setMarkdown('');
    setStructure([]);
    setProcessingState({ isProcessing: true, progress: 10, error: null });

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          const resultMarkdown = await convertDocumentToMarkdown(
            base64String, 
            selectedFile.type,
            (msg) => console.log(msg) // Optional logging
          );

          setMarkdown(resultMarkdown);
          extractStructure(resultMarkdown);
          setProcessingState({ isProcessing: false, progress: 100, error: null });
        } catch (err) {
          setProcessingState({ 
            isProcessing: false, 
            progress: 0, 
            error: err instanceof Error ? err.message : '转换失败' 
          });
        }
      };
      
      reader.onerror = () => {
        setProcessingState({ 
            isProcessing: false, 
            progress: 0, 
            error: '文件读取失败' 
        });
      };

      reader.readAsDataURL(selectedFile);
    } catch (e) {
      setProcessingState({ isProcessing: false, progress: 0, error: '发生意外错误' });
    }
  };

  const handleNavigate = (id: string) => {
    setActiveHeadingId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^/.]+$/, "") || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 text-white p-1.5 rounded-lg">
             <AlertCircle size={18} className="transform rotate-180" /> 
           </div>
           <h1 className="font-bold text-gray-800 text-lg">DocuMark <span className="text-blue-600">AI</span></h1>
        </div>

        <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg cursor-pointer transition-all shadow-md active:transform active:scale-95">
                <Upload size={16} />
                <span>上传 PDF / Word</span>
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
            </label>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Outline Sidebar */}
        <div className="hidden md:block">
            <Sidebar 
            structure={structure} 
            activeId={activeHeadingId} 
            onNavigate={handleNavigate} 
            fileName={file?.name}
            />
        </div>

        {/* Middle: Source Preview */}
        <div className="flex-1 min-w-0 border-r border-gray-200 bg-gray-100 flex flex-col">
            <DocumentPreview file={file} fileUrl={fileUrl} />
        </div>

        {/* Right: Markdown Result */}
        <div className="flex-1 min-w-0 bg-white flex flex-col">
           <MarkdownViewer 
             markdown={markdown} 
             processingState={processingState}
             onCopy={handleCopy}
             onDownload={handleDownload}
           />
        </div>
      </div>
    </div>
  );
}

export default App;