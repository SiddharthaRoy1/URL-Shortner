mongoose = require('mongoose');
// Database URL

const DATABASE = 'mongodb+srv://Siddhartha123:tylerdurden@cluster0.6o2da.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
mongoose.connect(DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('error', (err) => {
  console.log("Mongoose Connection error" + err.message);
});

mongoose.connection.once('open', () => {
  console.log("MongoDB connected");
});

// Import Model
require('./models/Url');

const express = require('express');
const fs = require('fs');
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Url = mongoose.model('Url');

// GET request to serve index.html
app.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  fs.readFile('./index.html', null, function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write('Route not found!');
    } else {
      res.write(data);
    }
    res.end();
  });
})
// GET request to redirect the shortened URL to the original URL
app.get('/:route', async (req, res) => {
  const route = req.params.route;
  const instance = await Url.findOne({id: route});
  if(instance) {
    instance.visitors = instance.visitors + 1;
    await instance.save();
    res.redirect(instance.url)
  } else {
    res.send("404")
  }
})
// GET request to serve count.html and show analytics
app.get('/analytics/:route', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  fs.readFile('./count.html', null, function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write('Route not found!');
    } else {
      res.write(data);
    }
    res.end();
  });
})
// POST request to send the number of visitors to count.html
app.post('/analytics', async (req, res) => {
  const route = req.body.route;
  const instance = await Url.findOne({id: route});
  res.send({
    visitors: instance.visitors,
    message: "Number of visitors sent!"
  })
})
// POST request for shortening the URL
app.post('/', async (req, res) => {
  const url = req.body.url;
  const instance = new Url({
    url: url,
    visitors: 0
  });
  short = JSON.stringify(instance._id)
  const id = short.slice(short.length-7, short.length-1)
  instance.id = id;
  await instance.save()
  res.send({
    message: `${id} was created`,
    url: id,
  });
})

app.listen(port, () => {
  console.log('Listening on port ${port}');
})
