// Libs
const express = require('express');
const socketIO = require('socket.io');

// Connection data
const connection_data = {
	index: "/views/index.html",
	ip: "127.0.0.1",
	port: process.env.PORT || 6060
};

// Chat users array
let chat_users = [];

// Start web page application
let app = express();

app.get('/', function (req, res) {
	res.sendFile(connection_data.index, { root: __dirname })
});

app.use(express.static("public"));
const server = express().use((req, res) => res.sendFile(
	connection_data.index, {
	root: __dirname
})).listen(connection_data.port, () =>
	console.log(`Página iniciada. URL: ${connection_data.port}`)
);

const socket_server = socketIO(server);

socket_server.on("connection", function (socket) {
	socket.on("chat_user_login", function (nome, callback) {
		if (!(nome in chat_users)) {
			// Add user to chat_users array
			socket.nome = nome;
			chat_users[nome] = socket;
			socket_server.sockets.emit("update_chat_users", Object.keys(chat_users));
			// Send welcome message on user login
			let welcome_message = nome + " entrou no bate-papo!";
			socket_server.sockets.emit("update_message", { message: welcome_message, sender: 'Sistema', date: get_date(), type: 'welcome' });
			callback(3);
		} else {
			callback(4);
		}
});


	socket.on("send_message", function (data, callback) {
		socket_server.sockets.emit("update_message", { message: data.message, sender: socket.nome, date: get_date(), type: '' });
		callback();
	});

	socket.on("disconnect", function () {
		if (socket.nome) {
			// Remove user in the array list
			delete chat_users[socket.nome];
			socket_server.sockets.emit("update_chat_users", Object.keys(chat_users));
			// Send exit message (type: exit)
			let exit_message = socket.nome + " saiu do bate-papo";
			socket_server.sockets.emit("update_message", { message: exit_message, sender: 'Sistema', date: get_date(), type: 'exit' });
		} else {
			return
		}
	});
});

function get_date() {
	let date = new Date();
	let hour = (date.getHours() < 10 ? '0' : '') + date.getHours();
	let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

	return hour + ":" + minutes;
}

