const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

const resolvers = {
  Query: {
    // "me" returns the currently authenticated user
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return User.findById(user.id);
    },

    getUser: async (_, { id }) => {
      return User.findById(id);
    },

    getUsers: async () => {
      return User.find();
    },
  },

  Mutation: {
    register: async (_, { email, password, name, role, interests, location }) => {
      // Check if user already exists
      const existing = await User.findOne({ email });
      if (existing) throw new Error('Email already registered');

      const user = await User.create({
        email,
        password,
        name,
        role: role || 'resident',
        interests: interests || [],
        location: location || '',
      });

      const token = generateToken(user);
      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid email or password');

      const valid = await user.comparePassword(password);
      if (!valid) throw new Error('Invalid email or password');

      const token = generateToken(user);
      return { token, user };
    },

    updateProfile: async (_, args, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return User.findByIdAndUpdate(user.id, args, { new: true });
    },
  },

  // Federation resolver: allows other subgraphs to resolve User references
  User: {
    __resolveReference: async (ref) => {
      return User.findById(ref.id);
    },
  },
};

module.exports = resolvers;
