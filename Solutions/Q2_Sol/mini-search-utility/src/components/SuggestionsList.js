import React from 'react';

function SuggestionsList(props) {
  const { suggestions } = props;
  return (
    <div style={{ border: '1px solid' }}>
      {suggestions.length ? (
        <ul>
          {suggestions.map((suggestion, index) => {
            return <li key={suggestion.id}>{suggestion.summary}</li>;
          })}
        </ul>
      ) : (
        <div>No suggestions!!</div>
      )}
    </div>
  );
}

export default SuggestionsList;
