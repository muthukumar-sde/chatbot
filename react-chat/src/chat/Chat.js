import React from 'react';
import './chat.css';
import { io } from "socket.io-client";
const SERVER = "http://127.0.0.1:8090";

export class Chat extends React.Component {
    socket;
    constructor(props) {
        super(props)
        this.state = {
            socketId: null,
            chatBody: [],
            message: "",
        }
    }
    componentDidMount() {
        this.scrollToBottom();
        this.configureSocket();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    configureSocket = () => {
        var socket = io(SERVER);
        socket.on('connect', () => {
            this.setState({ socketId: socket.id });
            this.socket.emit('chatInit', socket.id);
        });
        socket.on('welcome_message', response => {
            this.setState({ chatBody: [...this.state.chatBody, response] })
        });
        this.socket = socket;
    }

    sendAnswer = (question) => {
        var response = { statement: question, server: false }
        this.setState({
            chatBody: [...this.state.chatBody, response],
            message: ""
        }, () => {
            this.socket.emit('send-answer', question);
        })
    }

    render() {
        const { chatBody } = this.state;
        return (
            <div className="container">
                <div className="row mb-4">
                    <div className="col-12 text-center pt-3">
                        <h1>Starberry Chatbot</h1>
                    </div>
                </div>
                <div className="row justify-content-md-center mb-4">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body messages-box"  >
                                <ul className="list-unstyled messages-list" >
                                    {
                                        (chatBody) ?
                                            chatBody.map((chat, i) => {
                                                return (
                                                    <li className={`messages-${(chat.server) ? 'you' : 'me'} clearfix`} key={i}>
                                                        <p className="message-img img-circle">
                                                            <img src={chat.server ? 'support.jpg' : 'user.png'} alt="User Avatar" width="85px" className="avatar-sm border rounded-circle" />
                                                        </p>
                                                        <div className="message-body clearfix">
                                                            <div className="message-header">
                                                                <strong className="messages-title">{(chat.server) ? 'Support' : 'Me'}</strong>
                                                                <small className="time-messages text-muted">  <span className="fas fa-time"></span>&nbsp;                                                 </small>
                                                            </div>
                                                            {chat.statement ?
                                                                <p className="messages-p">{chat.statement}</p>
                                                                : null
                                                            }
                                                            {
                                                                (chat.questions) ? (
                                                                    chat.questions.map((question, i) => {
                                                                        return (
                                                                            question.statement ?
                                                                                <p className="messages-p" key={i}>{question.ques}</p>
                                                                                :
                                                                                <button className="btn btn-outline-primary answer-btn" key={i} onClick={() => { this.sendAnswer(question.ques) }}>{question.ques}</button>
                                                                        )
                                                                    })
                                                                ) : null
                                                            }
                                                        </div>
                                                    </li>)
                                            })
                                            : null
                                    }
                                </ul>
                                <div style={{ float: "left", clear: "both" }}
                                    ref={(el) => { this.messagesEnd = el; }}>
                                </div>
                            </div>
                        </div>
                        <div className="card-header">
                            <div className="input-group">
                                <input  
                                    type="text"
                                    value={this.state.message}
                                    name="message"
                                    className="form-control input-sm"
                                    placeholder="Type your message here..."
                                    onChange={(e) => {
                                        this.setState({ message: e.target.value })
                                    }}
                                />
                                <span className="input-group-append">
                                    <button className="btn btn-primary" type="button"
                                        onClick={() => {
                                            if (this.state.message !== "") {
                                                this.sendAnswer(this.state.message)
                                            }
                                        }
                                        }
                                    >Send</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}