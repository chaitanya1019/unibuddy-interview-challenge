import React from 'react';
import SelectedBookItem from './SelectedBookItem';

function SelectedBooks({ books }) {
  return (
    <div className="card-container">
      {books.map((book) => (
        <SelectedBookItem key={book.id} book={book} />
      ))}
    </div>
  );
}

export default SelectedBooks;
