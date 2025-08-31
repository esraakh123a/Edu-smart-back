const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
app.use(express.json());
app.use(cors({
  origin: "http://localhost:4200", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.set("io", io);
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// env
require('dotenv').config();
const port = process.env.PORT;
const mongourl = process.env.MONGO_URI;
mongoose.connect(mongourl)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

// Routes
const routeuser = require('./routes/user');
app.use("/user", routeuser);

const routeEnrollment = require('./routes/Enrollment');
app.use("/enrollments", routeEnrollment);

const routequiz = require('./routes/quizRoutes (2)');
app.use("/quizzes", routequiz);

const routeresult = require('./routes/quizResultRoutes');
app.use("/quizResults", routeresult);

const routeCertificate = require('./routes/certificate');
app.use("/certificates", routeCertificate);

const routePayment = require('./routes/Payment');
app.use("/payments", routePayment);

const routeCoupon = require('./routes/coupon');
app.use("/coupons", routeCoupon);

const routeChatbot = require('./routes/chatbot');
app.use("/chatbot", routeChatbot);

const routeGoogle = require('./routes/google');
app.use("/google", routeGoogle);

const routelesson = require('./routes/lesson');
app.use("/lessons", routelesson);

const routecourse = require('./routes/courseRoutes');
app.use("/courses", routecourse);

const routeconversation = require('./routes/conversation');
app.use("/conversations", routeconversation);

const routeMessage = require('./routes/message');
app.use("/messages", routeMessage);

const routeSearch = require('./routes/Search');
app.use("/search", routeSearch);

const routeRating = require('./routes/Rating');
app.use("/ratings", routeRating);

const routeSort_and_filter = require('./routes/Sort_and_filter');
app.use("/sort_or_filter", routeSort_and_filter);

const routeDashboard = require('./routes/dashboard');
app.use("/dashboard", routeDashboard);

const routeAdmin = require('./routes/admin');
app.use("/admin", routeAdmin);

app.listen(port, () => {
  console.log('server is running on port ' + port);
});
