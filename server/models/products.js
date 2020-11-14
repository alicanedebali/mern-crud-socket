const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validate = require('mongoose-validator');

const nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 40],
    message: 'Name must not exceed {ARGS[1]} characters.'
  })
];

// Define the database model
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    validate: nameValidator
  },
  img: {
    type: String,
    required: [false, 'Image is not required.'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required.'],
  },
  price_history: {
    type: Array,
    //required: [true, 'Price History is required.'],
  },
  category: {
    type: Number,
   // required: [true, 'Category is required.'],
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// Use the unique validator plugin
ProductSchema.plugin(unique, { message: 'That {PATH} is already taken.' });

const Products = module.exports = mongoose.model('products', ProductSchema);


