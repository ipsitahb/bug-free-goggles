'use strict';

// jQuery Document
$(document).ready(function() {
    
    // Get a list of all the courses from the sever as setup
    var courseCodes = [];
    getCourses();
    
    // Get all applicants from the server and update the html in the callback 
    // function
    $("#getApps").click(function() {
        $.get("/applicants", function(data) {
            displayApplicants(data, "getApps");
        });
    });
    
    // Get all applicants with the chosen status from the server and update the
    // html
    $("#status").change(function() {
        
        // Add the chosen status as the query of the request url
        let s = "/applicants?status=";
        s += document.getElementById("status").value;
        
        $.get(s, function(data) {
            displayApplicants(data, "getAppsByStatus");
        });
    });
    
    // Get applicant with the entered family name and update the html
    $("#fname").keypress(function(event) {
        
        // Execute code when enter key is pressed
        if(event.keyCode === 13){
            event.preventDefault(); 
            
            // Add the entered family name as the query of the request url
            let s = "/applicants?fname=";
            s += document.getElementById("fname").value; 
            
            $.get(s, function(data) {
                if(data === null){
                    alert("No applicant exists with this Family name.");
                }
                else{
                    displayApplicant(data, "getAppsByFName");   
                }
            });
        }
    });
    
    // Display the textboxes for applicant info when the "Add Applicant" menu
    // option is clicked
    $("#addApp").click(function() {
        document.getElementsByTagName("form")[0].style.display = "block";        
    });
    
    // Add a textbox for adding a course to a new applicants info
    $("#addCourse").click(function() {
        var add = document.getElementById("addCourse").parentElement;
        var course = document.createElement("input"); 
        
        // Set necessary attributes to the new text box
        course.setAttribute("type", "text");
        course.setAttribute("name", "course");
        course.setAttribute("placeholder", "code, rank, experience");
        course.setAttribute("pattern", ".*,.*,.*");
        add.appendChild(course);
        var br = document.createElement("br");
        add.appendChild(br);
    });
    
    // Add a new applicant when the form is submitted
    $("#adding").submit(function(event) {
        event.preventDefault();
        
        // Get all the info filled in the form
        var all = $( this ).serializeArray();
        var applicant = [];
        var info = {};
        
        // Add all info except the applicants courses to the json object
        for(var i=0; i<5; i++) {
            var name = all[i].name;
            var value = all[i].value;
            info[name] = value;
        }
        
        // Add all the applicants courses in the proper format to the json 
        // object
        info.courses = [];
        for(var j=5; j<all.length; j++) {
            
            // Split the info entered in the textbox by commas to get the code,
            // ranking, and experience
            var courseinfo = all[j].value.split(',');
            
            // Check if the course is a valid course by checking if its in the
            // list of course codes
            if($.inArray(courseinfo[0], courseCodes) === -1) {
                alert("Please enter a valid course code.");
                return;
            }
            else {
                info.courses.push({code:courseinfo[0], rank:courseinfo[1],
                                   experience:courseinfo[2]});
                console.log(info);
            }

        }
        // Post all the applicants info to the server if it is 
        // valid
        $.post("/applicants", info, function(response) {
            if(response === "Success") {
                alert("Applicant added!");
            }
            else {
                alert(response);
            }
        });
        return false;
    });
    
    // Display the textbox for applicant student number of family name when the
    // "Remove Applicant" menu option is clicked
    $("#deleteApp").click(function() {
        document.getElementsByTagName("form")[1].style.display = "block";        
    });
    
    
    // Delete an applicant by their family name(family names are assumed to be
    // unique)
    $("#deletingfname").keypress(function(event) {
        if(event.keyCode === 13){
            event.preventDefault(); 
            let s = "/applicants?fname=";
            let name = document.getElementById("deletingfname").value; 
            s += name;
            
            // Make a delete request to the server to delete the specified 
            // applicant
            $.ajax({
                url: s,
                type: "delete",
                dataType: "text",
                success: function(response) {
                    if(response === "Success"){
                        alert("The applicant has successfully been removed!");   
                    }
                    else{
                        alert("No applicant exists with the Family Name " 
                              + name); 
                    }
                },
                error: function (xhr, status, err) {
                    console.log(status, err.toString());
                }
            });
        }
    });
    
    // Delete an applicant by their student number   
    $("#deletingstunum").keypress(function(event) {
        if(event.keyCode === 13){
            event.preventDefault(); 
            let s = "/applicants?stunum=";
            let num = document.getElementById("deletingstunum").value;
            s += num;

            // Delete request to the server with the applicants student number
            // in the query
            $.ajax({
                url: s,
                type: "delete",
                dataType: "text",
                success: function(response) {
                    if(response === "Success"){
                        alert("The applicant has successfully been removed!");   
                    }
                    else{
                        alert("No applicant exists with the Student Number " 
                              + num); 
                    }
                },
                error: function (xhr, status, err) {
                    console.log(status, err.toString());
                }
            });
        }
    });
    
    // Get all courses and their applicant tas from the sever and update the 
    // html accordingly
    $("#allCourses").click(function() {
        $.get("/courses", function(data) {
            
            // Send the array of courses from the object recieved to the
            // display function
            displayCourseTas(data.courses, "allCourses");
        });
    });
    
    // Get the course with the entered course code from the server and update
    // the html
    $("#cid").keypress(function(event) {
        if(event.keyCode === 13){
            event.preventDefault(); 
            let c = document.getElementById("cid").value;
            
            // Check that the entered course is valid
            if($.inArray(c, courseCodes) === -1) {
                alert("Please enter a valid course code.");
                return;
            }
            
            let s = "/courses?course=" + c;            
            $.get(s, function(data) {
                
                // Send the single object recieved to the display function in 
                // an array
                displayCourseTas([data], "singleCourse");
            });
        }
    });
    
    // Display the tas of an array of courses as a table
    function displayCourseTas(data, id) {
        for(let i=0; i<data.length; i++) {
            var table = document.createElement("TABLE");
            table.setAttribute("class", "table");
            var caption = table.createCaption();
            caption.innerHTML = data[i].code;
            
            for(let j=0; j<data[i].tas.length; j++) {
                var row = table.insertRow(j);
            
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);

                cell1.innerHTML = data[i].tas[j].ranking;
                cell2.innerHTML = data[i].tas[j].experience;
                cell3.innerHTML = data[i].tas[j].status;
                cell4.innerHTML = data[i].tas[j].givenname;
                cell5.innerHTML = data[i].tas[j].familyname;  
            }
            var header = table.createTHead();
            var r = header.insertRow(0);
            var c1 = r.insertCell(0);
            c1.innerHTML = "<b>Rank</b>";
            var c2 = r.insertCell(1);
            c2.innerHTML = "<b>Experience</b>";
            var c3 = r.insertCell(2);
            c3.innerHTML = "<b>Status</b>";
            var c4 = r.insertCell(3);
            c4.innerHTML = "<b>Given Name</b>";
            var c5 = r.insertCell(4);
            c5.innerHTML = "<b>Family Name</b>";
            document.getElementById(id).appendChild(table);
        }
    }
    
    // Display the applicant sent in "data" as a paragraph on the html side
    function displayApplicant(data, id) {
        var desc = document.createElement("p");
        var info = "" + data.givenname + " " + data.familyname + ", " + 
            data.status + ", Year " + data.year + "<br> Courses:<br>";
        for(let i=0; i<data.courses.length; i++) {
            info += "Code: " + data.courses[i].code + ", Rank: " + 
                data.courses[i].rank + ", Experience: " + 
                data.courses[i].experience + "<br>";
        }
        desc.innerHTML = info; 
        document.getElementById(id).appendChild(desc);
    }
    
    // Display all the applicants as a table on the html side
    function displayApplicants(data, id){
        var applicants = data.tas;
        
        var table = document.createElement("TABLE");
        table.setAttribute("class", "table");
        
        let length = 0;

        $.each(applicants, function(key, val) {
            var row = table.insertRow(length);
            length++;

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);

            cell1.innerHTML = val.stunum;
            cell2.innerHTML = val.givenname;
            cell3.innerHTML = val.familyname;
            cell4.innerHTML = val.status;
            cell5.innerHTML = val.year;
        });
        
        var header = table.createTHead();
        var r = header.insertRow(0);
        var c1 = r.insertCell(0);
        c1.innerHTML = "<b>Student Number</b>";
        var c2 = r.insertCell(1);
        c2.innerHTML = "<b>Given Name</b>";
        var c3 = r.insertCell(2);
        c3.innerHTML = "<b>Family Name</b>";
        var c4 = r.insertCell(3);
        c4.innerHTML = "<b>Status</b>";
        var c5 = r.insertCell(4);
        c5.innerHTML = "<b>Year</b>";
        document.getElementById(id).appendChild(table);
    }
    
    // Get a list of all the courses from the server into a local copy
    function getCourses() {
        $.get("/course", function(response) {
            courseCodes = response.courses;
        });
    }
    
});
