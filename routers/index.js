const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
// Для работы с файлами
const fileMulter = require("../middleware/file");
// Для работы с формами
const bodyParser = require("body-parser");
const urlebcodedparser = bodyParser.urlencoded({ extended: false });

const SECONDAPP_URL = process.env.SECONDAPP_URL;

// ==================== Роуты ===============================
router.get("/", async (req, res) => {
  let books = [];
  try {
    const response = await fetch(`${SECONDAPP_URL}/api/books`);
    const data = await response.json();
    books = data.books;
  } catch (e) {
    console.log("Ошибка router.get /", {
      errorcode: 500,
      errmassage: "Ошибка router.get /",
      err: e,
    });
  }
  res.render("index", {
    title: "Main PAGE",
    store: books,
  });
});

// ==========================================================
router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${SECONDAPP_URL}/api/books/${id}`, {
      method: "delete",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    res.redirect("/");
  } catch (e) {
    console.log("router.post /delete/:id", {
      errorcode: 500,
      errmassage: "router.post /delete/:id",
      err: e,
    });
    res.status(404);
    res.json({
      status: 404,
      errormsg: "404 | страница не найдена",
    });
  }
});

// ==========================================================
router.get("/create", (req, res) => {
  res.render("create", {
    title: "CREATE PAGE",
  });
});

// ==========================================================
router.post(
  "/api/books/",
  urlebcodedparser,
  fileMulter.single("fileBook"),
  async (req, res) => {
    // Непосредственно запись в STATE новой книги
    console.log("=============== ID ========== ", req.body.id);
    const {
      id,
      title = "Название книги",
      description,
      authors,
      favorite,
      fileCover,
      fileName = req.file.originalname,
      // fileBook = req.file.filename,
    } = req.body;

    const newBook = {
      id,
      title,
      description,
      authors,
      favorite,
      fileCover,
      fileName,
      // fileBook
    };
    // Проверка - Редактирование или новая
    let host = null;
    let method = null;
    if (req.body.id) {
      // Делаем UPDATE
      host = `${SECONDAPP_URL}/api/books/${id}`;
      method = "put";
    } else {
      // Просто добавляем новую
      host = `${SECONDAPP_URL}/api/books`;
      method = "post";
    }
    try {
      const response = await fetch(host, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });
      const data = await response.json();
    } catch (e) {
      console.log("router.post /delete/:id", {
        errorcode: 500,
        errmassage: "router.post /delete/:id",
        err: e,
      });
      res.status(404);
      res.json({
        status: 404,
        errormsg: "404 | страница не найдена",
      });
    }
    res.status(201);
    res.redirect("/");
  }
);

// ==========================================================
router.get("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`${SECONDAPP_URL}/api/books/${id}`);
    const data = await response.json();
    res.render("update", {
      title: "UPDATE PAGE",
      item: data.book,
    });
  } catch {
    res.jsom({ msg: "Ошибка /update/:id" });
  }
});

// ==========================================================
router.get("/view/:id", async (req, res) => {
  const { id } = req.params;
  console.log("======= /view/:id", id);

  try {
    // Получаем книгу
    const response = await fetch(`${SECONDAPP_URL}/api/books/${id}`);
    const data = await response.json();
    // Увеличиваем счетчик просмотров
    const responseIncr = await fetch(`${SECONDAPP_URL}/counter/${id}/incr`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
    });
    // const dataIncr = await responseIncr.json();
    // Получаем текущее значение счетчик
    const responseCount = await fetch(`${SECONDAPP_URL}/counter/${id}`);
    const cntObj = await responseCount.json(); // Получаем значение из RADIS
    cnt = Number(cntObj[id]);
    // Рендер страницы
    res.status(200);
    res.render("view", {
      title: "VIEW PAGE",
      item: data.book,
      cnt: cnt,
    });
  } catch {
    res.status(404);
    res.json({ message: "Ошибка /view/:id" });
  }
});

module.exports = router;
