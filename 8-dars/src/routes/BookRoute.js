const { BooksGET, BookPOST, BookGET, BookPATCH, BookDELETE } = require("../controllers/BookController");

const router = require("express").Router();

router.get("/books", BooksGET)
router.post("/books", BookPOST);
router.get("/book/:slug", BookGET)
router.patch("/book/:slug", BookPATCH)
router.delete("/book/:slug", BookDELETE)

module.exports = {
    path: "/api",
    router
}