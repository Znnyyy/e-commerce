import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ 
  rating = 0, 
  maxRating = 5, 
  size = 18, 
  onChange = null, 
  className = "" 
}) {
  const [hover, setHover] = React.useState(0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const currentRating = hover || rating;
        const isFilled = currentRating >= starValue;
        const isHalf = !isFilled && currentRating >= starValue - 0.5;

        return (
          <button
            key={index}
            type="button"
            disabled={!onChange}
            onClick={() => onChange && onChange(starValue)}
            onMouseEnter={() => onChange && setHover(starValue)}
            onMouseLeave={() => onChange && setHover(0)}
            className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all active:scale-90`}
          >
            <div className="relative">
              <Star 
                size={size} 
                className={`${
                  isFilled 
                    ? 'fill-black text-black' 
                    : 'text-black opacity-10'
                } transition-colors`}
                strokeWidth={isFilled ? 0 : 2}
              />
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star 
                    size={size} 
                    className="fill-black text-black"
                    strokeWidth={0}
                  />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
