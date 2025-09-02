import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const listingId = params.listingId;

  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const CLOUD_NAME = "dc0yee8iu";
  const UPLOAD_PRESET = "profile_upload";

  // Fetch listing on component mount
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return console.error("Listing ID is missing");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/listing/get/${listingId}`
        );
        const data = await res.json();
        if (!data) return console.error("Listing not found");
        setFormData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchListing();
  }, [listingId]);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "sale" || id === "rent") {
      setFormData({ ...formData, type: id });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [id]: checked });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  // Upload images to Cloudinary
  const storeImage = async (file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );
    const data = await res.json();
    if (data.secure_url) return data.secure_url;
    throw new Error("Upload failed");
  };

  const handleImageSubmit = async () => {
    if (files.length === 0) return;
    if (files.length + formData.imageUrls.length > 15) {
      setImageUploadError("You can only upload 15 images per listing");
      return;
    }

    setUploading(true);
    setImageUploadError(false);

    try {
      const urls = await Promise.all(files.map((file) => storeImage(file)));
      setFormData({ ...formData, imageUrls: [...formData.imageUrls, ...urls] });
      setFiles([]);
      setUploading(false);
    } catch (err) {
      console.error(err);
      setImageUploadError("Image upload failed (max 2MB per image)");
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  // Submit updated listing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.imageUrls.length < 1)
      return setError("You must upload at least one image");
    if (+formData.discountPrice > +formData.regularPrice)
      return setError("Discount price must be lower than regular price");

    setLoading(true);
    setError(false);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/listing/update/${listingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ ...formData, userRef: currentUser._id }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (data.success === false) return setError(data.message);

      navigate(`/listing/${data._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center py-7">
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          {/* Name */}
          <input
            type="text"
            placeholder="Name"
            id="name"
            maxLength={60}
            minLength={10}
            required
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.name}
          />
          {/* Description */}
          <textarea
            placeholder="Description"
            id="description"
            required
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.description}
          />
          {/* Address */}
          <input
            type="text"
            placeholder="Address"
            id="address"
            required
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.address}
          />

          {/* Checkboxes */}
          <div className="flex gap-6 flex-wrap">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="sale"
                checked={formData.type === "sale"}
                onChange={handleChange}
              />
              Sell
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="rent"
                checked={formData.type === "rent"}
                onChange={handleChange}
              />
              Rent
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="parking"
                checked={formData.parking}
                onChange={handleChange}
              />
              Parking
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="furnished"
                checked={formData.furnished}
                onChange={handleChange}
              />
              Furnished
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                id="offer"
                checked={formData.offer}
                onChange={handleChange}
              />
              Offer
            </label>
          </div>

          {/* Number inputs */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min={1}
                max={10}
                required
                className="p-3 border rounded-lg"
                value={formData.bedrooms}
                onChange={handleChange}
              />
              Beds
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min={1}
                max={10}
                required
                className="p-3 border rounded-lg"
                value={formData.bathrooms}
                onChange={handleChange}
              />
              Baths
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min={50}
                max={10000000}
                required
                className="p-3 border rounded-lg"
                value={formData.regularPrice}
                onChange={handleChange}
              />
              <div className="flex flex-col items-center">
                Regular Price
                <span className="text-xs">($/month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min={0}
                  max={10000000}
                  required
                  className="p-3 border rounded-lg"
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
                <div className="flex flex-col items-center">
                  Discounted Price
                  <span className="text-xs">($/month)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images: <span className="font-normal text-gray-600 ml-2">First image will be cover (max 15)</span>
          </p>
          <div className="flex gap-4">
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              className="p-3 border w-full"
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={uploading}
              className="p-3 text-green-700 border rounded uppercase disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {imageUploadError && <p className="text-red-700 text-sm">{imageUploadError}</p>}

          {formData.imageUrls.map((url, index) => (
            <div key={index} className="flex justify-between border items-center p-2 rounded">
              <img src={url} alt="listing" className="w-20 h-20 object-contain rounded-lg" />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="p-2 text-red-700 rounded-lg uppercase hover:opacity-75"
              >
                Delete
              </button>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase disabled:opacity-80 hover:opacity-95"
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
