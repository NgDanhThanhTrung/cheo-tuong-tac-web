const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  initialPoints: { type: Number, default: 10 },
  currentPoints: { type: Number, default: 10 },
  tiktokDailyCount: { type: Number, default: 0 },
  lastTiktokDate: { type: Date, default: null },
  // Level & XP System
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  totalTasksCompleted: { type: Number, default: 0 },
  // Badges & Achievements
  badges: [{
    type: { type: String, enum: ['task', 'streak', 'time'] },
    name: { type: String },
    icon: { type: String },
    description: { type: String },
    earnedAt: { type: Date },
    category: { type: String } // Cho task badges
  }],
  // Streak System
  currentStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: Date },
  longestStreak: { type: Number, default: 0 },
  // Category Stats (cho task badges)
  categoryStats: {
    tiktok: { type: Number, default: 0 },
    facebook: { type: Number, default: 0 },
    shopee: { type: Number, default: 0 },
    youtube: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual để mapping customId thành id cho compatibility với frontend
userSchema.virtual('id').get(function() {
  return this.customId;
});

// Static method để tính level từ XP
userSchema.statics.calculateLevel = function(xp) {
  if (xp < 100) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Instance method để cập nhật level dựa trên XP
userSchema.methods.updateLevel = function() {
  this.level = this.constructor.calculateLevel(this.xp);
  return this.level;
};

// Instance method để thêm XP
userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  this.updateLevel();
  return this.xp;
};

// Instance method để thêm badge
userSchema.methods.addBadge = function(badge) {
  if (!this.badges) this.badges = [];
  
  // Kiểm tra đã có badge này chưa
  const existing = this.badges.find(b => b.type === badge.type && b.name === badge.name);
  if (!existing) {
    this.badges.push({
      ...badge,
      earnedAt: new Date()
    });
  }
  return this.badges;
};

// Instance method để cập nhật streak
userSchema.methods.updateStreak = function() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (this.lastCompletedDate === today) {
    // Đã hoàn thành hôm nay rồi, không tăng streak
    return this.currentStreak;
  }
  
  if (this.lastCompletedDate === yesterday) {
    // Hoàn thành ngày hôm qua, tăng streak
    this.currentStreak = (this.currentStreak || 0) + 1;
    if (this.currentStreak > (this.longestStreak || 0)) {
      this.longestStreak = this.currentStreak;
    }
  } else if (this.lastCompletedDate !== today) {
    // Reset streak
    this.currentStreak = 1;
  }
  
  this.lastCompletedDate = new Date();
  return this.currentStreak;
};

module.exports = mongoose.model('User', userSchema);