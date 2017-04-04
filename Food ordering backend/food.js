var mongoose = require('mongoose');
var url = 'mongodb://victorwu:victorwupass@ds119718.mlab.com:19718/deliverydb';

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var foodItemSchema = new Schema(
    {
        name: {
            type: String, required: true
        },
        description: {
            type: String, required: false
        },
        mealCategory: {
            type: String, required: false
        },
        vegetarian: {
            type: Boolean, required: true
        },
        vegan: {
            type: Boolean, required: true
        },
        glutenFree: {
            type: Boolean, required: true
        },
        price: {
            type: Number, default: 0
        }
    },
    {
        collection: 'foods'
    }

);

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.Promise = global.Promise;
var conn = mongoose.createConnection('mongodb://victorwu:victorwupass@ds119718.mlab.com:19718/deliverydb');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = conn.model('FoodItem', foodItemSchema);