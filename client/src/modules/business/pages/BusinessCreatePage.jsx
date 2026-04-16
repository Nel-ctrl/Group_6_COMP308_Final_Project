import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { CREATE_BUSINESS } from "../graphql/mutations";
import { GET_BUSINESSES } from "../graphql/queries";
import { useAuth } from "../../../shared/context/AuthContext";

export default function BusinessCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    address: "",
    phone: "",
    website: "",
    hours: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const [createBusiness, { loading }] = useMutation(CREATE_BUSINESS, {
    refetchQueries: [{ query: GET_BUSINESSES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      navigate("/businesses");
    },
    onError: (error) => {
      setErrorMessage(error.message || "Failed to create business.");
    },
  });

  if (user?.role !== "business_owner") {
    return <p className="p-6 text-red-500">Access denied</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.category || !formData.address) {
      return "Please fill all required fields.";
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      return "Website must start with http:// or https://";
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

    await createBusiness({
      variables: {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        phone: formData.phone || null,
        website: formData.website || null,
        hours: formData.hours || null,
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">List Your Business</h1>

      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Business Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description <span className="text-red-500">*</span></label>
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
          <label className="block mb-1 font-medium">Category <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Restaurant, Retail, Services"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Address <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. (514) 555-0100"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Website</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Hours</label>
          <input
            type="text"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Mon–Fri 9am–5pm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          {loading ? "Submitting..." : "List Business"}
        </button>
      </form>
    </div>
  );
}
