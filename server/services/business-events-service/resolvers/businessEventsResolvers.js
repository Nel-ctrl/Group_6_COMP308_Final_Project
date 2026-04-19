const axios = require('axios');
const Business = require('../models/Business');
const Event = require('../models/Event');

const AI_SERVICE_URL = `http://localhost:${process.env.AI_SERVICE_PORT || 4004}`;

const resolvers = {
  Query: {
    // ─── Business Queries ───

    getBusinesses: async (_, { category }) => {
      const filter = category ? { category } : {};
      return Business.find(filter).sort({ averageRating: -1 });
    },

    getBusiness: async (_, { id }) => {
      return Business.findById(id);
    },

    getBusinessesByOwner: async (_, { ownerId }) => {
      return Business.find({ ownerId });
    },

    // ─── Event Queries ───

    getEvents: async (_, { status, category }) => {
      const filter = {};
      if (status) filter.status = status;
      if (category) filter.category = category;
      return Event.find(filter).sort({ date: 1 });
    },

    getEvent: async (_, { id }) => {
      return Event.findById(id);
    },

    getEventsByOrganizer: async (_, { organizerId }) => {
      return Event.find({ organizerId }).sort({ date: -1 });
    },

    getVolunteerMatches: async (_, { eventId }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      const event = await Event.findById(eventId);
      if (!event) throw new Error('Event not found');

      try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/match-volunteers`, {
          event: {
            title: event.title,
            description: event.description,
            category: event.category,
            location: event.location,
          },
        });
        return response.data.matches;
      } catch (error) {
        console.error('AI volunteer matching failed:', error.message);
        return [];
      }
    },

    getOptimalEventTime: async (_, { category, location }) => {
      try {
        const recentEvents = await Event.find({ category })
          .sort({ date: -1 })
          .limit(50)
          .select('date attendees category');

        const response = await axios.post(`${AI_SERVICE_URL}/api/optimize-event-time`, {
          category,
          location,
          pastEvents: recentEvents.map((e) => ({
            date: e.date,
            attendeeCount: e.attendees.length,
          })),
        });

        return response.data.suggestedTime;
      } catch (error) {
        console.error('AI event optimization failed:', error.message);
        return 'Unable to determine optimal time';
      }
    },
  },

  Mutation: {
    // ─── Business Mutations ───

    createBusiness: async (_, args, { user }) => {
      if (!user) throw new Error('Not authenticated');
      if (user.role !== 'business_owner') {
        throw new Error('Only business owners can create listings');
      }
      return Business.create({ ...args, ownerId: user.id });
    },

    updateBusiness: async (_, { id, ...updates }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const business = await Business.findById(id);
      if (!business) throw new Error('Business not found');
      if (business.ownerId !== user.id) throw new Error('Not authorized');

      return Business.findByIdAndUpdate(id, updates, { new: true });
    },

    deleteBusiness: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const business = await Business.findById(id);
      if (!business) throw new Error('Business not found');
      if (business.ownerId !== user.id) throw new Error('Not authorized');

      await Business.findByIdAndDelete(id);
      return true;
    },

    addDeal: async (_, { businessId, title, description, validUntil }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const business = await Business.findById(businessId);
      if (!business) throw new Error('Business not found');
      if (business.ownerId !== user.id) throw new Error('Not authorized');

      business.deals.push({ title, description, validUntil });
      return business.save();
    },

    addBusinessImage: async (_, { businessId, image }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      if (!image?.trim()) throw new Error('Image is required');

      const business = await Business.findById(businessId);
      if (!business) throw new Error('Business not found');

      if (business.ownerId !== user.id) {
        throw new Error('Not authorized');
      }

      if (business.images.includes(image)) {
        throw new Error('This image has already been uploaded.');
      }

      business.images.push(image);
      return business.save();
    },

    addReview: async (_, { businessId, rating, comment }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const business = await Business.findById(businessId);
      if (!business) throw new Error('Business not found');

      const review = { authorId: user.id, rating, comment };

      // Get AI sentiment analysis
      try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/sentiment`, {
          text: comment,
        });
        review.sentiment = response.data.sentiment;
      } catch (error) {
        console.error('AI sentiment analysis failed:', error.message);
      }

      business.reviews.push(review);

      // Recalculate average rating
      const totalRating = business.reviews.reduce((sum, r) => sum + r.rating, 0);
      business.averageRating = totalRating / business.reviews.length;

      return business.save();
    },

    replyToReview: async (_, { businessId, reviewIndex, reply }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const business = await Business.findById(businessId);
      if (!business) throw new Error('Business not found');
      if (business.ownerId !== user.id) throw new Error('Only the owner can reply');

      if (reviewIndex < 0 || reviewIndex >= business.reviews.length) {
        throw new Error('Invalid review index');
      }

      business.reviews[reviewIndex].ownerReply = reply;
      return business.save();
    },

    // ─── Event Mutations ───

    createEvent: async (_, args, { user }) => {
      if (!user) throw new Error('Not authenticated');
      if (user.role !== 'community_organizer') {
        throw new Error('Only community organizers can create events');
      }
      return Event.create({ ...args, organizerId: user.id });
    },

    updateEvent: async (_, { id, ...updates }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const event = await Event.findById(id);
      if (!event) throw new Error('Event not found');
      if (event.organizerId !== user.id) throw new Error('Not authorized');

      return Event.findByIdAndUpdate(id, updates, { new: true });
    },

    deleteEvent: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const event = await Event.findById(id);
      if (!event) throw new Error('Event not found');
      if (event.organizerId !== user.id) throw new Error('Not authorized');

      await Event.findByIdAndDelete(id);
      return true;
    },

    joinEvent: async (_, { eventId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Event not found');

      // Check if already joined
      const alreadyJoined = event.attendees.some((a) => a.userId === user.id);
      if (alreadyJoined) throw new Error('Already joined this event');

      // Check capacity
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        throw new Error('Event is at full capacity');
      }

      event.attendees.push({ userId: user.id });
      return event.save();
    },

    volunteerForEvent: async (_, { eventId, role }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Event not found');

      const alreadyVolunteering = event.volunteers.some((v) => v.userId === user.id);
      if (alreadyVolunteering) throw new Error('Already volunteering for this event');

      event.volunteers.push({ userId: user.id, role: role || 'general' });
      return event.save();
    },
  },

  // Federation resolvers
  Business: {
    owner: (business) => ({ __typename: 'User', id: business.ownerId }),
    __resolveReference: async (ref) => Business.findById(ref.id),
  },

  Event: {
    organizer: (event) => ({ __typename: 'User', id: event.organizerId }),
    __resolveReference: async (ref) => Event.findById(ref.id),
  },
};

module.exports = resolvers;
