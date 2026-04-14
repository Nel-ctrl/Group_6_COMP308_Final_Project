const { mongoose } = require('../../../shared/db');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    organizerId: {
      type: String, // References User.id from auth-service
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: Date,
    location: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    maxAttendees: Number,
    attendees: [
      {
        userId: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    volunteers: [
      {
        userId: String,
        role: String,
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    // AI-suggested optimal time (stored after AI analysis)
    aiSuggestedTime: String,
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
