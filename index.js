const express=require("express");
const bodyParser = require("body-parser");
const cors=require("cors");
const bcryptjs = require("bcryptjs");
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const URL="mongodb+srv://user:hztHmDTfkSGd1p4D@cluster0.mc3htnf.mongodb.net"
//const URL="mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@cluster0.mc3htnf.mongodb.net/Money-Manager";
const jwt = require("jsonwebtoken");
const SECRET="Money-Management-backend";


//ENV file configuration
//require("dotenv").config();

//CREATING instance of Express module
const app=express();
app.use(express.json());

//CORS enabling
app.use(cors());

//Middleware configuration
app.use(bodyParser.json());

// Authentication process //
const authenticate = (req,res,next) => {
    if (req.headers.authorization){
       try {
           let token=req.headers.authorization.split(" ")[1];
         
           const verify= jwt.verify(token,'Money-Management-backend');
               if(verify){
                   next();
               }
       }catch (error){
           res.status(401).json({message:"Unauthorized"});
       }
   }else{
       res.status(401).json({message:"invalid token"});
   }
}

//register //
app.post("/register", async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        req.body.password = hash;
        await db.collection("users").insertOne(req.body);
        await connection.close();
        res.json({
            message: "user registered added successfully"
        })
    } catch (error) {
        console.log(error);
    }
})

app.get("/users", async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        const result = await db.collection("users").find().toArray();
        await connection.close();
        res.json(result);
    } catch (error) {
        console.log(error);
    }
})

//login---------------------------------//
app.post("/", async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        const temp = await db.collection("users").findOne({ username: req.body.username })
        if (temp) {
            const match = await bcryptjs.compare(req.body.password, temp.password);
            if (match) {
                const token = jwt.sign({ _id: temp._id }, SECRET,{expiresIn:"90min"});
                console.log(token)
                res.json({ message: "successfully logged in", token ,id:temp._id,profile:temp.username})
            } else {
                res.json({ message: "incorrect password" })
            }
        } else { res.json({ message: "user not found,Kindly register before logging in" }) }
        await connection.close();

    } catch (error) {
        console.log(error);
    }
})

//portal//

//add expennse //
app.post("/portal/addexpense",authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        req.body.userid=mongodb.ObjectId(req.userid);
        await db.collection("addexpense").insertOne(req.body);
        await connection.close();
        res.json({
            message: "expense added successfully"
        })
    } catch (error) {
        console.log(error);
    }
})

// add income//
app.post("/portal/addincome",authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        //req.body.userid=mongodb.ObjectId(req.userid);
        await db.collection("addincome").insertOne(req.body);
        await connection.close();
        res.json({
            message: "income added successfully"
        })
    } catch (error) {
        console.log(error);
    }
})

//displat expense list//
app.get("/portal/expenselist",authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        const result = await db.collection("addexpense").find().toArray();
        await connection.close();
        res.json(result);
    } catch (error) {
        console.log(error);
    }
})

// display income list//
app.get("/portal/incomelist",authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        
        const result = await db.collection("addincome").find().toArray();
        await connection.close();
        res.json(result);
    } catch (error) {
        console.log(error);
    }
})

//find one expense//
app.get("/portal/expense/:id",authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        const result = await db.collection("addexpense").findOne({ _id: mongodb.ObjectId(req.params.id) });
        await connection.close();
        res.json(result);
    } catch (error) {
        console.log(error);
    }
})

//expense update//


app.put("/portal/expense/edit/:id",authenticate, async function (req, res) {

    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        req.body.userid=mongodb.ObjectId(req.userid);
        const result = await db.collection("addexpense").updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });
        await connection.close();
        res.json({ message: "updated successfully" });
    } catch (error) {
        console.log(error);
    }
})

//expense delete//

app.delete("/portal/expense/delete/:id",authenticate, async function (req, res) {

    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
       
        const result = await db.collection("addexpense").deleteOne({ _id: mongodb.ObjectId(req.params.id) });
        await connection.close();
        res.json({ message: "updated successfully" });
    } catch (error) {
        console.log(error);
    }
})

//find income //
app.get("/portal/income/:id",authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        const result = await db.collection("addincome").findOne({ _id: mongodb.ObjectId(req.params.id) });
        await connection.close();
        res.json(result);
    } catch (error) {
        console.log(error);
    }
})

//income update//

app.put("/portal/income/edit/:id",authenticate, async function (req, res) {

    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        req.body.userid=mongodb.ObjectId(req.userid);
        const result = await db.collection("addincome").updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });
        await connection.close();
        res.json({ message: "updated successfully" });
    } catch (error) {
        console.log(error);
    }
})

//income delete//

app.delete("/portal/income/delete/:id",authenticate, async function (req, res) {

    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        
        const result = await db.collection("addincome").deleteOne({ _id: mongodb.ObjectId(req.params.id) });
        await connection.close();
        res.json({ message: "updated successfully" });
    } catch (error) {
        console.log(error);
    }
})

app.get("/portal/dashboard",authenticate, async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db("Money-Manager");
        const inc = await db.collection("addincome").aggregate([
                        {
                          '$group': {
                            '_id': '$division', 
                            Total: {
                              $sum: "$amount"
                            }
                          }
                        }
                      ]).toArray();
        const exp = await db.collection("addexpense").aggregate([
            {
              '$group': {
                '_id': '$division', 
                Total: {
                  $sum: "$amount"
                }
              }
            }
          ]).toArray();
          await connection.close();
        
          res.json({"total income":inc, "total expense":exp});
          
         
      } catch (error) {
          console.log(error);
      }
    })

app.get("/", (req, res) =>
  res.send(`Server Running`)
);


app.listen(5000);
exports.default=app