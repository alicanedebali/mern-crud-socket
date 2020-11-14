const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socket = require('socket.io');

const Products = require('./models/products');
// Use Node's default promise instead of Mongoose's promise library
mongoose.Promise = global.Promise;

// Connect to the database
mongoose.connect('mongodb+srv://alican:alicanedebali@cluster0.w4uzc.mongodb.net/deneme?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

let db = mongoose.connection;

db.on('open', () => {
  console.log('Connected to the database.');
});

db.on('error', (err) => {
  console.log(`Database error: ${err}`);
});

// Instantiate express
const app = express();

// Don't touch this if you don't know it
// We are using this for the express-rate-limit middleware
// See: https://github.com/nfriedly/express-rate-limit
app.enable('trust proxy');

// Set public folder using built-in express.static middleware
app.use(express.static('public'));

// Set body parser middleware
app.use(bodyParser.json());

// Enable cross-origin access through the CORS middleware
// NOTICE: For React development server only!
if (process.env.CORS) {
  app.use(cors());
}

// Use express's default error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ err: err });
});

// Start the server
const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Set up socket.io
const io = socket(server, { origins: '*:*'});
var online = 0;
io.on('connection', (socket) => {

  online++;
  console.log(`Socket ${socket.id} connected.`);
  console.log(`Online: ${online}`);
  io.emit('visitor enters', {online:online});

  socket.on('productChange', data =>{
    Products.watch().on('change',(change)=>{
      console.log('Something has changed');
      return io.emit('productChange', change.fullDocument)
    })
  });
  socket.on('products', data =>{//
    Products.find({})
        .then((result) => {
          return io.emit('products',JSON.stringify(result))
        })
        .catch((err) => {
          return JSON.stringify({success: false, msg: `Something went wrong. ${err}`});
        });
  });

  socket.on("create", data=>{
   let datas= JSON.parse(data);
    let newProducts = new Products({
      name: datas.name,
      img: datas.img,
      price: datas.price,
      category: datas.category
    });

    newProducts.save()
        .then((result) => {
          console.log(result); //dene
          let results= JSON.stringify({
            success: true,
            msg: `Successfully added!`,
            result: {
              name: result.name,
              img: result.img,
              price: result.price,
              category: result.category
            }
          });
           socket.broadcast.emit('productUpdate', results)
        })
        .catch((err) => {
          console.log(err);
          if (err.errors) {
            if (err.errors.name) {
              return JSON.stringify({success: false, msg: err.errors.name.message});
            }
            if (err.errors.img) {
              return JSON.stringify({success: false, msg: err.errors.img.message});
            }
            if (err.errors.price) {
              return JSON.stringify({success: false, msg: err.errors.price.message});

            }
            if (err.errors.category) {
              return JSON.stringify({success: false, msg: err.errors.category.message});

            }
            // Show failed if all else fails for some reasons
            return JSON.stringify({success: false, msg: `Something went wrong. ${err}`});
          }
        });

    });

  socket.on('update', data => {
    let datas= JSON.parse(data);
    let updatedProducts = {
        id:datas.id,
      name: datas.name,
      img: datas.img,
      price: datas.price,
        category: datas.category
    };
    console.log(updatedProducts);
    Products.findOneAndUpdate({_id: datas.id}, updatedProducts, {runValidators: true, context: 'query'})
        .then((oldResult) => {
          Products.findOne({_id: datas.id})
              .then((result) => {
                let results= JSON.stringify({
                  success: true,
                  msg: `Successfully updated!`,
                  result: {
                    _id: result._id,
                    name: result.name,
                    img: result.img,
                    price: result.price,
                    category: result.category
                  }
                });
                  socket.broadcast.emit('productUpdate', results)
              })
              .catch((err) => {
                return JSON.stringify({success: false, msg: `Something went wrong. ${err}`});
              });
        })
        .catch((err) => {
          if (err.errors) {
            if (err.errors.name) {
              return JSON.stringify({success: false, msg: err.errors.name.message});

            }
            if (err.errors.email) {
              return JSON.stringify({success: false, msg: err.errors.email.message});

            }
            if (err.errors.age) {
              return JSON.stringify({success: false, msg: err.errors.age.message});

            }
            if (err.errors.gender) {
              return JSON.stringify({success: false, msg: err.errors.gender.message});

            }
            // Show failed if all else fails for some reasons
            return JSON.stringify({success: false, msg: `Something went wrong. ${err}`});
          }
        });

  });
  socket.on('delete', data => {
    let datas= JSON.parse(data);
    Products.findByIdAndRemove(datas.id)
        .then((result) => {
          let results= JSON.stringify({
            success: true,
            msg: `It has been deleted.`,
            result: {
              _id: result._id,
              name: result.name,
              img: result.img,
              price: result.price,
              category: result.category
            }
          });
          socket.broadcast.emit('productUpdate', results)
        })
        .catch((err) => {
          return JSON.stringify({success: false, msg: 'Nothing to delete.'});
        });
  });

  socket.on('disconnect', () => {
    online--;
    console.log(`Socket ${socket.id} disconnected.`);
    console.log(`Online: ${online}`);
    io.emit('visitor exits', {online:online, ouid:socket.id});
  });
});
