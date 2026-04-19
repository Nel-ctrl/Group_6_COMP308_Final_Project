const axios = require('axios');
const { PubSub } = require('graphql-subscriptions');
const Post = require('../models/Post');

const pubsub = new PubSub();
const EMERGENCY_ALERT_CREATED = 'EMERGENCY_ALERT_CREATED';

const AI_SERVICE_URL = `http://localhost:${process.env.AI_SERVICE_PORT || 4004}`;

const TRENDS_TTL_MS = 60 * 60 * 1000; // 1 hour
let trendsCache = { data: null, expiresAt: 0 };

const resolvers = {
  Query: {
    getPosts: async (_, { category, limit = 20, offset = 0 }) => {
      const filter = category ? { category } : {};
      return Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },

    getPost: async (_, { id }) => {
      return Post.findById(id);
    },

    getPostsByAuthor: async (_, { authorId }) => {
      return Post.find({ authorId }).sort({ createdAt: -1 });
    },

    getHelpRequests: async (_, { status }) => {
      const filter = { category: 'help_request' };
      if (status) filter.status = status;
      return Post.find(filter).sort({ isUrgent: -1, createdAt: -1 });
    },

    getEmergencyAlerts: async () => {
      return Post.find({ category: 'emergency_alert' }).sort({ createdAt: -1 });
    },

    getTrendingTopics: async () => {
      if (trendsCache.data && Date.now() < trendsCache.expiresAt) {
        return trendsCache.data;
      }

      try {
        const recentPosts = await Post.find()
          .sort({ createdAt: -1 })
          .limit(100)
          .select('title content tags');

        if (recentPosts.length === 0) {
          trendsCache = { data: [], expiresAt: Date.now() + TRENDS_TTL_MS };
          return [];
        }

        const response = await axios.post(`${AI_SERVICE_URL}/api/trends`, {
          posts: recentPosts.map((p) => ({
            title: p.title,
            content: p.content,
            tags: p.tags,
          })),
        });

        trendsCache = { data: response.data.trends, expiresAt: Date.now() + TRENDS_TTL_MS };
        return response.data.trends;
      } catch (error) {
        console.error('AI trend detection failed:', error.message);
        return trendsCache.data || [];
      }
    },
  },

  Mutation: {
    createPost: async (_, { title, content, category, tags, isUrgent }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      if (category === 'emergency_alert' && !['resident', 'community_organizer'].includes(user.role)) {
        throw new Error('Only residents and organizers can post emergency alerts');
      }

      const post = await Post.create({
        title,
        content,
        category,
        tags: tags || [],
        isUrgent: isUrgent || false,
        authorId: user.id,
      });

      if (category === 'emergency_alert') {
        console.log('[PubSub] Publishing emergency alert:', post.title);
        pubsub.publish(EMERGENCY_ALERT_CREATED, { emergencyAlertCreated: post });
      }

      // Asynchronously analyze sentiment (don't block the response)
      axios
        .post(`${AI_SERVICE_URL}/api/sentiment`, { text: content })
        .then((res) => {
          Post.findByIdAndUpdate(post.id, { aiSentiment: res.data.sentiment }).catch(() => {});
        })
        .catch(() => {});

      return post;
    },

    updatePost: async (_, { id, ...updates }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.authorId !== user.id) throw new Error('Not authorized');

      return Post.findByIdAndUpdate(id, updates, { new: true });
    },

    deletePost: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.authorId !== user.id) throw new Error('Not authorized');

      await Post.findByIdAndDelete(id);
      return true;
    },

    addReply: async (_, { postId, content }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return Post.findByIdAndUpdate(
        postId,
        { $push: { replies: { authorId: user.id, content } } },
        { new: true }
      );
    },

    summarizePost: async (_, { postId }) => {
      const post = await Post.findById(postId);
      if (!post) throw new Error('Post not found');

      // Build the full text: post content + all replies
      const fullText = [
        post.content,
        ...post.replies.map((r) => r.content),
      ].join('\n\n');

      try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/summarize`, {
          text: fullText,
        });

        post.aiSummary = response.data.summary;
        await post.save();
      } catch (error) {
        console.error('AI summarization failed:', error.message);
      }

      return post;
    },
  },

  Subscription: {
    emergencyAlertCreated: {
      subscribe: () => pubsub.asyncIterableIterator(EMERGENCY_ALERT_CREATED),
    },
  },

  // Federation: resolve the author field using the User reference
  Post: {
    author: (post) => ({ __typename: 'User', id: post.authorId }),

    __resolveReference: async (ref) => {
      return Post.findById(ref.id);
    },
  },
};

module.exports = resolvers;
