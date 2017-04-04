var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/'));

// The request body is received on GET or POST.
// A middleware that just simplifies things a bit.
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// Set views path, template engine and default layout
app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

// Read the tas and courses into local object (local database) as soon as the
// server starts
var data = require('./tas.json');
var courses = require('./courses.json');

// Get the index page:
app.get('/', function(req, res) {
    res.render('tapp', { 
        errors: ''
    });
});

// Get all applicants ordered by Family Name
function getApplicants(req, res){
    
    // Check if the query specifies a status
    if(req.query.status !== undefined) {
        getApplicantsByStatus(req.query.status, res);
        return res.json;
    }
    
    // Check if the query specifies a Family Name
    if(req.query.fname !== undefined) {
        getApplicantInfo(req.query.fname, res);
        return res.json;
    }
    
    // Get a list of all applicants formatted properly
    var lastNames = [];
    for(var i=0; i < data.tas.length; i++) {
        let a = data.tas[i];
        let info = {stunum: a.stunum, givenname: a.givenname, familyname: a.familyname, 
                        status: a.status, year: a.year};
        lastNames.push(info);
    }
    
    // Sort by Family Name
    lastNames.sort(compare);
    
    return res.json ({
        tas: lastNames
    });
}

// Get all applicants with a given status (Status is Undergrad, MSc, PhD,
// MScAC, MEng)
function getApplicantsByStatus(req, res){  
    var lastNames = [];
    for(var i=0; i < data.tas.length; i++) {
        let a = data.tas[i];
        if(a.status === req) {
            let info = {stunum: a.stunum, givenname: a.givenname, familyname: a.familyname, 
                        status: a.status, year: a.year};
            lastNames.push(info);
        }
    }

    // Sort by Family Name
    lastNames.sort(compare);
    
    return res.json ({
        tas: lastNames
    });
}

// Get the information about an applicant with a particular Family Name
function getApplicantInfo(req, res){
    var info = null;
    for(var i=0; i < data.tas.length; i++) {
        let a = data.tas[i];
        if(a.familyname === req) {
            info = a;
        }
    }
    
    return res.json(info);
}

// Add a new applicant
function addApplicant(req, res){
    
    // Check is applicant with the student number has already applied before
    for(var i=0; i < data.tas.length; i++) {
        let a = data.tas[i];
        if(req.body.stunum === a.stunum) {
            return res.send("Error: duplicate student number");
        }
    }
    
    // Add ta to local database
    data.tas.push(req.body);
    return res.send("Success");
}

// Remove applicant by family name or student number
function deleteApplicant(req, res){
    
    if(req.query !== undefined) {
        var len = data.tas.length;
        var info = null;
        
        // Search for specified applicant in the database
        for(var i=0; i < data.tas.length; i++) {
            let a = data.tas[i];
            
            // Check by fname or stunum, depending on the query
            if(req.query.fname !== undefined) {
                if(a.familyname === req.query.fname) {
                    data.tas.splice(i, 1);
                }
            }
            else if(req.query.stunum !== undefined) {
                if(a.stunum === req.query.stunum) {
                    data.tas.splice(i, 1);
                }
            }

        }
        
        // If no applicant was removed, then they do not exist in the database
        if(data.tas.length === len) {
            res.send("Error: no such student");
        }
        else {
            res.send("Success");
        }
    }
    
    // Error check for invalid delete request
    else {
        return res.json({
            error: 'Invalid delete request'
        });
    }
    
}

// Get applicants for each course. For each course, list all the applicants who
// applied for that course ordered by ranking
function getCoursesApplicants(req, res){
    
    // Check if course code to search by is specified in the request query
    if(req.query.course !== undefined) {
        getCourseApplicants(req.query.course, res);
        return res.json;
    }

    // Get all applicants for all courses if there is no query
    var c = courses.courses;
    var answer = { courses: []};
    
    // Go through all the courses
    for(var i=0; i<c.length; i++) {
        
        // Get tas for a single course
        var obj = getTAs(c[i]);
        answer.courses.push({code: c[i], tas: obj.tas});
    }
    
    return res.json(answer);
}

// Get all applicants who have applied for a particular course ordered by
// ranking
function getCourseApplicants(req, res) {
    return res.json({
        code: req,
        tas: getTAs(req).tas
    });
}

// Helper function that returns all the applicants for a specified course 
// ordered by ranking
function getTAs(course) {
    var ans = {tas: []};
    var d = data.tas;
    
    // Go through all the tas
    for(var j=0; j<d.length; j++) {
        var personcourses = d[j].courses;
        var k = 0;
        
        // Go through all the courses of a single ta and check if they have
        // applied for the specified course
        while(k < personcourses.length){
            if(personcourses[k].code === course) {
                var person = {stunum: d[j].stunum, givenname:d[j].givenname,
                              familyname: d[j].familyname,
                              status: d[j].status, year: d[j].year,
                              ranking: personcourses[k].rank,
                              experience: personcourses[k].experience};
                ans.tas.push(person);
                k = personcourses.length;
            }
            k++;                                        
        }
    }
    
    // Sort by ranking
    ans.tas.sort(compareTAs);
    return ans;
}

// Helper function to sort accroding to familyname
function compare(a,b) {
      if (a.familyname < b.familyname)
        return -1;
      if (a.familyname > b.familyname)
        return 1;
      return 0;
}

// Helper function to sort according to ranking
function compareTAs(a,b) {
      if (a.ranking < b.ranking)
        return -1;
      if (a.ranking > b.ranking)
        return 1;
      return 0;
}

// Helper function to return the courses in the local database
function checkCourseCode(req, res) {
    return res.json(courses);
}

// Routes
app.get('/applicants', getApplicants);
app.post('/applicants', addApplicant);
app.delete('/applicants', deleteApplicant);
app.get('/courses', getCoursesApplicants);
app.get('/course', checkCourseCode);


app.listen(process.env.PORT || 3000);
console.log('Listening on  http://localhost:3000');
