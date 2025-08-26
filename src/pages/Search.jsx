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
        const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/listing/get?${apiParams.toString()}`);
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/listing/get?${urlParams.toString()}`);
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
      {/* Sidebar */}
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen w-full md:w-72">
        {/* form code same */}
      </div>

      {/* Listings */}
      <div className="flex-1">
        {/* same UI as your version */}
      </div>
    </div>
  );
}
