export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
    size: number;
  };
} 