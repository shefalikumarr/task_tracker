import { useState, useEffect } from 'react';
import './App.css';
import {
  register,
  login,
  getTasks,
  addTask,
  updateTask,
  deleteTask
} from './api';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      getTasks(token).then(data => {
        if (Array.isArray(data)) setTasks(data);
      });
    }
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(username, password);
    if (res.success) {
      setAuthMode('login');
      setUsername('');
      setPassword('');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.token) {
      setToken(res.token);
      localStorage.setItem('token', res.token);
      setUsername('');
      setPassword('');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setTasks([]);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const res = await addTask(token, newTask);
    if (res.id) {
      setTasks([...tasks, res]);
      setNewTask('');
    }
  };

  const handleToggleTask = async (id, completed) => {
    await updateTask(token, id, !completed);
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(token, id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="container">
      <h1>Task Tracker</h1>
      {!token ? (
        <div className="auth-box">
          <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="switch-btn">
            {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
          {error && <div className="error">{error}</div>}
        </div>
      ) : (
        <div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
          <form onSubmit={handleAddTask} className="task-form">
            <input
              type="text"
              placeholder="New task"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              required
            />
            <button type="submit">Add</button>
          </form>
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                <span onClick={() => handleToggleTask(task.id, task.completed)} style={{ cursor: 'pointer' }}>
                  {task.title}
                </span>
                <button onClick={() => handleDeleteTask(task.id)} className="delete-btn">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
