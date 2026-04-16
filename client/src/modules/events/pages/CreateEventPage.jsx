import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { CREATE_EVENT } from "../graphql/mutations";
import { GET_EVENTS } from "../graphql/queries";
import { useAuth } from '../../../shared/context/AuthContext';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    category: "",
    maxAttendees: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const [createEvent, { loading }] = useMutation(CREATE_EVENT, {
    refetchQueries: [
      {
        query: GET_EVENTS,
        variables: { status: "upcoming", category: "" }
      }
    ],
    awaitRefetchQueries: true,

    onCompleted: () => {
      navigate("/events");
    },

    onError: (error) => {
      setErrorMessage(error.message || "Failed to create event.");
    },
  });

  if (user?.role !== "community_organizer") {
    return <p className="p-6 text-red-500">Access denied</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.location ||
      !formData.category
    ) {
      return "Please fill all required fields.";
    }

    const startDate = new Date(formData.date);
    const now = new Date();

    if (startDate <= now) {
      return "Event date must be in the future.";
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.date)) {
      return "End date must be after start date.";
    }

    if (formData.maxAttendees && Number(formData.maxAttendees) < 1) {
      return "Max attendees must be at least 1.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await createEvent({
        variables: {
          title: formData.title,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
          location: formData.location,
          category: formData.category,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        },
      });
    } catch (error) {}
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>

      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Start Date</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">End Date</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Max Attendees</label>
          <input
            type="number"
            name="maxAttendees"
            value={formData.maxAttendees}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min="1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}