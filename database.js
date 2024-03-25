const {createPool}=require('mysql')
const pool=createPool({
    host:"localhost",
    user:"root",
    password:"Deekshana@163",
    database:"db1",
    connectionLimit:10
})

pool.query("select *from students",(err,result,fields)=>{
    if(err){
        return console.log(err)
    }
    return console.log(result)
})


const newStudent = { Names: "John", Age: 25, DOB: "1999-01-01", City: "New York" };


pool.query("INSERT INTO students SET ?", newStudent, (err, result) => {
    if (err) {
        return console.error(err);
    }
    console.log("Inserted new student with ID:", result.insertId);
})

const studentIdToDelete = 1; // Assuming you want to delete a student with Sno = 1

pool.query("DELETE FROM students WHERE Sno = ?", [studentIdToDelete], (err, result) => {
    if (err) {
        return console.error(err);
    }
    console.log("Deleted", result.affectedRows, "student(s).");
});


const studentToUpdate = { Names: "John Doe", Age: 26, DOB: "1998-01-01", City: "Los Angeles" };
const studentIdToUpdate = 4; // Assuming you want to update a student with Sno = 2

pool.query("UPDATE students SET ? WHERE Sno = ?", [studentToUpdate, studentIdToUpdate], (err, result) => {
    if (err) {
        return console.error(err);
    }
    console.log("Updated", result.affectedRows, "student(s).");
});
