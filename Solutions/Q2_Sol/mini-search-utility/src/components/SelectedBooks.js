import React from 'react';

function SelectedBooks(props) {
  const { books } = props;
  return (
    <div>
      {books.map(book => (
        <div
          key={book.id}
          style={{ width: 200, height: 100, border: '1px solid' }}>
          <p>{book.title}</p>
        </div>
      ))}
    </div>
  );
}

export default SelectedBooks;
