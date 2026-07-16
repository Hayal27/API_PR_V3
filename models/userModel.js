// const con = require("./db");

// //to get User
// const getAllUser = (req, res) => {
//   const sql = "SELECT * FROM user";
//   con.query(sql, (err, data) => {
//     if (err) return res.json("error1 " + err);
//     return res.json(data);
//   });
// };

// //to get User
// const getAllRoles = (req, res) => {
//   const sql = "SELECT * FROM role";
//   con.query(sql, (err, data) => {
//     if (err) return res.json("error1 " + err);
//     return res.json(data);
//   });
// };

// // add user into database
// const addUser = (req, res) => {
//   const { fname, lname, phone, email, role_id } = req.body;

//   const query = "INSERT INTO user(fname, lname, email, phone, role_id) VALUES (?, ?, ?, ?, ?)";
//   db.query(query, [fname, lname, phone, email, role_id], (err, result) => {
//     if (err) {
//       console.error("Database error:", err); // Log the actual database error
//       return res.status(500).send({ message: "Error saving user data", error: err.message });
//     }
//     res.status(200).send({ message: "User successfully registered" });
//   });
// };



// // change user status 
// const changeUserStatus =(req, res)=>{
//   const id=req.params.user_id;
//   const val=req.body.value;
//   con.query('UPDATE user SET status=? WHERE user_id=?', [val, id], (error, results)=>{
//     if(error){
//       // res.status.status(500).json({message:error})
//       console.log(error)
//     }else{
//       // res.status(200).json({message:'successfully changed'})
//       console.log('success', results)
//     }
//   } )
//   res.status(200).json({message:"successfully Updated"})
//   }
// module.exports = { getAllUser, getAllRoles, addUser, changeUserStatus };
