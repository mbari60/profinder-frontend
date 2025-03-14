"use client";

import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/recurent/StarRating";

const ReviewCard = React.memo(({ review }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                {review.reviewer_name?.charAt(0).toUpperCase() || "A"}
              </Avatar>
              <span className="font-medium">
                {review.reviewer_name || "Anonymous"}
              </span>
            </div>
            <div className="mt-2">
              <StarRating rating={review.rating} />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
        <Separator className="my-3" />
        <p className="text-sm">{review.comment}</p>
      </CardContent>
    </Card>
  );
});

ReviewCard.displayName = "ReviewCard";

export default ReviewCard;
