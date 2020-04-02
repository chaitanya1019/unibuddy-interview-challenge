import React, { useState, Fragment } from 'react';
import SuggestionsList from './SuggestionsList';

function AutoComplete(props) {
  const [searchTxt, setSearchTxt] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  const handleSubmit = e => {
    e.preventDefault();
  };

  const onChange = e => {
    setSearchTxt(e.target.value);
  };

  const onKeyDown = e => {};

  return (
    <Fragment>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={searchTxt}
          placeholder="Search"
        />

        <input type="submit" value="Add" />
      </form>
      <br />
      {searchTxt && <SuggestionsList suggestions={suggestions} />}
    </Fragment>
  );
}

export default AutoComplete;
