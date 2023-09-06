const express = require("express");
const http = require('http');
const socketIO = require('socket.io');
const indexRouter = require("./routers/index");



const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.set("view engine", "ejs");
app.use(express.json());
app.use("/", indexRouter);
app.use("/css", express.static(__dirname + "/css"));

io.on('connection', (socket) => {
  console.log('IO connection');
  const {id} = socket;
  console.log(`Socket connected: ${id}`);

  // сообщение себе
  socket.on('message-to-me', (msg) => {
      console.log('server ME');
      msg.type = 'me';
      socket.emit('message-to-me', msg);
  });

  // сообщение для всех
  socket.on('message-to-all', (msg) => {
      console.log('server ALL');
      msg.type = 'all';
      socket.broadcast.emit('message-to-all', msg);
      socket.emit('message-to-all', msg);
  });

  // работа с комнатами
  const {roomName} = socket.handshake.query;
  console.log(`Socket roomName: ${roomName}`);
  socket.join(roomName);
  socket.on('message-to-room', (msg) => {
      console.log('server ROOM');
      msg.type = `room: ${roomName}`;
      socket.to(roomName).emit('message-to-room', msg);
      socket.emit('message-to-room', msg);
  });

  socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${id}`);
  });
});

const PORT = process.env.PORT || 3000;
async function start() {
  try {
    server.listen(PORT, () => {
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
