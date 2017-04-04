var mongoose = require('mongoose');
var url = 'mongodb://victorwu:victorwupass@ds119718.mlab.com:19718/deliverydb';

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
FoodItem = require('./food.js');
Food = mongoose.model('FoodItem').schema;
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var orderSchema = new Schema(
    {
        userEmail: {
            type: String, required: true  
        },
        orderTime: {
            type: String, required: true
        },
        specialRequests: {
            type: String, required: false
        },
        status: {
            type: String, required: true
        },
        totalPrice: {
            type: Number, required: true
        },
        orderDate: {
            type: Date, required: true
        },
        foodItems: [ {
            item: {
                type: String, required: true
            }
        }
        ]
        
    },
    {
        collection: 'orders'
    }
);

orderSchema.virtual('orderID').get(function() {
    return this._id;
});

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.Promise = global.Promise;
var conn = mongoose.createConnection('mongodb://victorwu:victorwupass@ds119718.mlab.com:19718/deliverydb');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = conn.model('Order', orderSchema);