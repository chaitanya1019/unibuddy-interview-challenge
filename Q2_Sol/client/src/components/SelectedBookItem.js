import React, { Fragment } from 'react';

function SelectedBookItem({ book }) {
  return (
    <div className="card">
      <img src={book.url} />
      <h3 className="content-title" data-testid={`bookItem-title-${book.id}`}>
        {book.title}
      </h3>
      <p
        className="content-summary"
        data-testid={`bookItem-summary-${book.id}`}>
        {book.summary}
      </p>
      <p data-testid={`bookItem-author-${book.id}`}>{book.author}</p>
    </div>
  );
}

export default SelectedBookItem;
