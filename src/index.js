const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const UserModel = require('./models/user.model');
const MessageModel = require('./models/message.model');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('assets'));

io.on('connection', (socket) => {
  socket.on('new::user', async (data) => {
    const currentTime = new Date().toLocaleTimeString();
    const currentTimeOffline = new Date();

    const user = await UserModel.findById({ _id: data });

    user.socketId = socket.id;
    await user.save();

    const messages = await MessageModel.find({}).exec();
    const users = await UserModel.find({}).exec();

    io.emit('add::user', { users, time: currentTimeOffline.getTime() });
    io.emit('message::history', { messages, count: messages.length });
    io.emit('bot::mess', { message: `User ${user.name} connected`, name: 'OnixChat Bot', time: currentTime });
  });

  socket.on('disconnect', async () => {
    const user = await UserModel.findOne({ socketId: socket.id });
    if (user) {
      const currentTime = new Date().toLocaleTimeString();
      const currentTimeOffline = new Date().getTime();
      user.socketId = null;
      user.offlineTime = currentTimeOffline;
      await user.save();
      io.emit('bot::mess', { message: `User ${user.name} disconnected`, name: 'OnixChat Bot', time: currentTime });
    }
  });

  socket.on('send::mess', async (data) => {
    const user = await UserModel.findOne({ socketId: socket.id });

    const currentTime = new Date().toLocaleTimeString();

    const message = new MessageModel({
      name: user.name,
      message: data.message,
      time: currentTime,
    });
    await message.save();
    const messNumb = await MessageModel.countDocuments({});

    io.emit('add::mess', {
      message: data.message, name: user.name, time: currentTime, count: messNumb,
    });
  });

  socket.on('user::typing', (data) => {
    socket.broadcast.emit('user::typing', {
      name: data.name,
    });
  });
});

app.get('/chat', async (req, res) => {
  if (req.cookies.id) {
    const user = await UserModel.findById({ _id: req.cookies.id });

    if (user) {
      return res.status(200).render('chat', {
        user_name: user.name,
        user_id: user.id,
      });
    }
    return res.status(400).redirect('/auth/sign-up');
  }
  return res.status(400).redirect('/auth/sign-up');
});

app.get('/auth/sign-up', (req, res) => {
  res.render('signup');
});
app.post('/auth/sign-up', async (req, res) => {
  const user = new UserModel({
    name: req.body.name,
    password: req.body.password,
  });
  await user.save();
  res.status(201).redirect('/auth/sign-in');
});

app.get('/auth/sign-in', (req, res) => {
  res.render('signin');
});
app.post('/auth/sign-in', async (req, res) => {
  const user = await UserModel.findOne({ name: req.body.name, password: req.body.password });
  if (user) {
    return res.status(200).cookie('id', user.id).redirect('/chat');
  }
  return res.status(401).redirect('/auth/sign-up');
});

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
