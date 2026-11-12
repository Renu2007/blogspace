# BlogSpace 📝

A Full Stack Blog Application built using HTML, CSS, JavaScript, Node.js, Express.js and MongoDB.

BlogSpace allows users to register, log in securely, create and manage blog posts, and explore blogs shared by users.

## 🚀 Features

- **User Registration:** Create an account with name, email and password.
- **User Login:** Secure authentication using JWT.
- **Dashboard:** Access a personalized user dashboard.
- **Create Blogs:** Publish blog posts with title, category and content.
- **View Blogs:** Explore published blog posts.
- **Edit Blogs:** Update existing blog posts.
- **Delete Blogs:** Remove blog posts.
- **User Profile:** Display logged-in user information.
- **Logout:** Securely end the user session.
- **Protected Routes:** Restrict dashboard access to authenticated users.
- **Responsive Design:** Supports desktop and mobile screens.

## 🛠️ Technologies Used

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js
- JWT Authentication
- bcryptjs

**Database**
- MongoDB Atlas
- Mongoose

**Development Tools**
- Visual Studio Code
- Git and GitHub
- Postman

## 📂 Project Structure

```text
blogspace/
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Blog.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── create-blog.html
├── script.js
├── style.css
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Renu2007/blogspace.git
```

### 2. Open the project folder

```bash
cd blogspace
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the backend folder.

Add your MongoDB connection string and JWT secret:

```env
MONGO_URI=your_m