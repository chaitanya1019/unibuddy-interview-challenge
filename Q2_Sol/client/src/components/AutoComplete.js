import React, { useState, useCallback, Fragment } from 'react';
import SelectedBooks from './SelectedBooks.js';
import axios from 'axios';
import { debounce } from 'lodash';

// Recent searches can store max of 10 items
const RECENT_SEARCHES_MAX_LENGTH = 10;
const BOOK_IMAGES = [
  'https://images.unsplash.com/photo-1555252586-d77e8c828e41?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=751&q=80',
  'https://images.unsplash.com/photo-1533563672978-98d2cb263ee0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80',
  'https://images.unsplash.com/photo-1549122728-f519709caa9c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=625&q=80',
  'https://images.unsplash.com/photo-1551300317-58b878a9ff6e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80',
  'https://images.unsplash.com/photo-1569738713551-2958195b458a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=375&q=80',
];

function AutoComplete() {
  const [searchTxt, setSearchTxt] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState({});
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setSearching] = useState(false);

  // add selected book to list of selected books
  const handleSubmit = () => {
    // If search txt is not empty and selectedBook is not empty
    if (searchTxt.trim().length && !isEmpty(selectedSuggestion)) {
      let selectedBook = { ...selectedSuggestion };
      selectedBook['url'] =
        BOOK_IMAGES[Math.floor(Math.random() * BOOK_IMAGES.length)];
      setSelectedBooks([...selectedBooks, selectedBook]); // add selected book to list of books
      setSearchTxt(''); // reset search txt
      setActiveSuggestion(0); // reset active suggestion
      setShowSuggestions(false); // hide suggestions
      setSelectedSuggestion({}); // reset selected suggestion
      setSuggestions([]); // reset suggestions
    }
  };

  // check if object is empty
  const isEmpty = (obj) => {
    for (let x in obj) {
      return false;
    }
    return true;
  };

  // handle searching state to show/hide searching text when api call is made
  const fetchSummaries = async (searchInput) => {
    setShowSuggestions(true); // display suggestions
    setSearching(true); //change searching to true
    try {
      // API call to fetch books matching search data
      const response = await axios.get('http://localhost:5001/summaries', {
        params: {
          search: searchInput,
        },
      });
      const suggestions = response.data;
      // set suggestions to response received from the api in case of success call or empty array if failed
      setSuggestions(suggestions);
      // set active suggestion to the first item in suggestions array
      setActiveSuggestion(0);
      setSearching(false); //change searching to false
    } catch (error) {
      console.error('Error in fetching summaries');
      setSearching(false); //change searching to false

      setShowSuggestions(false); //hide suggestions
      setSuggestions([]); //reset suggestions
    }
  };

  // using debounce from lodash library to delay the rate at which api calls are made
  const handleFetchSummries = useCallback(
    debounce((q) => fetchSummaries(q), 1000),
    []
  );

  //when text input is changed..
  const onChange = (e) => {
    const searchTxt = e.target.value;
    setSearchTxt(searchTxt);
    if (searchTxt.trim().length) {
      //input not empty
      handleFetchSummries(e.target.value); //call fn to fetch matching summaries
    } else {
      setShowSuggestions(false); //hide suggestions
      setSuggestions([]); // reset suggestions
    }
  };

  // Handle key events such as enter, up arrow and down arrow keys in input text
  const onKeyDown = (e) => {
    // if search txt is not empty
    if (e.target.value.trim().length) {
      if (e.keyCode === 13) {
        // enter button clicked
        console.log('enter triggered');
        if (suggestions.length && showSuggestions) {
          // if suggestions is not empty and suggestions are displayed
          handleRecentSearches(); // add search txt to recent searches
          setActiveSuggestion(0); // reset active suggestion to 0
          setShowSuggestions(false); // hide suggestions

          setSelectedSuggestion(suggestions[activeSuggestion]); // set selected book

          setSearchTxt(suggestions[activeSuggestion]['title']); //set it to title of book
        } else {
          // a book is selected from list of available suggestion
          handleSubmit(); // add selected book to selectedBooks
        }
      } else if (e.keyCode === 38) {
        // up arrow clicked
        //active suggestion is pointing to first element in list of suggestions
        if (activeSuggestion === 0) {
          return; // no changes
        }
        // active suggestion is not pointing to first element in list of suggestions
        setActiveSuggestion(activeSuggestion - 1); // point to element before it
      } else if (e.keyCode === 40) {
        // down arrow clicked

        //active suggestion is pointing to first element in list of suggestions
        if (activeSuggestion === suggestions.length - 1) {
          return; //no changes
        }
        // active suggestion is not pointing to lasr element in list of suggestions

        setActiveSuggestion(activeSuggestion + 1); // point to element after it
      }
    }
  };

  //manage recent searches
  function handleRecentSearches() {
    let recentSearchesClone = [...recentSearches]; // clone recentSearches state

    if (recentSearches.length === RECENT_SEARCHES_MAX_LENGTH) {
      // check if recent searches reached it's max value
      recentSearchesClone.pop(); // remove the last element
    }
    setRecentSearches([searchTxt, ...recentSearchesClone]); // add latest search txt to list
  }

  // manage when suggestions are clicked
  function handleSuggestionClick(suggestion, e) {
    handleRecentSearches(); // add txt to recent searches
    setActiveSuggestion(0); // reset active suggestion
    setSuggestions([]); // reset suggestions
    setShowSuggestions(false); // hide suggestions
    setSearchTxt(e.currentTarget.innerText); //set search txt to title of suggestion
    setSelectedSuggestion(suggestion); // set selected suggestion
  }

  return (
    <Fragment>
      <div className="hero">
        <div className="hero__background">
          <img
            src="https://images.unsplash.com/photo-1506609762754-bf3a1b5a4d7b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80"
            alt="hero_img"
          />
        </div>
        <section className="hero__content hero__content--centered">
          <h1 className="hero__title">
            Awesome power Of knowledge, right at your fingertips!
          </h1>
        </section>
        <div className="main-nav-bar__search-bar">
          <div
            className={
              showSuggestions ? 'search-bar search-bar--open' : 'search-bar'
            }>
            <div className="search-bar__container">
              <input
                data-testid="summary-input"
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={searchTxt}
                placeholder="Enter Book Summary"
                autoFocus
                required
              />

              <button
                data-testid="add-book__button"
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
                    xmlnscc="http://creativecommons.org/ns#"
                    xmlnsdc="http://purl.org/dc/elements/1.1/"
                    xmlnsinkscape="http://www.inkscape.org/namespaces/inkscape"
                    xmlnsrdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                    xmlnssodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                    xmlnssvg="http://www.w3.org/2000/svg">
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
                {isSearching ? (
                  <div className="searching">Searching...</div>
                ) : suggestions.length ? (
                  <ul className="search-bar__suggestions">
                    {suggestions.map((suggestion, index) => {
                      return (
                        <li
                          className={
                            index === activeSuggestion ? 'active' : null
                          }
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
      </div>

      <div className="container">
        <div className="search">
          <section className="search__header">
            <h1 className="search__header__title">recent searches</h1>
          </section>
          <div className="recent-search__suggestions">
            {recentSearches.map((searchItem) => (
              <p key={searchItem}>{searchItem}</p>
            ))}
          </div>
        </div>

        {selectedBooks.length > 0 ? (
          <SelectedBooks books={selectedBooks} />
        ) : (
          <p>No Books Selected</p>
        )}
      </div>
    </Fragment>
  );
}

export default AutoComplete;
