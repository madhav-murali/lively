import mongoose from 'mongoose';

const pingResultSchema = new mongoose.Schema({
  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monitor',
    required: true,
    index: true,
  },
  statusCode: {
    type: Number,
    default: null,
  },
  responseTime: {
    type: Number, // milliseconds
    required: true,
  },
  isUp: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
  checkedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient queries: "get results for monitor X, sorted by time"
pingResultSchema.index({ monitorId: 1, checkedAt: -1 });

// TTL index: auto-delete results older than 30 days
pingResultSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const PingResult = mongoose.model('PingResult', pingResultSchema);
export default PingResult;
