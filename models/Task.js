const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
  points: { type: Number, default: 1 },
  maxSlots: { type: Number, default: 10 },
  autoDeleteAt: { type: Date, default: null }, // Thời gian tự động xóa
  autoDeleteType: { type: String, enum: ['daily', '24h', null], default: null }, // Loại auto-delete
  hidden: { type: Boolean, default: false }, // Tự động ẩn khi đủ lượt
  // Co-op Task Fields
  isCoop: { type: Boolean, default: false }, // Task có phải co-op không
  requiredParticipants: { type: Number, default: 2 }, // Số người cần tham gia
  participants: [{ type: String }], // Danh sách userId đã tham gia
  coopStatus: { type: String, enum: ['pending', 'matched', 'completed'], default: 'pending' } // Trạng thái co-op
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to ensure id is always available
taskSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Virtual để kiểm tra task đã đầy đủ participants chưa
taskSchema.virtual('isFullCoop').get(function() {
  return this.isCoop && this.participants.length >= this.requiredParticipants;
});

module.exports = mongoose.model('Task', taskSchema);