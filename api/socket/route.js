// app/api/socket/route.js
import { NextResponse } from "next/server";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

export const runtime = "edge"; // You might need to change this to 'nodejs' if edge runtime doesn't support all features

export function GET(req) {
	if (req.headers.get("upgrade") !== "websocket") {
		return new NextResponse("Expected Upgrade: websocket", { status: 426 });
	}

	const { socket, response } = new WebSocket(req);

	const io = new Server(socket, {
		path: "/api/socket",
		addTrailingSlash: false,
	});

	io.on("connection", (socket) => {
		console.log("New client connected");
		socket.id = uuidv4();
		console.log(`New client connected with ID: ${socket.id}`);

		socket.on("message", async (message) => {
			console.log("Received:", message);

			// Server-side code
			socket.emit("typing", { isTyping: true });

			// Parse the incoming message
			const parsedMessage = JSON.parse(message);

			// Make the API call
			try {
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
						session_id: socket.id,
						input_type: "chat",
						output_type: "chat",
						tweaks: {},
					}),
				});

				const apiResponse = await response.json();
				console.log(apiResponse);
				const resp = apiResponse.output[0].message;

				socket.emit("typing", { isTyping: false });

				// Send the API response back to the WebSocket client
				socket.emit("message", {
					sender: "bot",
					text: resp,
				});
			} catch (error) {
				console.error("Error making API call:", error);
				socket.emit("typing", { isTyping: false });
				socket.emit("message", {
					sender: "bot",
					text: "Error processing your request.",
				});
			}
		});

		socket.on("disconnect", () => {
			console.log("Client disconnected");
		});
	});

	return response;
}
