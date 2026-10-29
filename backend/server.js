
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Temporary storage for learning
const users = [];
const blogs = [];

// Home route
app.get("/", (req, res) => {
    res.send("BlogSpace Backend is working!");
});

// Register API
app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const existingUser = users.find(
        user => user.email === email
    );

    if (existingUser) {
        return res.status(409).json({
            message: "Email already registered"
        });
    }

    users.push({ name, email, password });

    res.status(201).json({
        message: "Registration successful"
    });
});

// Login API
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(
        user =>
            user.email === email &&
            user.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        message: "Login successful",
        user: {
            name: user.name,
            email: user.email
        }
    });
});

// Create blog API
app.post("/api/blogs", (req, res) => {
    const { title, category, content, author } = req.body;

    if (!title || !category || !content || !author) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const blog = {
        id: Date.now(),
        title,
        category,
        content,
        author,
        date: new Date().toLocaleDateString()
    };

    blogs.push(blog);

    res.status(201).json({
        message: "Blog created successfully",
        blog
    });
});

// Get all blogs API
app.get("/api/blogs", (req, res) => {
    res.json(blogs);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
