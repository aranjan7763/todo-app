"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from("todos")
      .select()
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error);
      return;
    }
    setTodos(data || []);
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
      await fetchTodos();
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const addTodo = async () => {
    const text = newTask.trim();
    if (!text) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert({ text, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
      return;
    }

    setTodos((prev) => [...prev, data]);
    setNewTask("");
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", id);

    if (error) {
      console.error("Error toggling todo:", error);
      return;
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    );
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
      return;
    }

    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const markDone = async (id: string) => {
    const { error } = await supabase
      .from("todos")
      .update({ completed: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking done:", error);
      return;
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = async (id: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from("todos")
      .update({ text: trimmed })
      .eq("id", id);

    if (error) {
      console.error("Error saving edit:", error);
      return;
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t))
    );
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="todo-page">
        <div className="container">
          <div className="loading-state">Loading your tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-page">
      <div className="header-bar">
        <span className="header-email">{userEmail}</span>
        <button onClick={handleLogout} className="header-logout">
          Sign out
        </button>
      </div>

      <div className="container">
        <h1>📝 My To-Do List</h1>

        <div className="input-container">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            autoComplete="off"
            className="task-input"
          />
          <button onClick={addTodo} title="Add task" className="add-btn">
            <span className="material-icons">add</span>
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="empty-state">No tasks yet. Add one above!</div>
        ) : (
          <ul className="task-list">
            {activeTodos.length > 0 && (
              <>
                <div className="section-header">Active Tasks</div>
                {activeTodos.map((todo) => (
                  <li key={todo.id} className="task-item">
                    {editingId === todo.id ? (
                      <>
                        <input
                          type="checkbox"
                          disabled
                          className="checkbox"
                          style={{ opacity: 0.3 }}
                        />
                        <div className="task-content">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(todo.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                            className="task-input-edit"
                          />
                          <div className="task-date">
                            {formatDate(todo.created_at)}
                          </div>
                        </div>
                        <button
                          onClick={() => saveEdit(todo.id)}
                          title="Save"
                          className="save-btn"
                        >
                          <span className="material-icons">check</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          title="Cancel"
                          className="cancel-btn"
                        >
                          <span className="material-icons">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          onChange={() => toggleTodo(todo.id, todo.completed)}
                          className="checkbox"
                        />
                        <div className="task-content">
                          <span className="task-text">{todo.text}</span>
                          <div className="task-date">
                            {formatDate(todo.created_at)}
                          </div>
                        </div>
                        <button
                          onClick={() => startEdit(todo.id, todo.text)}
                          title="Edit task"
                          className="edit-btn"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          onClick={() => markDone(todo.id)}
                          title="Mark as done"
                          className="done-btn"
                        >
                          <span className="material-icons">check_circle</span>
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          title="Delete task"
                          className="delete-btn"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </>
            )}

            {completedTodos.length > 0 && (
              <>
                <div className="section-header">Completed Tasks</div>
                {completedTodos.map((todo) => (
                  <li key={todo.id} className="task-item completed">
                    <input
                      type="checkbox"
                      checked
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      className="checkbox"
                    />
                    <div className="task-content">
                      <span className="task-text">{todo.text}</span>
                      <div className="task-date">
                        {formatDate(todo.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      title="Delete task"
                      className="delete-btn"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
