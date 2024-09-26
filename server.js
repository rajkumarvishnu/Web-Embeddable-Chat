// server.js

const http = require("http");
const WebSocket = require("ws");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("WebSocket server is running");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
	console.log("New client connected");
	ws.id = uuidv4();
	console.log(`New client connected with ID: ${ws.id}`);

	ws.on("message", async (message) => {
		console.log("Received:", message);
		// Server-side code
		ws.send(JSON.stringify({ type: "typing", isTyping: true }));

		// Parse the incoming message
		const parsedMessage = JSON.parse(message);

		// Dynamically import node-fetch
		const fetch = (await import("node-fetch")).default;

		// Make the API call
		try {
			console.log(process.env.API_KEY);
			const response = await fetch(process.env.URI, {
				method: "POST",
				headers: {
					accept: "application/json",
					"api-key": process.env.API_KEY,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					endpoint: process.env.ENDPOINT,
					input_value: parsedMessage.text,
					session_id: ws.id,
					input_type: "chat",
					output_type: "chat",
					tweaks: {},
				}),
			});

			const apiResponse = await response.json();
			console.log(apiResponse);
			resp = apiResponse.output[0].message;
			ws.send(JSON.stringify({ type: "typing", isTyping: false }));

			// Send the API response back to the WebSocket client
			ws.send(
				JSON.stringify({
					sender: "bot",
					text: resp,
				})
			);
		} catch (error) {
			console.error("Error making API call:", error);
			ws.send(JSON.stringify({ type: "typing", isTyping: true }));

			ws.send(
				JSON.stringify({
					sender: "bot",
					text: "Error processing your request.",
				})
			);
		}
	});

	ws.on("close", () => {
		console.log("Client disconnected");
	});
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
