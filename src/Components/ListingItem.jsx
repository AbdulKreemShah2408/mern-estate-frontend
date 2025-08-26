import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";

export default function ListingItem({ listing, className = '' }) {
  return (
    <div className={`bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg ${className}`}>
      <Link to={`/listing/${listing._id}`}>
        <img
          src={
            listing?.imageUrls?.[0] ||
            "https://www.google.com/imgres?q=real%20estate&imgurl=https%3A%2F%2Fcdn.prod.website-files.com%2F620ec747459e13c7cf12a39e%2F625b10a58137b364b18df2ea_iStock-94179607.jpg&imgrefurl=https%3A%2F%2Fwww.concreit.com%2Fblog%2Fbasics-of-real-estate&docid=L0PhEgtl2Q4dOM&tbnid=44Mix5G356a2VM&vet=12ahUKEwjm4LCCiKOPAxVdvScCHbKIG-UQM3oECCcQAA..i&w=725&h=482&hcb=2&ved=2ahUKEwjm4LCCiKOPAxVdvScCHbKIG-UQM3oECCcQAA"
          }
          alt={listing?.name || "Listing"}
          className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300"
        />
        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="truncate text-lg font-semibold text-slate-600">
            {listing.name}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="w-4 h-4 text-green-700" />
            <p className="text-sm text-gray-600 truncate w-full">
              {listing.address}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
          <p className="text-slate-500 mt-2 font-semibold">
            $
            {listing.offer
              ? listing.discountPrice.toLocaleString("en-US")
              : listing.regularPrice.toLocaleString("en-US")}
            {listing.type === "rent" && " /month"}
          </p>
          <div className="text-slate-700 flex gap-4">
            <div className="font-bold text-xs">
              {listing.bedrooms > 1
                ? `${listing.bedrooms} beds`
                : `${listing.bedrooms} bed`}
            </div>
            <div className="font-bold text-xs">
              {listing.bathrooms > 1
                ? `${listing.bathrooms} baths`
                : `${listing.bathrooms} bath`}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
