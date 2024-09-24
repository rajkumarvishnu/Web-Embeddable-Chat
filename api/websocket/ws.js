import { Server } from "http";
import WebSocket from "ws";

export default function handler(req, res) {
	if (!res.socket.server.wss) {
		console.log("Initializing WebSocket server...");

		const server = new Server(res.socket.server);
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

		res.socket.server.wss = wss;
	}

	res.status(200).end("WebSocket server is running");
}
