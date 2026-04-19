const { mongoose } = require('../../../shared/db');

const reviewSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', ''],
    default: '',
  },
  ownerReply: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String, // References User.id from auth-service
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: String,
    website: String,
    hours: String,
    images: {
      type: [String],
      default: [],
    },
    deals: [
      {
        title: { type: String, required: true },
        description: String,
        validUntil: Date,
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

businessSchema.index({ ownerId: 1 });
businessSchema.index({ category: 1 });
businessSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Business', businessSchema);
