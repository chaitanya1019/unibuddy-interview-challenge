import React, { Fragment } from 'react';

function SelectedBooks(props) {
  const { books } = props;
  return (
    <div className="card-container">
      {books.map((book) => (
        <div className="card" key={book.id}>
          <div className="imgBx">
            <img
              src="https://image.flaticon.com/icons/svg/2092/2092063.svg"
              alt=""
            />
          </div>
          <div className="contentBx">
            <h2>{book.title}</h2>
            <p className="content-summary">{book.summary}</p>
            <p>{book.author}</p>
            {/* <a href="">
              <span>Read More</span>
            </a> */}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SelectedBooks;
