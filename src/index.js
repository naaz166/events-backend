/// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

const { Evt } = require('../models/evt');
const { Cart } = require('../models/cart');
const { User } = require('../models/user');
const { Todo} = require('../models/todo')
mongoose.connect('mongodb+srv://Naaz:1234mongo@cluster0.vxnlo.mongodb.net/events?retryWrites=true&w=majority');
const port = process.env.PORT || 3001
// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));


app.post('/auth', async (req,res) => {
  const user = await User.findOne({ username: req.body.username })
  console.log(req.body)
  console.log("test")
  if(!user) {
    return res.sendStatus(401);
  }
  if( req.body.password !== user.password ){
    return res.sendStatus(403)
  }

  user.token = uuidv4()
  await user.save()
  res.send({token: user.token})

})

app.use( async (req,res,next) => {
  const authHeader = req.headers['authorization']
  const user = await User.findOne({token: authHeader})
  if(user) {
    next()
  }else {
    res.sendStatus(403);
  }
})


// defining CRUD operations

app.post('/', async (req, res) => {
  const newEvt = req.body;
  const evt = new Evt(newEvt);
  await evt.save();
  res.send({ message: 'New event added.' });
});
app.get('/', async (req, res) => {
  res.send(await Evt.find());
});


app.delete('/:id', async (req, res) => {
  await Evt.deleteOne({ _id: ObjectId(req.params.id) })
  res.send({ message: 'Event  removed.' });
});

app.put('/:id', async (req, res) => {
  await Evt.findOneAndUpdate({ _id: ObjectId(req.params.id)}, req.body )
  res.send({ message: 'Event updated.' });
});




// defining CRUD operations
app.get('/todo', async (req, res) => {
  res.send(await Todo.find());
});

app.post('/todo', async (req, res) => {
  const newTodo = req.body;
  const todo = new Todo(newTodo);
  await todo.save();
  res.send({ message: 'New todo inserted.' });
});

app.delete('/todo/:id', async (req, res) => {
  await Todo.deleteOne({ _id: ObjectId(req.params.id) })
  res.send({ message: 'todo removed.' });
});

app.put('/todo/:id', async (req, res) => {
  await Todo.findOneAndUpdate({ _id: ObjectId(req.params.id)}, req.body )
  res.send({ message: 'todo updated.' });
});






// starting the server
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log("Database connected!")
});
