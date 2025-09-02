import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  signInSuccess,
  updateUserStart,
  updateUserFailure,
  updateUserSuccess,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { Link } from "react-router-dom";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, token, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [updateSucces, setUpdateSuccess] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
    avatar: currentUser?.avatar || "",
  });

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", UPLOAD_PRESET);
    setFilePerc(0);
    setFileUploadError(false);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setFilePerc(percent);
      }
    });
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.secure_url) {
          const updatedUser = { ...currentUser, avatar: data.secure_url };
          dispatch(signInSuccess({ user: updatedUser, token }));
          setFormData((prev) => ({ ...prev, avatar: data.secure_url }));
          setFilePerc(100);
          setFileUploadError(false);
        } else {
          setFileUploadError(true);
        }
      } else {
        setFileUploadError(true);
      }
    };
    xhr.onerror = () => setFileUploadError(true);
    xhr.send(formDataUpload);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return;
    dispatch(updateUserStart());
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/user/update/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.status !== 200) {
        dispatch(updateUserFailure(data.message || "Update failed"));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/user/delete/${currentUser._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess());
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/signout`);
      dispatch(signOutUserSuccess());
      localStorage.removeItem("user");
    } catch {
      dispatch(signOutUserFailure());
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/user/listings/${currentUser._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/listing/delete/${listingId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success === false) return;
      setUserListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser?.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        {filePerc > 0 && filePerc < 100 && <p>Uploading: {filePerc}%</p>}
        {filePerc === 100 && <p className="text-green-600">Upload complete!</p>}
        {fileUploadError && <p className="text-red-600">Upload failed. Try again.</p>}
        <input
          type="text"
          placeholder="username"
          className="border p-3 rounded-lg"
          id="username"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          className="border p-3 rounded-lg"
          id="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          id="password"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-slate-700 text-white uppercase p-3 rounded-lg hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "loading..." : "Update"}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5 text-red-600 font-semibold px-2">
        <button onClick={handleDeleteUser} className="hover:underline">
          Delete account
        </button>
        <button onClick={handleSignOut} className="hover:underline">
          Sign out
        </button>
      </div>
      <p className="text-green-700 mt-5">
        {updateSucces ? "User is updated successfully" : ""}
      </p>
      <button onClick={handleShowListings} className="text-green-700 w-full">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>
      {userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
