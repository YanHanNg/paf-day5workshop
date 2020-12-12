export interface Priority {
    id: number,
    priority: string
}

export interface Todo {
    id?: number,
    task_name: string,
    due_date: Date,
    priority_id: number,
    priority?: string,
    status_id: number,
    status?: string,
    image_key?: string,
    image_data?: string
}

export interface SubTodo { 
    id?: number,
    todo_id: number,
    sub_task_name: string,
    status_id: number,
    status?: string
}