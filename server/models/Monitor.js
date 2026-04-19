import mongoose from 'mongoose';

const monitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Monitor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    validate: {
      validator: function (v) {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format',
    },
  },
  interval: {
    type: Number,
    default: 60,
    min: [10, 'Interval must be at least 10 seconds'],
    max: [3600, 'Interval cannot exceed 1 hour'],
  },
  expectedStatusCode: {
    type: Number,
    default: 200,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastStatus: {
    type: String,
    enum: ['up', 'down', 'pending'],
    default: 'pending',
  },
  lastResponseTime: {
    type: Number,
    default: null,
  },
  lastCheckedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

monitorSchema.index({ isActive: 1 });
monitorSchema.index({ url: 1 }, { unique: true });

const Monitor = mongoose.model('Monitor', monitorSchema);
export default Monitor;
