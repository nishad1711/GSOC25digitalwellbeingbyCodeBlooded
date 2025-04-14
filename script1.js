document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const messagesContainer = document.getElementById("messagesContainer");
  const emptyState = document.getElementById("emptyState");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const userToggle = document.getElementById("userToggle");
  const themeToggle = document.getElementById("themeToggle");
  const typingIndicator = document.getElementById("typingIndicator");
  const notification = document.getElementById("notification");

  // App state
  let currentUser = "User 1";
  const messages = [];
  let isDarkMode = false;
  let typingTimeout = null;
  let notificationTimeout = null;

  // Toxic words list with strict word boundaries
  const toxicWords = [
    "dumb",
    "bitch",
    "fuck",
    "nigga",
    "shit",
    "asshole",
    "cunt",
    "faggot",
    "retard",
    "whore",
    "slut",
    "bastard",
    "damn",
    "hell", // Note: "hell" may still need careful handling
    "idiot",
    "stupid",
    "jerk",
    "loser",
  ];

  // Check for toxic content with strict word boundaries
  function checkToxicity(message) {
    const lowerMessage = message.toLowerCase();
    // Use regex with word boundaries to prevent substring matches
    return toxicWords.some((word) => {
      const regex = new RegExp(`\\b${word}\\b`);
      const isToxic = regex.test(lowerMessage);
      if (isToxic) {
        console.log(`Toxic word detected: ${word} in message: ${message}`);
      }
      return isToxic;
    });
  }

  // Add welcome message
  function addWelcomeMessage() {
    const welcomeDiv = document.createElement("div");
    welcomeDiv.className = "welcome-message";
    welcomeDiv.innerHTML = `
        <h3>Welcome to QuickChat</h3>
        <p>Try sending a message about weather, movies, food, or ask a question!</p>
      `;
    messagesContainer.insertBefore(welcomeDiv, typingIndicator);
  }

  addWelcomeMessage();

  // Event listeners
  messageInput.addEventListener("input", function () {
    sendButton.disabled = !messageInput.value.trim();

    // Auto-expand textarea
    messageInput.style.height = "auto";
    messageInput.style.height = `${Math.min(messageInput.scrollHeight, 120)}px`;

    // Show typing indicator for the other user
    if (messageInput.value.trim()) {
      showTypingIndicator();
    }
  });

  messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendButton.disabled) {
        sendMessage();
      }
    }
  });

  sendButton.addEventListener("click", sendMessage);

  userToggle.addEventListener("click", function () {
    currentUser = currentUser === "User 1" ? "User 2" : "User 1";
    userToggle.innerHTML = `<i class="fas fa-user"></i> ${currentUser}`;
    renderMessages();

    // Hide typing indicator when switching users
    hideTypingIndicator();

    // Show notification
    showNotification(`Switched to ${currentUser}`);
  });

  themeToggle.addEventListener("click", toggleTheme);

  // Functions
  function sendMessage() {
    const messageText = messageInput.value.trim();

    if (messageText) {
      // Check for toxicity
      if (checkToxicity(messageText)) {
        showNotification(
          "Message contains inappropriate content and cannot be sent.",
          true
        );
        messageInput.value = "";
        messageInput.style.height = "auto";
        sendButton.disabled = true;
        return;
      }

      // Add message to array
      messages.push({
        text: sanitizeInput(messageText),
        sender: currentUser,
        time: new Date(),
        status: "sent",
        isToxic: false,
      });

      // Clear input
      messageInput.value = "";
      messageInput.style.height = "auto";
      sendButton.disabled = true;

      // Render messages
      renderMessages();

      // Focus back on input
      messageInput.focus();

      // Hide typing indicator
      hideTypingIndicator();

      // Simulate reply from the other user
      if (Math.random() > 0.2) {
        simulateTyping(messageText);
      }
    }
  }

  function renderMessages() {
    // Hide empty state if we have messages
    if (messages.length > 0) {
      emptyState.style.display = "none";
    } else {
      emptyState.style.display = "flex";
      return;
    }

    // Clear container except for welcome message, empty state, and typing indicator
    const messagesToRemove = messagesContainer.querySelectorAll(
      ".message, .day-divider"
    );
    messagesToRemove.forEach((element) => {
      messagesContainer.removeChild(element);
    });

    // Add date dividers and messages
    let lastDate = null;

    messages.forEach((msg, index) => {
      const messageDate = new Date(msg.time);
      const messageDay = messageDate.toLocaleDateString();

      // Add date divider if it's a new day
      if (lastDate !== messageDay) {
        const divider = document.createElement("div");
        divider.className = "day-divider";

        // Format date: Today, Yesterday, or date
        const today = new Date().toLocaleDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString();

        let dateText;
        if (messageDay === today) {
          dateText = "Today";
        } else if (messageDay === yesterdayStr) {
          dateText = "Yesterday";
        } else {
          dateText = messageDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
        }

        divider.textContent = dateText;
        messagesContainer.insertBefore(divider, typingIndicator);
        lastDate = messageDay;
      }

      // Create message element
      const messageElement = document.createElement("div");
      messageElement.className = `message ${
        msg.sender === currentUser ? "sent" : "received"
      } ${msg.isToxic ? "toxic" : ""}`;

      const textElement = document.createElement("p");
      textElement.textContent = msg.text;

      const timeElement = document.createElement("div");
      timeElement.className = "time";
      timeElement.innerHTML = `${messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      // Add read status for sent messages
      if (msg.sender === currentUser && msg.status === "read") {
        timeElement.innerHTML += ' <i class="fas fa-check-double"></i>';
      } else if (msg.sender === currentUser) {
        timeElement.innerHTML += ' <i class="fas fa-check"></i>';
      }

      messageElement.appendChild(textElement);
      messageElement.appendChild(timeElement);

      // Add toxic label if flagged
      if (msg.isToxic) {
        const toxicLabel = document.createElement("span");
        toxicLabel.className = "toxic-label";
        toxicLabel.textContent = "Flagged as toxic";
        messageElement.appendChild(toxicLabel);
      }

      // Insert before typing indicator
      messagesContainer.insertBefore(messageElement, typingIndicator);

      // Mark previous messages as read after a delay
      if (
        index > 0 &&
        messages[index - 1].sender !== currentUser &&
        messages[index - 1].status !== "read"
      ) {
        setTimeout(() => {
          messages[index - 1].status = "read";
          renderMessages();
        }, 1000);
      }
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function toggleTheme() {
    const root = document.documentElement;
    isDarkMode = !isDarkMode;

    if (isDarkMode) {
      root.style.setProperty("--primary-color", "#8e24aa");
      root.style.setProperty("--primary-light", "#a84dc7");
      root.style.setProperty("--primary-dark", "#6a1b9a");
      root.style.setProperty("--background-color", "#121212");
      root.style.setProperty("--card-color", "#1e1e1e");
      root.style.setProperty("--text-primary", "#e0e0e0");
      root.style.setProperty("--text-secondary", "#b0b0b0");
      root.style.setProperty("--sent-message", "#8e24aa");
      root.style.setProperty("--received-message", "#333333");
      root.style.setProperty("--toxic-color", "#ff6666");
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      showNotification("Dark mode enabled");
    } else {
      root.style.setProperty("--primary-color", "#5b42f3");
      root.style.setProperty("--primary-light", "#7e6af5");
      root.style.setProperty("--primary-dark", "#4935c7");
      root.style.setProperty("--background-color", "#f8f9fa");
      root.style.setProperty("--card-color", "#ffffff");
      root.style.setProperty("--text-primary", "#333333");
      root.style.setProperty("--text-secondary", "#666666");
      root.style.setProperty("--sent-message", "#5b42f3");
      root.style.setProperty("--received-message", "#e9ecef");
      root.style.setProperty("--toxic-color", "#ff4d4d");
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      showNotification("Light mode enabled");
    }
  }

  function showTypingIndicator() {
    if (currentUser === "User 1") {
      typingIndicator.querySelector("span").textContent = "User 2 is typing";
    } else {
      typingIndicator.querySelector("span").textContent = "User 1 is typing";
    }

    typingIndicator.classList.add("visible");

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Hide typing indicator after 3 seconds
    typingTimeout = setTimeout(() => {
      hideTypingIndicator();
    }, 3000);
  }

  function hideTypingIndicator() {
    typingIndicator.classList.remove("visible");
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  }

  function showNotification(message, isError = false) {
    notification.querySelector(".content").textContent = message;
    if (isError) {
      notification.classList.add("error");
      notification.querySelector(".icon").innerHTML =
        '<i class="fas fa-exclamation-circle"></i>';
    } else {
      notification.classList.remove("error");
      notification.querySelector(".icon").innerHTML =
        '<i class="fas fa-bell"></i>';
    }
    notification.classList.add("show");

    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    notificationTimeout = setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  function simulateTyping(userMessage) {
    setTimeout(() => {
      showTypingIndicator();
      setTimeout(() => {
        const reply = generateContextualReply(userMessage);
        const isReplyToxic = checkToxicity(reply);
        if (isReplyToxic) {
          console.log(`Simulated reply flagged as toxic: ${reply}`);
        }
        messages.push({
          text: sanitizeInput(reply),
          sender: currentUser === "User 1" ? "User 2" : "User 1",
          time: new Date(),
          status: "sent",
          isToxic: isReplyToxic,
        });
        hideTypingIndicator();
        renderMessages();
        showNotification("New message received");
      }, 2000);
    }, 1000);
  }

  function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  }

  function generateContextualReply(userMessage) {
    // Convert to lowercase for easier matching
    const lowerMessage = userMessage.toLowerCase();

    // Check for greetings
    if (
      /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(
        lowerMessage
      )
    ) {
      const greetings = [
        "Hello there! How are you today?",
        "Hi! Nice to chat with you.",
        "Hey! How's your day going?",
        "Hello! What's on your mind?",
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Check for questions
    if (lowerMessage.includes("?")) {
      if (
        /\b(how are you|how's it going|how are things)\b/.test(lowerMessage)
      ) {
        const responses = [
          "I'm doing well, thanks for asking! How about you?",
          "Pretty good! Just taking it one day at a time. You?",
          "Can't complain! How's your day been?",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }

      if (/\b(what|when|where|why|how|who)\b/.test(lowerMessage)) {
        const responses = [
          "That's an interesting question. Let me think about that.",
          "Good question! I'd need to know more details to give you a proper answer.",
          "I've been wondering about that too, actually.",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Check for weather mentions
    if (
      /\b(weather|rain|sunny|cold|hot|snow|temperature)\b/.test(lowerMessage)
    ) {
      const responses = [
        "The weather has been quite unpredictable lately, hasn't it?",
        "I heard it's going to be really nice this weekend!",
        "I love this time of year, weather-wise.",
        "Do you prefer sunny days or rainy days?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Check for movie mentions
    if (
      /\b(movie|film|watch|cinema|theater|netflix|show|series)\b/.test(
        lowerMessage
      )
    ) {
      const responses = [
        "I've been watching a lot of movies lately. Any recommendations?",
        "Have you seen anything good recently?",
        "I'm always looking for new things to watch. What genres do you like?",
        "I heard there are some great new releases coming out soon.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Check for food mentions
    if (
      /\b(food|eat|dinner|lunch|breakfast|restaurant|cooking|recipe)\b/.test(
        lowerMessage
      )
    ) {
      const responses = [
        "I'm getting hungry just thinking about food! What's your favorite cuisine?",
        "I tried a new restaurant the other day. The food was amazing!",
        "Do you like to cook? I've been trying to learn some new recipes.",
        "Nothing beats a good meal with friends, right?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Check for work or study mentions
    if (
      /\b(work|job|office|study|school|college|university|homework|project)\b/.test(
        lowerMessage
      )
    ) {
      const responses = [
        "How's work/school going for you these days?",
        "I've been pretty busy with projects lately too.",
        "It's important to maintain a good work-life balance.",
        "What field are you in? It sounds interesting!",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Check for weekend or plans mentions
    if (/\b(weekend|plan|vacation|holiday|trip|travel)\b/.test(lowerMessage)) {
      const responses = [
        "Any exciting plans coming up?",
        "I love planning trips! Where would you like to go next?",
        "Weekends always go by too quickly, don't they?",
        "Sometimes a relaxing weekend at home is the best.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Check for expressions of feeling
    if (
      /\b(happy|sad|excited|tired|exhausted|bored|angry|frustrated)\b/.test(
        lowerMessage
      )
    ) {
      const responses = [
        "I understand how you feel. Would you like to talk about it?",
        "It's good to acknowledge your feelings. Is there anything that might help?",
        "I've felt that way before too. Things usually get better with time.",
        "Thanks for sharing that with me.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Default responses if no specific context is matched
    const defaultResponses = [
      "That's cool! Tell me more.",
      "Interesting, what's next?",
      "I hear you! What's on your mind now?",
      "Nice one! Got any other thoughts?",
    ];
    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  }
});
