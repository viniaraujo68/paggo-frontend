export interface Document {
  id: string;
  filename: string;
  createdAt: string;
  summary: string;
  text: string;
  imageUrl: string;
}

export interface Message {
  id: string;
  content: string;
  order: number;
  sentAt: string;
}