import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { TodoComponent } from './components/todo.component';
import { SubTodoComponent } from './components/sub-todo.component';
import { TodoService } from './todo.service';

const ROUTES: Routes = [
  { path: '', component: TodoComponent },
  { path: 'subTodo/:todoId', component: SubTodoComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
]

@NgModule({
  declarations: [
    AppComponent,
    TodoComponent,
    SubTodoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [TodoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
