import React, { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  id: string;
  name: string;
  onDelete: () => void;
}

function TodoList({ id, name, onDelete }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem(`todos_${id}`);
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    localStorage.setItem(`todos_${id}`, JSON.stringify(todos));
  }, [id, todos]);

  const handleAddTodo = () => {
    if (newTodo.trim() !== '') {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      };
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleDeleteTodo = (index: number) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  const handleToggleComplete = (index: number) => {
    const newTodos = todos.map((todo, i) => 
      i === index ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
  };

  const uncompletedTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  const renderTodoItem = (todo: Todo, index: number) => (
    <li key={index} className={todo.completed ? 'completed' : ''}>
      <span>{todo.text}</span>
      <div>
        <button onClick={() => handleToggleComplete(index)} className="complete-btn">
          {todo.completed ? '取消完成' : '完成'}
        </button>
        <button onClick={() => handleDeleteTodo(index)} className="delete-btn">删除</button>
      </div>
    </li>
  );

  return (
    <div className="todo-list">
      <h2>{name}</h2>
      <button className="list-delete-button" onClick={onDelete}>🗑️ 删除列表</button>
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加新的待办事项"
        />
        <button onClick={handleAddTodo}>添加</button>
      </div>
      <ul>
        {uncompletedTodos.map((todo, index) => renderTodoItem(todo, todos.indexOf(todo)))}
      </ul>
      {completedTodos.length > 0 && (
        <>
          <hr className="divider" />
          <h3>已完成</h3>
          <ul>
            {completedTodos.map((todo, index) => renderTodoItem(todo, todos.indexOf(todo)))}
          </ul>
        </>
      )}
    </div>
  );
}

export default TodoList;
