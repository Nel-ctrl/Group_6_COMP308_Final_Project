const { mongoose } = require('../../../shared/db');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['news', 'discussion', 'help_request', 'emergency_alert'],
      required: true,
    },
    authorId: {
      type: String, // References User.id from auth-service
      required: true,
    },
    // AI-generated fields
    aiSummary: {
      type: String,
      default: '',
    },
    aiSentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', ''],
      default: '',
    },
    tags: [String],
    status: {
      type: String,
      enum: ['open', 'resolved', 'closed'],
      default: 'open',
    },
    // For help requests
    isUrgent: {
      type: Boolean,
      default: false,
    },
    replies: [
      {
        authorId: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient queries
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ authorId: 1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
