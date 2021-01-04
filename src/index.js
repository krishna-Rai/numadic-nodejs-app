const { Client } = require("pg");
const inside = require('point-in-polygon')
const connectionString = "postgresql://postgres:pass@localhost:5432/postgres";
//polygon representing pune as mentioned in question
const polygon = [
  [73.5598715332623, 18.7128121962049],
  [73.7795980957623, 18.858427375322],
  [74.0817221191998, 18.8298343351168],
  [74.1805990723248, 18.6633784989781],
  [74.2575033691998, 18.4420517762916],
  [74.2025717285748, 18.2569599275397],
  [74.0460165527935, 18.1030009147098],
  [73.743892529356, 18.0272764656119],
  [73.568111279356, 18.074281691122],
  [73.4774740723248, 18.2100037896017],
  [73.3538778809185, 18.4733152757346],
  [73.4088095215435, 18.6659806320587],
  [73.5598715332623, 18.7128121962049],
];

const express = require("express");
const cors = require('cors')
const app = express()
const port = 5000;
app.use(cors())
app.use(express.json())

const client = new Client({
  connectionString,
});
client.connect().then((response)=>{
    console.log("connected to postgres db")
    app.listen(port, () => {
      console.log("Server is up on port " + port);
    });
}).catch((error)=>{
    console.log(error.message)
})

app.get("/place_interactions",async (req,res)=>{

    try {
        const start_tis = req.query.start_tis;
        const end_tis = req.query.end_tis;
        console.log(start_tis, end_tis);
        const result = [];
        const query = {
          name: "place interactions",
          text:
            "select license,latitude,longitude,time from location join vehicle on vehicle_id=vehicle.id where time between $1 and $2",
          values: [start_tis, end_tis],
        };
        const { rows } = await client.query(query);
        console.log(rows.length)
        rows.forEach((row) => {
          if (inside([row.longitude, row.latitude], polygon)) {
            // console.log(row.license, row.latitude, row.longitude, row.time);
            // console.log(true);
            result.push({
              license: row.license,
              latitude: row.latitude,
              longitude: row.longitude,
              time: row.time,
            });
          }
        });
        console.log(result.length)
        res.send(result);
    } catch (error) {
        res.status(400).send({error:error.message})
    }
    

});


app.get("/vehicle_activity",async (req,res)=>{

    try {
        
        const license = req.query.license;
        const start_tis = req.query.start_tis;
        const end_tis = req.query.end_tis;
        const result = []
        const query = {
          name: "vehicle activity",
          text:
            "select latitude,longitude from location join vehicle on vehicle_id=vehicle.id where time between $1 and $2 and vehicle.license=$3",
          values: [start_tis, end_tis,license],
        };
        const {rows} = await client.query(query)
        console.log(rows.length);
        rows.forEach((row)=>{
            console.log(row.latitude,row.longitude)
            if(row.latitude && row.longitude)
            result.push({ lat: Number(row.latitude), lng: Number(row.longitude) });
        })
        res.send(result)

    } catch (error) {
        console.log(error.message)
        res.status(400).send({error:error.message})
    }
})