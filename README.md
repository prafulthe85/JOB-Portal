# 🧠 AI-Powered Job Portal (MERN Stack + LLM Integration)

A full-featured job portal built with the **MERN stack** (**MongoDB, Express.js, React.js, Node.js**), enhanced with **AI capabilities** and **LLM integration** for an intelligent, seamless user experience.

This platform enables users to browse and apply for jobs, manage their applications, and generate job listings using AI prompts. It also includes blog quality analysis powered by LLMs.

---

## 🚀 Features

- 🔐 **User Authentication**  
  Secure login/register with **JWT-based authentication** for both job seekers and employers.

- 💼 **Job Listings & Application Management**

  - Users can browse dynamic job listings stored in MongoDB.
  - Employers can post jobs and manage applications.
  - Candidates can apply and track their application status.

- 🧠 **AI & LLM Integration**

  - Integrated **LLM API** to **generate job descriptions** from user prompts.
  - **Blog Quality Score**: AI evaluates blog content and suggests improvements.

- 🛠️ **State Management with Redux Toolkit**  
  Efficient and scalable global state management using Redux for authentication, job data, and UI feedback.

- 📷 **Image Upload Support**  
  Blog creation supports image uploads via `FormData`, with proper validation and previews.

- 📊 **Smart Filtering & Pagination**  
  Combine filters like **Category**, **Title**, and **Your Blogs**, with **pagination** for optimized UX.

- 📱 **Responsive UI**  
  Clean, modern, and mobile-friendly interface built with React and Tailwind CSS.

## Technologies Used

- **Frontend:** React.js, React Router, Bootstrap
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT (JSON Web Tokens), Bcrypt (for password hash)
- **Image Upload:** Cloudinary for storing and managing uploaded images
- **Deployment:** Vercel (frontend), Render(backend), MongoDB Atlas (database)

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- Node.js installed on your machine with latest version or v22.2.0 above
- MongoDB Atlas account (or local MongoDB server)
- Cloudinary account for image storage

### Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/prafulthe85/JOB-Portal.git
   ```
2. Install NPM packages:
   ```sh
   cd react-job-portal
   cd backend
   npm install
   cd..
   cd frontend
   npm install
   ```
3. Set up environment variables:

   - Create a `config.env` file after creating a `config folder` in the backend directory, containing the following variables:

   ```env
   PORT=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_CLOUD_NAME=
   FRONTEND_URL=
   DB_URL=
   JWT_SECRET_KEY=
   JWT_EXPIRE=
   COOKIE_EXPIRE=
   ```

   Replace each value with your specific configuration details.

4. Run the application in fronted folder:
   ```sh
   npm run dev
   ```
5. Run the application in backend folder:
   ```sh
   npm start
   ```
6. Open your browser and navigate to `http://localhost:5173` to view the app.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request (`we will merge within 24 hour`)

## Please give a star to the repository if you like it.

## 📬 Contact & Project Info

**👤 Author:** Praful Gupta

[![GitHub](https://img.shields.io/badge/GitHub-prafulthe85-181717?style=flat-square&logo=github)](https://github.com/prafulthe85)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-prafulgupta85-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/prafulgupta85/)  
[![Instagram](https://img.shields.io/badge/Instagram-@candid__gmad__85_-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://www.instagram.com/candid_gmad_85/)

---

## 🚀 Project Links

🔗 **Project Repository:**  
[📂 JOB-Portal GitHub Repo](https://github.com/prafulthe85/JOB-Portal)

🌐 **Live Hosted Link:**  
[🔗 jobportalx.netlify.app](https://jobportalx.netlify.app/)

---

## 🔐 Demo Login Credentials

**🧑 Employer**

- **Email:** `guptapraful130@gmail.com`
- **Password:** `Praful@1234`

**🙋 Job Seeker**

- **Email:** `guptapraful130+2@gmail.com`
- **Password:** `Praful@1234`

**⌚ Cron Job**

- **Cron Scheduled at:** `https://console.cron-job.org/jobs`

📫 _Feel free to connect or give feedback!_
