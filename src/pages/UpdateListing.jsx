import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { id } = useParams(); // use the correct param name
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

  // Fetch the listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/listing/get/${id}`);
        const data = await res.json();

        if (res.status === 404) {
          setError("Listing not found");
          return;
        }

        setFormData(data);
      } catch (err) {
        setError("Failed to fetch listing");
      }
    };
    fetchListing();
  }, [id]);

  // Cloudinary setup
  const CLOUD_NAME = "dc0yee8iu";
  const UPLOAD_PRESET = "profile_upload";

  const storeImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) return data.secure_url;
    throw new Error("Upload failed");
  };

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 15) {
      setUploading(true);
      setImageUploadError(false);
      try {
        const urls = await Promise.all(files.map((file) => storeImage(file)));
        setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
        setUploading(false);
      } catch {
        setImageUploadError("Image upload failed (max 2MB per image)");
        setUploading(false);
      }
    } else {
      setImageUploadError("You can only upload 15 images per listing");
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({ ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== index) });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageUrls.length < 1) return setError("You must upload at least one image");
    if (+formData.regularPrice < +formData.discountPrice) return setError("Discount price must be lower than regular price");

    setLoading(true);
    setError(false);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/listing/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`, // Add token here
        },
        body: JSON.stringify(formData), // Remove userRef
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) return setError(data.message || "Update failed");

      navigate(`/listing/${data._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center py-7">Update a Listing</h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            id="name"
            maxLength="60"
            minLength="10"
            required
            className="border p-3 rounded-lg"
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            placeholder="Description"
            id="description"
            required
            className="border p-3 rounded-lg"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="Address"
            id="address"
            required
            className="border p-3 rounded-lg"
            value={formData.address}
            onChange={handleChange}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" onChange={handleChange} checked={formData.type === "sale"} />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" onChange={handleChange} checked={formData.type === "rent"} />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" onChange={handleChange} checked={formData.parking} />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" onChange={handleChange} checked={formData.furnished} />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" onChange={handleChange} checked={formData.offer} />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input type="number" id="bedrooms" min="1" max="10" required value={formData.bedrooms} onChange={handleChange} />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" id="bathrooms" min="1" max="10" required value={formData.bathrooms} onChange={handleChange} />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" id="regularPrice" min="50" max="10000000" required value={formData.regularPrice} onChange={handleChange} />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs">($ /month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input type="number" id="discountPrice" min="0" max="10000000" required value={formData.discountPrice} onChange={handleChange} />
                <div className="flex flex-col items-center">
                  <p>Discounted Price</p>
                  <span className="text-xs">($ /month)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images: <span className="font-normal text-gray-600 ml-2">The first image will be cover (max 15)</span>
          </p>
          <div className="flex gap-4">
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              className="p-3 border border-gray-300 w-full"
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
            <button type="button" onClick={handleImageSubmit} disabled={uploading} className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {imageUploadError && <p className="text-red-700 text-sm">{imageUploadError}</p>}

          {formData.imageUrls.map((url, index) => (
            <div key={url} className="flex justify-between border items-center">
              <img src={url} alt="listing" className="w-20 h-20 object-contain rounded-lg" />
              <button type="button" onClick={() => handleRemoveImage(index)} className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75">
                Delete
              </button>
            </div>
          ))}

          <button disabled={loading || uploading} className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? "Updating..." : "Update listing"}
          </button>

          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
