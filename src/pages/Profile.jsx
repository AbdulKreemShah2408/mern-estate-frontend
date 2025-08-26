import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice.js";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
  });
  const [listings, setListings] = useState([]);
  const [showListingsError, setShowListingsError] = useState(null);

  const API_URL = import.meta.env.VITE_BACKEND_API_URL;

  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`${API_URL}/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

 
  const handleDelete = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`${API_URL}/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess());
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(`${API_URL}/auth/signout`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess());
    } catch (err) {
      dispatch(signOutUserFailure(err.message));
    }
  };

 
  const handleShowListings = async () => {
    try {
      setShowListingsError(null);
      const res = await fetch(`${API_URL}/user/listings/${currentUser._id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(data.message);
        return;
      }
      setListings(data);
    } catch (err) {
      setShowListingsError(err.message);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`${API_URL}/listing/delete/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success === false) {
        return;
      }
      setListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-center my-4">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />
        <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
          Update
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <button
          onClick={handleDelete}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </button>
        <button
          onClick={handleSignOut}
          className="text-blue-700 cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="mt-5">
        <button
          onClick={handleShowListings}
          className="text-green-700 cursor-pointer"
        >
          Show My Listings
        </button>
        {showListingsError && (
          <p className="text-red-700 mt-2">{showListingsError}</p>
        )}
        {listings.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">My Listings</h2>
            <ul>
              {listings.map((listing) => (
                <li
                  key={listing._id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span>{listing.name}</span>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className="text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
