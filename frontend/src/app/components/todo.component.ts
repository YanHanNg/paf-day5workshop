import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Priority, Todo } from '../todo.model';
import { TodoService } from '../todo.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {

  priority: Priority[];
  form: FormGroup;

  todo: Todo[];

  constructor(private fb: FormBuilder, private todoSvc: TodoService,
    private router: Router) {
    
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      task_name: this.fb.control('', [Validators.required]),
      due_date: this.fb.control('', [Validators.required]),
      priority: this.fb.control('', [Validators.required])
    })
    
    this.todoSvc.getPriority()
      .subscribe(data => {
        this.priority = data;
        this.form.get('priority').setValue(this.priority[0].id.toString());
      })

    this.todoSvc.getTodo()
      .subscribe(data => {
        this.todo = data;
      })
  }

  onSubmit() {
    console.info(this.form.value);
    let todo: Todo = {
      task_name: this.form.get('task_name').value,
      due_date: this.form.get('due_date').value,
      priority_id: this.form.get('priority').value,
      status_id: 0
    }

    this.todoSvc.createTodo(todo)
      .subscribe(data => {
        this.todoSvc.getTodo()
          .subscribe(data => {
            this.todo = data;
          })
      });

    this.form.reset(); 
  }

  completeTodo(t: Todo) {
    this.todoSvc.completeTodo(t)
      .subscribe(data => {
        this.todoSvc.getTodo()
          .subscribe(data => {
            this.todo = data;
          })
      });
  }

}
