const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '📌' },
  color: { type: String, default: '#6366f1' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to ensure id is always available
categorySchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('Category', categorySchema);