// chat-window.js

class ChatWindow {
	constructor(containerId, options = {}) {
		this.container = document.getElementById(containerId);
		this.options = {
			title: options.title || "Chat Window",
			width: options.width || "350px",
			height: options.height || "400px",
			websocketUrl: options.websocketUrl || "ws://localhost:8080",
		};
		this.messages = [];
		this.isTyping = false;
		this.typingAnimationInterval = null;
		this.render();
		this.connectWebSocket();
	}

	render() {
		this.container.innerHTML = `
      <div class="chat-window" style="
        width: ${this.options.width};
        height: ${this.options.height};
        position: fixed;
        right: 20px;
        bottom: 20px;
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
        display: flex;
        flex-direction: column;
        z-index: 1000;
      ">
        <div class="chat-header" style="
          background-color: #4CAF50;
          color: white;
          padding: 15px;
          font-weight: bold;
          font-size: 16px;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        ">
          ${this.options.title}
        </div>
        <div class="chat-messages" style="
          flex-grow: 1;
          overflow-y: auto;
          padding: 15px;
          background-color: #f5f5f5;
        "></div>
        <div class="typing-indicator" style="
          padding: 10px;
          font-style: italic;
          color: #666;
          display: none;
        ">
          Bot is typing<span class="typing-dots"></span>
        </div>
        <div class="chat-input" style="
          padding: 15px;
          background-color: #fff;
          border-top: 1px solid #e0e0e0;
          display: flex;
        ">
          <input type="text" placeholder="Type a message..." style="
            flex-grow: 1;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            padding: 10px 15px;
            margin-right: 10px;
            outline: none;
          ">
          <button style="
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 20px;
            cursor: pointer;
            transition: background-color 0.3s;
          ">Send</button>
        </div>
      </div>
    `;

		this.messageContainer = this.container.querySelector(".chat-messages");
		this.typingIndicator =
			this.container.querySelector(".typing-indicator");
		this.typingDots = this.container.querySelector(".typing-dots");
		this.input = this.container.querySelector("input");
		this.sendButton = this.container.querySelector("button");

		this.sendButton.addEventListener("click", () => this.sendMessage());
		this.input.addEventListener("keypress", (e) => {
			if (e.key === "Enter") this.sendMessage();
		});

		// Add hover effect to send button
		this.sendButton.addEventListener("mouseover", () => {
			this.sendButton.style.backgroundColor = "#45a049";
		});
		this.sendButton.addEventListener("mouseout", () => {
			this.sendButton.style.backgroundColor = "#4CAF50";
		});
	}

	connectWebSocket() {
		this.socket = new WebSocket(this.options.websocketUrl);

		this.socket.onopen = () => {
			console.log("WebSocket connection established");
			this.addMessage("system", "Connected to chat");
		};

		this.socket.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "typing") {
				this.setTypingIndicator(message.isTyping);
			} else {
				this.addMessage(message.sender, message.text);
			}
		};

		this.socket.onclose = () => {
			console.log("WebSocket connection closed");
			this.addMessage("system", "Disconnected from chat");
		};

		this.socket.onerror = (error) => {
			console.error("WebSocket error:", error);
			this.addMessage("system", "Error: Could not connect to chat");
		};
	}

	sendMessage() {
		const message = this.input.value.trim();
		if (message && this.socket.readyState === WebSocket.OPEN) {
			// Immediately display the user's message
			this.addMessage("user", message);

			// Send the message to the server
			this.socket.send(JSON.stringify({ sender: "user", text: message }));

			// Clear the input field
			this.input.value = "";
		}
	}

	addMessage(sender, text) {
		this.messages.push({ sender, text });
		this.updateMessages();
		this.setTypingIndicator(false);
	}

	updateMessages() {
		this.messageContainer.innerHTML = this.messages
			.map(
				(msg) => `
      <div style="
        margin-bottom: 10px;
        ${msg.sender === "user" ? "text-align: right;" : ""}
      ">
        <span style="
          display: inline-block;
          padding: 8px 12px;
          border-radius: 18px;
          max-width: 70%;
          word-wrap: break-word;
          ${
				msg.sender === "user"
					? "background-color: #4CAF50; color: white;"
					: msg.sender === "system"
					? "background-color: #f1f1f1; color: #333;"
					: "background-color: #e0e0e0; color: #333;"
			}
        ">
          <strong>${
				msg.sender === "user"
					? "You"
					: msg.sender === "system"
					? "System"
					: "Bot"
			}:</strong> ${msg.text}
        </span>
      </div>
    `
			)
			.join("");
		this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
	}

	setTypingIndicator(isTyping) {
		this.isTyping = isTyping;
		this.typingIndicator.style.display = isTyping ? "block" : "none";
		if (isTyping) {
			this.messageContainer.scrollTop =
				this.messageContainer.scrollHeight;
			this.startTypingAnimation();
		} else {
			this.stopTypingAnimation();
		}
	}

	startTypingAnimation() {
		let dotCount = 0;
		this.typingAnimationInterval = setInterval(() => {
			dotCount = (dotCount + 1) % 4;
			this.typingDots.textContent = ".".repeat(dotCount);
		}, 500);
	}

	stopTypingAnimation() {
		if (this.typingAnimationInterval) {
			clearInterval(this.typingAnimationInterval);
			this.typingAnimationInterval = null;
		}
	}
}

// Usage example
// const chat = new ChatWindow('chat-container', {
//   title: 'Customer Support',
//   websocketUrl: 'ws://localhost:8080'
// });
