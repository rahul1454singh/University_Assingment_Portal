# University Assignment Portal

This is a web application I built for universities to help manage assignment submissions. 

### What it does
The project solves the problem of professors getting too many assignment files on their email or WhatsApp. It keeps everything organized in one place. It has three main parts:

1. **Admin Panel**: The admin sets up the departments and creates accounts for both students and professors.
2. **Student Portal**: Students log in, select their specific professor, and upload their completed assignment files.
3. **Professor Portal**: Professors log in to see all the files submitted to them. They can review the work and simply click "Approve" or "Reject".

### Tech Stack
Here is the technology I used and why:
- **React & Vite (Frontend)**: To build the website interface so it loads fast and runs smoothly.
- **Node.js & Express (Backend)**: To create the server that handles user logins and processes the data.
- **MongoDB (Database)**: To save all the user accounts, department info, and assignment details.
- **Cloudinary**: To safely store the actual assignment files that students upload.
- **Socket.io**: To handle real-time features.

### How to run the project on your computer

1. Clone this repository to your computer.
2. Open a terminal and go into the `backend` folder. 
3. Run `npm install` to get all the backend packages.
4. Create a `.env` file in the `backend` folder. You will need to add your own database and Cloudinary details (like `PORT`, `MONGODB_URI`, `JWT_SECRET`, and Cloudinary API keys).
5. Run `npm start` to start the backend server.
6. Open a second terminal, go to the `frontend` folder, and run `npm install`.
7. Finally, run `npm run dev` to start the website.
