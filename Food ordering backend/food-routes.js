var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var FoodItem = require('../models/food');
var Order = require('../models/order');
var User = require('../models/user');
var app = express();

var activeStatus = ["placed", "prep", "cooking"];

app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/'));

// The request body is received on GET or POST.
// A middleware that just simplifies things a bit.
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(cors());

// Get the index page:
app.get('/', function(req, res) {
    res.sendfile('./public/index.html');
});


/**
* GET - Return all items on the menu.
*
* URL - /menu
*/
function allItems(req, res){    
    FoodItem.find({}, function (err, menu) {      
        if (err) throw err;
        return res.send(menu);
    });
}


/**
* GET - Return user with specified email.
*
* URL - /logIn?email=abc@g.com
*/
function logIn(req, res){
    if(req.query.email === undefined) {
        return res.send("Error: email undefined");
    }
    User.findOne({'email': req.query.email}, function (err, user) {
        if (err) throw err;
        if(user === null) {
            return res.send("Error: No such user exists"); 
        }
        return res.json(user);
    });    
}


/**
* POST - Store information of new user and 
* return this user.
*
* URL - /signUp
*/
function signUp(req, res) { 
    if(req.body.email === undefined) {
        return res.send("Error: no info");
    }
    var newUser = new User(req.body);
    newUser.save(function(err, newUser) {
        if (err) throw err;
        return res.json(newUser);
    });
}


/**
* POST - Store new information about existing user.
*
* URL - /updateProfile
*/
function updateUserProfile(req, res) {
    if(req.body.userID === undefined){
        return res.send("Error: no user specified");
    }
    User.findById(req.body.userID, function (err, user) {
        if (err) throw err;
        if(user === null) {
            return res.send("Error: No such User exists");
        }

        user.name = req.body.name;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.address = req.body.address;
        user.password = req.body.password;
        
        user.save(function(err) {
            if (err) throw err;
            return res.send('Success');
        });
        
    });
    
}


/**
* GET - Return all the customer users' userId, name, and email.
*
* URL - /customers
*/
function getCustomers(req, res) {
    var answer = [];
    
    User.find({}, function(err, users) {
        if (err) throw err;
        for(var i = 0; i<users.length; i++) {
            if(!users[i].admin) {
                answer.push({userId: users[i]._id, name: users[i].name, email: users[i].email});
            }
        }
        return res.json(answer);
    });    
}


/**
* GET - Return all user profiles.
*
* URL - /users
*/
function getAllUsers(req, res) {
    User.find({}, function(err, users) {
        if (err) throw err;
        return res.json(users);
    }); 
}



// Customer requests


/**
* POST - Store an order placed by a customer and return it.
*
* URL - /order
*/
function placeOrder(req, res) {
    if(req.body.userEmail === undefined) {
        return res.send("Error: no order");
    }
    var order = req.body;
    var newOrder = new Order(order);
    
    newOrder.save(function(err, newOrder) {
        if (err) throw err;
        return res.send(newOrder);
    });   
}


/**
* GET - Return the five most recent orders of the specified customer. 
*
* URL - /order?email=abc@g.com
*/
function getOrders(req, res) {
    var answer = [];
    if(req.query.email === undefined) {
        return res.send("Error: no email specified");
    }
    Order.find({userEmail: req.query.email}, function(err, orders) {
        if (err) throw err;
        orders.sort(compare);
        if(orders.length <= 5) {
            answer.push({orders: orders});
        }
        else {
            answer.push({orders: orders.slice(0,6)});   
        }
        return res.json(answer);
    });
}

function getOrder(req, res) {
    Order.find({userEmail: req.query.email}, function(err, orders) {
        if (err) throw err;
        orders.sort(compare);
        return res.json(orders[0]);
    });
}

/**
* GET - Return the order status of the specified order.
* 
* URL - /status?orderID=584342b42f98df8965985b69
*/
function getOrderStatus(req, res) {
    if(req.query.orderID === undefined) {
        return res.send("Error: orderID undefined");
    }        
    Order.findOne({_id: req.query.orderID}, function(err, order) {
        if (err) throw err;
        return res.send(order.status);
    });
}



// Admin requests


/**
* GET - Return all customer orders that have been placed but not delivered.
*
* URL - /activeOrders
*/
function getActiveOrders(req, res) {
    Order.find({status: { $in: activeStatus}}, function(err, orders) {
        if (err) throw err;
        return res.json(orders);
    });
}


/**
* POST - Store the new order status for a specific order. 
* 
* URL - /orderStatus
*/
function updateOrderStatus(req, res) {   
    if(req.body.orderID === undefined) {
        return res.send("Error: no orderID specified");
    }
    Order.findOne({_id: req.body.orderID}, function(err, order) {
        if (err) throw err;
        if(order === null){
            return res.send("Error: no such order exists");
        }
        order.status = req.body.status;
        order.save(function(err, order) {
            if (err) throw err;
            return res.json("Success");
        });
    });
}


/**
* POST - Store new menu item and return it. 
*
* URL - /menu
*/
function addMenuItem(req, res) {    
    var newItem = new FoodItem(req.body);
    console.log(newItem);
    
    newItem.save(function(err, newItem) {
        if (err) throw err;
        return res.json(newItem);
    });
}


/**
* DELETE - Remove specified menu item from database.
*
* URL - /menu
*/
function deleteMenuItem(req, res) {
    FoodItem.findOne({_id: req.body.itemID}, function(err, item) {
        if (err) throw err;
        if(item === null) {
            return res.send("Error: no such item");
        }
        item.remove(function(err) {
            if (err) throw err;
            return res.send("Success");
        });
    });
}

/**
* DELETE - Remove specified user item from database.
*
* URL - /menu
*/
function deleteUser(req, res) {
    User.findOne({_id: req.body.userID}, function(err, user) {
        if (err) throw err;
        if(user === null) {
            return res.send("Error: no such user");
        }
        user.remove(function(err) {
            if (err) throw err;
            return res.send("Success");
        });
    });
}

// Helper function to sort orders by date
function compare(a,b) {
      if (a.orderDate < b.orderDate)
        return -1;
      if (a.orderDate > b.orderDate)
        return 1;
      return 0;
}

// Routes
app.get('/ord', getOrder);
app.get('/menu', allItems);
app.get('/login', logIn);
app.post('/signUp', signUp);
app.post('/updateProfile', updateUserProfile);
app.get('/customers', getCustomers);
app.get('/users', getAllUsers);

app.post('/order', placeOrder);
app.get('/order', getOrders);
app.get('/status', getOrderStatus);

app.get('/activeOrders', getActiveOrders);
app.post('/orderStatus', updateOrderStatus);
app.post('/menu', addMenuItem);
app.delete('/menu', deleteMenuItem);
app.delete('/user', deleteUser);

// Start the server
app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');