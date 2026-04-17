// src/components/TourCard.tsx
import React from 'react';
import { Lock } from 'lucide-react';

interface TourCardProps {
  title: string;
  duration: string;
  spots: number;
  isFree: boolean;
  price?: number;
  locked?: boolean;
}

const TourCard: React.FC<TourCardProps> = ({ title, duration, spots, isFree, price, locked }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative">
        {locked && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Lock size={14} /> Premium
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-500 text-sm mt-1">
          {spots} điểm • {duration}
        </p>

        <div className="flex justify-between items-center mt-4">
          {isFree ? (
            <span className="text-green-600 font-medium">Miễn phí</span>
          ) : (
            <span className="text-orange-600 font-semibold">
              {price?.toLocaleString('vi-VN')}đ
            </span>
          )}
          <button className="text-orange-500 font-medium text-sm">Chi tiết →</button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;