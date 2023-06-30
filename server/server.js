const app = require('express')();
const http = require('http').createServer(app);
const _ = require('lodash');
const nodemailer = require("nodemailer");
const PORT = 8090;
const config = require("./config");

const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        //allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

//Mail config
var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: config.mailCredential,
	tls: {rejectUnauthorized: false}
}); 

var statement = [
    `Hi Welcome to chat bot !
Please select you queries below`];

//Chat bot questions
var questions = [
    { id: 1, ques: 'Issue with Previous Order?', child: null },
    { id: 2, ques: 'Issue with Previous Payment?', child: null },
    { id: 3, ques: 'Show my Last Order status', child: null },
    { id: 4, ques: 'Cancel My Last Order', child: null },
    { id: 5, ques: 'Order Status Not updated?', child: 1 },
    { id: 6, ques: 'Mistakenly placed the order?', child: 1 },
    { id: 7, ques: 'Amount debited but payment not updated', child: 2 },
    { id: 8, ques: 'Payment failed?', child: 2 },
    { id: 9, ques: 'Your last order status is completed(Order ID : 132456). Your Items are ready for shipping', child: 3, statement: true },
    { id: 11, ques: 'Your last order cancelled successfully!', child: 4, statement: true },
    { id: 12, ques: 'Your order is in-progress. please wait for sometime!', child: 5, statement: true },
    { id: 13, ques: 'Your last order will be cancelled shortly.', child: 6, statement: true },
    { id: 14, ques: 'Your payment will be credited within 24 hours', child: 7, statement: true },
    { id: 15, ques: 'There is an issue on Payment server. please try again after sometime ', child: 8, statement: true },
    { id: 16, ques: 'There is an issue on Payment server. please try again after sometime ', child: 9, statement: true },
    { id: 17, ques: 'Hi', child: 18, statement: true },
    { id: 18, ques: 'Hello', child: 17, statement: true }
];

app.get("/", function (req, res, next) {
    res.json("Welcome to Node js and socket Chatbot");
});

//Connect Socket
io.on('connection', (socket) => {
    console.log('New Client Connected', socket.id);
    socket.emit('connection', null);
    socket.on('chatInit', (connectionId) => {
        let question = _.filter(questions, function (o) { return o.child == null; });
        io.to(socket.id).emit("welcome_message", { statement: statement[0], questions: question, server: true });
    });
    socket.on('send-answer', (answer) => {
        let givenAnswer = _.filter(questions, function (o) { return _.toLower(o.ques) == _.toLower(answer); });       
        if (!_.isEmpty(givenAnswer)) {
            let question = _.filter(questions, function (o) { return o.child == givenAnswer[0].id; });
            io.to(socket.id).emit("welcome_message", { questions: question, server: true });
        } else {
            
            io.to(socket.id).emit("welcome_message", { questions: [{ ques: 'Your Query has been submitted to Our Team. Our Executive will contact shortly', statement: true }], server: true });
			mailSend(answer, (res) => {})
        }
    });
    socket.on('disconnect', () => {
        console.log('Disconnect', socket.id)
    });

});


const mailSend = (question, callback) => {
    var subject = `Support Question`;
    var mailContent = question;
    transporter.sendMail(
        {
            from: '"Starberry" muthukumaran195@gmail.com',
            to: "saranya@startberry.tv",
            subject: subject,
            html: `<p>${mailContent}</p> 	
           <p>Regards,<br/> 	
            Startbery Team</p>`,
        },
        function (error, info) {
            if (error) {
                console.log('Mail failed', error);
                callback(false);
            } else {
                console.log('Mail send');
                callback(true);
            }
        }
    );

}
