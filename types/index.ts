export type GenerationState =
  | 'idle'
  | 'uploading'
  | 'generating'
  | 'completed'
  | 'error';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}
