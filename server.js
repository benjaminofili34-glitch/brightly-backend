const express = require('express');
const morgan = require('morgan');
const cors = require("cors");
const { connectToMongoDB, disconnectFromMongoDB } = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));

app.use(cors());
const path = require('path');

app.use(express.json()); 
let myLesson = require('./lesson.js')



//  RETURNING STATIC IMAGES with 404 error if not available   
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/images', (req, res) => {
    res.status(404).json({ error: "404 - Image not found" });
});


// GET /lessons
app.get('/', (req,res)=>{
    res.json(' Eureka it works')
})

app.get('/lessons', async (req, res) => {
    try {
        const lessons = await db.collection('lessons').find().toArray();
        res.json(lessons);
    } catch (error) {
        console.error("Error fetching lessons:", error);
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
});



app.get('/search', (req, res) => {
    const { q } = req.query;

    if (typeof q !== 'string' || !q.trim()) {
        return res.status(400).json({
            error: "A non-empty search query 'q' is required"
        });
    }

    const query = q.trim().toLowerCase();

    const results = myLesson.filter(lesson =>
        lesson.topic.toLowerCase().includes(query) ||
        lesson.location.toLowerCase().includes(query) ||
        (typeof lesson.teacher === 'string' &&
            lesson.teacher.toLowerCase().includes(query))
    );

    res.json(results);
});


app.get('/enrolment/:id', (req, res) => {
    const id = Number(req.params.id);
        const lesson = myLesson.find(item => item.id === id);

    if (!lesson) {
        return res.status(404).json({
            error: "Lesson not found"
        });
    }

    console.log("Lesson found:", lesson);
    res.json(lesson.totalSpaces - lesson.space);
});

// POST /orders

// app.post('/orders',(req,res) =>{
//     const order = req.body;
//     console.log(order)
//     res.json("Order Submitted Successfully")
// })
app.post('/lessons', (req, res) => {
    console.log("Received body:", req.body);

    const newLesson = req.body;

    if (!newLesson.topic || !newLesson.price || !newLesson.space || !newLesson.location) {
        return res.status(400).json({
            error: "Missing required lesson fields"
        });
    }

    newLesson.id = myLesson.length + 1;
    myLesson.push(newLesson);

    res.status(201).json(newLesson);
});

app.post('/orders', (req, res) => {
    console.log("Received body:", req.body);

    const order = req.body;

    if (!order || !order.name || !order.phone ||
        !Array.isArray(order.items) || order.items.length === 0) {
        return res.status(400).json({
            error: "Missing required order details"
        });
    }

    res.status(200).json({
        message: "Order received for testing. Not saved yet."
    });
});

// PUT /lessons/:id

app.put('/lessons/:id', (req, res) => {

    const id = Number(req.params.id);

    const lesson = myLesson.find(item => item.id === id);

    if (!lesson) {
        return res.status(404).json({
            error: "Lesson not found"
        });
    }

    console.log("Lesson found:", lesson);
    console.log("Updates received:", req.body);

    if (req.body.id !== undefined) {
    return res.status(400).json({
        error: "Lesson ID cannot be changed"
    });
    }
    
    if (req.body.space !== undefined &&
    (!Number.isInteger(req.body.space) || req.body.space < 0)) {
    return res.status(400).json({
        error: "Spaces must be a non-negative integer"
    });
    }
    Object.assign(lesson, req.body);

    res.json(lesson);
});


// Other routes

// Start server



app.use((req, res) => {
    res.status(404).json({ error: "404 - Resource not found" });
});

let server;

async function startServer() {
    const client = await connectToMongoDB();
    db = client.db('brightly');
    server = app.listen(PORT, () => {
        console.log(`server running at http://localhost:${PORT}/`);
    });
}

async function shutdown() {
    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close(error => error ? reject(error) : resolve());
            });
        }
        await disconnectFromMongoDB();
    } catch (error) {
        console.error("Error while shutting down:", error);
        process.exitCode = 1;
    }
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

startServer().catch(error => {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
});
