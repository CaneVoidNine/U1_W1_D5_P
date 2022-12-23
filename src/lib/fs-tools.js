import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON, writeFile } = fs;

const dataFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../api/products"
);
const publicFolderPath = join(process.cwd(), "./public/img/products");

console.log("ROOT OF THE PROJECT:", process.cwd());
console.log("PUBLIC FOLDER:", publicFolderPath);

console.log("DATA FOLDER PATH: ", dataFolderPath);
const productsJSONPath = join(dataFolderPath, "products.json");
const booksJSONPath = join(dataFolderPath, "books.json");

export const getproducts = () => readJSON(productsJSONPath);
export const writeproducts = (productsArray) =>
  writeJSON(productsJSONPath, productsArray);
export const getBooks = () => readJSON(booksJSONPath);
export const writeBooks = (booksArray) => writeJSON(booksJSONPath, booksArray);

export const saveUsersAvatars = (fileName, contentAsABuffer) =>
  writeFile(join(publicFolderPath, fileName), contentAsABuffer);
