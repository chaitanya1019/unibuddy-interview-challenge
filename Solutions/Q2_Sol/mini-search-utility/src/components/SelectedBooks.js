import React, { Fragment } from 'react';

function SelectedBooks(props) {
  const { books } = props;
  return (
    <div className="card-container">
      {books.map((book) => (
        <div class="card" key={book.id}>
          <img src="https://images.unsplash.com/photo-1533658925625-2f94d23fc425?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=894c97adfd68510170db9ae89704c92e&auto=format&fit=crop&w=800&q=60" />
          <h3 className="content-title">{book.title}</h3>
          <p className="content-summary">{book.summary}</p>
          <p>{book.author}</p>
        </div>
      ))}
    </div>
  );
}

export default SelectedBooks;
