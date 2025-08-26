import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ListingItem from "../Components/ListingItem";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "createdAt",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl = urlParams.get("searchTerm") || "";
    const typeFromUrl = urlParams.get("type") || "all";
    const parkingFromUrl = urlParams.get("parking") === "true";
    const furnishedFromUrl = urlParams.get("furnished") === "true";
    const offerFromUrl = urlParams.get("offer") === "true";
    const sortFromUrl = urlParams.get("sort") || "createdAt";
    const orderFromUrl = urlParams.get("order") || "desc";

    setSidebarData({
      searchTerm: searchTermFromUrl,
      type: typeFromUrl,
      parking: parkingFromUrl,
      furnished: furnishedFromUrl,
      offer: offerFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
    });

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const apiParams = new URLSearchParams();
      if (searchTermFromUrl) apiParams.set("searchTerm", searchTermFromUrl);
      if (typeFromUrl && typeFromUrl !== "all") apiParams.set("type", typeFromUrl);
      if (parkingFromUrl) apiParams.set("parking", "true");
      if (furnishedFromUrl) apiParams.set("furnished", "true");
      if (offerFromUrl) apiParams.set("offer", "true");
      if (sortFromUrl) apiParams.set("sort", sortFromUrl);
      if (orderFromUrl) apiParams.set("order", orderFromUrl);
      apiParams.set("limit", 9);

      try {
        const res = await fetch(`/api/listing/get?${apiParams.toString()}`);
        const data = await res.json();

        if (data.length === 9) {
          setShowMore(true);
          setListings(data.slice(0, 8)); 
        } else {
          setShowMore(false);
          setListings(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setListings([]);
        setShowMore(false);
      }

      setLoading(false);
    };

    fetchListings();
  }, [location.search]);
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "type") {
      setSidebarData({ ...sidebarData, type: value });
    } else if (id === "searchTerm") {
      setSidebarData({ ...sidebarData, searchTerm: value });
    } else if (["parking", "furnished", "offer"].includes(id)) {
      setSidebarData({ ...sidebarData, [id]: checked });
    } else if (id === "sort_order") {
      const [sort, order] = value.split("_");
      setSidebarData({ ...sidebarData, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();

    if (sidebarData.searchTerm) urlParams.set("searchTerm", sidebarData.searchTerm);
    if (sidebarData.type && sidebarData.type !== "all") urlParams.set("type", sidebarData.type);
    if (sidebarData.parking) urlParams.set("parking", "true");
    if (sidebarData.furnished) urlParams.set("furnished", "true");
    if (sidebarData.offer) urlParams.set("offer", "true");
    if (sidebarData.sort) urlParams.set("sort", sidebarData.sort);
    if (sidebarData.order) urlParams.set("order", sidebarData.order);

    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;

    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", numberOfListings);
    urlParams.set("limit", 9);

    try {
      const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
      const data = await res.json();

      if (data.length < 9) {
        setShowMore(false);
      }
      setListings([...listings, ...data]);
    } catch (error) {
      console.error("Failed to load more listings", error);
      setShowMore(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen w-full md:w-72">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col">
            <label htmlFor="searchTerm" className="whitespace-nowrap font-semibold mb-1">
              Search Term:
            </label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="font-semibold">Type:</legend>
            {["all", "rent", "sale"].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  id="type"
                  name="type"
                  value={option}
                  checked={sidebarData.type === option}
                  onChange={handleChange}
                />
                <span className="capitalize">{option === "all" ? "Rent & Sale" : option}</span>
              </label>
            ))}
          </fieldset>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="offer"
              checked={sidebarData.offer}
              onChange={handleChange}
              className="w-5"
            />
            <label htmlFor="offer" className="font-semibold cursor-pointer">
              Offer
            </label>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="font-semibold">Amenities:</legend>
            {["parking", "furnished"].map((amenity) => (
              <label key={amenity} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={amenity}
                  checked={sidebarData[amenity]}
                  onChange={handleChange}
                  className="w-5"
                />
                <span className="capitalize">{amenity}</span>
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col">
            <label htmlFor="sort_order" className="font-semibold mb-1">
              Sort:
            </label>
            <select
              id="sort_order"
              value={`${sidebarData.sort}_${sidebarData.order}`}
              onChange={handleChange}
              className="border rounded-lg p-3"
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95"
          >
            Search
          </button>
        </form>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5 md:mt-0">
          Listing results
        </h1>
        <div className="p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <p className="text-xl text-slate-700 text-center w-full">Loading...</p>
          )}

          {!loading && listings.length === 0 && (
            <p className="text-xl text-slate-700">No Listing found!</p>
          )}

          {!loading &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
        </div>

        {showMore && (
          <div className="flex justify-center w-full">
            <button
              onClick={onShowMoreClick}
              className="text-green-700 hover:underline p-7"
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
