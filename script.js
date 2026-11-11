
const API_URL = "http://localhost:3000/api";

// Get form elements
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const createBlogForm = document.getElementById("create-blog-form");

// API request function
async function apiRequest(endpoint, data = null, method = "GET") {
    const token = localStorage.getItem("token");

    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (token) {
        options.headers.Authorization = "Bearer " + token;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(API_URL + endpoint, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
    }

    return result;
}

// Display messages
function showMessage(element, message, success = false) {
    if (!element) return;

    element.textContent = message;
    element.style.color = success ? "green" : "red";
}

// REGISTER
if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("message");

        const userData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        };

        try {
            const result = await apiRequest("/register", userData, "POST");

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
            const result = await apiRequest("/login", credentials, "POST");

            console.log("Login response:", result);

            if (!result.token) {
                throw new Error("Token not received from backend");
            }

            // Store JWT token and user details
            localStorage.setItem("token", result.token);
            localStorage.setItem("blogUser", JSON.stringify(result.user));
            localStorage.setItem("loggedInUser", result.user.email);

            showMessage(message, "Login successful!", true);

            window.location.href = "dashboard.html";

        } catch (error) {
            showMessage(message, error.message);
            console.error(error);
        }
    });
}

// DASHBOARD WELCOME MESSAGE
const welcomeMessage = document.getElementById("welcome-message");

if (welcomeMessage) {
    const user = JSON.parse(localStorage.getItem("blogUser") || "null");

    if (user) {
        welcomeMessage.textContent = "Welcome, " + user.name + "!";
    } else {
        welcomeMessage.textContent = "Welcome to BlogSpace!";
    }
}

// EDIT BLOG
async function editBlog(blog) {
    const newTitle = prompt("Enter new blog title:", blog.title);

    if (!newTitle) return;

    const newCategory = prompt("Enter new category:", blog.category);

    if (!newCategory) return;

    const newContent = prompt("Enter new content:", blog.content);

    if (!newContent) return;

    try {
        const result = await apiRequest(
            "/blogs/" + blog._id,
            {
                title: newTitle,
                category: newCategory,
                content: newContent
            },
            "PUT"
        );

        alert(result.message || "Blog updated successfully!");
        loadBlogs();
        loadBlogDetails();

    } catch (error) {
        alert(error.message);
    }
}

// DELETE BLOG
async function deleteBlog(blogId) {
    const confirmDelete = confirm("Are you sure you want to delete this blog?");

    if (!confirmDelete) return;

    try {
        const result = await apiRequest(
            "/blogs/" + blogId,
            null,
            "DELETE"
        );

        alert(result.message || "Blog deleted successfully!");

        window.location.href = "dashboard.html";

    } catch (error) {
        alert(error.message);
    }
}

// DISPLAY BLOGS
function displayBlogs(container, blogs) {
    if (!container) return;

    container.innerHTML = "";

    if (!blogs || blogs.length === 0) {
        container.innerHTML = "<p>No blogs available.</p>";
        return;
    }

    const currentUser = JSON.parse(
        localStorage.getItem("blogUser") || "null"
    );

    blogs.forEach(function (blog) {
        const blogCard = document.createElement("div");
        blogCard.className = "blog-card";

        const title = document.createElement("h3");
        title.textContent = blog.title;
        title.style.cursor = "pointer";

        title.addEventListener("click", function () {
            window.location.href = "blog-details.html?id=" + blog._id;
        });

        const category = document.createElement("p");
        category.textContent = "Category: " + blog.category;

        const content = document.createElement("p");
        content.textContent = blog.content;

        const author = document.createElement("p");
        author.textContent = "Author: " + blog.author;

        blogCard.appendChild(title);
        blogCard.appendChild(category);
        blogCard.appendChild(content);
        blogCard.appendChild(author);

        if (currentUser && currentUser.name === blog.author) {
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "btn";

            editButton.addEventListener("click", function () {
                editBlog(blog);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "btn";

            deleteButton.addEventListener("click", function () {
                deleteBlog(blog._id);
            });

            blogCard.appendChild(editButton);
            blogCard.appendChild(deleteButton);
        }

        container.appendChild(blogCard);
    });
}

// LOAD ALL BLOGS
async function loadBlogs() {
    const allBlogsContainer = document.getElementById("blog-list");
    const myBlogsContainer = document.getElementById("my-blog-list");

    if (!allBlogsContainer && !myBlogsContainer) return;

    try {
        const blogs = await apiRequest("/blogs");

        if (allBlogsContainer) {
            displayBlogs(allBlogsContainer, blogs);
        }

        if (myBlogsContainer) {
            const user = JSON.parse(
                localStorage.getItem("blogUser") || "null"
            );

            const myBlogs = user
                ? blogs.filter(function (blog) {
                    return blog.author === user.name;
                })
                : [];

            displayBlogs(myBlogsContainer, myBlogs);
        }

    } catch (error) {
        console.error("Error loading blogs:", error);
    }
}

// CREATE BLOG
if (createBlogForm) {
    createBlogForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = document.getElementById("blog-message");

        const blogData = {
            title: document.getElementById("blog-title").value.trim(),
            category: document.getElementById("blog-category").value.trim(),
            content: document.getElementById("blog-content").value.trim()
        };

        try {
            const result = await apiRequest("/blogs", blogData, "POST");

            showMessage(
                message,
                result.message || "Blog created successfully!",
                true
            );

            createBlogForm.reset();

        } catch (error) {
            showMessage(message, error.message);
        }
    });
}

// LOAD BLOG DETAILS
async function loadBlogDetails() {
    const detailsContainer = document.getElementById("blog-details");

    if (!detailsContainer) return;

    const params = new URLSearchParams(window.location.search);
    const blogId = params.get("id");

    if (!blogId) {
        detailsContainer.textContent = "Blog not found.";
        return;
    }

    try {
        const blog = await apiRequest("/blogs/" + blogId);

        detailsContainer.innerHTML = `
            <h2>${escapeHTML(blog.title)}</h2>
            <p><strong>Category:</strong> ${escapeHTML(blog.category)}</p>
            <p><strong>Author:</strong> ${escapeHTML(blog.author)}</p>
            <p>${escapeHTML(blog.content)}</p>
        `;

        const user = JSON.parse(
            localStorage.getItem("blogUser") || "null"
        );

        if (user && user.name === blog.author) {
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "btn";

            editButton.addEventListener("click", function () {
                editBlog(blog);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "btn";

            deleteButton.addEventListener("click", function () {
                deleteBlog(blog._id);
            });

            detailsContainer.appendChild(editButton);
            detailsContainer.appendChild(deleteButton);
        }

    } catch (error) {
        detailsContainer.textContent = error.message;
    }
}

// Escape HTML characters before displaying blog content
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}

// RUN PAGE FUNCTIONS
loadBlogs();
loadBlogDetails();
