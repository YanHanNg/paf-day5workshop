import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SubTodo } from '../todo.model';
import { TodoService } from '../todo.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-sub-todo',
  templateUrl: './sub-todo.component.html',
  styleUrls: ['./sub-todo.component.css']
})
export class SubTodoComponent implements OnInit {
  @ViewChild('imageFile', { static: false }) imageFile: ElementRef;

  constructor(private activatedRoute: ActivatedRoute, private fb: FormBuilder, 
    private todoSvc: TodoService, private sanitizer: DomSanitizer) { }

  todoId: number;
  todoImage: any;
  subTodo: SubTodo[];

  form: FormGroup = this.fb.group({
    imagefile: this.fb.control(''),
    sub_task_name: this.fb.control('', [Validators.required])
  })

  ngOnInit(): void {
    this.todoId = parseInt(this.activatedRoute.snapshot.params.todoId);
    
    //Get Image Using TodoId
    this.todoSvc.getTodoImage(this.todoId.toString())
      .subscribe(resultfromblob => {
        let objectURL = URL.createObjectURL(resultfromblob);
        console.info(objectURL);
        this.todoImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        console.info(this.todoImage);
      })

    //Get SubTask Using TodoId
    this.todoSvc.getSubTodo(this.todoId.toString())
      .subscribe(data => {
        this.subTodo = data;
      })
  }


  uploadTodoImage() {
    let formData = new FormData();
    formData.set('todoId', this.todoId.toString());
    formData.set('image-file', this.imageFile.nativeElement.files[0]);

    this.todoSvc.uploadTodoImage(formData)
      .subscribe(data => {
        this.form.get('imagefile').reset();
        this.todoSvc.getTodoImage(this.todoId.toString())
          .subscribe(resultfromblob => {
            let objectURL = URL.createObjectURL(resultfromblob);
            this.todoImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          })
      });
  }

  onSubmit() {
    //Add SubTask
    let subTodo: SubTodo = {
      todo_id: this.todoId,
      sub_task_name: this.form.get('sub_task_name').value,
      status_id: 0
    }

    this.todoSvc.createSubTodoTask(subTodo)
      .subscribe(data => {
        this.todoSvc.getSubTodo(this.todoId.toString())
          .subscribe(data => {
            this.subTodo = data;
          })
      });
    
    this.form.get('sub_task_name').reset();
  }
}
