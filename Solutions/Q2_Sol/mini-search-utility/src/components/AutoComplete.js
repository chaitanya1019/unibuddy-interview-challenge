import React, { useState, Fragment } from 'react';
import { searchSummaries } from '../utils/index.js';
import SelectedBooks from './SelectedBooks.js';

function AutoComplete(props) {
  const [searchTxt, setSearchTxt] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState({});
  const [selectedBooks, setSelectedBooks] = useState([]);

  const handleSubmit = e => {
    e.preventDefault();

    console.log('submit triggered');
    if (searchTxt.trim().length) {
      setSelectedBooks([...selectedBooks, selectedSuggestion]);
      setSearchTxt('');
      setActiveSuggestion(0);
      setShowSuggestions(false);
      setSelectedSuggestion({});
      setSuggestions([]);
    }
  };

  const onChange = e => {
    const searchTxt = e.target.value;
    setSearchTxt(searchTxt);
    if (searchTxt.trim().length) {
      const suggestions = searchSummaries(searchTxt, 3);

      setSuggestions(suggestions);
      setActiveSuggestion(0);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }

    console.log(suggestions);
  };

  const onKeyDown = e => {
    if (e.keyCode === 13) {
      setActiveSuggestion(0);
      setShowSuggestions(false);
      setSearchTxt(suggestions[activeSuggestion]['title']); //set it to title of book
    } else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }
      setActiveSuggestion(activeSuggestion - 1);
    } else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === suggestions.length) {
        return;
      }

      setActiveSuggestion(activeSuggestion + 1);
    }
  };

  function handleSuggestionClick(suggestion, e) {
    setActiveSuggestion(0);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchTxt(e.currentTarget.innerText);
    setSelectedSuggestion(suggestion);
  }

  return (
    <Fragment>
      <div className="wrap">
        <div className="searchBox">
          <form onSubmit={handleSubmit}>
            <div className="search">
              <input
                type="text"
                className={
                  !showSuggestions
                    ? 'searchTextBox'
                    : 'searchTextBox with-suggestions'
                }
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={searchTxt}
                placeholder="Search"
              />

              <input
                type="submit"
                value="Add"
                className={
                  !showSuggestions ? 'addButton' : 'addButton with-suggestions'
                }
              />
            </div>
          </form>
        </div>

        {showSuggestions && searchTxt && (
          <div className="suggestions">
            {suggestions.length ? (
              <ul className="suggestions">
                {suggestions.map((suggestion, index) => {
                  return (
                    <li
                      className={index === activeSuggestion ? 'active' : null}
                      key={suggestion.id}
                      onClick={e => handleSuggestionClick(suggestion, e)}>
                      {suggestion.title}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="no-suggestions">No suggestions!!</div>
            )}
          </div>
        )}
      </div>

      {selectedBooks.length > 0 ? (
        <SelectedBooks books={selectedBooks} />
      ) : (
        <p>No Books Selected</p>
      )}
    </Fragment>
  );
}

export default AutoComplete;
