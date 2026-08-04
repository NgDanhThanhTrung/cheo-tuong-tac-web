import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  ExternalLink, 
  Trophy, 
  CheckCircle2, 
  Users, 
  ShieldCheck,
  Sparkles,
  Settings,
  Trash2,
  Edit,
  Filter,
  Award,
  MessageCircle
} from 'lucide-react';

// Admin Page Component
function AdminPage({ isAdmin, adminPassword }) {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [password, setPassword] = useState(adminPassword || '');
  
  // Category form state
  const [isCategoryModal, setIsCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('📌');
  const [newColor, setNewColor] = useState('#6366f1');
  
  // User form state
  const [isUserModal, setIsUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserInitialPoints, setNewUserInitialPoints] = useState(10);
  const [newUserCurrentPoints, setNewUserCurrentPoints] = useState(10);
  
  // Task form state
  const [isTaskModal, setIsTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskUserId, setNewTaskUserId] = useState('');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskLink, setNewTaskLink] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(1);
  const [newTaskMaxSlots, setNewTaskMaxSlots] = useState(10);

  useEffect(() => {
    if (isAdmin && password) {
      fetchCategories();
      fetchUsers();
      fetchTasks();
      fetchLogs();
    }
  }, [isAdmin, password]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?password=${password}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/admin/tasks?password=${password}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/admin/logs?password=${password}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Category handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, name: newName, description: newDescription, icon: newIcon, color: newColor })
      });
      if (response.ok) {
        await fetchCategories();
        setIsCategoryModal(false);
        setNewName('');
        setNewDescription('');
        setNewIcon('📌');
        setNewColor('#6366f1');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, name: newName, description: newDescription, icon: newIcon, color: newColor })
      });
      if (response.ok) {
        await fetchCategories();
        setEditingCategory(null);
        setIsCategoryModal(false);
        setNewName('');
        setNewDescription('');
        setNewIcon('📌');
        setNewColor('#6366f1');
      }
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Bạn có chắc muốn xóa category này?')) return;
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setNewName(category.name);
    setNewDescription(category.description);
    setNewIcon(category.icon);
    setNewColor(category.color);
    setIsCategoryModal(true);
  };

  // User handlers
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password, 
          fullName: newUserName, 
          phone: newUserPhone, 
          initialPoints: newUserInitialPoints,
          currentPoints: newUserCurrentPoints
        })
      });
      if (response.ok) {
        await fetchUsers();
        setIsUserModal(false);
        setNewUserName('');
        setNewUserPhone('');
        setNewUserInitialPoints(10);
        setNewUserCurrentPoints(10);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password, 
          fullName: newUserName, 
          phone: newUserPhone, 
          initialPoints: newUserInitialPoints,
          currentPoints: newUserCurrentPoints
        })
      });
      if (response.ok) {
        await fetchUsers();
        setEditingUser(null);
        setIsUserModal(false);
        setNewUserName('');
        setNewUserPhone('');
        setNewUserInitialPoints(10);
        setNewUserCurrentPoints(10);
      }
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa user này?')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        await fetchUsers();
        await fetchTasks();
        await fetchLogs();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setNewUserName(user.fullName);
    setNewUserPhone(user.phone);
    setNewUserInitialPoints(user.initialPoints);
    setNewUserCurrentPoints(user.currentPoints);
    setIsUserModal(true);
  };

  // Task handlers
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password, 
          userId: newTaskUserId, 
          categoryId: newTaskCategoryId, 
          title: newTaskTitle, 
          link: newTaskLink,
          points: newTaskPoints,
          maxSlots: newTaskMaxSlots
        })
      });
      if (response.ok) {
        await fetchTasks();
        setIsTaskModal(false);
        setNewTaskUserId('');
        setNewTaskCategoryId('');
        setNewTaskTitle('');
        setNewTaskLink('');
        setNewTaskPoints(1);
        setNewTaskMaxSlots(10);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password, 
          userId: newTaskUserId, 
          categoryId: newTaskCategoryId, 
          title: newTaskTitle, 
          link: newTaskLink,
          points: newTaskPoints,
          maxSlots: newTaskMaxSlots
        })
      });
      if (response.ok) {
        await fetchTasks();
        setEditingTask(null);
        setIsTaskModal(false);
        setNewTaskUserId('');
        setNewTaskCategoryId('');
        setNewTaskTitle('');
        setNewTaskLink('');
        setNewTaskPoints(1);
        setNewTaskMaxSlots(10);
      }
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Bạn có chắc muốn xóa task này?')) return;
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        await fetchTasks();
        await fetchLogs();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setNewTaskUserId(task.userId);
    setNewTaskCategoryId(task.categoryId);
    setNewTaskTitle(task.title);
    setNewTaskLink(task.link);
    setNewTaskPoints(task.points);
    setNewTaskMaxSlots(task.maxSlots);
    setIsTaskModal(true);
  };

  // Logs handler
  const handleClearLogs = async () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả logs?')) return;
    try {
      const response = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        await fetchLogs();
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  // Verify password by calling an API
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (adminPassword) {
      // Verify password by calling a simple endpoint
      fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })
      .then(res => res.json())
      .then(data => {
        setIsVerified(data.valid);
        setIsLoading(false);
      })
      .catch(() => {
        setIsVerified(false);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [adminPassword]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-slate-400">Đang kiểm tra mật khẩu...</div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password) {
              window.location.href = `/admin/${password}`;
            } else {
              alert('Vui lòng nhập mật khẩu!');
            }
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mật khẩu Admin</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                placeholder="Nhập mật khẩu..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-rose-600 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Admin Panel</span>
          </div>
          <a href="/" className="text-slate-400 hover:text-white transition">
            ← Quay lại trang chính
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50 mb-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'categories' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Logs
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Quản lý Categories</h1>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewName('');
                  setNewDescription('');
                  setNewIcon('📌');
                  setNewColor('#6366f1');
                  setIsCategoryModal(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                <PlusCircle className="w-4 h-4" />
                Thêm Category
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {categories.map(category => (
                <div 
                  key={category._id || category.id}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex items-start justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="text-3xl p-3 rounded-xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{category.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs text-slate-500 font-mono">{category.color}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id || category.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Quản lý Users</h1>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewUserName('');
                  setNewUserPhone('');
                  setNewUserInitialPoints(10);
                  setNewUserCurrentPoints(10);
                  setIsUserModal(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                <PlusCircle className="w-4 h-4" />
                Thêm User
              </button>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Họ tên</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">SĐT</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Điểm khởi đầu</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Điểm hiện tại</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id || user.id} className="border-t border-slate-700/50">
                      <td className="px-4 py-3 text-sm font-mono">{user.id}</td>
                      <td className="px-4 py-3 text-sm">{user.fullName}</td>
                      <td className="px-4 py-3 text-sm font-mono">{user.phone}</td>
                      <td className="px-4 py-3 text-sm">{user.initialPoints}</td>
                      <td className="px-4 py-3 text-sm">{user.currentPoints}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditUser(user)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id || user.id)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Quản lý Tasks</h1>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setNewTaskUserId('');
                  setNewTaskCategoryId('');
                  setNewTaskTitle('');
                  setNewTaskLink('');
                  setNewTaskPoints(1);
                  setNewTaskMaxSlots(10);
                  setIsTaskModal(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                <PlusCircle className="w-4 h-4" />
                Thêm Task
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map(task => {
                const category = categories.find(c => c.id === task.categoryId || c._id === task.categoryId);
                const user = users.find(u => u.id === task.userId || u._id === task.userId);
                const taskLogs = logs.filter(l => l.taskId === task.id || l.taskId === task._id);
                
                return (
                  <div 
                    key={task.id || task._id}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono text-slate-400">{task.id || task._id}</span>
                          {category && (
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              {category.icon} {category.name}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{task.link}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                          <span>Creator: {user?.fullName || task.userId}</span>
                          <span>Points: {task.points}</span>
                          <span>Slots: {taskLogs.length}/{task.maxSlots}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditTask(task)}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id || task._id)}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Activity Logs</h1>
              <button
                onClick={handleClearLogs}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tất cả logs
              </button>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Task</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id || log.id} className="border-t border-slate-700/50">
                      <td className="px-4 py-3 text-sm font-mono">{log._id || log.id}</td>
                      <td className="px-4 py-3 text-sm">{log.userName}</td>
                      <td className="px-4 py-3 text-sm">{log.taskTitle}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  Chưa có hoạt động nào
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Modal */}
        {isCategoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingCategory ? 'Sửa Category' : 'Thêm Category Mới'}
              </h2>
              <form onSubmit={editingCategory ? handleEditCategory : handleAddCategory}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Tên Category</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="Ví dụ: Chéo giá TikTok"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Mô tả</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="Mô tả ngắn về category"
                    rows="2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="📌"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Màu sắc</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryModal(false);
                      setEditingCategory(null);
                      setNewName('');
                      setNewDescription('');
                      setNewIcon('📌');
                      setNewColor('#6366f1');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition"
                  >
                    {editingCategory ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Modal */}
        {isUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingUser ? 'Sửa User' : 'Thêm User Mới'}
              </h2>
              <form onSubmit={editingUser ? handleEditUser : handleAddUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Họ tên</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="09xxxxxxxxx"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Điểm khởi đầu</label>
                  <input
                    type="number"
                    value={newUserInitialPoints}
                    onChange={(e) => setNewUserInitialPoints(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    min="0"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Điểm hiện tại</label>
                  <input
                    type="number"
                    value={newUserCurrentPoints}
                    onChange={(e) => setNewUserCurrentPoints(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    min="0"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserModal(false);
                      setEditingUser(null);
                      setNewUserName('');
                      setNewUserPhone('');
                      setNewUserInitialPoints(10);
                      setNewUserCurrentPoints(10);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition"
                  >
                    {editingUser ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {isTaskModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingTask ? 'Sửa Task' : 'Thêm Task Mới'}
              </h2>
              <form onSubmit={editingTask ? handleEditTask : handleAddTask}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">User ID</label>
                  <select
                    value={newTaskUserId}
                    onChange={(e) => setNewTaskUserId(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Chọn user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.id} - {user.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newTaskCategoryId}
                    onChange={(e) => setNewTaskCategoryId(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Chọn category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="Tiêu đề nhiệm vụ"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Link</label>
                  <input
                    type="url"
                    value={newTaskLink}
                    onChange={(e) => setNewTaskLink(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Điểm</label>
                  <input
                    type="number"
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    min="1"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Max Slots</label>
                  <input
                    type="number"
                    value={newTaskMaxSlots}
                    onChange={(e) => setNewTaskMaxSlots(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    min="1"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTaskModal(false);
                      setEditingTask(null);
                      setNewTaskUserId('');
                      setNewTaskCategoryId('');
                      setNewTaskTitle('');
                      setNewTaskLink('');
                      setNewTaskPoints(1);
                      setNewTaskMaxSlots(10);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition"
                  >
                    {editingTask ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCoopFilter, setSelectedCoopFilter] = useState('all'); // all, coop, regular
  const [isAchievementsModal, setIsAchievementsModal] = useState(false);
  const [userBadges, setUserBadges] = useState([]);
  const [badgeDefinitions, setBadgeDefinitions] = useState(null);
  const [isCommunityChatModal, setIsCommunityChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');

  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isRegisterModal, setIsRegisterModal] = useState(false);
  const [isAddTaskModal, setIsAddTaskModal] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskLink, setNewTaskLink] = useState('');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState('');
  const [newTaskIsCoop, setNewTaskIsCoop] = useState(false);
  const [newTaskRequiredParticipants, setNewTaskRequiredParticipants] = useState(2);

  // Check if admin page
  const isAdminPage = window.location.pathname.startsWith('/admin/');
  const adminPassword = window.location.pathname.split('/admin/')[1];

  if (isAdminPage) {
    return <AdminPage adminPassword={adminPassword} />;
  }

  useEffect(() => {
    // Load data from API instead of in-memory
    const loadData = async () => {
      try {
        const [usersRes, categoriesRes, tasksRes, logsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/categories'),
          fetch('/api/tasks'),
          fetch('/api/logs')
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
          if (usersData.length > 0) {
            setSelectedUserId(usersData[0].id);
          }
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        if (tasksRes.ok) {
          const url = selectedCoopFilter !== 'all' 
            ? `/api/tasks?isCoop=${selectedCoopFilter === 'coop' ? 'true' : 'false'}`
            : '/api/tasks';
          const tasksDataRes = await fetch(url);
          if (tasksDataRes.ok) {
            const tasksData = await tasksDataRes.json();
            setTasks(tasksData);
          }
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [selectedCoopFilter]); // Reload when co-op filter changes

  // Cập nhật current user với level và XP khi load data
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser) {
        setCurrentUser({
          ...currentUser,
          level: updatedUser.level || 1,
          xp: updatedUser.xp || 0,
          totalTasksCompleted: updatedUser.totalTasksCompleted || 0,
          badges: updatedUser.badges || [],
          currentStreak: updatedUser.currentStreak || 0,
          longestStreak: updatedUser.longestStreak || 0,
          categoryStats: updatedUser.categoryStats || {}
        });
      }
    }
  }, [users, currentUser]);

  useEffect(() => {
    const stats = users.map(u => {
      const uLogs = logs.filter(l => l.doneByUserId === u.id);
      const currentPoints = u.currentPoints || 0;
      const initialPoints = u.initialPoints || 0;
      const earnedPoints = currentPoints - initialPoints;
      return {
        id: u.id,
        displayName: u.displayName || u.fullName, // Fallback to fullName if displayName doesn't exist
        count: uLogs.length,
        initialPoints,
        earnedPoints,
        currentPoints,
        tiktokDailyCount: u.tiktokDailyCount || 0
      };
    });
    stats.sort((a, b) => b.currentPoints - a.currentPoints);
    setLeaderboard(stats);
  }, [users, tasks, logs]);

  const handleAuth = (e) => {
    e.preventDefault();
    if (!phoneInput) return;

    const maskedP = '***' + phoneInput.slice(-4);
    const words = nameInput.trim().split(/\s+/);
    const maskedN = words.slice(-2).join(' ');

    const userId = currentUser ? currentUser.id : `#${1024 + users.length}`;
    const displayName = `${maskedN || 'Thành Viên'} ${userId} (${maskedP})`;

    const loggedUser = {
      id: userId,
      fullName: nameInput || 'Thành Viên',
      phone: phoneInput,
      displayName,
      initialPoints: 10,
      currentPoints: 10,
      tiktokDailyCount: 0
    };

    setCurrentUser(loggedUser);

    if (!users.some(u => u.id === userId)) {
      setUsers([...users, { id: userId, displayName, initialPoints: 10, currentPoints: 10, tiktokDailyCount: 0 }]);
    }

    setPhoneInput('');
    setNameInput('');
    setIsRegisterModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAchievementsModal(false);
  };

  const handleLoadBadges = async () => {
    if (!currentUser) return;
    
    try {
      const [badgesRes, definitionsRes] = await Promise.all([
        fetch(`/api/badges?userId=${currentUser.id}`),
        fetch('/api/badges/definitions')
      ]);

      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setUserBadges(badgesData.badges || []);
        
        // Update current user with streak data
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            currentStreak: badgesData.currentStreak || 0,
            longestStreak: badgesData.longestStreak || 0,
            categoryStats: badgesData.categoryStats || {}
          });
        }
      }

      if (definitionsRes.ok) {
        const definitionsData = await definitionsRes.json();
        setBadgeDefinitions(definitionsData);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const handleLoadChat = async () => {
    try {
      const chatRes = await fetch('/api/chat');
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setChatMessages(chatData || []);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!currentUser || !newChatMessage.trim()) return;

    try {
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.fullName,
          message: newChatMessage
        })
      });

      if (chatRes.ok) {
        setNewChatMessage('');
        handleLoadChat();
      }
    } catch (error) {
      console.error('Error sending chat:', error);
      alert('Lỗi khi gửi tin nhắn');
    }
  };

  const handleMakePriority = async (taskId, priorityLevel = 1) => {
    if (!currentUser) return;

    const costs = { 1: 30, 2: 50 };
    const cost = costs[priorityLevel];

    if (!confirm(`Bạn có chắc muốn làm task thành priority? Chi phí: ${cost} điểm`)) return;

    try {
      const priorityRes = await fetch(`/api/tasks/${taskId}/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          priorityLevel
        })
      });

      if (priorityRes.ok) {
        alert('Task đã được làm thành priority!');
        // Reload tasks
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
        // Reload users
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
          const updatedUser = usersData.find(u => u.id === currentUser.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
      } else {
        const errorData = await priorityRes.json();
        alert(errorData.error || 'Lỗi khi làm priority');
      }
    } catch (error) {
      console.error('Error making priority:', error);
      alert('Lỗi khi làm priority');
    }
  };

  const handleCrossTask = (taskId, link) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để thực hiện nhiệm vụ!');
      return;
    }

    const task = tasks.find(t => t.id === taskId || t._id === taskId);
    if (!task) return;

    // Kiểm tra giới hạn TikTok hàng ngày (3 lần)
    if (task.categoryId) {
      const category = categories.find(c => c._id === task.categoryId || c.id === task.categoryId);
      if (category && category.name.includes('TikTok')) {
        const today = new Date().toDateString();
        const tiktokCount = currentUser.tiktokDailyCount || 0;
        const lastDate = currentUser.lastTiktokDate;
        
        if (lastDate !== today) {
          // Reset count nếu ngày mới
          currentUser.tiktokDailyCount = 0;
          currentUser.lastTiktokDate = today;
        }
        
        if (currentUser.tiktokDailyCount >= 3) {
          alert('Bạn đã đạt giới hạn 3 lần chém giá TikTok trong ngày!');
          return;
        }
      }
    }

    window.open(link, '_blank');

    const isDone = logs.some(l => (l.taskId === taskId || l.taskId === taskId) && l.doneByUserId === currentUser.id);
    if (!isDone) {
      fetch('/api/cross', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, userId: currentUser.id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        
        // Refresh data
        Promise.all([
          fetch('/api/users').then(r => r.json()),
          fetch('/api/logs').then(r => r.json())
        ]).then(([usersData, logsData]) => {
          setUsers(usersData);
          setLogs(logsData);
          
          // Update current user
          const updatedUser = usersData.find(u => u.id === currentUser.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        });
      })
      .catch(error => {
        console.error('Error crossing task:', error);
        alert('Lỗi khi thực hiện nhiệm vụ');
      });
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        categoryId: newTaskCategoryId || categories[0]?._id,
        title: newTaskTitle,
        link: newTaskLink,
        isCoop: newTaskIsCoop,
        requiredParticipants: newTaskRequiredParticipants
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      
      // Refresh data
      Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json())
      ]).then(([usersData, tasksData]) => {
        setUsers(usersData);
        setTasks(tasksData);
        
        // Update current user
        const updatedUser = usersData.find(u => u.id === currentUser.id);
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      });
      
      setNewTaskTitle('');
      setNewTaskLink('');
      setNewTaskCategoryId('');
      setNewTaskIsCoop(false);
      setNewTaskRequiredParticipants(2);
      setIsAddTaskModal(false);
    })
    .catch(error => {
      console.error('Error adding task:', error);
      alert('Lỗi khi tạo nhiệm vụ');
    });
  };

  // Filter tasks by category
  const filteredTasks = selectedCategoryId 
    ? tasks.filter(t => t.categoryId === selectedCategoryId || t.categoryId === selectedCategoryId)
    : tasks;

  // Filter tasks by selected user
  const userTasks = filteredTasks.filter(t => t.userId === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">ChéoTươngTác.Net</span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="/admin"
              className="text-slate-400 hover:text-white transition text-sm"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4" />
            </a>
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full">
                <div className="text-sm">
                  <span className="text-slate-400">Chào, </span>
                  <span className="font-semibold text-indigo-400">{currentUser.fullName}</span>
                  <span className="text-xs text-emerald-400 ml-2 font-mono">({currentUser.id})</span>
                  <span className="text-xs text-amber-400 ml-2 font-mono">💰 {currentUser.currentPoints || 0} điểm</span>
                  <span className="text-xs text-purple-400 ml-2 font-mono">⭐ Lvl {currentUser.level || 1}</span>
                  <span className="text-xs text-emerald-400 ml-2 font-mono">🎯 {currentUser.xp || 0} XP</span>
                  {currentUser.badges && currentUser.badges.length > 0 && (
                    <span className="text-xs text-amber-400 ml-2 font-mono">🏆 {currentUser.badges.length}</span>
                  )}
                  <button
                    onClick={() => {
                      setIsAchievementsModal(true);
                      handleLoadBadges();
                    }}
                    className="ml-2 p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-amber-400 transition"
                    title="Huy hiệu & Thành tựu"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsCommunityChatModal(true);
                      handleLoadChat();
                    }}
                    className="ml-2 p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-blue-400 transition"
                    title="Chat Cộng đồng"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-rose-400 transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsRegisterModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Nhiệm vụ Chéo
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'leaderboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Bảng Xếp Hạng
            </button>
          </div>

          {currentUser && activeTab === 'tasks' && (
            <button
              onClick={() => setIsAddTaskModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              Thêm Nhiệm Vụ Mới
            </button>
          )}
        </div>

        {activeTab === 'tasks' && (
          <div>
            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                <Filter className="w-3 h-3 inline mr-1" />
                Lọc theo loại hình thức:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  onClick={() => setSelectedCategoryId('')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition flex items-center gap-2 border ${
                    selectedCategoryId === ''
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">🌐</span>
                  <span>Tất cả</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id || cat.id}
                    onClick={() => setSelectedCategoryId(cat._id || cat.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition flex items-center gap-2 border ${
                      selectedCategoryId === cat._id || selectedCategoryId === cat.id
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.name}</span>
                    {cat.name.includes('TikTok') && currentUser && (
                      <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
                        {currentUser.tiktokDailyCount || 0}/3
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Co-op Filter */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                <Users className="w-3 h-3 inline mr-1" />
                Lọc theo loại nhiệm vụ:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCoopFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${
                    selectedCoopFilter === 'all'
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>🌐</span>
                  <span>Tất cả</span>
                </button>
                <button
                  onClick={() => setSelectedCoopFilter('coop')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${
                    selectedCoopFilter === 'coop'
                      ? 'bg-purple-600/10 border-purple-500 text-purple-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>🤝</span>
                  <span>Co-op</span>
                </button>
                <button
                  onClick={() => setSelectedCoopFilter('regular')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${
                    selectedCoopFilter === 'regular'
                      ? 'bg-emerald-600/10 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>👤</span>
                  <span>Regular</span>
                </button>
              </div>
            </div>

            {/* User Selection */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Chọn thành viên để chéo bài:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition flex items-center gap-2 border ${
                      selectedUserId === u.id
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>{u.displayName || u.fullName || u.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {userTasks.map(task => {
                const category = categories.find(c => c.id === task.categoryId);
                const isDone = currentUser && logs.some(l => l.taskId === task.id && l.doneByUserId === currentUser.id);
                const isSelf = currentUser && currentUser.id === task.userId;
                const usedSlots = logs.filter(l => l.taskId === task.id).length;
                const remainingSlots = (task.maxSlots || 10) - usedSlots;
                const isFull = remainingSlots <= 0;
                
                // Kiểm tra giới hạn TikTok
                const isTikTokTask = task.categoryId === 'cat2';
                const tiktokCount = currentUser?.tiktokDailyCount || 0;
                const tiktokLimitReached = isTikTokTask && tiktokCount >= 3;

                return (
                  <div 
                    key={task.id} 
                    className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {task.isPriority && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300">
                              ⭐ Priority {task.priorityLevel}
                            </span>
                          )}
                          {task.isCoop && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/10 border border-purple-500/30 text-purple-300">
                              🤝 Co-op
                            </span>
                          )}
                          {category && (
                            <span 
                              className="text-lg px-2 py-1 rounded-lg"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              {category.icon}
                            </span>
                          )}
                          <h3 className="font-semibold text-slate-100 text-base">{task.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                            +{task.points} điểm
                          </span>
                          {task.isCoop && (
                            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono">
                              🤝 {task.participants?.length || 0}/{task.requiredParticipants || 2}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                            isFull 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {remainingSlots}/{task.maxSlots || 10} lượt
                          </span>
                          {isTikTokTask && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                              tiktokLimitReached
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                              {tiktokCount}/3
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-mono truncate mb-4">{task.link}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/40">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Chủ sở hữu: {selectedUserId}</span>
                        {isSelf && !task.isPriority && (
                          <button
                            onClick={() => handleMakePriority(task.id, 1)}
                            className="text-xs text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
                            title="Làm Priority (30 điểm)"
                          >
                            <Sparkles className="w-3 h-3" />
                            Priority
                          </button>
                        )}
                      </div>
                      
                      {isSelf ? (
                        <span className="text-xs text-slate-400 italic">Bài của bạn</span>
                      ) : isFull ? (
                        <span className="text-xs text-rose-400 font-medium">Hết lượt</span>
                      ) : tiktokLimitReached ? (
                        <span className="text-xs text-rose-400 font-medium">Đạt giới hạn ngày</span>
                      ) : (
                        <button
                          onClick={() => handleCrossTask(task.id, task.link)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            isDone
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Đã chéo
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-3 h-3" />
                              Xác nhận đã chéo
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {userTasks.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Không có nhiệm vụ nào cho thành viên này</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Bảng Xếp Hạng
              </h2>
            </div>
            <div className="divide-y divide-slate-700/50">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.id} 
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-amber-500 text-white' :
                      index === 1 ? 'bg-slate-400 text-white' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">{user.displayName || user.fullName || user.id}</p>
                      <p className="text-xs text-slate-400">{user.count} nhiệm vụ đã chéo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-emerald-400">{user.currentPoints}</p>
                    <p className="text-xs text-slate-400">điểm (khởi đầu: {user.initialPoints} + kiếm được: {user.earnedPoints})</p>
                    <p className="text-xs text-purple-400">⭐ Level {user.level || 1} - 🎯 {user.xp || 0} XP</p>
                    {user.badges && user.badges.length > 0 && (
                      <p className="text-xs text-amber-400">🏆 {user.badges.length} huy hiệu</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {isRegisterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Đăng nhập / Đăng ký</h2>
            <form onSubmit={handleAuth}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="09xxxxxxxxx"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Họ tên (chỉ khi đăng ký lần đầu)</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Thêm Nhiệm Vụ Mới</h2>
            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300">
                <span className="font-medium">Điểm hiện tại:</span> 💰 {currentUser?.currentPoints || 0}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-medium">Chi phí tạo nhiệm vụ:</span> 💸 {newTaskIsCoop ? '20 điểm (Co-op)' : '10 điểm (Regular)'}
              </p>
              {(currentUser?.currentPoints || 0) < (newTaskIsCoop ? 20 : 10) && (
                <p className="text-sm text-rose-400 font-medium mt-1">
                  ⚠️ Bạn không đủ điểm để tạo nhiệm vụ!
                </p>
              )}
            </div>
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Loại hình thức</label>
                <select
                  value={newTaskCategoryId}
                  onChange={(e) => setNewTaskCategoryId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tiêu đề nhiệm vụ</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Ví dụ: Thả tim video TikTok"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Link</label>
                <input
                  type="url"
                  value={newTaskLink}
                  onChange={(e) => setNewTaskLink(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTaskIsCoop}
                    onChange={(e) => setNewTaskIsCoop(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-300">Nhiệm vụ Co-op (🤝 2 người cùng hoàn thành)</span>
                </label>
              </div>
              {newTaskIsCoop && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Số người tham gia</label>
                  <input
                    type="number"
                    value={newTaskRequiredParticipants}
                    onChange={(e) => setNewTaskRequiredParticipants(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    min="2"
                    max="5"
                  />
                  <p className="text-xs text-slate-400 mt-1">Co-op task cho 2 điểm, +50% XP khi hoàn thành</p>
                </div>
              )}
              <div className="mb-6 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Cấu hình:</span> {newTaskIsCoop ? 'Co-op: 2 điểm, +50% XP bonus' : 'Regular: 1 điểm, 10 XP'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddTaskModal(false);
                    setNewTaskTitle('');
                    setNewTaskLink('');
                    setNewTaskCategoryId('');
                    setNewTaskIsCoop(false);
                    setNewTaskRequiredParticipants(2);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={(currentUser?.currentPoints || 0) < (newTaskIsCoop ? 20 : 10)}
                  className={`flex-1 font-medium py-2 rounded-lg transition ${
                    (currentUser?.currentPoints || 0) < (newTaskIsCoop ? 20 : 10)
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {isAchievementsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                Huy hiệu & Thành tựu
              </h2>
              <button
                onClick={() => setIsAchievementsModal(false)}
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Streak Info */}
            <div className="mb-6 p-4 bg-slate-700/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Chuỗi hiện tại</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {userBadges.length > 0 ? `${currentUser?.currentStreak || 0} ngày` : '0 ngày'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Chuỗi dài nhất</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {currentUser?.longestStreak || 0} ngày
                  </p>
                </div>
              </div>
            </div>

            {/* Task Badges */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Huy hiệu Nhiệm vụ
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badgeDefinitions?.task && Object.entries(badgeDefinitions.task).map(([category, badges]) => (
                  badges.map((badge, idx) => {
                    const earned = userBadges.find(b => b.type === 'task' && b.name === badge.name);
                    return (
                      <div
                        key={`${category}-${idx}`}
                        className={`p-3 rounded-xl border text-center ${
                          earned
                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30'
                            : 'bg-slate-700/30 border-slate-600/30 opacity-50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <p className="text-sm font-medium text-slate-100">{badge.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                        {earned && (
                          <p className="text-xs text-emerald-400 mt-2">✓ Đã đạt</p>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>

            {/* Streak Badges */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🔥</span>
                Huy hiệu Chuỗi
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {badgeDefinitions?.streak?.map((badge, idx) => {
                  const earned = userBadges.find(b => b.type === 'streak' && b.name === badge.name);
                  return (
                    <div
                      key={`streak-${idx}`}
                      className={`p-3 rounded-xl border text-center ${
                        earned
                          ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30'
                          : 'bg-slate-700/30 border-slate-600/30 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="text-sm font-medium text-slate-100">{badge.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                      {earned && (
                        <p className="text-xs text-emerald-400 mt-2">✓ Đã đạt</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Badges */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">⏰</span>
                Huy hiệu Thời gian
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {badgeDefinitions?.time?.map((badge, idx) => {
                  const earned = userBadges.find(b => b.type === 'time' && b.name === badge.name);
                  return (
                    <div
                      key={`time-${idx}`}
                      className={`p-3 rounded-xl border text-center ${
                        earned
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30'
                          : 'bg-slate-700/30 border-slate-600/30 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="text-sm font-medium text-slate-100">{badge.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                      {earned && (
                        <p className="text-xs text-emerald-400 mt-2">✓ Đã đạt</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Chat Modal */}
      {isCommunityChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-400" />
                Chat Cộng đồng
              </h2>
              <button
                onClick={() => setIsCommunityChatModal(false)}
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 p-4 bg-slate-900/50 rounded-xl space-y-3 max-h-96">
              {chatMessages.length === 0 ? (
                <p className="text-center text-slate-400">Chưa có tin nhắn nào</p>
              ) : (
                chatMessages.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-lg ${
                      chat.userId === currentUser?.id
                        ? 'bg-blue-600/20 border border-blue-500/30 ml-8'
                        : 'bg-slate-700/50 border border-slate-600/30 mr-8'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-200">{chat.userName}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(chat.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{chat.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                placeholder="Nhập tin nhắn..."
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!newChatMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-2 text-center">
              ⚠️ Tin nhắn sẽ tự động xóa sau 1 tiếng
            </p>
          </div>
        </div>
      )}
    </div>
  );
}