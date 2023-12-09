const express = require('express');
const cors = require('cors');
const stripess = require("stripe")("sk_test_51OEvv1AD2BmhwX6YmmYwTZTYMobzD2diWsqjlDaLWWXPNBoCPNVY9YBDENMh5ghdyM5ZSw0vSJGdhymRECfhsycv00A6DEM6Gq")
const jwt = require("jsonwebtoken")
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://keepLearningDB:N3PYuveqEhvfsYcp@cluster0.v1k6wbk.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const tokenVarifay = (req,res,next)=>{

  // console.log(req.headers)
  if(!req.headers.authorization){
    return res.status(401).send({messses:"forbinen"})
  }
  const token = req.headers.authorization.split(' ')[1]
  if(token){
    jwt.verify(token,process.env.TOKEN_SECRET,(err,decoded)=>{
      if(err){
        return res.status(401).send({messses:"forbinen"})
      }
      // console.log(decoded)
      req.user = decoded
      next()
    })
  }
  }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const UserCollection = client.db("Keep_learning").collection("user")
    const RequiesCollection = client.db("Keep_learning").collection("Requiet")
    const AddClassCollection = client.db("Keep_learning").collection("AddClass")
    const AdminApprovedClassCollection = client.db("Keep_learning").collection("Admin-Approved")
    const CreatedAssignmentClassCollection = client.db("Keep_learning").collection("Created-Assingnment")
    const PurchessCourseClassCollection = client.db("Keep_learning").collection("Purchess-Coruse")
    // const PaymentInfoClassCollection = client.db("Keep_learning").collection("Payment-info")
    
    app.post("/jwt", async(req,res)=>{
      const email = req.body;
      const token = jwt.sign(email,process.env.TOKEN_SECRET,
      {expiresIn:"1h"})
      console.log(token)
      res.send({token})
    })
    
    app.post("/user", async (req, res) => {
      const user = req.body
      const quray = { email: user.email }
      const find = await UserCollection.findOne(quray)
      if (find) {
        return
      }
      const result = await UserCollection.insertOne(user)
      res.send(result)
    })
    app.get("/users",  tokenVarifay, async  (req, res) => {
      const result = await UserCollection.find().toArray()
      res.send(result)
    })
    app.get("/find-Admin-data/:email" , tokenVarifay, async(req,res)=>{
      const email = req.params.email
      const quray = {email:email}
      const findAmin = await UserCollection.findOne(quray)
      const checkAdmin = findAmin?.Role ==="Admin"
      const findTeacher = await RequiesCollection.findOne(quray)
      console.log(findTeacher)
      const checkTecher = findTeacher?.role === "Teacher"
      if(checkAdmin || checkTecher){
        return res.send({checkAdmin,checkTecher})
      }else{
        return
      }
    })

    app.patch("/admin/make-Admin/:id", async (req, res) => {
      const id = req.params.id
      const quray = { _id: new ObjectId(id) }
      const setRole = {
        $set: {
          Role: "Admin"
        }
      }
      const result = await UserCollection.updateOne(quray, setRole)
      res.send(result)
    })
    app.post("/Tech-requiest", tokenVarifay, async (req, res) => {
      const requiest = req.body
      console.log(requiest)
      const result = await RequiesCollection.insertOne(requiest)
      res.send(result)
    })
    app.get("/send-Requies", tokenVarifay, async (req, res) => {
      const result = await RequiesCollection.find().toArray()
      res.send(result)
    })
    app.patch("/set-Role/:id", async (req, res) => {
      const id = req.params.id
      const quray = { _id: new ObjectId(id) }
      const opction = { upsert: true }
      const update = {
        $set: {
          role: "Teacher"
        }
      }
      const result = await RequiesCollection.updateOne(quray, update, opction)
      res.send(result)

    })
    app.post("/AddClass", tokenVarifay, async (req, res) => {
      const AddClass = req.body
      console.log(AddClass)
      const result = await AddClassCollection.insertOne(AddClass)
      res.send(result)
    })

    app.get("/My_Clsss/:email", async (req, res) => {
      const email = req.params.email
      console.log(email)
      const quray = { email: email }
      const result = await AddClassCollection.find(quray).toArray()
      res.send(result)
    })
    app.delete("/My_Class/:id", async (req, res) => {
      const id = req.params.id
      const quray = { _id: new ObjectId(id) }
      const result = await AddClassCollection.deleteOne(quray)
      res.send(result)
    })
    app.get("/update_Class/:id", async (req, res) => {
      const id = req.params.id
      const quray = { _id: new ObjectId(id) }
      const result = await AddClassCollection.findOne(quray)
      res.send(result)
    })
    app.put("/Class-update/:id", tokenVarifay, async (req, res) => {
      const body = req.body
      const id = req.params.id
      const quray = { _id: new ObjectId(id) }
      const update = {
        $set: {
          email: body.email,
          name: body.name,
          price: body.price,
          title: body.title,
          img: body.img,
          Experince: body.Experince,
          Category: body.Category
        }

      }
      console.log(update)
      const result = await AddClassCollection.updateOne(quray, update)
      res.send(result)
    })
    app.patch("/admin/rejected/:id", async (req, res) => {
      const id = req.params.id
      const quray = { _id: new ObjectId(id) }
      const setRejected = {
        $set: {
          status: "Rejected"
        }
      }
      const result = await AddClassCollection.updateOne(quray, setRejected)
      res.send(result)
    })
    app.patch("/admin/Approved/status/:id", async (req, res) => {
      const id = req.params.id
      const quray = { _id: new ObjectId(id) }
      const setRejected = {
        $set: {
          status: "Posted "
        }
      }
      const result = await AddClassCollection.updateOne(quray, setRejected)
      res.send(result)
    })
    app.get("/admin/AllClasses", tokenVarifay, async (req, res) => {
      const result = await AddClassCollection.find().toArray()
      res.send(result)
    })
    app.post("/admin/Approved", async (req, res) => {
      const body = req.body
      const result = await AdminApprovedClassCollection.insertOne(body)
      res.send(result)
    })
    app.get("/all-Class",async (req, res) => {
      const body = req.body
      const result = await AdminApprovedClassCollection.find(body).toArray()
      res.send(result)
    })

    app.get("/cruseDetiles/:id",  async (req, res) => {
      const id = req.params.id
      const quray = { _id: new ObjectId(id) }
      const result = await AdminApprovedClassCollection.findOne(quray)
      res.send(result)
    })

    //  Payment

    app.get("/payment-Info/:id", async (req, res) => {
      const id = req.params.id
      console.log(id)
      const quray = { _id: new ObjectId(id) }
      const result = await AdminApprovedClassCollection.findOne(quray)
      res.send(result)
    })

    app.post("/create-payment-intent",tokenVarifay, async (req, res) => {
      const { price } = req.body
      // const convartPrice = Number(price)
      // const amout = parseFloat(convartPrice * 100)
      const currenPrice = parseInt(price)*100
      console.log(currenPrice)
      const pald =  await stripess.paymentIntents.create({
        amount:currenPrice,
        currency: "usd",
        payment_method_types: [
                "card"
              ],

      })
      res.send({clientSecret:pald.client_secret})
    })

    //  Created assignment
    app.post("/Created-Assignment" , tokenVarifay, async(req,res)=>{
      const AssignmentInfo = req.body
      const result = await CreatedAssignmentClassCollection.insertOne(AssignmentInfo)
      res.send(result)
    })

    app.get("/Assignment/:id" , async(req,res)=>{
      const id = req.params.id
      console.log(id)
      const quray = {Assignment_id:id}
      const result = await CreatedAssignmentClassCollection.find(quray).toArray()
      res.send(result)
    })

    // Purchess Coruse

    app.post("/Purchess-Coruse-info", async (req,res)=>{
      const body = req.body
      const result = await PurchessCourseClassCollection.insertOne(body)
      res.send(result)
    })

    app.get("/Enrrol-Class/:email", async(req,res)=>{
      const email = req.params.email
      console.log(email)
      const quray = {email:email}
      const result = await PurchessCourseClassCollection.find(quray).toArray()
      res.send(result)
    })
    app.get("/Student-Class-dtls/:id", async(req,res)=>{
      const id = req.params.id
      const quray = {_id:new ObjectId(id)}
      const result = await PurchessCourseClassCollection.findOne(quray)
      res.send(result)
    })

    //  get All data

    app.get("/All-Data", async(req,res)=>{
      const allUser = await UserCollection.find().toArray()
      const AllClass = await AdminApprovedClassCollection.find().toArray()
      const allStudent = await PurchessCourseClassCollection.find().toArray()
      const allTecher = await RequiesCollection.find().toArray()
      res.send({allUser,AllClass, allStudent,allTecher})
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", async (req, res) => {
  res.send("keep Learning in runing")
})
app.listen(port, () => {
  console.log(`server in runing on port ${port}`)
})