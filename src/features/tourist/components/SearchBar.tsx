// src/components/SearchBar.tsx
import React, { useState } from 'react';
import { Search, Mic, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onVoiceSearch?: () => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Tìm kiếm ẩm thực, địa điểm...",
  onSearch,
  onVoiceSearch,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative flex-1 max-w-xl ${className}`}
    >
      <div 
        className={`
          group relative flex items-center bg-white rounded-3xl border 
          transition-all duration-300 shadow-sm
          ${isFocused 
            ? 'border-orange-500 shadow-md scale-[1.02]' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        {/* Icon Search */}
        <div className="pl-5 text-gray-400 group-hover:text-orange-500 transition-colors">
          <Search size={20} strokeWidth={2.5} />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-3.5 text-base outline-none placeholder:text-gray-400 text-gray-700"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="p-2 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={onVoiceSearch}
          className="p-3 pr-5 text-gray-400 hover:text-orange-500 transition-all active:scale-90"
        >
          <Mic size={22} strokeWidth={2.25} />
        </button>
      </div>

      {/* Subtle glow effect when focused */}
      {isFocused && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/10 to-amber-400/10 rounded-[22px] -z-10 blur-sm" />
      )}
    </form>
  );
};

export default SearchBar;