import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Todo } from '../models/todo.interface';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos: Todo[] = [];
  private todosSubject = new BehaviorSubject<Todo[]>([]);

  constructor() {
    this.loadTodos();
  }

  private loadTodos(): void {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      this.todos = JSON.parse(savedTodos);
      this.todosSubject.next(this.todos);
    }
  }

  getTodos(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'attachment'>): number {
    const newTodo: Todo = {
      ...todo,
      id: this.todos.length + 1,
      createdAt: new Date(),
      attachment: undefined
    };
    this.todos.push(newTodo);
    this.updateTodos();
    return newTodo.id;
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.updateTodos();
    }
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.updateTodos();
  }

  updateTodo(id: number, updates: Partial<Todo>): void {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      this.todos[index] = { ...this.todos[index], ...updates };
      this.updateTodos();
    }
  }

  addAttachment(id: number, file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        todo.attachment = {
          name: file.name,
          url: e.target?.result as string,
          type: file.type,
          size: file.size
        };
        this.updateTodos();
      }
    };
    reader.readAsDataURL(file);
  }

  removeAttachment(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      delete todo.attachment;
      this.updateTodos();
    }
  }

  private updateTodos(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
    this.todosSubject.next(this.todos);
  }
} 