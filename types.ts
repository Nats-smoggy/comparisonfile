export interface DocumentStructure {
  level: number;
  text: string;
  id: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0 to 100
  error: string | null;
}

export enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  UNKNOWN = 'unknown'
}
