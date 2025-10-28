'use client';

import React from 'react';

interface SearchBarProps {
  placeholder: string;
  onSearchChange: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearchChange }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearchChange(e.target.value)}
        className="p-2 border rounded-md w-full shadow-sm"
      />
    </div>
  );
};

export default SearchBar;
