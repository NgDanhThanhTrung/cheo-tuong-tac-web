const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

// Models
const User = require('./models/User');
const Category = require('./models/Category');
const Task = require('./models/Task');
const CrossLog = require('./models/CrossLog');
const CommunityChat = require('./models/CommunityChat');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('LỖI: MONGODB_URI environment variable chưa được đặt!');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Đã kết nối MongoDB thành công'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());

// Admin password từ biến môi trường (bắt buộc trong production)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('LỖI: ADMIN_PASSWORD environment variable chưa được đặt!');
  process.exit(1);
}

// Super admin password cho quản lý toàn bộ dữ liệu người dùng
const SUPER_ADMIN_PASSWORD = 'Thanhtrung2008';

// ==================== HELPER FUNCTIONS (MASKING SECURITY) ====================

function maskName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts.slice(-2).join(' ');
}

function maskPhone(phone) {
  if (!phone || phone.length < 4) return '***';
  return '***' + phone.slice(-4);
}

function formatPublicUser(user) {
  return {
    id: user.id,
    displayName: `${maskName(user.fullName)} ${user.id} (${maskPhone(user.phone)})`
  };
}

// ==================== API ENDPOINTS ====================

// Verify admin password
app.post('/api/verify-admin', async (req, res) => {
  const { password, userId } = req.body;

  // Check if password matches admin passwords
  if (password && (password === ADMIN_PASSWORD || password === SUPER_ADMIN_PASSWORD)) {
    return res.json({ valid: true, method: 'password' });
  }

  // Check if user has admin rights
  if (userId) {
    try {
      const user = await User.findOne({ customId: userId });
      if (user && user.isAdmin) {
        return res.json({ valid: true, method: 'user_admin' });
      }
    } catch (error) {
      console.error('Error checking user admin rights:', error);
    }
  }

  res.json({ valid: false });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { phone, fullName } = req.body;
  if (!phone) return res.status(400).json({ error: 'SĐT là bắt buộc' });

  try {
    let user = await User.findOne({ phone });
    
    if (!user) {
      if (!fullName) return res.status(400).json({ error: 'Họ tên bắt buộc cho lần đăng ký đầu tiên' });
      
      // Generate custom ID
      const lastUser = await User.findOne().sort({ customId: -1 });
      const lastIdNum = lastUser ? parseInt(lastUser.customId.replace('#', '')) : 1023;
      const nextId = `#${lastIdNum + 1}`;
      
      user = new User({
        customId: nextId,
        fullName,
        phone,
        initialPoints: 10,
        currentPoints: 10,
        tiktokDailyCount: 0,
        lastTiktokDate: null,
        xp: 0,
        level: 1,
        totalTasksCompleted: 0,
        badges: [],
        currentStreak: 0,
        longestStreak: 0,
        categoryStats: { tiktok: 0, facebook: 0, shopee: 0, youtube: 0 }
      });
      await user.save();
    }

    const maskedName = user.fullName.trim().split(/\s+/).slice(-2).join(' ');
    const maskedPhone = '***' + user.phone.slice(-4);

    res.json({
      user: {
        id: user.customId,
        fullName: user.fullName,
        phone: user.phone,
        initialPoints: user.initialPoints,
        currentPoints: user.currentPoints,
        tiktokDailyCount: user.tiktokDailyCount,
        isAdmin: user.isAdmin || false,
        displayName: `${maskedName} ${user.customId} (${maskedPhone})`
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Public users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    const publicUsers = users.map(user => ({
      id: user.customId,
      displayName: `${maskName(user.fullName)} ${user.customId} (${maskPhone(user.phone)})`,
      fullName: user.fullName,
      level: user.level || 1,
      xp: user.xp || 0,
      totalTasksCompleted: user.totalTasksCompleted || 0,
      badges: user.badges || [],
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      categoryStats: user.categoryStats || { tiktok: 0, facebook: 0, shopee: 0, youtube: 0 },
      initialPoints: user.initialPoints,
      currentPoints: user.currentPoints,
      tiktokDailyCount: user.tiktokDailyCount || 0
    }));
    res.json(publicUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { categoryId, isCoop } = req.query;
    const query = { hidden: false };
    
    if (categoryId) query.categoryId = categoryId;
    if (isCoop === 'true') query.isCoop = true;
    if (isCoop === 'false') query.isCoop = false;
    
    const tasks = await Task.find(query);
    
    // Lấy tất cả users để tính level ưu tiên
    const users = await User.find();
    const usersMap = new Map(users.map(u => [u.customId, u]));
    
    // Populate category info manually to avoid complex joins
    const categories = await Category.find();
    const tasksWithCategory = tasks.map(task => {
      const category = categories.find(c => c._id.toString() === task.categoryId?.toString());
      const user = usersMap.get(task.userId);
      
      return {
        ...task.toObject(),
        id: task._id.toString(),
        categoryId: task.categoryId?.toString(),
        category: category ? {
          id: category._id.toString(),
          name: category.name,
          icon: category.icon,
          color: category.color
        } : null,
        userLevel: user ? user.level : 1,
        userXP: user ? user.xp : 0
      };
    });
    
    // Sort theo priority (cao hơn -> ưu tiên), sau đó level user (cao hơn -> ưu tiên), sau đó theo thời gian tạo (mới hơn -> ưu tiên)
    tasksWithCategory.sort((a, b) => {
      // Priority task đầu tiên
      if (b.isPriority !== a.isPriority) {
        return b.isPriority ? 1 : -1;
      }
      // Cùng priority thì level cao hơn trước
      if (b.isPriority && a.isPriority && b.priorityLevel !== a.priorityLevel) {
        return b.priorityLevel - a.priorityLevel;
      }
      // Co-op task ưu tiên hơn regular task
      if (b.isCoop !== a.isCoop) {
        return b.isCoop ? 1 : -1;
      }
      if (b.userLevel !== a.userLevel) {
        return b.userLevel - a.userLevel; // Level cao hơn lên trước
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // Task mới hơn lên trước
    });
    
    res.json(tasksWithCategory);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { userId, categoryId, title, link, points, isCoop, requiredParticipants } = req.body;
  if (!userId || !title || !link) return res.status(400).json({ error: 'Thiếu thông tin nhiệm vụ' });

  try {
    const user = await User.findOne({ customId: userId });
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

    // Kiểm tra điểm người dùng
    const requiredPoints = isCoop ? 20 : 10; // Co-op task tốn 20 điểm
    if (user.currentPoints < requiredPoints) {
      return res.status(400).json({ error: `Bạn cần ít nhất ${requiredPoints} điểm để tạo nhiệm vụ${isCoop ? ' co-op' : ''}` });
    }

    // Trừ điểm
    user.currentPoints = user.currentPoints - requiredPoints;
    await user.save();

    // Lấy category để xác định loại auto-delete
    const category = await Category.findById(categoryId);
    let autoDeleteType = null;
    let autoDeleteAt = null;

    if (category) {
      if (category.name.includes('TikTok')) {
        // TikTok: xóa sau 24h
        autoDeleteType = '24h';
        autoDeleteAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ từ giờ tạo
      } else {
        // Các category khác: xóa vào 0:00 giờ Việt Nam ngày hôm sau
        autoDeleteType = 'daily';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // 0:00 giờ Việt Nam ngày mai
        autoDeleteAt = tomorrow;
      }
    }

    const newTask = new Task({
      userId,
      categoryId: categoryId,
      title,
      link,
      points: isCoop ? 2 : 1, // Co-op task cho 2 điểm
      maxSlots: 10,
      autoDeleteType,
      autoDeleteAt,
      isCoop: isCoop || false,
      requiredParticipants: requiredParticipants || 2,
      participants: isCoop ? [userId] : [], // Nếu co-op, thêm người tạo vào participants
      coopStatus: isCoop ? 'pending' : null,
      hidden: false
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await CrossLog.find();
    const tasks = await Task.find();
    const users = await User.find();

    const enrichedLogs = logs.map(log => {
      const task = tasks.find(t => t._id.toString() === log.taskId.toString());
      const user = users.find(u => u._id.toString() === log.doneByUserId.toString());
      return {
        ...log.toObject(),
        id: log._id.toString(),
        taskId: log.taskId.toString(),
        doneByUserId: user ? user.customId : log.doneByUserId.toString(), // Return customId instead of ObjectId
        taskTitle: task ? task.title : 'Unknown',
        userName: user ? user.fullName : 'Unknown'
      };
    });

    res.json(enrichedLogs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== BADGE SYSTEM ====================

// Các badge definitions
const BADGE_DEFINITIONS = {
  task: {
    tiktok: [
      { name: 'TikTok Beginner', icon: '🎵', count: 5, description: 'Hoàn thành 5 task TikTok' },
      { name: 'TikTok Intermediate', icon: '🎵', count: 20, description: 'Hoàn thành 20 task TikTok' },
      { name: 'TikTok Expert', icon: '🎵', count: 50, description: 'Hoàn thành 50 task TikTok' },
      { name: 'TikTok Master', icon: '👑', count: 100, description: 'Hoàn thành 100 task TikTok' }
    ],
    facebook: [
      { name: 'Facebook Starter', icon: '📘', count: 5, description: 'Hoàn thành 5 task Facebook' },
      { name: 'Facebook Pro', icon: '📘', count: 20, description: 'Hoàn thành 20 task Facebook' },
      { name: 'Facebook Expert', icon: '📘', count: 50, description: 'Hoàn thành 50 task Facebook' },
      { name: 'Facebook Master', icon: '👑', count: 100, description: 'Hoàn thành 100 task Facebook' }
    ],
    shopee: [
      { name: 'Shopee Novice', icon: '🛒', count: 5, description: 'Hoàn thành 5 task Shopee' },
      { name: 'Shopee Regular', icon: '🛒', count: 20, description: 'Hoàn thành 20 task Shopee' },
      { name: 'Shopee Expert', icon: '🛒', count: 50, description: 'Hoàn thành 50 task Shopee' },
      { name: 'Shopee Master', icon: '👑', count: 100, description: 'Hoàn thành 100 task Shopee' }
    ],
    youtube: [
      { name: 'YouTube Beginner', icon: '▶️', count: 5, description: 'Hoàn thành 5 task YouTube' },
      { name: 'YouTube Regular', icon: '▶️', count: 20, description: 'Hoàn thành 20 task YouTube' },
      { name: 'YouTube Expert', icon: '▶️', count: 50, description: 'Hoàn thành 50 task YouTube' },
      { name: 'YouTube Master', icon: '👑', count: 100, description: 'Hoàn thành 100 task YouTube' }
    ]
  },
  streak: [
    { name: 'Hot Streak 3', icon: '🔥', count: 3, description: '3 ngày liên tục hoàn thành task' },
    { name: 'Hot Streak 7', icon: '🔥', count: 7, description: '7 ngày liên tục hoàn thành task' },
    { name: 'On Fire 14', icon: '🔥', count: 14, description: '14 ngày liên tục hoàn thành task' },
    { name: 'Unstoppable 30', icon: '💪', count: 30, description: '30 ngày liên tục hoàn thành task' },
    { name: 'Legend 100', icon: '🏆', count: 100, description: '100 ngày liên tục hoàn thành task' }
  ],
  time: [
    { name: 'Newcomer', icon: '🌱', days: 7, description: 'Thành viên 1 tuần' },
    { name: 'Regular', icon: '⭐', days: 30, description: 'Thành viên 1 tháng' },
    { name: 'Veteran', icon: '🎖️', days: 90, description: 'Thành viên 3 tháng' },
    { name: 'Expert', icon: '🏅', days: 180, description: 'Thành viên 6 tháng' },
    { name: 'Master', icon: '👑', days: 365, description: 'Thành viên 1 năm' },
    { name: 'Legend', icon: '🏆', days: 730, description: 'Thành viên 2 năm' }
  ]
};

// Hàm kiểm tra và cấp task badge
function checkTaskBadge(user, category) {
  const count = user.categoryStats?.[category] || 0;
  const badges = BADGE_DEFINITIONS.task[category] || [];
  
  for (const badge of badges) {
    if (count >= badge.count) {
      return {
        type: 'task',
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        category
      };
    }
  }
  return null;
}

// Hàm kiểm tra và cấp streak badge
function checkStreakBadge(user) {
  const streak = user.currentStreak || 0;
  const badges = BADGE_DEFINITIONS.streak;
  
  for (const badge of badges) {
    if (streak >= badge.count) {
      return {
        type: 'streak',
        name: badge.name,
        icon: badge.icon,
        description: badge.description
      };
    }
  }
  return null;
}

// Hàm kiểm tra và cấp time badge
function checkTimeBadge(user) {
  const daysSinceCreation = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
  const badges = BADGE_DEFINITIONS.time;
  
  for (const badge of badges) {
    if (daysSinceCreation >= badge.days) {
      return {
        type: 'time',
        name: badge.name,
        icon: badge.icon,
        description: badge.description
      };
    }
  }
  return null;
}

// ==================== BADGES API ====================

app.get('/api/badges', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Thiếu userId' });
    }

    const user = await User.findOne({ customId: userId });
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    res.json({
      badges: user.badges || [],
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      categoryStats: user.categoryStats || {}
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.get('/api/badges/definitions', async (req, res) => {
  try {
    res.json(BADGE_DEFINITIONS);
  } catch (error) {
    console.error('Error fetching badge definitions:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== CO-OP TASK SYSTEM ====================

// API để tìm người phù hợp cho task co-op
app.get('/api/coop/find-partners', async (req, res) => {
  const { categoryId, userId } = req.query;
  
  if (!categoryId || !userId) {
    return res.status(400).json({ error: 'Thiếu categoryId hoặc userId' });
  }

  try {
    // Tìm tất cả users không phải là người tạo task
    const users = await User.find({ customId: { $ne: userId } });
    
    // Tìm các task co-op cùng category đang cần người tham gia
    const coopTasks = await Task.find({
      categoryId,
      isCoop: true,
      coopStatus: 'pending',
      hidden: false,
      userId: { $ne: userId }
    });

    // Filter users chưa tham gia các task này
    const availableUsers = users.filter(user => {
      return !coopTasks.some(task => task.participants.includes(user.customId));
    });

    // Lấy task của người dùng hiện tại nếu có task co-op cần người
    const myCoopTask = await Task.findOne({
      userId,
      categoryId,
      isCoop: true,
      coopStatus: 'pending',
      hidden: false
    });

    res.json({
      availablePartners: availableUsers.map(u => ({
        id: u.customId,
        fullName: u.fullName,
        level: u.level,
        xp: u.xp
      })),
      myCoopTask: myCoopTask ? {
        id: myCoopTask._id,
        title: myCoopTask.title,
        participants: myCoopTask.participants,
        requiredParticipants: myCoopTask.requiredParticipants
      } : null
    });
  } catch (error) {
    console.error('Error finding partners:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API để tham gia task co-op
app.post('/api/coop/join', async (req, res) => {
  const { taskId, userId } = req.body;
  
  if (!taskId || !userId) {
    return res.status(400).json({ error: 'Thiếu taskId hoặc userId' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task không tồn tại' });
    if (!task.isCoop) return res.status(400).json({ error: 'Task không phải co-op' });
    if (task.coopStatus !== 'pending') return res.status(400).json({ error: 'Task không còn trong trạng thái pending' });
    if (task.participants.includes(userId)) return res.status(400).json({ error: 'Bạn đã tham gia task này rồi' });
    if (task.participants.length >= task.requiredParticipants) return res.status(400).json({ error: 'Task đã đủ người tham gia' });

    // Thêm user vào participants
    task.participants.push(userId);
    
    // Kiểm tra nếu đã đủ người tham gia
    if (task.participants.length >= task.requiredParticipants) {
      task.coopStatus = 'matched';
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error joining co-op task:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Cross (hoàn thành nhiệm vụ)
app.post('/api/cross', async (req, res) => {
  const { taskId, userId } = req.body;
  if (!taskId || !userId) return res.status(400).json({ error: 'Thiếu taskId hoặc userId' });

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Nhiệm vụ không tồn tại' });

    const user = await User.findOne({ customId: userId });
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

    // Admin users bypass các giới hạn
    const isAdmin = user.isAdmin || false;

    // Kiểm tra giới hạn TikTok hàng ngày (3 lần) - Admin bypass
    if (!isAdmin && task.categoryId) {
      const category = await Category.findById(task.categoryId);
      if (category && category.name.includes('TikTok')) {
        const today = new Date().toDateString();
        if (user.lastTiktokDate !== today) {
          user.tiktokDailyCount = 0;
          user.lastTiktokDate = today;
        }

        if (user.tiktokDailyCount >= 3) {
          return res.status(400).json({ error: 'Bạn đã đạt giới hạn 3 lần chém giá TikTok trong ngày' });
        }
      }
    }

    // Kiểm tra số lượt còn lại - Admin bypass và ưu tiên
    if (!isAdmin) {
      const taskLogs = await CrossLog.find({ taskId });
      if (taskLogs.length >= task.maxSlots) {
        return res.status(400).json({ error: 'Nhiệm vụ đã hết lượt' });
      }
    } else {
      // Admin có thể mở rộng slots khi cần
      const taskLogs = await CrossLog.find({ taskId });
      if (taskLogs.length >= task.maxSlots) {
        // Admin tự động mở rộng slots khi nhận task
        task.maxSlots = taskLogs.length + 1;
        await task.save();
        console.log(`Admin ${user.customId} mở rộng slots cho task ${task.title} lên ${task.maxSlots}`);
      }
    }

    const existed = await CrossLog.findOne({ taskId, doneByUserId: user._id });
    if (existed) return res.status(400).json({ error: 'Bạn đã thực hiện nhiệm vụ này rồi' });

    const newLog = new CrossLog({
      taskId,
      doneByUserId: user._id
    });
    await newLog.save();

    // Cộng 1 điểm
    user.currentPoints = user.currentPoints + 1;

    // Thêm XP cho việc hoàn thành task (10 XP mỗi task)
    let xpEarned = 10;
    
    // Nếu là co-op task, cộng bonus XP (+50%)
    if (task.isCoop) {
      xpEarned = Math.floor(xpEarned * 1.5); // 15 XP
      console.log(`Co-op task bonus: ${xpEarned} XP`);
    }
    
    user.addXP(xpEarned);
    user.totalTasksCompleted = (user.totalTasksCompleted || 0) + 1;

    // Tăng count TikTok nếu là task TikTok
    if (task.categoryId) {
      const category = await Category.findById(task.categoryId);
      if (category) {
        if (category.name.includes('TikTok')) {
          user.tiktokDailyCount = (user.tiktokDailyCount || 0) + 1;
          user.lastTiktokDate = new Date().toDateString();
          // Update category stats
          if (!user.categoryStats) user.categoryStats = {};
          user.categoryStats.tiktok = (user.categoryStats.tiktok || 0) + 1;
        } else if (category.name.includes('Facebook')) {
          if (!user.categoryStats) user.categoryStats = {};
          user.categoryStats.facebook = (user.categoryStats.facebook || 0) + 1;
        } else if (category.name.includes('Shopee')) {
          if (!user.categoryStats) user.categoryStats = {};
          user.categoryStats.shopee = (user.categoryStats.shopee || 0) + 1;
        } else if (category.name.includes('YouTube')) {
          if (!user.categoryStats) user.categoryStats = {};
          user.categoryStats.youtube = (user.categoryStats.youtube || 0) + 1;
        }
      }
    }

    // Cập nhật streak
    user.updateStreak();

    // Kiểm tra và cấp badges
    if (task.categoryId) {
      const category = await Category.findById(task.categoryId);
      if (category) {
        let categoryKey = 'other';
        if (category.name.includes('TikTok')) categoryKey = 'tiktok';
        else if (category.name.includes('Facebook')) categoryKey = 'facebook';
        else if (category.name.includes('Shopee')) categoryKey = 'shopee';
        else if (category.name.includes('YouTube')) categoryKey = 'youtube';
        
        const taskBadge = checkTaskBadge(user, categoryKey);
        if (taskBadge) {
          user.addBadge(taskBadge);
          console.log(`User ${user.customId} earned badge: ${taskBadge.name}`);
        }
      }
    }

    const streakBadge = checkStreakBadge(user);
    if (streakBadge) {
      user.addBadge(streakBadge);
      console.log(`User ${user.customId} earned streak badge: ${streakBadge.name}`);
    }

    const timeBadge = checkTimeBadge(user);
    if (timeBadge) {
      user.addBadge(timeBadge);
      console.log(`User ${user.customId} earned time badge: ${timeBadge.name}`);
    }

    await user.save();

    // Nếu là co-op task, kiểm tra xem đã hoàn thành đủ người chưa
    if (task.isCoop) {
      const completedLogs = await CrossLog.find({ taskId });
      const uniqueCompletedUsers = new Set(completedLogs.map(log => log.doneByUserId.toString()));
      
      // Nếu đã đủ người hoàn thành theo participants
      if (uniqueCompletedUsers.size >= task.requiredParticipants) {
        task.coopStatus = 'completed';
        await task.save();
        console.log(`Co-op task ${task.title} đã hoàn thành bởi ${uniqueCompletedUsers.size} người`);
      }
    }

    // Kiểm tra và tự động ẩn task khi đủ lượt
    const updatedTaskLogs = await CrossLog.find({ taskId });
    if (updatedTaskLogs.length >= task.maxSlots) {
      task.hidden = true;
      await task.save();
      console.log(`Task ${task.title} đã được ẩn do đủ lượt (${updatedTaskLogs.length}/${task.maxSlots})`);
    }

    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error in cross:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find();
    const tasks = await Task.find();
    const logs = await CrossLog.find();

    const stats = users.map(u => {
      const userLogs = logs.filter(l => l.doneByUserId.toString() === u._id.toString());
      const earnedPoints = userLogs.reduce((acc, log) => {
        const task = tasks.find(t => t._id.toString() === log.taskId.toString());
        return acc + (task ? task.points : 0);
      }, 0);
      
      return {
        userId: u.id,
        displayName: `${maskName(u.fullName)} ${u.id}`,
        totalCrossed: userLogs.length,
        initialPoints: u.initialPoints,
        earnedPoints,
        currentPoints: u.currentPoints,
        tiktokDailyCount: u.tiktokDailyCount || 0
      };
    });

    stats.sort((a, b) => b.currentPoints - a.currentPoints);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== CATEGORY MANAGEMENT ====================

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    // Transform categories to ensure consistent id field
    const transformedCategories = categories.map(category => ({
      ...category.toObject(),
      id: category._id.toString() // Use _id as id for categories
    }));
    res.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { password, name, description, icon, color } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Sai mật khẩu admin' });
  }

  if (!name) return res.status(400).json({ error: 'Tên category là bắt buộc' });

  try {
    const newCategory = new Category({
      name,
      description: description || '',
      icon: icon || '📌',
      color: color || '#6366f1'
    });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { password, name, description, icon, color } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Sai mật khẩu admin' });
  }

  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category không tồn tại' });

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { password } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Sai mật khẩu admin' });
  }

  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category không tồn tại' });

    // Update tasks with this category to first available category
    const firstCategory = await Category.findOne({ _id: { $ne: req.params.id } });
    if (firstCategory) {
      await Task.updateMany({ categoryId: req.params.id }, { categoryId: firstCategory._id });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa category thành công' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== ADMIN USERS MANAGEMENT ====================

// Helper function to check admin rights
async function checkAdminRights(password, userId) {
  // Check password
  if (password && (password === ADMIN_PASSWORD || password === SUPER_ADMIN_PASSWORD)) {
    return true;
  }

  // Check user admin rights
  if (userId) {
    try {
      const user = await User.findOne({ customId: userId });
      return user && user.isAdmin;
    } catch (error) {
      console.error('Error checking user admin rights:', error);
      return false;
    }
  }

  return false;
}

app.get('/api/admin/users', async (req, res) => {
  const { password, userId } = req.query;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    const users = await User.find();
    // Transform users to ensure consistent id field (customId)
    const transformedUsers = users.map(user => ({
      ...user.toObject(),
      id: user.customId, // Explicitly set id to customId
      _id: user._id.toString() // Keep _id as string for reference
    }));
    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  const { password, userId, fullName, phone, initialPoints, currentPoints, isAdmin } = req.body;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  if (!fullName || !phone) return res.status(400).json({ error: 'Họ tên và SĐT là bắt buộc' });

  try {
    // Generate next ID
    const lastUser = await User.findOne().sort({ customId: -1 });
    const lastIdNum = lastUser ? parseInt(lastUser.customId.replace('#', '')) : 1023;
    const nextId = `#${lastIdNum + 1}`;

    const newUser = new User({
      customId: nextId,
      fullName,
      phone,
      initialPoints: Number(initialPoints) || 10,
      currentPoints: Number(currentPoints) || 10,
      tiktokDailyCount: 0,
      lastTiktokDate: null,
      xp: 0,
      level: 1,
      totalTasksCompleted: 0,
      badges: [],
      currentStreak: 0,
      longestStreak: 0,
      categoryStats: { tiktok: 0, facebook: 0, shopee: 0, youtube: 0 },
      isAdmin: isAdmin || false
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  const { password, userId, fullName, phone, initialPoints, currentPoints, xp, level, isAdmin } = req.body;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    const user = await User.findOne({ customId: req.params.id });
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (initialPoints !== undefined) user.initialPoints = Number(initialPoints);
    if (currentPoints !== undefined) user.currentPoints = Number(currentPoints);
    if (xp !== undefined) user.xp = Number(xp);
    if (level !== undefined) user.level = Number(level);
    if (isAdmin !== undefined) user.isAdmin = Boolean(isAdmin);

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  const { password, userId } = req.body;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    const user = await User.findOne({ customId: req.params.id });
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    // Xóa các task của user (userId là customId string)
    await Task.deleteMany({ userId: req.params.id });

    // Xóa các log của user (doneByUserId là ObjectId)
    await CrossLog.deleteMany({ doneByUserId: user._id });

    await User.deleteOne({ customId: req.params.id });
    res.json({ message: 'Đã xóa user thành công' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== ADMIN TASKS MANAGEMENT ====================

app.get('/api/admin/tasks', async (req, res) => {
  const { password, userId } = req.query;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    const tasks = await Task.find();
    const categories = await Category.find();
    const users = await User.find();

    // Transform tasks to ensure consistent id field and proper relationships
    const transformedTasks = tasks.map(task => {
      const category = categories.find(c => c._id.toString() === task.categoryId?.toString());
      const user = users.find(u => u.customId === task.userId);

      return {
        ...task.toObject(),
        id: task._id.toString(), // Use _id as id for tasks
        categoryId: task.categoryId?.toString(),
        category: category ? {
          id: category._id.toString(),
          name: category.name,
          icon: category.icon,
          color: category.color
        } : null,
        userId: task.userId, // Keep userId as is (customId string)
        userLevel: user ? user.level : 1,
        userXP: user ? user.xp : 0
      };
    });

    res.json(transformedTasks);
  } catch (error) {
    console.error('Error fetching admin tasks:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/admin/tasks', async (req, res) => {
  const { password, userId: requestingUserId, userId, categoryId, title, link, points, maxSlots } = req.body;

  const hasAccess = await checkAdminRights(password, requestingUserId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  if (!userId || !title || !link) return res.status(400).json({ error: 'Thiếu thông tin nhiệm vụ' });

  try {
    const newTask = new Task({
      userId,
      categoryId,
      title,
      link,
      points: Number(points) || 1,
      maxSlots: Number(maxSlots) || 10
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.put('/api/admin/tasks/:id', async (req, res) => {
  const { password, userId: requestingUserId, userId, categoryId, title, link, points, maxSlots } = req.body;

  const hasAccess = await checkAdminRights(password, requestingUserId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task không tồn tại' });

    if (userId) task.userId = userId;
    if (categoryId) task.categoryId = categoryId;
    if (title) task.title = title;
    if (link) task.link = link;
    if (points !== undefined) task.points = Number(points);
    if (maxSlots !== undefined) task.maxSlots = Number(maxSlots);

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.delete('/api/admin/tasks/:id', async (req, res) => {
  const { password, userId } = req.body;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task không tồn tại' });

    // Xóa các log liên quan
    await CrossLog.deleteMany({ taskId: req.params.id });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa task thành công' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== ADMIN RAW DATA VIEW ====================

app.get('/api/admin/raw-data', async (req, res) => {
  const { password, userId, model } = req.query;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    let rawData = {};

    if (!model || model === 'users') {
      const users = await User.find().lean();
      rawData.users = users;
    }

    if (!model || model === 'categories') {
      const categories = await Category.find().lean();
      rawData.categories = categories;
    }

    if (!model || model === 'tasks') {
      const tasks = await Task.find().lean();
      rawData.tasks = tasks;
    }

    if (!model || model === 'logs') {
      const logs = await CrossLog.find().lean();
      rawData.logs = logs;
    }

    if (model && model !== 'users' && model !== 'categories' && model !== 'tasks' && model !== 'logs') {
      return res.status(400).json({ error: 'Model không hợp lệ. Chọn: users, categories, tasks, logs' });
    }

    res.json(rawData);
  } catch (error) {
    console.error('Error fetching raw data:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.put('/api/admin/raw-data', async (req, res) => {
  const { password, userId, model, documentId, data } = req.body;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  if (!model || !documentId || !data) {
    return res.status(400).json({ error: 'Thiếu thông tin model, documentId hoặc data' });
  }

  try {
    let Model;
    switch (model) {
      case 'users':
        Model = User;
        break;
      case 'categories':
        Model = Category;
        break;
      case 'tasks':
        Model = Task;
        break;
      case 'logs':
        Model = CrossLog;
        break;
      default:
        return res.status(400).json({ error: 'Model không hợp lệ' });
    }

    const document = await Model.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document không tồn tại' });
    }

    // Update document with new data
    Object.assign(document, data);
    await document.save();

    res.json({ message: 'Đã cập nhật document thành công', document });
  } catch (error) {
    console.error('Error updating raw data:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
});

// ==================== ADMIN SCHEMA VIEW ====================

app.get('/api/admin/schema', async (req, res) => {
  const { password, userId } = req.query;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    const schemas = {
      User: {
        fields: User.schema.paths,
        virtuals: User.schema.virtuals,
        methods: Object.getOwnPropertyNames(User.schema.methods).filter(m => typeof User.schema.methods[m] === 'function'),
        statics: Object.getOwnPropertyNames(User.schema.statics).filter(s => typeof User.schema.statics[s] === 'function')
      },
      Category: {
        fields: Category.schema.paths,
        virtuals: Category.schema.virtuals
      },
      Task: {
        fields: Task.schema.paths,
        virtuals: Task.schema.virtuals
      },
      CrossLog: {
        fields: CrossLog.schema.paths,
        virtuals: CrossLog.schema.virtuals
      }
    };

    // Format schema paths for better readability
    const formattedSchemas = {};
    for (const [modelName, schemaData] of Object.entries(schemas)) {
      formattedSchemas[modelName] = {
        fields: {},
        virtuals: {},
        methods: schemaData.methods || [],
        statics: schemaData.statics || []
      };

      for (const [fieldName, fieldInfo] of Object.entries(schemaData.fields)) {
        let enumValues = undefined;
        if (fieldInfo.enumValues && Array.isArray(fieldInfo.enumValues)) {
          enumValues = fieldInfo.enumValues
            .filter(v => v !== null && v !== undefined)
            .map(v => (v && typeof v === 'object' && v.value !== undefined) ? v.value : v);
        }

        formattedSchemas[modelName].fields[fieldName] = {
          type: fieldInfo.instance,
          required: fieldInfo.isRequired,
          default: fieldInfo.defaultValue,
          unique: fieldInfo.isUnique,
          enum: enumValues
        };
      }

      for (const [virtualName, virtualInfo] of Object.entries(schemaData.virtuals)) {
        formattedSchemas[modelName].virtuals[virtualName] = {
          path: virtualInfo.path,
          getters: Object.keys(virtualInfo.getters),
          setters: Object.keys(virtualInfo.setters)
        };
      }
    }

    res.json(formattedSchemas);
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== ADMIN LOGS MANAGEMENT ====================

app.get('/api/admin/logs', async (req, res) => {
  const { password, userId } = req.query;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    const logs = await CrossLog.find()
      .populate('taskId')
      .populate('doneByUserId');

    const enrichedLogs = logs.map(log => ({
      ...log.toObject(),
      userName: log.doneByUserId?.fullName || 'Unknown',
      taskTitle: log.taskId?.title || 'Unknown'
    }));

    res.json(enrichedLogs);
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.delete('/api/admin/logs', async (req, res) => {
  const { password, userId } = req.body;

  const hasAccess = await checkAdminRights(password, userId);
  if (!hasAccess) {
    return res.status(401).json({ error: 'Sai mật khẩu admin hoặc không có quyền admin' });
  }

  try {
    await CrossLog.deleteMany({});
    res.json({ message: 'Đã xóa tất cả logs thành công' });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== ADMIN ROUTES ====================

app.get('/admin/:password', (req, res) => {
  const { password } = req.params;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).send('Sai mật khẩu admin');
  }

  // Serve admin page (admin page được render từ frontend)
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/admin', (req, res) => {
  // Serve admin page login form
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// ==================== COMMUNITY CHAT ====================

// API để lấy tin nhắn chat cộng đồng
app.get('/api/chat', async (req, res) => {
  try {
    const chats = await CommunityChat.find().sort({ createdAt: -1 }).limit(50);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API để gửi tin nhắn chat cộng đồng
app.post('/api/chat', async (req, res) => {
  const { userId, userName, message } = req.body;
  
  if (!userId || !userName || !message) {
    return res.status(400).json({ error: 'Thiếu thông tin tin nhắn' });
  }

  try {
    const newChat = new CommunityChat({
      userId,
      userName,
      message,
      autoDeleteAt: new Date(Date.now() + 60 * 60 * 1000) // 1 tiếng sau
    });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error sending chat:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API để xóa tin nhắn
app.delete('/api/chat/:id', async (req, res) => {
  try {
    await CommunityChat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== PRIORITY TASK SYSTEM ====================

// API để làm task thành priority
app.post('/api/tasks/:id/priority', async (req, res) => {
  const { userId, priorityLevel } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'Thiếu userId' });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task không tồn tại' });
    if (task.userId !== userId) return res.status(403).json({ error: 'Bạn không phải chủ task' });

    const user = await User.findOne({ customId: userId });
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    // Chi phí priority
    const costs = { 1: 30, 2: 50 }; // Level 1: 30 điểm, Level 2: 50 điểm
    const cost = costs[priorityLevel] || 30;

    if (user.currentPoints < cost) {
      return res.status(400).json({ error: `Bạn cần ${cost} điểm để làm priority` });
    }

    // Trừ điểm
    user.currentPoints -= cost;
    await user.save();

    // Update task
    task.isPriority = true;
    task.priorityLevel = priorityLevel || 1;
    task.priorityCost = cost;
    task.priorityExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Error making task priority:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== AUTO DELETE TASKS ====================

// Hàm xóa các nhiệm vụ đã hết hạn
async function deleteExpiredTasks() {
  try {
    const now = new Date();
    
    // Xóa các nhiệm vụ có autoDeleteAt < now
    const deletedTasks = await Task.deleteMany({
      autoDeleteAt: { $lt: now }
    });
    
    if (deletedTasks.deletedCount > 0) {
      console.log(`Đã xóa ${deletedTasks.deletedCount} nhiệm vụ hết hạn vào ${now.toLocaleString('vi-VN')}`);
      
      // Xóa các logs liên quan
      await CrossLog.deleteMany({
        taskId: { $in: deletedTasks.deletedIds }
      });
    }
  } catch (error) {
    console.error('Lỗi khi xóa nhiệm vụ hết hạn:', error);
  }
}

// Cron job chạy vào 0:00 giờ Việt Nam mỗi ngày để xóa các nhiệm vụ daily
// 0:00 UTC = 7:00 Vietnam time, nên cron chạy vào 0:00 UTC (7:00 VN)
cron.schedule('0 0 * * *', async () => {
  console.log('Chạy cron job xóa nhiệm vụ daily vào 0:00 giờ Việt Nam');
  
  try {
    // Xóa các nhiệm vụ có autoDeleteType = 'daily'
    const deletedTasks = await Task.deleteMany({
      autoDeleteType: 'daily'
    });
    
    if (deletedTasks.deletedCount > 0) {
      console.log(`Đã xóa ${deletedTasks.deletedCount} nhiệm vụ daily vào ${new Date().toLocaleString('vi-VN')}`);
      
      // Xóa các logs liên quan
      const taskIds = (await Task.find({ autoDeleteType: 'daily' })).map(t => t._id);
      await CrossLog.deleteMany({ taskId: { $in: taskIds } });
    }
  } catch (error) {
    console.error('Lỗi khi xóa nhiệm vụ daily:', error);
  }
}, {
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm kiểm tra và xóa các nhiệm vụ 24h mỗi 5 phút
async function checkAndDelete24hTasks() {
  try {
    const now = new Date();
    
    // Xóa các nhiệm vụ có autoDeleteType = '24h' và autoDeleteAt < now
    const deletedTasks = await Task.deleteMany({
      autoDeleteType: '24h',
      autoDeleteAt: { $lt: now }
    });
    
    if (deletedTasks.deletedCount > 0) {
      console.log(`Đã xóa ${deletedTasks.deletedCount} nhiệm vụ 24h hết hạn vào ${now.toLocaleString('vi-VN')}`);
    }
  } catch (error) {
    console.error('Lỗi khi xóa nhiệm vụ 24h:', error);
  }
}

// Chạy kiểm tra nhiệm vụ 24h mỗi 5 phút
cron.schedule('*/5 * * * *', checkAndDelete24hTasks, {
  timezone: 'Asia/Ho_Chi_Minh'
});

// Chạy kiểm tra xóa tin nhắn chat sau 1 tiếng mỗi 5 phút
async function deleteExpiredChats() {
  try {
    const now = new Date();
    const deletedChats = await CommunityChat.deleteMany({
      autoDeleteAt: { $lt: now }
    });
    
    if (deletedChats.deletedCount > 0) {
      console.log(`Đã xóa ${deletedChats.deletedCount} tin nhắn chat hết hạn vào ${now.toLocaleString('vi-VN')}`);
    }
  } catch (error) {
    console.error('Lỗi khi xóa tin nhắn chat hết hạn:', error);
  }
}

cron.schedule('*/5 * * * *', deleteExpiredChats, {
  timezone: 'Asia/Ho_Chi_Minh'
});

// Chạy kiểm tra priority task expiry mỗi 5 phút
async function checkPriorityExpiry() {
  try {
    const now = new Date();
    const expiredTasks = await Task.find({
      isPriority: true,
      priorityExpiresAt: { $lt: now }
    });
    
    for (const task of expiredTasks) {
      task.isPriority = false;
      task.priorityLevel = 0;
      task.priorityCost = 0;
      task.priorityExpiresAt = null;
      await task.save();
    }
    
    if (expiredTasks.length > 0) {
      console.log(`Đã xóa priority cho ${expiredTasks.length} task hết hạn vào ${now.toLocaleString('vi-VN')}`);
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra priority expiry:', error);
  }
}

cron.schedule('*/5 * * * *', checkPriorityExpiry, {
  timezone: 'Asia/Ho_Chi_Minh'
});

// Chạy kiểm tra ngay khi server khởi động
setTimeout(() => {
  deleteExpiredTasks();
  checkAndDelete24hTasks();
  deleteExpiredChats();
  checkPriorityExpiry();
}, 5000); // Chờ 5 giây để MongoDB kết nối xong

// ==================== SEED DATA ====================

async function seedData() {
  try {
    // Check if data already exists
    const existingCategories = await Category.countDocuments();
    const existingUsers = await User.countDocuments();
    if (existingCategories > 0 && existingUsers > 0) {
      console.log('Dữ liệu đã tồn tại, bỏ qua seeding');
      return;
    }

    console.log('Đang tạo dữ liệu mẫu...');

    // Create default categories
    const categories = [
      { name: 'Chéo sự kiện Shopee', description: 'Like, comment, share sản phẩm Shopee', icon: '🛒', color: '#EE4D2D' },
      { name: 'Chém giá TikTok', description: 'Thả tim, comment, share video TikTok', icon: '🎵', color: '#FF0050' },
      { name: 'Chéo Facebook', description: 'Like, comment, share bài viết Facebook', icon: '📘', color: '#1877F2' },
      { name: 'Chéo YouTube', description: 'View, like, subscribe kênh YouTube', icon: '▶️', color: '#FF0000' }
    ];

    for (const cat of categories) {
      await Category.create(cat);
    }

    const savedCategories = await Category.find();
    const shopeeCat = savedCategories.find(c => c.name.includes('Shopee'));
    const tiktokCat = savedCategories.find(c => c.name.includes('TikTok'));
    const fbCat = savedCategories.find(c => c.name.includes('Facebook'));
    const ytCat = savedCategories.find(c => c.name.includes('YouTube'));

    // Create default users
    const users = [
      { 
        customId: '#1024', 
        fullName: 'Nguyễn Văn Anh Tuấn', 
        phone: '0987654321', 
        initialPoints: 10, 
        currentPoints: 10, 
        tiktokDailyCount: 0,
        xp: 50,
        level: 1,
        totalTasksCompleted: 5,
        badges: [],
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        categoryStats: { tiktok: 5, facebook: 0, shopee: 0, youtube: 0 },
        createdAt: new Date()
      },
      { 
        customId: '#1025', 
        fullName: 'Trần Thị Thu Hà', 
        phone: '0912345678', 
        initialPoints: 10, 
        currentPoints: 10, 
        tiktokDailyCount: 0,
        xp: 200,
        level: 2,
        totalTasksCompleted: 20,
        badges: [
          { type: 'task', name: 'TikTok Beginner', icon: '🎵', description: 'Hoàn thành 5 task TikTok', category: 'tiktok', earnedAt: new Date() },
          { type: 'task', name: 'Facebook Starter', icon: '📘', description: 'Hoàn thành 5 task Facebook', category: 'facebook', earnedAt: new Date() }
        ],
        currentStreak: 3,
        longestStreak: 3,
        lastCompletedDate: new Date(),
        categoryStats: { tiktok: 10, facebook: 10, shopee: 0, youtube: 0 },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      { 
        customId: '#1026', 
        fullName: 'Lê Hoàng Minh', 
        phone: '0901112233', 
        initialPoints: 10, 
        currentPoints: 10, 
        tiktokDailyCount: 0,
        xp: 1000,
        level: 4,
        totalTasksCompleted: 100,
        badges: [
          { type: 'task', name: 'TikTok Expert', icon: '🎵', description: 'Hoàn thành 50 task TikTok', category: 'tiktok', earnedAt: new Date() },
          { type: 'task', name: 'Facebook Pro', icon: '📘', description: 'Hoàn thành 20 task Facebook', category: 'facebook', earnedAt: new Date() },
          { type: 'streak', name: 'Hot Streak 7', icon: '🔥', description: '7 ngày liên tục hoàn thành task', earnedAt: new Date() },
          { type: 'time', name: 'Regular', icon: '⭐', description: 'Thành viên 1 tháng', earnedAt: new Date() }
        ],
        currentStreak: 7,
        longestStreak: 7,
        lastCompletedDate: new Date(),
        categoryStats: { tiktok: 50, facebook: 30, shopee: 20, youtube: 0 },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
      }
    ];

    for (const user of users) {
      await User.create(user);
    }

    const savedUsers = await User.find();

    // Create default tasks
    const tasks = [
      { 
        userId: '#1024', 
        categoryId: fbCat._id, 
        title: 'Tương tác bài viết Facebook mới', 
        link: 'https://facebook.com/post/1', 
        points: 1, 
        maxSlots: 10,
        autoDeleteType: 'daily',
        autoDeleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Ngày mai 0:00
        hidden: false
      },
      { 
        userId: '#1024', 
        categoryId: ytCat._id, 
        title: 'Sub kênh YouTube cá nhân', 
        link: 'https://youtube.com/c/example', 
        points: 1, 
        maxSlots: 10,
        autoDeleteType: 'daily',
        autoDeleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        hidden: false
      },
      { 
        userId: '#1025', 
        categoryId: shopeeCat._id, 
        title: 'Like & Comment bài Shopee', 
        link: 'https://shopee.vn/product/1', 
        points: 1, 
        maxSlots: 10,
        autoDeleteType: 'daily',
        autoDeleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        hidden: false
      },
      { 
        userId: '#1026', 
        categoryId: tiktokCat._id, 
        title: 'Thả tim TikTok video mới', 
        link: 'https://tiktok.com/@example/video/1', 
        points: 1, 
        maxSlots: 10,
        autoDeleteType: '24h',
        autoDeleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h từ giờ tạo
        hidden: false
      }
    ];

    for (const task of tasks) {
      await Task.create(task);
    }

    // Create a sample log
    const task = await Task.findOne({ title: 'Like & Comment bài Shopee' });
    const user = await User.findOne({ customId: '#1024' });
    if (task && user) {
      await CrossLog.create({
        taskId: task._id,
        doneByUserId: user._id
      });
    }

    console.log('Đã tạo dữ liệu mẫu thành công!');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
  }
}

// Seed data on startup
seedData();

// Serve frontend static build
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
