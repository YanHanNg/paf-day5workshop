import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable, of } from 'rxjs';
import { Priority, Todo, SubTodo } from './todo.model';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class TodoService {

    httpOptions = {
        headers: new HttpHeaders({ 
          'Content-Type': 'application/json',  
          'Accept': 'application/json'})
    };

    constructor(private http: HttpClient) { }

    getPriority() : Observable<Priority[]> {
        return this.http.get<Priority[]>('http://localhost:3000/priority')
            .pipe();
    }

    getTodo() : Observable<Todo[]> {
        return this.http.get<Todo[]>('http://localhost:3000/GetTodo')
            .pipe();
    }

    getSubTodo(todoId: string) : Observable<SubTodo[]> {
        return this.http.get<SubTodo[]>(`http://localhost:3000/GetSubTodo/${todoId}`)
            .pipe();
    }

    createTodo(T: Todo) : Observable<any> {
        console.info(T);
        // return this.http.post('http://localhost:3000/createTodo', T)
        //     .pipe(
        //         tap(_ => console.log('posted todo')),
        //         catchError(this.handleError<any>('createTodo', []))
        //     );
        return this.http.post('http://localhost:3000/createTodo', T)
            .pipe();
    }

    completeTodo(t : Todo) {
        return this.http.put(`http://localhost:3000/completeTodo/${t.id}`, t)
            .pipe();
    }

    createSubTodoTask(S: SubTodo) : Observable<any> {
        return this.http.post(`http://localhost:3000/createSubTodo/${S.todo_id}`, S)
            .pipe();
    }

    uploadTodoImage(formData) : Observable<any> {
        return this.http.post('http://localhost:3000/uploadTodoImage', formData)
            .pipe();
    }

    getTodoImage(todoId: string) : Observable<any> {
        return this.http.get(`http://localhost:3000/getTodoImage/${todoId}`, { responseType: "blob" })
            .pipe();
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
        console.error(error); // log to console instead
        return of(result as T);
        };
    }
}