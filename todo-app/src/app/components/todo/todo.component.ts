import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.interface';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  todos: Todo[] = [];
  newTodoTitle = '';
  newTodoPriority: 'low' | 'medium' | 'high' = 'medium';
  newTodoDescription = '';
  selectedFile: File | null = null;

  // Validation states and messages
  titleError = '';
  descriptionError = '';
  fileError = '';
  
  // File upload constraints
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  constructor(
    private todoService: TodoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

  validateTodo(): boolean {
    let isValid = true;
    
    // Validate title
    if (!this.newTodoTitle.trim()) {
      this.titleError = 'Title is required';
      isValid = false;
    } else if (this.newTodoTitle.length > 100) {
      this.titleError = 'Title must be less than 100 characters';
      isValid = false;
    } else {
      this.titleError = '';
    }

    // Validate description (now required)
    if (!this.newTodoDescription.trim()) {
      this.descriptionError = 'Description is required';
      isValid = false;
    } else if (this.newTodoDescription.length > 500) {
      this.descriptionError = 'Description must be less than 500 characters';
      isValid = false;
    } else {
      this.descriptionError = '';
    }

    // Validate file attachment (now required)
    if (!this.selectedFile) {
      this.fileError = 'Document attachment is required';
      isValid = false;
    }

    return isValid;
  }

  validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.fileError = `File size must be less than ${this.formatFileSize(this.MAX_FILE_SIZE)}`;
      return false;
    }

    // Check file type
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      this.fileError = 'Invalid file type. Allowed types: Images, PDF, DOC, DOCX, TXT';
      return false;
    }

    this.fileError = '';
    return true;
  }

  addTodo(): void {
    // Reset error messages
    this.titleError = '';
    this.descriptionError = '';
    this.fileError = '';

    // Validate todo (includes file validation)
    if (!this.validateTodo()) {
      return;
    }

    // Validate file if selected (additional file type and size validation)
    if (this.selectedFile && !this.validateFile(this.selectedFile)) {
      return;
    }

    const newTodo = {
      title: this.newTodoTitle.trim(),
      description: this.newTodoDescription.trim(),
      priority: this.newTodoPriority,
      completed: false
    };
    
    const newTodoId = this.todoService.addTodo(newTodo);
    
    // Add the attachment (we know it exists because of validation)
    if (this.selectedFile) {
      this.todoService.addAttachment(newTodoId, this.selectedFile);
    }
    
    // Clear the form
    this.resetForm();
  }

  resetForm(): void {
    this.newTodoTitle = '';
    this.newTodoDescription = '';
    this.newTodoPriority = 'medium';
    this.removeSelectedFile();
    this.titleError = '';
    this.descriptionError = '';
    this.fileError = '';
  }

  toggleTodo(id: number): void {
    this.todoService.toggleTodo(id);
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file before setting
      if (this.validateFile(file)) {
        this.selectedFile = file;
      } else {
        // Reset file input if validation fails
        this.removeSelectedFile();
      }
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  addAttachment(id: number): void {
    if (this.selectedFile) {
      this.todoService.addAttachment(id, this.selectedFile);
      this.selectedFile = null;
    }
  }

  removeAttachment(id: number): void {
    this.todoService.removeAttachment(id);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffbb33';
      case 'low':
        return '#00C851';
      default:
        return '#2BBBAD';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  previewFile(attachment: { url: string; type: string; name: string }): void {
    if (!attachment || !attachment.url) return;

    // For images and PDFs, open in new window
    if (attachment.type.startsWith('image/') || attachment.type === 'application/pdf') {
      window.open(attachment.url, '_blank');
    } else {
      // For other file types, trigger download
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      link.click();
    }
  }
} 