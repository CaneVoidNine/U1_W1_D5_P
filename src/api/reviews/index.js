// ******************************************* BOOKS RELATED ENDPOINTS ***********************************

/* ********************************************** BOOKS CRUD ENDPOINTS ***********************************

1. CREATE --> POST http://localhost:3001/books/ (+body)
2. READ --> GET http://localhost:3001/books/ (+ optional query params)
3. READ (single book) --> GET http://localhost:3001/books/:bookId
4. UPDATE (single book) --> PUT http://localhost:3001/books/:bookId (+ body)
5. DELETE (single book) --> DELETE http://localhost:3001/books/:bookId

*/

import express from "express";
import uniqid from "uniqid";

import { getReviews, writeReviews } from "../../lib/fs-tools.js";

const reviewRouter = express.Router();

reviewRouter.post(
  "/",

  async (req, res, next) => {
    try {
      const newBook = { ...req.body, createdAt: new Date(), id: uniqid() };

      const reviewsArray = await getReviews();

      reviewsArray.push(newBook);

      await writeReviews(reviewsArray);

      res.status(201).send({ id: newBook.id });
    } catch (error) {
      next(error); // with the next(error) I can send this error to the error handlersd
    }
  }
);

reviewRouter.get("/", async (req, res, next) => {
  try {
    // throw new Error("KABOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOM")
    const reviewsArray = await getReviews();

    console.log("reviews array: ", reviewsArray);
    if (req.query && req.query.category) {
      const filteredBooks = reviewsArray.filter(
        (book) => book.category === req.query.category
      );
      res.send(filteredBooks);
    } else {
      res.send({ reviewsArray });
    }
  } catch (error) {
    next(error);
  }
});

reviewRouter.get("/:bookId", async (req, res, next) => {
  try {
    const books = await getReviews();
    const book = books.find((book) => book.id === req.params.bookId);
    if (book) {
      res.send(book);
    } else {
      // next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
      next(NotFound(`Book with id ${req.params.bookId} not found!`)); // --> err object {status: 404, message: `Book with id ${req.params.bookId} not found!` }
      // next(BadRequest("message")) // --> err object {status: 400, message: `message` }
      // next(Unauthorized("message")) // --> err object {status: 401, message: `message`}
    }
  } catch (error) {
    next(error);
  }
});

reviewRouter.put("/:bookId", async (req, res, next) => {
  try {
    const books = await getReviews();

    const index = books.findIndex((book) => book.id === req.params.bookId);
    if (index !== -1) {
      const oldBook = books[index];

      const updatedBook = { ...oldBook, ...req.body, updatedAt: new Date() };

      books[index] = updatedBook;

      await writeReviews(books);
      res.send(updatedBook);
    } else {
      next(NotFound(`Book with id ${req.params.bookId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

reviewRouter.delete("/:bookId", async (req, res, next) => {
  try {
    const books = await getReviews();

    const remainingBooks = books.filter(
      (book) => book.id !== req.params.bookId
    );

    if (books.length !== remainingBooks.length) {
      await writeReviews(remainingBooks);
      res.status(204).send();
    } else {
      next(NotFound(`Book with id ${req.params.bookId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default reviewRouter;
