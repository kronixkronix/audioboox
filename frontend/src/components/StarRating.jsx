import React, { useState } from 'react';
import { Star } from 'lucide-react';
import classNames from 'classnames';

const StarRating = ({ avgRating = 0, ratingsCount = 0, userRating = 0, onRate, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);

  const handleRate = (stars) => {
    if (!readOnly && onRate) onRate(stars);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = hovered ? star <= hovered : star <= (userRating || Math.round(avgRating));
          return (
            <button
              key={star}
              disabled={readOnly}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(0)}
              className={classNames(
                "transition-transform",
                { "cursor-pointer hover:scale-125": !readOnly, "cursor-default": readOnly }
              )}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={20}
                className={classNames("transition-colors duration-150", {
                  "fill-amber-400 text-amber-400": filled,
                  "fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600": !filled,
                })}
              />
            </button>
          );
        })}
        {ratingsCount > 0 && (
          <span className="ml-2 text-sm text-secondary">
            {avgRating.toFixed(1)} ({ratingsCount} {ratingsCount === 1 ? 'rating' : 'ratings'})
          </span>
        )}
        {ratingsCount === 0 && !readOnly && (
          <span className="ml-2 text-sm text-secondary">No ratings yet</span>
        )}
      </div>
      {!readOnly && userRating > 0 && (
        <span className="text-xs text-green-600 font-medium">You rated this {userRating}★</span>
      )}
    </div>
  );
};

export default StarRating;
