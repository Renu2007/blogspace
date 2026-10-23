
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const createBlogForm = document.getElementById("create-blog-form");

// Register
if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const message = document.getElementById("register-message");

        const user = { name: name, email: email, password: password };

        localStorage.setItem("blogUser", JSON.stringify(user));

        message.textContent = "Registration successful! You can now log in.";
        message.style.color = "green";
    });
}

// Login
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");
        const savedUser = JSON.parse(localStorage.getItem("blogUser"));

        if (savedUser && savedUser.email === email &&
            savedUser.password === password) {
            localStorage.setItem("loggedInUser", savedUser.email);
            message.textContent = "Login successful! Welcome, " + savedUser.name + "!";
            message.style.color = "green";
        } else {
            message.textContent = "Incorrect details. Please register or try again.";
            message.style.color = "red";
        }
    });
}

// Dashboard welcome message
const dashboardTitle = document.getElementById("dashboard-title");

if (dashboardTitle) {
    const savedUser = JSON.parse(localStorage.getItem("blogUser"));

    if (savedUser) {
        dashboardTitle.textContent = "Welcome, " + savedUser.name + "!";
    }
}

// Create and publish a blog
if (createBlogForm) {
    createBlogForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = document.getElementById("blog-message");
        const userEmail = localStorage.getItem("loggedInUser");

        if (!userEmail) {
            message.textContent = "Please log in before publishing a blog.";
            message.style.color = "red";
            return;
        }

        const title = document.getElementById("blog-title").value.trim();
        const category = document.getElementById("blog-category").value.trim();
        const content = document.getElementById("blog-content").value.trim();

        const blogs = JSON.parse(localStorage.getItem("blogs") || "[]");

        blogs.push({
            title: title,
            category: category,
            content: content,
            author: userEmail,
            date: new Date().toLocaleDateString()
        });

        localStorage.setItem("blogs", JSON.stringify(blogs));

        message.textContent = "Blog published successfully!";
        message.style.color = "green";
        createBlogForm.reset();
    });
}

// Display blogs on Home and Dashboard
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

        const date = document.createElement("small");
        date.textContent = "Published: " + blog.date;

        article.append(heading, category, content, date);
        container.appendChild(article);
    });
}

// Home page blogs
const blogList = document.getElementById("blog-list");

if (blogList) {
    const blogs = JSON.parse(localStorage.getItem("blogs") || "[]");
    displayBlogs(blogList, blogs);
}

// Dashboard blogs
const myBlogList = document.getElementById("my-blog-list");

if (myBlogList) {
    const userEmail = localStorage.getItem("loggedInUser");
    const blogs = JSON.parse(localStorage.getItem("blogs") || "[]");
    const myBlogs = blogs.filter(function (blog) {
        return blog.author === userEmail;
    });

    displayBlogs(myBlogList, myBlogs);
}
