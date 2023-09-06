const express = require("express");
const indexRouter = require("./routers/index");

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use("/", indexRouter);
app.use("/css", express.static(__dirname + "/css"));
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(
        `=== Основное приложение Express запущено на ${PORT} порту ===`
      );
    });
  } catch (e) {
    console.log({
      massage: "Ошибка при старте Первого приложения",
      error: e,
    });
  }
}

start();
