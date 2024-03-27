const http = require('http');
const url = require('url');

const mysql = require('mysql'); //Import the MySQL module
const cors = require('cors'); 


//MySQL connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Deekshana@163",
    database: "db1",
    connectionLimit: 10
});

//handle database queries
function queryDatabase(query, values) {
    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

//HTTP server
const server = http.createServer((req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*'); //Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    //preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        
        res.writeHead(200);
        res.end();
        return;
    }
   
    const parsedUrl = url.parse(req.url, true);

    const path = parsedUrl.pathname;

    const method = req.method;
   //GET requests to the '/reads' endpoint
if (method === 'GET' && path === '/reads') {

    //database to fetch all student details
    const sql = "SELECT * FROM students";
    pool.query(sql, (err, result) => {
        if (err) {
            console.error("Error:", err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }

        if (result.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('No student data found');
        }
    });
    return;
}

    //POST requests to the '/submit' endpoint
    if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); //Convert Buffer to string
        });
        req.on('end', async () => {
            

            try {
                const formData = JSON.parse(body);

            //Insert data into the database
            const sql = "INSERT INTO students (Names, Age, DOB, City) VALUES (?, ?, ?, ?)";
            const values = [formData.name, formData.age, formData.dob, formData.city];
          
                const result = await queryDatabase(sql, values);
                
                console.log("Inserted new student with ID:", result.insertId);

                console.log("Received data:", values);
 
                //Send response back to the client
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Data received and stored successfully!');
            } catch (error) {
                console.error("Error:", error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
        });
        return;
    }

    //PUT requests to the '/updates' endpoint
if (method === 'PUT' && path === '/updates') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const formData = JSON.parse(body);

            // Initialize SQL query and values array
            let sql = "UPDATE students SET";
            let values = [];
            let isFirstField = true;

            //Loop through formData and construct the SQL query dynamically
            for (const field in formData) {
                if (formData[field] !== '' && field !== 'id') { //Exclude empty and 'id' fields
                    if (!isFirstField) {
                        sql += ",";
                    }
                    sql += ` ${field}=?`;
                    values.push(formData[field]);
                    isFirstField = false;
                }
            }

            //Add condition for the specific student ID
            sql += " WHERE Sno=?";

            values.push(formData.id);

            //Execute the SQL query
            const result = await queryDatabase(sql, values);
            
            console.log("Updated student with ID:", formData.id);

            console.log("Received data:", values);

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Data received and updated successfully!');
        } catch (error) {
            console.error("Error:", error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    });
    return;
}

  //DELETE requests to the '/deletes' endpoint
if (req.method === 'DELETE' && req.url === '/deletes') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const formData = JSON.parse(body);

            //Extract the value from the request data
            const Sno = formData.Sno;

            //Delete data from the database based on the ID
            const sql = "DELETE FROM students WHERE Sno = ?";
            const values = [Sno];
            const result = await queryDatabase(sql, values);

            if (result.affectedRows > 0) {
                console.log(`Deleted student with ID ${Sno}`);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`Student with ID ${Sno} deleted successfully!`);
            } else {
                // If no rows were affected, the student with that ID doesn't exist
                console.log(`Student with ID ${Sno} not found`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`Student with ID ${Sno} not found`);
            }
        } catch (error) {
            console.error("Error:", error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    });
    return;
}

    //other requests (e.g., serving HTML files)
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
});

//Start the server
const PORT = process.env.PORT || 6030;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
