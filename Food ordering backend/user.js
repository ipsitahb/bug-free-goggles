var mongoose = require('mongoose');
var url = 'mongodb://victorwu:victorwupass@ds119718.mlab.com:19718/deliverydb';

// Doc for Mongoose Schemas: http://mongoosejs.com/docs/guide
Order = require('./order.js');
Ord = mongoose.model('Order').schema;
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var userSchema = new Schema(
    {
        name: {
            type: String, required: true
        },
        email: {
            type: String, required: true
        },
        phone: {
            type: String, required: true
        },
        address: {
            type: String, required: true
        },
        password: {
            type: String, required: true
        },
        admin: {
            type: Boolean, required: true
        }
    },
    {
        collection: 'users'
    }

);

// Doc for Mongoose Connections: http://mongoosejs.com/docs/connections
mongoose.Promise = global.Promise;
var conn = mongoose.createConnection('mongodb://victorwu:victorwupass@ds119718.mlab.com:19718/deliverydb');

// Doc for Mongoose Models: http://mongoosejs.com/docs/models
module.exports = conn.model('User', userSchema);