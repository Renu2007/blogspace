
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Blog = require("./models/Blog");

// Load environment variables
dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// Check JWT secret
if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing in .env file");
    process.exit(1);
}

// HOME ROUTE
app.get("/", (req, res) => {
    res.send("BlogSpace Backend is working!");
});

// AUTHENTICATION MIDDLEWARE
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please login."
        });
    }

    jwt.verify(token, JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token."
            });
        }

        req.user = user;
        next();
    });
}

// CHECK BLOG OWNER
async function checkBlogOwner(req, res, next) {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        if (blog.author !== req.user.name) {
            return res.status(403).json({
                message: "You cannot modify this blog."
            });
        }

        req.blog = blog;
        next();

    } catch (error) {
        res.status(500).json({
            message: "Error checking blog owner",
            error: error.message
        });
    }
}

// REGISTER ROUTE
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// LOGIN ROUTE WITH JWT
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        console.log("JWT token generated successfully");

        // Send token to frontend
        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

// GET ALL BLOGS
app.get("/api/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({
            createdAt: -1
        });

        res.status(200).json(blogs);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch blogs",
            error: error.message
        });
    }
});

// GET SINGLE BLOG
app.get("/api/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.status(200).json(blog);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch blog",
            error: error.message
        });
    }
});

// CREATE BLOG
app.post(
    "/api/blogs",
    authenticateToken,
    async (req, res) => {
        try {
            const { title, category, content } = req.body;

            if (!title || !category || !content) {
                return res.status(400).json({
                    message: "Please fill all blog fields."
                });
            }

            const newBlog = new Blog({
                title,
                category,
                content,
                author: req.user.name
            });

            await newBlog.save();

            res.status(201).json({
                message: "Blog created successfully!",
                blog: newBlog
            });

        } catch (error) {
            res.status(500).json({
                message: "Blog creation failed",
                error: error.message
            });
        }
    }
);

// UPDATE BLOG
app.put(
    "/api/blogs/:id",
    authenticateToken,
    checkBlogOwner,
    async (req, res) => {
        try {
            const { title, category, content } = req.body;

            if (!title || !category || !content) {
                return res.status(400).json({
                    message: "Please fill all blog fields."
                });
            }

            req.blog.title = title;
            req.blog.category = category;
            req.blog.content = content;

            await req.blog.save();

            res.status(200).json({
                message: "Blog updated successfully!",
                blog: req.blog
            });

        } catch (error) {
            res.status(500).json({
                message: "Blog update failed",
                error: error.message
            });
        }
    }
);

// DELETE BLOG
app.delete(
    "/api/blogs/:id",
    authenticateToken,
    checkBlogOwner,
    async (req, res) => {
        try {
            await req.blog.deleteOne();

            res.status(200).json({
                message: "Blog deleted successfully!"
            });

        } catch (error) {
            res.status(500).json({
                message: "Blog deletion failed",
                error: error.message
            });
        }
    }
);

// CONNECT DATABASE AND START SERVER
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
