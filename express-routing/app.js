const express = require("express");

const app = express();
const PORT = 3000;

// -------------------------
// Middleware
// -------------------------

// JSON parsing middleware
app.use(express.json());

// Logger middleware
function logger(req, res, next) {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
}

// Timing middleware
function timer(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
        const time = Date.now() - start;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Request completed in ${time} ms`
        );
    });

    next();
}

// Apply middleware globally
app.use(logger);
app.use(timer);

// -------------------------
// PART (a) ROUTES
// -------------------------

// Basic route
app.get("/", (req, res) => {
    res.send("Welcome to ExpressJS Routing!");
});

// Route parameter
app.get("/user/:id", (req, res) => {
    const id = req.params.id;
    res.send(`User ID: ${id}`);
});

// Query parameters
app.get("/search", (req, res) => {
    const q = req.query.q;
    const limit = req.query.limit;

    res.send(`Searching for '${q}', limit ${limit}`);
});

// URL building using req.originalUrl
app.get("/url", (req, res) => {
    res.json({
        message: "Current URL",
        url: req.originalUrl
    });
});

// Redirect example
app.get("/home", (req, res) => {
    res.redirect("/");
});

// -------------------------
// PART (b) BOOK RESOURCE
// -------------------------

let books = [
    {
        id: 1,
        title: "The Hobbit",
        author: "Tolkien"
    },
    {
        id: 2,
        title: "Dune",
        author: "Herbert"
    }
];

let nextId = 3;

// GET /books
app.get("/books", (req, res) => {
    res.json(books);
});

// GET /books/:id
app.get("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.json(book);
});

// POST /books
app.post("/books", (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).json({
            message: "Title and author are required"
        });
    }

    const newBook = {
        id: nextId++,
        title: title,
        author: author
    };

    books.push(newBook);

    res.status(201).json(newBook);
});

// DELETE /books/:id
app.delete("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    books.splice(index, 1);

    res.status(204).send();
});

// -------------------------
// Route-specific middleware
// -------------------------

function checkApiKey(req, res, next) {
    if (req.headers["x-api-key"] === "12345") {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
}

// This route requires API key
app.get("/secure", checkApiKey, (req, res) => {
    res.send("You accessed the secure route successfully!");
});

// -------------------------
// 404 Handler
// -------------------------

app.use((req, res) => {
    res.status(404).json({
        message: "Route Not Found"
    });
});

// -------------------------
// Start Server
// -------------------------

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
