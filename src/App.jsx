import { useState, useEffect, useMemo, useCallback } from 'react'

// Perbaikan Issue 1: Menggunakan Environment Variable (Vite/CRA)
const API_KEY = import.meta.env.VITE_API_KEY;

function App() {
  // Perbaikan Issue 2: State diinisialisasi langsung dari localStorage agar sinkron & efisien (Lazy Initial State)
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Failed to parse todos from localStorage', error)
      return []
    }
  })
  
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  
  // Perbaikan Issue 3 & 4: Digabung menjadi satu useEffect dengan dependency array [todos] yang tepat
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos))
    } catch (error) {
      console.error('Failed to save todos to localStorage', error)
    }
  }, [todos])
  
  // Perbaikan Issue 5: Di-memoize menggunakan useCallback agar fungsi tidak dibuat ulang di setiap render
  const addTodo = useCallback(() => {
    if (input.trim() === '') {
      alert('Please enter a todo')
      return
    }
    
    // Perbaikan Issue 6: Menggunakan crypto.randomUUID() untuk menjamin keunikan ID unik (anti-collision)
    const newTodo = {
      id: crypto.randomUUID(),
      text: input,
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setTodos(prevTodos => [...prevTodos, newTodo])
    setInput('')
  }, [input])
  
  // Perbaikan Issue 7: Menambahkan penanganan jika ID tidak ditemukan (defensive programming)
  const deleteTodo = useCallback((id) => {
    setTodos(prevTodos => {
      if (!prevTodos.some(todo => todo.id === id)) {
        console.error(`Todo with ID ${id} not found.`)
        return prevTodos
      }
      return prevTodos.filter(todo => todo.id !== id)
    })
  }, [])
  
  const toggleTodo = useCallback((id) => {
    setTodos(prevTodos => prevTodos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }, [])
  
  // Perbaikan Issue 8: Menggunakan useMemo agar filtering hanya berjalan ketika `todos` atau `filter` berubah
  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(todo => !todo.completed)
    if (filter === 'completed') return todos.filter(todo => todo.completed)
    return todos
  }, [todos, filter])
  
  // Perbaikan Issue 9: Menggunakan useMemo untuk kalkulasi statistik agar tidak membebani setiap render
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter(t => t.completed).length
    return {
      total,
      completed,
      active: total - completed
    }
  }, [todos])

  // Perbaikan Issue 10: Event handler dipisah menjadi fungsi bernama agar tidak membuat arrow function inline
  const handleInputChange = useCallback((e) => setInput(e.target.value), [])
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') addTodo()
  }, [addTodo])

  return (
    <div className="app">
      <h1>My Todo List</h1>
      
      {/* Perbaikan Issue 11: Menambahkan label tersembunyi (sr-only) atau properti htmlFor untuk Aksesibilitas */}
      <div className="input-section">
        <label htmlFor="todo-input" className="visually-hidden">New Todo Item</label>
        <input 
          id="todo-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      {/* Perbaikan Issue 12: Menggunakan CSS className dinamis (Direkomendasikan pindah ke file .css) */}
      <div className="filter-buttons">
        <button 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'btn-active' : 'btn-inactive'}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'btn-active' : 'btn-inactive'}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'btn-active' : 'btn-inactive'}
        >
          Completed
        </button>
      </div>
      
      <div className="todo-list">
        {/* Perbaikan Issue 13: Handling Empty State */}
        {filteredTodos.length === 0 ? (
          <p className="empty-message">No todos found.</p>
        ) : (
          filteredTodos.map((todo) => (
            // Perbaikan Issue 14: Konsisten menggunakan Unique ID (todo.id) untuk key React
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input 
                type="checkbox"
                aria-label={`Mark "${todo.text}" as completed`}
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              {/* Perbaikan Issue 15: Menggunakan JSX standar (Aman dari celah keamanan XSS) */}
              <span>{todo.text}</span>
              <button 
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="stats">
        <p>Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}</p>
      </div>

      {/* Perbaikan Issue 16: Kode debug console.log() sudah dihapus sepenuhnya */}
    </div>
  )
}

export default App
