"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Todo, Category, Profile } from "@/lib/types";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryPickerTodoId, setCategoryPickerTodoId] = useState<
    string | null
  >(null);
  const [sortBy, setSortBy] = useState<"created_at" | "text">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
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
      if (!user) return;

      setUserEmail(user.email || "");
      setUserId(user.id);

      const [todosRes, categoriesRes, profileRes] = await Promise.all([
        supabase.from("todos").select().order("created_at", { ascending: true }),
        supabase
          .from("categories")
          .select()
          .order("created_at", { ascending: true }),
        supabase.from("profiles").select().eq("id", user.id).single(),
      ]);

      setTodos(todosRes.data || []);
      setCategories(categoriesRes.data || []);
      setProfile(profileRes.data || null);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close category picker on outside click
  useEffect(() => {
    if (!categoryPickerTodoId) return;
    const handler = () => setCategoryPickerTodoId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [categoryPickerTodoId]);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortDropdownOpen) return;
    const handler = () => setSortDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [sortDropdownOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const addTodo = async () => {
    const text = newTask.trim();
    if (!text || !userId) return;

    const categoryId =
      selectedCategoryId && selectedCategoryId !== "uncategorized"
        ? selectedCategoryId
        : null;

    const { data, error } = await supabase
      .from("todos")
      .insert({ text, user_id: userId, category_id: categoryId })
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

  const updateTodoCategory = async (
    todoId: string,
    categoryId: string | null
  ) => {
    const { error } = await supabase
      .from("todos")
      .update({ category_id: categoryId })
      .eq("id", todoId);

    if (!error) {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId ? { ...t, category_id: categoryId } : t
        )
      );
    }
    setCategoryPickerTodoId(null);
  };

  // Category CRUD
  const createCategory = async (name: string, color: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, color, user_id: userId })
      .select()
      .single();

    if (!error && data) {
      setCategories((prev) => [...prev, data]);
    }
  };

  const editCategory = async (id: string, name: string, color: string) => {
    const { error } = await supabase
      .from("categories")
      .update({ name, color })
      .eq("id", id);

    if (!error) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name, color } : c))
      );
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      // Todos with this category become uncategorized (handled by ON DELETE SET NULL)
      setTodos((prev) =>
        prev.map((t) =>
          t.category_id === id ? { ...t, category_id: null } : t
        )
      );
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Derived data
  const filteredTodos = useMemo(() => {
    const filtered = todos.filter((t) => {
      const matchesCategory =
        selectedCategoryId === null ||
        (selectedCategoryId === "uncategorized"
          ? t.category_id === null
          : t.category_id === selectedCategoryId);
      const matchesSearch =
        searchQuery === "" ||
        t.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    const sorted = [...filtered].sort((a, b) => {
      let cmp: number;
      if (sortBy === "text") {
        cmp = a.text.localeCompare(b.text);
      } else {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [todos, selectedCategoryId, searchQuery, sortBy, sortDir]);

  const activeTodos = filteredTodos.filter((t) => !t.completed);
  const completedTodos = filteredTodos.filter((t) => t.completed);

  const todoCounts = useMemo(() => {
    const byCategory: Record<string, number> = {};
    let uncategorized = 0;
    todos.forEach((t) => {
      if (t.category_id) {
        byCategory[t.category_id] = (byCategory[t.category_id] || 0) + 1;
      } else {
        uncategorized++;
      }
    });
    return {
      total: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
      uncategorized,
      byCategory,
    };
  }, [todos]);

  const getCategoryForTodo = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId) || null;
  };

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
      <Header
        onLogout={handleLogout}
        onMenuToggle={() => setSidebarOpen((p) => !p)}
      />

      <div className="app-layout">
        <Sidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          todoCounts={todoCounts}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCreateCategory={createCategory}
          onEditCategory={editCategory}
          onDeleteCategory={deleteCategory}
          profile={profile}
          userEmail={userEmail}
          userId={userId}
          onProfileUpdate={(updated) => setProfile(updated)}
        />

        <div className="main-panel">
          <div className="container">
            <h1>My To-Do List</h1>

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

            {filteredTodos.length === 0 ? (
              <div className="empty-state">
                {searchQuery
                  ? "No tasks match your search."
                  : "No tasks yet. Add one above!"}
              </div>
            ) : (
              <ul className="task-list">
                {activeTodos.length > 0 && (
                  <>
                    <div className="section-header">
                      Active Tasks
                      <div className="sort-controls">
                        <div
                          className="sort-field"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSortDropdownOpen((p) => !p);
                          }}
                        >
                          <span className="material-icons sort-icon">sort</span>
                          <span className="sort-label">
                            {sortBy === "created_at" ? "Date created" : "Title"}
                          </span>
                          {sortDropdownOpen && (
                            <div
                              className="sort-dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className={`sort-dropdown-item ${sortBy === "text" ? "active" : ""}`}
                                onClick={() => {
                                  setSortBy("text");
                                  setSortDropdownOpen(false);
                                }}
                              >
                                Title
                                {sortBy === "text" && (
                                  <span className="material-icons sort-check">check</span>
                                )}
                              </button>
                              <button
                                className={`sort-dropdown-item ${sortBy === "created_at" ? "active" : ""}`}
                                onClick={() => {
                                  setSortBy("created_at");
                                  setSortDropdownOpen(false);
                                }}
                              >
                                Date created
                                {sortBy === "created_at" && (
                                  <span className="material-icons sort-check">check</span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="sort-divider" />
                        <button
                          className="sort-dir-btn"
                          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                          title={sortDir === "asc" ? "Ascending" : "Descending"}
                        >
                          <span className="material-icons">
                            {sortDir === "asc" ? "arrow_upward" : "arrow_downward"}
                          </span>
                        </button>
                      </div>
                    </div>
                    {activeTodos.map((todo) => {
                      const cat = getCategoryForTodo(todo.category_id);
                      return (
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
                                <div className="task-meta">
                                  <span className="task-date">
                                    {formatDate(todo.created_at)}
                                  </span>
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
                                onChange={() =>
                                  toggleTodo(todo.id, todo.completed)
                                }
                                className="checkbox"
                              />
                              <div className="task-content">
                                <span className="task-text">{todo.text}</span>
                                <div className="task-meta">
                                  <span className="task-date">
                                    {formatDate(todo.created_at)}
                                  </span>
                                  {cat && (
                                    <span
                                      className="task-category-badge"
                                      style={{ background: cat.color }}
                                    >
                                      {cat.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                className="task-category-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCategoryPickerTodoId(
                                    categoryPickerTodoId === todo.id
                                      ? null
                                      : todo.id
                                  );
                                }}
                                title="Assign category"
                              >
                                <span
                                  className="task-category-dot"
                                  style={{
                                    background: cat?.color || "transparent",
                                  }}
                                />
                                <span className="task-category-label">
                                  {cat ? cat.name : "Category"}
                                </span>
                                {categoryPickerTodoId === todo.id && (
                                  <div
                                    className="task-category-picker"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      className="task-category-picker-item"
                                      onClick={() =>
                                        updateTodoCategory(todo.id, null)
                                      }
                                    >
                                      <span
                                        className="category-dot"
                                        style={{
                                          background: "transparent",
                                          border: "1.5px solid currentColor",
                                        }}
                                      />
                                      None
                                    </button>
                                    {categories.map((c) => (
                                      <button
                                        key={c.id}
                                        className="task-category-picker-item"
                                        onClick={() =>
                                          updateTodoCategory(todo.id, c.id)
                                        }
                                      >
                                        <span
                                          className="category-dot"
                                          style={{ background: c.color }}
                                        />
                                        {c.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
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
                                <span className="material-icons">
                                  check_circle
                                </span>
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
                      );
                    })}
                  </>
                )}

                {completedTodos.length > 0 && (
                  <>
                    <div className="section-header">Completed Tasks</div>
                    {completedTodos.map((todo) => {
                      const cat = getCategoryForTodo(todo.category_id);
                      return (
                        <li key={todo.id} className="task-item completed">
                          <input
                            type="checkbox"
                            checked
                            onChange={() =>
                              toggleTodo(todo.id, todo.completed)
                            }
                            className="checkbox"
                          />
                          <div className="task-content">
                            <span className="task-text">{todo.text}</span>
                            <div className="task-meta">
                              <span className="task-date">
                                {formatDate(todo.created_at)}
                              </span>
                              {cat && (
                                <span
                                  className="task-category-badge"
                                  style={{ background: cat.color }}
                                >
                                  {cat.name}
                                </span>
                              )}
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
                      );
                    })}
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
