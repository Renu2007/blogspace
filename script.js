
const API_URL = "http://localhost:3000/api";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const createBlogForm = document.getElementById("create-blog-form");

// Display success or error messages
function showMessage(element, message, success = false) {
    if (!element) return;

    element.textContent = message;
    element.style.color = success ? "green" : "red";
}

// Communicate with the backend API
async function apiRequest(endpoint, data, method = "POST") {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(API_URL + endpoint, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Request failed");
    }

    return result;
}

// REGISTER
if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("register-message");

        const user = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("register-email").value.trim(),
            password: document.getElementById("register-password").value
        };

        try {
            const result = await apiRequest("/register", user);
            showMessage(message, result.message, true);
            registerForm.reset();
        } catch (error) {
            showMessage(message, error.message);
        }
    });
}

// LOGIN
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("message");

        const credentials = {
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        };

        try {
            const result = await apiRequest("/login", credentials);

            localStorage.setItem(
                "blogUser",
                JSON.stringify(result.user)
            );

            localStorage.setItem("loggedInUser", result.user.email);

            showMessage(message, result.message, true);

            window.location.href = "dashboard.html";
        } catch (error) {
            showMessage(message, error.message);
        }
    });
}

// DASHBOARD WELCOME MESSAGE
const dashboardTitle = document.getElementById("dashboard-title");

if (dashboardTitle) {
    const savedUser = JSON.parse(
        localStorage.getItem("blogUser") || "null"
    );

    if (savedUser) {
        dashboardTitle.textContent = "Welcome, " + savedUser.name + "!";
    }
}

// DISPLAY BLOGS
function displayBlogs(container, blogs) {
    container.replaceChildren();

    if (blogs.length === 0) {
        container.textContent = "No blogs published yet.";
        return;
    }

    blogs.forEach(function (blog) {
        const article = document.createElement("article");
        article.className = "blog-card";

        const heading = document.createElement("h3");
        heading.textContent = blog.title;

        const category = document.createElement("p");
        category.textContent = "Category: " + blog.category;

        const content = document.createElement("p");
        content.textContent = blog.content;

        const author = document.createElement("p");
        author.textContent = "Author: " + blog.author;

        const date = document.createElement("small");
        date.textContent = "Published: " + blog.date;

        article.append(heading, category, content, author, date);
        container.appendChild(article);
    });
}

// LOAD BLOGS FROM BACKEND
async function loadBlogs() {
    const blogList = document.getElementById("blog-list");
    const myBlogList = document.getElementById("my-blog-list");

    try {
        const blogs = await apiRequest("/blogs", null, "GET");

        if (blogList) {
            displayBlogs(blogList, blogs);
        }

        if (myBlogList) {
            const userEmail = localStorage.getItem("loggedInUser");

            const myBlogs = blogs.filter(function (blog) {
                return blog.author === userEmail;
            });

            displayBlogs(myBlogList, myBlogs);
        }
    } catch (error) {
        if (blogList) {
            blogList.textContent =
                "Unable to load blogs. Check whether the backend is running.";
        }

        if (myBlogList) {
            myBlogList.textContent =
                "Unable to load your blogs. Check whether the backend is running.";
        }
    }
}

// CREATE AND PUBLISH BLOG
if (createBlogForm) {
    createBlogForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("blog-message");
        const userEmail = localStorage.getItem("loggedInUser");

        if (!userEmail) {
            showMessage(message, "Please log in before publishing a blog.");
            return;
        }

        const blog = {
            title: document.getElementById("blog-title").value.trim(),
            category: document.getElementById("blog-category").value.trim(),
            content: document.getElementById("blog-content").value.trim(),
            author: userEmail
        };

        try {
            const result = await apiRequest("/blogs", blog);

            showMessage(message, result.message, true);
            createBlogForm.reset();
        } catch (error) {
            showMessage(message, error.message);
        }
    });
}

// Load blogs when the page opens
loadBlogs();
