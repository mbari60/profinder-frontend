"use client";

import React from "react";
import { Star } from "lucide-react";

const StarRating = React.memo(
  ({ rating, size = 4, interactive = false, onChange }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-${size} w-${size} ${
              interactive ? "cursor-pointer" : ""
            }`}
            fill={star <= rating ? "#FFD700" : "none"}
            stroke={star <= rating ? "#FFD700" : "#D1D5DB"}
            onClick={interactive ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  }
);

StarRating.displayName = "StarRating";

export default StarRating;
