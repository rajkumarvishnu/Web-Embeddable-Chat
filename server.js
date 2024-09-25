// server.js

const http = require("http");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("WebSocket server is running");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
	console.log("New client connected");

	ws.on("message", async (message) => {
		console.log("Received:", message);

		// Parse the incoming message
		const parsedMessage = JSON.parse(message);

		// Dynamically import node-fetch
		const fetch = (await import("node-fetch")).default;

		// Make the API call
		try {
			const response = await fetch(
				"https://YOUR DOMAIN/copilot/orchestrator-be/execute_workflow",
				{
					method: "POST",
					headers: {
						accept: "application/json",
						"api-key": "YOUR KEY",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						endpoint: "a9cd874d-009b-48af-8b81-19d906dd3fa9",
						input_value: parsedMessage.text,
						session_id: "dsfasdfsadfsadfsad",
						input_type: "chat",
						output_type: "chat",
						tweaks: {},
					}),
				}
			);

			const apiResponse = await response.json();
			console.log(apiResponse);
			resp = apiResponse.output[0].message;

			// Send the API response back to the WebSocket client
			ws.send(
				JSON.stringify({
					sender: "bot",
					text: resp,
				})
			);
		} catch (error) {
			console.error("Error making API call:", error);
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
