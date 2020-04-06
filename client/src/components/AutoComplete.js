import React, { useState, useCallback, Fragment } from 'react';
import SelectedBooks from './SelectedBooks.js';
import axios from 'axios';
import { debounce } from 'lodash';

const RECENT_SEARCHES_MAX_LENGTH = 10;

function AutoComplete() {
  const [searchTxt, setSearchTxt] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState({});
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setSearching] = useState(false);

  const handleSubmit = () => {
    if (searchTxt.trim().length && !isEmpty(selectedSuggestion)) {
      setSelectedBooks([...selectedBooks, selectedSuggestion]);
      setSearchTxt('');
      setActiveSuggestion(0);
      setShowSuggestions(false);
      setSelectedSuggestion({});
      setSuggestions([]);
    }
  };

  const isEmpty = (obj) => {
    for (let x in obj) {
      return false;
    }
    return true;
  };

  const fetchSummaries = async (searchInput) => {
    setSearching(true);
    try {
      const response = await axios.get('http://localhost:5001/summaries', {
        params: {
          search: searchInput,
        },
      });
      const suggestions = response.data;
      setSuggestions(suggestions);
      setActiveSuggestion(0);
      setShowSuggestions(true);
      setSearching(false);
    } catch (error) {
      console.error('Error in fetching summaries');
      setSearching(false);

      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleFetchSummries = useCallback(
    debounce((q) => fetchSummaries(q), 1000),
    []
  );

  const onChange = (e) => {
    const searchTxt = e.target.value;
    setSearchTxt(searchTxt);
    if (searchTxt.trim().length) {
      handleFetchSummries(e.target.value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const onKeyDown = (e) => {
    if (e.target.value.trim().length) {
      if (e.keyCode === 13) {
        console.log('enter triggered');

        if (suggestions.length && showSuggestions) {
          handleRecentSearches();
          setActiveSuggestion(0);
          setShowSuggestions(false);

          setSelectedSuggestion(suggestions[activeSuggestion]);

          setSearchTxt(suggestions[activeSuggestion]['title']); //set it to title of book
        } else {
          handleSubmit();
        }
        // e.preventDefault();
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
    }
  };

  function handleRecentSearches() {
    let recentSearchesClone = [...recentSearches];

    if (recentSearches.length === RECENT_SEARCHES_MAX_LENGTH) {
      recentSearchesClone.splice(recentSearches.length - 1, 1);
    }
    setRecentSearches([searchTxt, ...recentSearchesClone]);
  }

  function handleSuggestionClick(suggestion, e) {
    console.log('sugg click triggered');
    handleRecentSearches();
    setActiveSuggestion(0);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchTxt(e.currentTarget.innerText);
    setSelectedSuggestion(suggestion);
  }

  return (
    <Fragment>
      <div className="main-nav-bar__search-bar">
        <div
          className={
            showSuggestions ? 'search-bar search-bar--open' : 'search-bar'
          }>
          <div className="search-bar__container">
            <input
              type="text"
              onChange={onChange}
              onKeyDown={onKeyDown}
              value={searchTxt}
              placeholder="Search"
              autoFocus
              required
            />

            <button
              type="button"
              onClick={handleSubmit}
              className={
                !showSuggestions ? 'addButton' : 'addButton with-suggestions'
              }>
              <i className="rd__svg-icon">
                <svg
                  enableBackground="new 0 0 32 32"
                  height="32px"
                  id="svg2"
                  version="1.1"
                  viewBox="0 0 32 32"
                  width="32px"
                  xmlSpace="preserve"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsCc="http://creativecommons.org/ns#"
                  xmlnsDc="http://purl.org/dc/elements/1.1/"
                  xmlnsInkscape="http://www.inkscape.org/namespaces/inkscape"
                  xmlnsRdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                  xmlnsSodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                  xmlnsSvg="http://www.w3.org/2000/svg">
                  <g id="background">
                    <rect fill="none" height="32" width="32" />
                  </g>
                  <g id="book_x5F_text_x5F_add">
                    <path d="M32,23.001c0-3.917-2.506-7.24-5.998-8.477V4h-2V1.999h2V0h-23C2.918,0.004,2.294-0.008,1.556,0.354   C0.808,0.686-0.034,1.645,0.001,3c0,0.006,0.001,0.012,0.001,0.018V30c0,2,2,2,2,2h21.081l-0.007-0.004   C28.013,31.955,32,27.946,32,23.001z M2.853,3.981C2.675,3.955,2.418,3.869,2.274,3.743C2.136,3.609,2.017,3.5,2.002,3   c0.033-0.646,0.194-0.686,0.447-0.856c0.13-0.065,0.289-0.107,0.404-0.125C2.97,1.997,3,2.005,3.002,1.999h19V4h-19   C3,4,2.97,4.002,2.853,3.981z M4,30V6h20v8.06C23.671,14.023,23.337,14,22.998,14c-2.142,0-4.106,0.751-5.651,2H6v2h9.516   c-0.413,0.616-0.743,1.289-0.995,2H6v2h8.057c-0.036,0.329-0.059,0.662-0.059,1.001c0,2.829,1.307,5.35,3.348,6.999H4z M23,30   c-3.865-0.008-6.994-3.135-7-6.999c0.006-3.865,3.135-6.995,7-7c3.865,0.006,6.992,3.135,7,7C29.992,26.865,26.865,29.992,23,30z    M22,12H6v2h16V12z" />
                    <g>
                      <polygon points="28,22 24.002,22 24.002,18 22,18 22,22 18,22 18,24 22,24 22,28 24.002,28 24.002,24 28,24   " />
                    </g>
                  </g>
                </svg>
              </i>
            </button>
          </div>

          {showSuggestions && searchTxt && (
            <div className="search-bar__dropdown">
              {suggestions.length ? (
                <ul className="search-bar__suggestions">
                  {suggestions.map((suggestion, index) => {
                    return (
                      <li
                        className={index === activeSuggestion ? 'active' : null}
                        key={suggestion.id}
                        onClick={(e) => handleSuggestionClick(suggestion, e)}>
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
      </div>

      <div className="search">
        <section className="search__header">
          <h1 className="search__header__title">recent searches</h1>
        </section>
        <div className="recent-search__suggestions">
          {recentSearches.map((searchItem) => (
            <p>{searchItem}</p>
          ))}
        </div>
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
