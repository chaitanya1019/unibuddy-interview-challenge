import React, { useState } from 'react';

function SearchInput() {
  const [searchTxt, setSearchTxt] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" id="fname" name="fname" placeholder="Search" />

      <input type="submit" value="Search" />
    </form>
  );
}

export default SearchInput;
