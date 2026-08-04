const mongoose = require('mongoose');

const crossLogSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, required: true },
  doneByUserId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to ensure id is always available
crossLogSchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('CrossLog', crossLogSchema);