const mongoose = require('mongoose');

const communityChatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  autoDeleteAt: { type: Date, required: true } // Tự động xóa sau 1 tiếng
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to ensure id is always available
communityChatSchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('CommunityChat', communityChatSchema);
