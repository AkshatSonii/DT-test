const express = require("express");
const dotenv = require("dotenv");

const app = express();

dotenv.config();
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URL;

const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

async function run() {
  try {
    await client.connect();

    await client.db("DT-test").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




const myDB = client.db("DT-test");
const myColl = myDB.collection("events");

app.use(express.json());

app.post("/api/v3/app/events", async(req,res) =>{
    try{
        const doc = {type: "event",uid:18, name: req.body.name, files: req.body.files, tagline: req.body.tagline, description: req.body.description, moderator: req.body.moderator, category: req.body.category, sub_category: req.body.sub_category, rigor_rank: req.body.rigor_rank, attendes:["abc", "def"], createdAt: new Date()};
        const result = await myColl.insertOne(doc,{timestamps:true});
        console.log(result);
        console.log(
            `A document was inserted with the _id: ${result.insertedId}`,
         )
    }
    catch(err){
        console.log(err);
    }
});


var ObjectId = require('mongodb').ObjectId;

app.put("/api/v3/app/events/:id", async(req,res) => {
    try{
        const filter = { _id: new ObjectId( req.params.id ) };
        const options = { upsert: true };

        const updateDocument = {
            $set: req.body
         };
         const result = await myColl.updateOne(filter, updateDocument,options);
         console.log(result);
    }
    catch(err){
        console.log(err);
    }
});

app.delete("/api/v3/app/events/:id", async(req,res) => {
    try{
        const deleteId = new ObjectId(req.params.id);
        const result = await myColl.deleteOne({_id: deleteId});
        console.log(result);
    }
    catch(err){
        console.log(err);
    }
});


app.get("/api/v3/app/events", async(req,res)=>{
    
    try{
        const qId = new ObjectId(req.query.id);
        const query = {"_id" : qId};

        const type = new String(req.query.type);
        const limit = req.query.limit;
        const page = req.query.page;
        let cursor;
        
        const query2 = {};
        // sort in descending (-1) order by creation of object
        const sort = { createdAt: -1 };

        if(qId){
            cursor = await myColl.find(query);
        }
        else if(type && limit && page){
            cursor = await myColl.find(query2).sort(sort).limit(limit);
        }
        else{
            cursor = await myColl.find()
        }
        
        for await (const doc of cursor) {
            console.dir(doc);
          } 
        res.status(200).json(cursor);
    }
    catch(err){
        console.log(err);
    }
});


app.listen(process.env.PORT || 3000, () =>{
    console.log('Server on port 3000');
});

