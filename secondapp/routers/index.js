const express = require("express");
const router = express.Router();
const Books = require("../models/Books");
// REDIS
const redis = require("redis");
const REDIS_URL = process.env.REDIS_URL || "redis://localhost";
const client = redis.createClient({ url: REDIS_URL });
(async () => {
  await client.connect();
})();

// ================================================================
// Routes MONGO DB
router.get("/api/books", async (req, res) => {
  try {
    const books = await Books.find();
    res.status(200);
    res.json({ message: "route GET/api/books", books: books });
  } catch {
    res.status(500);
    res.json({ message: "ERROR FROM route GET/api/books" });
  }
});
// ================================================================
router.get("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Books.findById(id);
    res.status(200);
    res.json({ message: "route GET/api/books/:id", book: book });
  } catch {
    res.status(404);
    res.json({ message: `Книга с id=${id} не найдена` });
  }
});

// ================================================================
router.post("/api/books", async (req, res) => {
  const { title, description, authors, favorite, fileCover, fileName } =
    req.body;
  const newBook = new Books({
    title: title,
    description: description,
    authors: authors,
    favorite: favorite,
    fileCover: fileCover,
    fileName: fileName,
  });
  try {
    const book = await newBook.save();
    res.status(200);
    res.json({ message: "route POST/api/books", book: book });
  } catch {
    res.status(500);
    res.json({ message: "ERROR FROM route POST /api/books" });
  }
});
// ================================================================
router.put("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  try {
    const book = await Books.findByIdAndUpdate(id, update);
    res.status(200);
    res.json({ message: "route PUT /api/books/id", books: book });
  } catch {
    res.status(404);
    res.json({ message: `Книга с id=${id} не найдена` });
  }
});
// ================================================================
router.delete("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  const filter = { _id: id };
  try {
    const book = await Books.deleteOne(filter);
    res.status(200);
    res.json({ message: "OK", book: book });
  } catch {
    res.status(500);
    res.json({ message: "ERROR FROM route DELETE /api/books/:id" });
  }
});
// ================================================================
// Роуты с REDIS
router.get("/counter/:bookId", async (req, res) => {
  const { bookId } = req.params;
  let cnt = null;
  try {
    cnt = Number(await client.hGet("viewCount", String(bookId)));
    // cnt = !cnt ? 1 : cnt + 1;
  } catch (e) {
    console.log(" Ошибка ", {
      errorcode: 500,
      errmessage: "error in radis second APP",
      err: e,
    });
  }
  res.status(200);
  res.json({ [bookId]: cnt });
});
// ================================================================
router.post("/counter/:bookId/incr", async (req, res) => {
  const { bookId } = req.params;
  let status = "Ok";
  let cnt = null;
  try {
    cnt = Number(await client.hGet("viewCount", String(bookId)));
    cnt = !cnt ? 0 : cnt;
    await client.hSet("viewCount", String(bookId), cnt + 1);
  } catch (e) {
    status = e.status;
    console.log("Ошибка POST in REDIS", {
      errorcode: 500,
      errmessage: "error in radis second APP",
      err: e,
    });
  }
  res.status(200);
  res.json({ status, cnt: cnt });
});

module.exports = router;
