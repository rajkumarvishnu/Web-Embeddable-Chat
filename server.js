// server.js

const WebSocket = require("ws");
const http = require("http");

const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("WebSocket server is running");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
	console.log("New client connected");

	ws.on("message", (message) => {
		console.log("Received:", message);

		// Parse the incoming message
		const parsedMessage = JSON.parse(message);

		// Echo the message back to the sender
		ws.send(
			JSON.stringify({
				sender: "bot",
				text: `You said: "${parsedMessage.text}"`,
			})
		);
	});

	ws.on("close", () => {
		console.log("Client disconnected");
	});
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
