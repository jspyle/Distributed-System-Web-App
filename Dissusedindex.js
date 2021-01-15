const express = require('express');
const  Datastore =require('nedb');
const fetch = require('node-fetch');
const RedisServer = require('redis-server');
const  redis = require('redis');

const PORT = process.env.PORT || 2000;
const PORT_REDIS = process.env.PORT || 6379;

const app = express();
const redisClient = redis.createClient(PORT_REDIS);
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



app.listen(3000, () =>console.log('Listening at 3000'));
app.use(express.static('public'));
app.use(express.json({limit:'1mb'}));

const database = new Datastore('database.db');
database.loadDatabase();


// app.get('/weather/:location', async (request, response) =>{
//     console.log(request.params);
//     const location =  request.params.location.split(',');
//     console.log(location);
//     const lat = location[0];
//     const lon = location[1];
//     console.log(lat, lon);
//
//
//
//         const api_url = `http://api.worldweatheronline.com/premium/v1/marine.ashx?key=ba7bc67111044844b25141521203012&q=${lat},${lon}&num_of_days=2&tp=3&format=json`;
//         const fetch_response = await fetch(api_url);
//         const json = await fetch_response.json();
//         response.json(json)
//
//
//         weatherData = json.data.weather[0];
//         weatherData2 = json.data.weather[1];
//
//         console.log(weatherData);
//
//         database.insert(weatherData);
//         database.insert(weatherData2);
//
//
// });



app.post('/api', (request, response) => {
    console.log('I got a request')
    console.log(request.body);
    const data = request.body;
    const timestamp = Date.now()
    data.timestamp = timestamp;
    database.insert(data);
    response.json({
        status:'success',
        timestamp:timestamp
        }

    );
    }

);




// app.post('jsonData', async (jsonrequest, jsonresponse) =>
// {
//     const lat = 58.7984;
//     const lng = 17.8081;
//     const params = 'waveHeight,airTemperature';
//
//     const api_url = `http://api.worldweatheronline.com/premium/v1/weather.ashx?key=ba7bc67111044844b25141521203012&q=48.85,2.35&num_of_days=2&tp=3&format=json`;
//     const fetch_response = await fetch(api_url);
//     const json = await fetch_response.json();
//     jsonresponse.json(json);
//
//
//
// })

app.get(`/weather/:location`, get, (req, res) => {
    console.log(req.params);
    const location =  req.params.location.split(',');
    console.log(location);
    const lat = location[0];
    const lon = location[1];
    console.log(lat, lon);

    fetch(`http://api.worldweatheronline.com/premium/v1/marine.ashx?key=ba7bc67111044844b25141521203012&q=${lat},${lon}&num_of_days=2&tp=3&format=json`)
        .then(res => res.json())
        .then(json => {
            set(req.route.path, json);
            res.status(200).send(json);
        })
        .catch(error => {
            console.error(error);
            res.status(400).send(error);
        });
});app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));

app.get(`/location/:search`, get, (req, res) => {
    console.log(req.params);
    const location = req.params.location;
    fetch(`https://eu1.locationiq.com/v1/search.php?key=pk.356a43e5932c6d8e1d0b0e96168407e8&q=${location}&format=json`);
    const fetch_response = await fetch(api_url);
    const json = await fetch_response.json();
    jsonresponse.json(json);

});


// app.get('/weather/:location', async (request, response) =>{
//     console.log(request.params);
//     const location =  request.params.location.split(',');
//     console.log(location);
//     const lat = location[0];
//     const lon = location[1];
//     console.log(lat, lon);
//
//
//
//         const api_url = `http://api.worldweatheronline.com/premium/v1/marine.ashx?key=ba7bc67111044844b25141521203012&q=${lat},${lon}&num_of_days=2&tp=3&format=json`;
//         const fetch_response = await fetch(api_url);
//         const json = await fetch_response.json();
//         response.json(json)
//
//
//         weatherData = json.data.weather[0];
//         weatherData2 = json.data.weather[1];
//
//         console.log(weatherData);
//
//         database.insert(weatherData);
//         database.insert(weatherData2);
//
//
// });




// async function run() {
//
//     try {
//
//         await client.connect();
//
//         const database = client.db("sample_mflix");
//
//         const collection = database.collection("movies");
//
//         // create a document to be inserted
//
//         const doc = { name: "Red", town: "kanto" };
//
//         const result = await collection.insertOne(doc);
//
//         console.log(
//
//             `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
//
//         );
//
//     } finally {
//
//         await client.close();
//
//     }
//
// }
//
// run().catch(console.dir);




// app.post('jsonData', async (jsonrequest, jsonresponse) =>
// {
//     const lat = 58.7984;
//     const lng = 17.8081;
//     const params = 'waveHeight,airTemperature';
//
//     const api_url = `http://api.worldweatheronline.com/premium/v1/weather.ashx?key=ba7bc67111044844b25141521203012&q=48.85,2.35&num_of_days=2&tp=3&format=json`;
//     const fetch_response = await fetch(api_url);
//     const json = await fetch_response.json();
//     jsonresponse.json(json);
//
//
//
// })



// console.log(req.params);
// const location =  req.params.location.split(',');
// console.log(location);
// const lat = location[0];
// const lon = location[1];

//
// const options = {
//     // sort returned documents in ascending order by title (A->Z)
//     sort: {timestamp: 1},
//     // Include only the `title` and `imdb` fields in each returned document
//     projection: {_id: 0, location: 1, timestamp: 1, text: 1},
// };
//
// const cursor = collection.find(query, options);
//
// await cursor.forEach(console.dir);