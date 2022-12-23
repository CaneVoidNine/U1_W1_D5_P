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
import httpErrors from "http-errors";
import { checksProductsSchema, triggerBadRequest } from "./validator.js";
import { getproducts, getReviews, writeproducts } from "../../lib/fs-tools.js";

const { NotFound, Unauthorized, BadRequest } = httpErrors;

const booksRouter = express.Router();

booksRouter.post(
  "/",
  checksProductsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newBook = { ...req.body, createdAt: new Date(), id: uniqid() };

      const productsArray = await getproducts();

      productsArray.push(newBook);

      await writeproducts(productsArray);

      res.status(201).send({ id: newBook.id });
    } catch (error) {
      next(error); // with the next(error) I can send this error to the error handlersd
    }
  }
);

booksRouter.get("/", async (req, res, next) => {
  try {
    // throw new Error("KABOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOM")
    const productsArray = await getproducts();
    const reviewsArray = await getReviews();
    console.log("Products array: ", productsArray);
    if (req.query && req.query.category) {
      const filteredBooks = productsArray.filter(
        (book) => book.category === req.query.category
      );
      res.send(filteredBooks);
    } else {
      res.send({ productsArray, reviewsArray });
    }
  } catch (error) {
    next(error);
  }
});

booksRouter.get("/:bookId", async (req, res, next) => {
  try {
    const books = await getproducts();
    const reviews = await getReviews();
    const book = books.find((book) => book.id === req.params.bookId);
    const review = reviews.find(
      (review) => review.productId === req.params.bookId
    );

    const both = Object.assign(book, review);
    if (book) {
      res.send(both);
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

booksRouter.put("/:bookId", async (req, res, next) => {
  try {
    const books = await getproducts();

    const index = books.findIndex((book) => book.id === req.params.bookId);
    if (index !== -1) {
      const oldBook = books[index];

      const updatedBook = { ...oldBook, ...req.body, updatedAt: new Date() };

      books[index] = updatedBook;

      await writeproducts(books);
      res.send(updatedBook);
    } else {
      next(NotFound(`Book with id ${req.params.bookId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

booksRouter.delete("/:bookId", async (req, res, next) => {
  try {
    const books = await getproducts();

    const remainingBooks = books.filter(
      (book) => book.id !== req.params.bookId
    );

    if (books.length !== remainingBooks.length) {
      await writeproducts(remainingBooks);
      res.status(204).send();
    } else {
      next(NotFound(`Book with id ${req.params.bookId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default booksRouter;
