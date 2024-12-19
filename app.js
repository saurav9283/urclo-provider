require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
const socketIO = require('socket.io');
var indexRouter = require('./routes/index');
const bodyParser = require('body-parser');
const SubProviderRouter = require('./routes/Provider/sub-provider/sub-provider.router.js');
const ProviderRouter = require('./routes/Provider/providerAuth/providerAuth.router.js');
const ProviderOdditRouter = require('./routes/Provider/providerOddit/provider.oddit.router.js');
const RabbitConnect = require('./utils/RabbitMQ .js');
const {providerNotifyService} = require('./routes/Provider/providerNotify/provider.notify.service.js');

var app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
})

app.set('io', io);


app.use(cors("*"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public/images')));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use('/', indexRouter);
app.use('/api/provider-auth', ProviderRouter);
app.use('/api/provider', ProviderOdditRouter);
app.use('/api/sub-provider', SubProviderRouter)

app.get('/api', (req, res) => {
  res.send("Api is working fine")
})

RabbitConnect.subscribeToQueue("provider_message_queue", async(message) => {
  try {
    console.log('Received message:', JSON.parse(message));
    const { user_id, provider_id, schedule_time } = JSON.parse(message);
    await providerNotifyService(user_id, provider_id, schedule_time);
  } catch (error) {
    console.error('Error processing RabbitMQ message:', error);
  }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

RabbitConnect.connect();

const PORT = "4956";
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

module.exports = app;