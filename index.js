//Node Modules
const express = require('express');
const  Datastore =require('nedb');
const fetch = require('node-fetch');
const RedisServer = require('redis-server');
const  redis = require('redis');
const nconf = require('nconf');

//Connecting to database
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Josh:nKDRAd4zHyU0BBZi@cluster0.yfhtd.mongodb.net/project?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

//keys for redis server
nconf.argv().env().file('keys.json');

//ports for node and redis server
const PORT = process.env.PORT || 2000;
const PORT_REDIS = process.env.PORT || 6379;

//connection to redis server
const app = express();
const redisClient = redis.createClient(
    nconf.get('redisPort') || '11764',
    nconf.get('redisHost') || 'redis-11764.c233.eu-west-1-1.ec2.cloud.redislabs.com',

    {
        'auth_pass': nconf.get('redisKey'),
        'return_buffers': true
    }
).on('error', (err) => console.error('ERR:REDIS:', err));

const set = (key, value) => {
    redisClient.set(key, JSON.stringify(value));
}
const get = (req, res, next) => {
    let key = req.route.path;    redisClient.get(key, (error, data) => {
        if (error) res.status(400).send(err);
        if (data !== null) res.status(200).send(JSON.parse(data));
        else next();
    });
}



//starting node server on port 3000 and using express(basis for web app and apis)
app.listen(3000, () =>console.log('Listening at 3000'));
app.use(express.static('public'));
app.use(express.json({limit:'1mb'}));

//disused testing code
const database = new Datastore('database.db');
database.loadDatabase();

//variables for getting the location details
let lon, lat, location;

//api for getting the longitude and latitude from a placename
app.get(`/location/:search`, get, async (req, res) => {
    console.log(req.params.search);
    location = req.params.search;
    console.log(location);
    const api_url = `https://eu1.locationiq.com/v1/search.php?key=pk.356a43e5932c6d8e1d0b0e96168407e8&q=${location}&format=json`;
    const fetch_response = await fetch(api_url);
    const json = await fetch_response.json();
    res.json(json);

    lon = json[0].lon;
    lat = json[0].lat;




    console.log(lon);

});

//api for weather details for the sea
app.get(`/weather/:location`, get, (req, res, data) => {

    console.log(lat, lon);

    fetch(`http://api.worldweatheronline.com/premium/v1/marine.ashx?key=ba7bc67111044844b25141521203012&q=${lat},${lon}&num_of_days=2&tp=3&format=json`)
.then(res => {
        return res.json();
    }).then(json => {

        res.send(json);

    }).catch(err => {
        console.error(err);
        res.sendStatus(202);
    })
        .catch(error => {
            console.error(error);
            res.status(400).send(error);
        });

    });

app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));



// local api for getting details from the forms and pushing it to the database
app.post('/api', (request, response) => {
        console.log('I got a request');
        const data = request.body;
        const timestamp = Date.now();
        data.timestamp = timestamp;
        data.location = location;

        async function run() {

            try {

                await client.connect();

                const database = client.db("project");

                const collection = database.collection("user_requests");

                // create a document to be inserted

                const doc = data;

                const result = await collection.insertOne(doc);

                console.log(

                    `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,

                );

            } finally {

                console.log('Database Updated');

            }

        }
        run().catch(console.dir);


        console.log(data);
        response.json({
                status:'success',
                timestamp:timestamp
            }

        );
    }

);

//local api for database queries
app.get('/database', (request, response) => {


    async function run() {

        try {

            await client.connect();

            const database = client.db("project");
            //
            // const collection = database.collection("user_requests");

            const query = {location: location};


            database.collection("user_requests").find(query, { projection: { _id: 0, location: 1, text: 1, timestamp: 1, name: 1 } }).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);

                response.json(result);
            })

        } finally {

            console.log('Database Updated');

        }

    }

    run().catch(console.dir);


}
);

