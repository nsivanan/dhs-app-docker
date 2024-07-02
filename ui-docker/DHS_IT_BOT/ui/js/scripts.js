const loader = `<span class='loader'><span class='loader__dot'></span><span class='loader__dot'></span><span class='loader__dot'></span></span>`;
const errorMessage =
  "My apologies, I'm not available at the moment. Please call our support team directly at 0123456789.";
const urlPattern =
  /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
const $document = document;
const $chatbot = $document.querySelector(".chatbot");
const $chatbotMessageWindow = $document.querySelector(
  ".chatbot__message-window"
);
const $chatbotHeader = $document.querySelector(".chatbot__header");
const $chatbotMessages = $document.querySelector(".chatbot__messages");
const $chatbotInput = $document.querySelector(".chatbot__input");
const $chatbotSubmit = $document.querySelector(".chatbot__submit");
const $chatbotCloseButton = $document.querySelector(".chatbot__close-button");
const $clearButton = document.getElementById("clear-button");
const $stopButton = document.getElementById("stop-button");
let isLoading = false;
let ratingGiven = false;
let ratingFormDisplayed = false;
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "en-US";
let isSpeechInput = false;
let synth = window.speechSynthesis;
let currentUtterance = null;

$chatbotInput.addEventListener("focus", () => {
  isSpeechInput = false;
});

$stopButton.addEventListener("click", function () {
  if (synth.speaking) {
    synth.cancel();
  }
  toggleButtons();
});

function toggleButtons() {
  if (synth.speaking) {
    $clearButton.style.display = "none";
    $stopButton.style.display = "block";
  } else {
    $clearButton.style.display = "block";
    $stopButton.style.display = "none";
  }
}

synth.addEventListener("start", toggleButtons);
synth.addEventListener("end", toggleButtons);
synth.addEventListener("pause", toggleButtons);
synth.addEventListener("resume", toggleButtons);

// Speek Button Functionality

// document.getElementById("speak-button").onclick = function () {
//   startSpeechRecognition();
// };

recognition.onresult = function (event) {
  const userInput = event.results[0][0].transcript;
  document.getElementById("user-input").value = userInput;
  isSpeechInput = true;
  submitMessage();
};

recognition.onerror = function (event) {
  console.error("Speech recognition error", event.error);
};

const keyWords = [
  "i want to log a ticket",
  "i want to raise a ticket",
  "issue not resolved. Need to connect with IT Support",
  "need help",
  "need help from it support",
  "i need it help.",
  "submit a support ticket",
  "request it assistance",
  "raise a support ticket",
  "can't resolve this issue",
  "need tech support",
  "it problem, need help",
  "it support needed",
  "facing technical difficulties",
  "submit it help request",
  "log an it issue",
  "tech issue, need support",
  "cannot fix this tech problem",
  "please assist with it issue",
  "require it support",
  "need to connect with it",
  "open a tech support ticket",
  "raise a ticket",
  "raise ticket",
  "help me",
  "support",
  "need support",
  "connect support",
  "tech support ticket",
];

$chatbotHeader.addEventListener(
  "click",
  () => {
    if (!$chatbot.classList.contains("chatbot--closed")) {
      toggle($chatbot, "chatbot--closed");
      if (!ratingFormDisplayed) {
        displaySatisfactionRating();
        ratingFormDisplayed = true;
      } else {
        toggle($chatbot, "chatbot--closed");
      }
    }
    toggle($chatbot, "chatbot--closed");
  },
  false
);

const scrollDown = () => {
  if (
    !$chatbotMessageWindow ||
    !$chatbotMessages ||
    !$chatbotMessages.lastChild
  ) {
    console.error("Required elements are not defined.");
    return false;
  }
  const distanceToScroll = $chatbotMessages.offsetHeight;
  $chatbotMessageWindow.scrollTo({ top: distanceToScroll, behavior: "smooth" });
  setTimeout(() => {
    console.log("Scroll position:", $chatbotMessageWindow.scrollTop);
  }, 1000);
  return false;
};

const toggle = (element, klass) => {
  const classes = element.className.match(/\S+/g) || [],
    index = classes.indexOf(klass);
  index >= 0 ? classes.splice(index, 1) : classes.push(klass);
  element.className = classes.join(" ");
};

const initializeSessionStorage = () => {
  if (!sessionStorage.getItem("qaArray")) {
    sessionStorage.setItem("qaArray", JSON.stringify([]));
  }
};

const saveQA = (user_input, bot_response) => {
  const qaArray = JSON.parse(sessionStorage.getItem("qaArray")) || [];
  qaArray.push({ user_input, bot_response });
  sessionStorage.setItem("qaArray", JSON.stringify(qaArray));
};

document.addEventListener("DOMContentLoaded", function () {
  initializeSessionStorage();
  $chatbotInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitMessage();
    }
  });
  $chatbotSubmit.addEventListener("click", function () {
    submitMessage();
  });
  $clearButton.addEventListener("click", clearChat);
});

const rasaServerUrl = "http://10.67.128.6/webhooks/rest/webhook";
// "https://deliveranswers.aeriestechnology.com/webhooks/rest/webhook";

document.getElementById("send-button").onclick = function () {
  submitMessage();
};

const removeLoader = () => {
  let loadingElem = document.getElementById("is-loading");
  if (loadingElem) $chatbotMessages.removeChild(loadingElem);
};

function addMessageToChat(sender, message, className, voiceMessage) {
  const chatContainer = document.getElementById("chat-container");
  const messageElement = document.createElement("div");
  messageElement.className = `message ${className}`;

  if (className === "bot" && isSpeechInput) {
    const utterance = new SpeechSynthesisUtterance(voiceMessage);
    // speechSynthesis.speak(currentUtterance);
    utterance.onstart = () => {
      toggleButtons();
    };
    utterance.onend = () => {
      toggleButtons();
    };
    speechSynthesis.speak(utterance);
  }
  toggleButtons();

  if (className === "user") {
    messageElement.innerHTML = `<li class='is-user animation'><p class='chatbot__message'>${message}</p><span class='chatbot__arrow chatbot__arrow--right'></span></li>`;
  } else {
    messageElement.innerHTML = `<li class='is-ai animation'><div class="is-ai__profile-picture"><img src="./images/chatbot.png" alt="" class="chatbot_icon"/></div><span class='chatbot__arrow chatbot__arrow--left'></span><div class='chatbot__message'><div class='loader-view'>${loader}</div><div class='message-view' style='display:none'>${message}</div></div></li>`;
    setTimeout(() => {
      const loaderView = messageElement.querySelector(".loader-view");
      const messageView = messageElement.querySelector(".message-view");
      loaderView.style.display = "none";
      messageView.style.display = "block";
    }, 2000);
  }

  chatContainer.appendChild(messageElement);
  scrollDown();

  if (className === "user") {
    isLoading = true;
    setTimeout(() => {
      removeLoader();
      isLoading = false;
      addBotResponse();
    }, 3000);
  }

  if (className === "bot" && message === "<ul><p>Sorry. I didnt understand. Do you want me to log a ticket?</p></ul>") {
    const buttonElement = document.createElement("button");
    buttonElement.innerText = "Log a Ticket";
    buttonElement.className = "log-ticket-button";
    buttonElement.onclick = displayRequestForm;
    chatContainer.appendChild(buttonElement);
    scrollDown();
  }
}

async function addBotResponse() {
  const userInput = document.getElementById("user-input").value;
  if (!userInput) return;

  const response = await fetch(rasaServerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender: "user", message: userInput }),
  });

  const messages = await response.json();
  ratingGiven = false;
  ratingFormDisplayed = false;

  messages.forEach((message) => {
    let rawMessage = formatMessage(message.text)
    let finalMessage = ""
    if(rawMessage === "<ul><p>Sorry, I didn't understand that. Can you please rephrase?</p></ul>"){
      finalMessage = "<ul><p>Sorry. I didnt understand. Do you want me to log a ticket?</p></ul>" 
    }
    else{
      finalMessage = rawMessage
    }
    // addMessageToChat("bot", formatMessage(message.text), "bot", message.text);
    addMessageToChat("bot", finalMessage, "bot", finalMessage);
    saveQA(userInput, message.text);
  });
}

function formatMessage(message) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  message = message.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
  const steps = message
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  let formattedMessage = "";
  for (let step of steps) {
    if (/^\d+\./.test(step)) {
      formattedMessage += `<li>${step}</li>`;
    } else {
      formattedMessage += `<p>${step}</p>`;
    }
  }
  return `<ul>${formattedMessage}</ul>`;
}

function displayRequestForm() {
  const chatContainer = document.getElementById("chat-container");
  const formContainer = document.createElement("div");
  formContainer.id = "formContainer";
  // formContainer.innerHTML = `<li class='is-ai animation' id='${
  //   isLoading ? "is-loading" : ""
  // }'>
  // <div class="is-ai__profile-picture">
  // <img src="./images/chatbot.png" alt="" class="chatbot_icon"/>
  // </div>
  // <span class='chatbot__arrow chatbot__arrow--left'></span>
  // <div class='chatbot__message'>
  // <form id="supportForm">
  // <input type="email" id="formEmail" placeholder="Your Email" required>
  // <div id="formEmailError" class="error-message">
  // </div>
  // <input type="text" id="formName" placeholder="Subject" required>
  // <div id="formNameError" class="error-message">
  // </div>
  // <textarea id="formDescription" placeholder="Description" required>
  // </textarea>
  // <div id="formDescriptionError" class="error-message">
  // </div>
  // <button id="formSubmit">Submit</button>
  // </form><
  // /div>
  // </li>`;
  formContainer.innerHTML = `
    <li class='is-ai animation' id='${isLoading ? "is-loading" : ""}'>
      <div class="is-ai__profile-picture">
        <img src="./images/chatbot.png" alt="" class="chatbot_icon"/>
      </div>
      <span class='chatbot__arrow chatbot__arrow--left'></span>
      <div class='chatbot__message'>
        <p>Please fill the form to log a ticket:</p>
        <form id="supportForm">
          <input type="email" id="formEmail" placeholder="Your Email" required>
          <div id="formEmailError" class="error-message"></div>
          <input type="text" id="formName" placeholder="Subject" required>
          <div id="formNameError" class="error-message"></div>
          <textarea id="formDescription" placeholder="Description" required></textarea>
          <div id="formDescriptionError" class="error-message"></div>
          
          <div id="formRatingError" class="error-message"></div>
          <button id="formSubmit">Submit</button>
        </form>
      </div>
    </li>
  `;
  chatContainer.appendChild(formContainer);
  scrollDown();

  const formSubmitButton = document.getElementById("formSubmit");
  formSubmitButton.addEventListener("click", submitForm);
}

function validateForm() {
  const email = document.getElementById("formEmail").value;
  const subject = document.getElementById("formName").value;
  const description = document.getElementById("formDescription").value;

  const emailError = document.getElementById("formEmailError");
  const nameError = document.getElementById("formNameError");
  const descriptionError = document.getElementById("formDescriptionError");

  emailError.textContent = "";
  nameError.textContent = "";
  descriptionError.textContent = "";

  let valid = true;
  if (!email) {
    document.getElementById("formEmailError").textContent =
      "Please enter your email.";
    valid = false;
  } else if (!validateEmail(email)) {
    document.getElementById("formEmailError").textContent =
      "Please enter a valid email address.";
    valid = false;
  }
  if (!subject) {
    document.getElementById("formNameError").textContent =
      "Please enter a subject.";
    valid = false;
  }
  if (!description) {
    document.getElementById("formDescriptionError").textContent =
      "Please enter a description.";
    valid = false;
  }
}

function validateEmail(email) {
  // const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const re = /^[^\s@]+@deliverhealth\.com$/;
  return re.test(email);
}

async function submitForm(event) {
  event.preventDefault();
  const email = document.getElementById("formEmail").value.trim();
  const subject = document.getElementById("formName").value.trim();
  const description = document.getElementById("formDescription").value.trim();

  document.getElementById("formEmailError").textContent = "";
  document.getElementById("formNameError").textContent = "";
  document.getElementById("formDescriptionError").textContent = "";
  document.getElementById("formRatingError").textContent = "";

  let isValid = true;

  if (!email) {
    document.getElementById("formEmailError").textContent =
      "Please enter your email.";
    isValid = false;
  } else if (!validateEmail(email)) {
    document.getElementById("formEmailError").textContent =
      "Please enter a valid email address.";
    isValid = false;
  }
  if (!subject) {
    document.getElementById("formNameError").textContent =
      "Please enter a subject.";
    isValid = false;
  }
  if (!description) {
    document.getElementById("formDescriptionError").textContent =
      "Please enter a description.";
    isValid = false;
  }
  // if (!rating) {
  //   document.getElementById("formRatingError").textContent = "Please provide a rating.";
  //   isValid = false;
  // }

  if (!isValid) {
    return;
  }

  const formData = {
    email: email,
    subject: subject,
    description: description,
  };

  try {
    const response = await fetch(
      "http://10.67.128.6/helpapi/request/v2",
      // "https://deliveranswers.aeriestechnology.com/helpapi/request/v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit form");
    }

    const data = await response.json();
    const response_id = data.request.display_id;

    addMessageToChat(
      "",
      `Your request has been submitted successfully. Response ID: ${response_id}`,
      "bot",
      `Your request has been submitted successfully. Response ID: ${response_id}`
    );
    ratingGiven = false;

    displaySatisfactionRating();
    // setTimeout(() => {
    //   toggle($chatbot, "chatbot--closed");
    // }, 2000);

    console.log("Form submitted successfully!");
  } catch (error) {
    console.error("Error submitting form:", error.message);
  }
}

// function submitForm(email, subject, description) {
//   const apiUrl =
//     "https://deliveranswers.aeriestechnology.com/helpapi/request/v2";
//   fetch(apiUrl, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, subject, description }),
//   })
//     .then((response) => {
//       if (response.ok) {
//         const successMessage = "Support ticket submitted successfully.";
//         addMessageToChat(
//           "bot",
//           formatMessage(successMessage),
//           "bot",
//           successMessage
//         );
//         document.getElementById("supportForm").reset();
//       } else {
//         const errorMessage =
//           "Failed to submit support ticket. Please try again later.";
//         addMessageToChat(
//           "bot",
//           formatMessage(errorMessage),
//           "bot",
//           errorMessage
//         );
//       }
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//       const errorMessage =
//         "Failed to submit support ticket. Please try again later.";
//       addMessageToChat("bot", formatMessage(errorMessage), "bot", errorMessage);
//     });
// }

// function displaySatisfactionRating() {
//   const chatContainer = document.getElementById("chat-container");
//   const ratingContainer = document.createElement("div");
//   ratingContainer.innerHTML = `<li class='is-ai animation'><div class="is-ai__profile-picture"><img src="./images/chatbot.png" alt="" class="chatbot_icon"/></div><span class='chatbot__arrow chatbot__arrow--left'></span><div class='chatbot__message'>How would you rate your interaction with the chatbot?<br><br><button class="rating-button" data-rating="good">Good</button><button class="rating-button" data-rating="average">Average</button><button class="rating-button" data-rating="poor">Poor</button></div></li>`;
//   chatContainer.appendChild(ratingContainer);
//   scrollDown();

//   const ratingButtons = document.querySelectorAll(".rating-button");
//   ratingButtons.forEach((button) => {
//     button.addEventListener("click", function () {
//       const rating = this.getAttribute("data-rating");
//       if (!ratingGiven) {
//         const message = "Thank you for your feedback!";
//         addMessageToChat("bot", formatMessage(message), "bot", message);
//         ratingGiven = true;
//       }
//     });
//   });
// }

function displaySatisfactionRating() {
  const chatContainer = document.getElementById("chat-container");
  const ratingContainer = document.createElement("div");
  ratingContainer.className = "rating-container";

  ratingContainer.innerHTML = `
    <li class='is-ai animation'>
      <div class="is-ai__profile-picture">
        <img src="./images/chatbot.png" alt="" class="chatbot_icon"/>
      </div>
      <span class='chatbot__arrow chatbot__arrow--left'></span>
      <div class='chatbot__message'>
        <p>Please rate your satisfaction and remarks with our support:</p>
        <form id="supportForm">
          <input type="email" id="formRemarkEmail" placeholder="Your Email" >
          <textarea id="formRemarks" placeholder="Feedback" ></textarea>
          
          <div id="formRatingError" class="error-message"></div>
        </form>
        <div class="star-rating">
          <span class="star" data-value="1">&#9733;</span>
          <span class="star" data-value="2">&#9733;</span>
          <span class="star" data-value="3">&#9733;</span>
          <span class="star" data-value="4">&#9733;</span>
          <span class="star" data-value="5">&#9733;</span>
        </div>
      </div>
    </li>
  `;

  chatContainer.appendChild(ratingContainer);
  scrollDown();

  const stars = ratingContainer.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", handleStarClick);
  });
}

async function handleStarClick(event) {
  const rating = event.target.getAttribute("data-value");
  const remarkEmail = document.getElementById("formRemarkEmail").value.trim();
  const remarkDescription = document.getElementById("formRemarks").value.trim();
  if (ratingGiven) return;
  else {
    ratingGiven = true;
    highlightStars(rating);

    if (rating == "4" || rating == "5") {
      addMessageToChat(
        "",
        `Thank you for rating us ${rating} stars! <span style='font-size:23px;'>&#128522;</span>`,
        "bot",
        `Thank you for rating us ${rating} stars!`
      );
    } else {
      addMessageToChat(
        "",
        `Thank you for rating us ${rating} stars!`,
        "bot",
        `Thank you for rating us ${rating} stars!`
      );
    }

    setTimeout(() => {
      toggle($chatbot, "chatbot--closed");
    }, 6000);
    try {
      const response = await fetch(
        "http://10.67.128.6/helpapi/dhs/api/feedback",
        // "https://deliveranswers.aeriestechnology.com/helpapi/dhs/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: remarkEmail,
            reviews: remarkDescription,
            ratings: rating,
          }),
        }
      );

      console.log(response);
      try {
        let logRecord = JSON.parse(sessionStorage.getItem("qaArray"));
        const saveLog = await fetch(
          "http://10.67.128.6/helpapi/dhs/api/conversation-history",
          // "https://deliveranswers.aeriestechnology.com/helpapi/dhs/api/conversation-history",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversation_history: logRecord,
              // user_email: "sairam@deliverhealth.com",
            }),
          }
        );

        console.log(saveLog);
        sessionStorage.removeItem("qaArray");
      } catch (error) {
        console.error("Error fetching response from server:", error);
      }
    } catch (error) {
      console.error("Error fetching response from server:", error);
    }
  }
}

function highlightStars(rating) {
  const stars = document.querySelectorAll(".star-rating .star");
  stars.forEach((star) => {
    const starValue = star.getAttribute("data-value");
    if (starValue <= rating) {
      star.classList.add("highlighted");
    } else {
      star.classList.remove("highlighted");
    }
  });
}

function clearChat() {
  const chatContainer = document.getElementById("chat-container");
  while (chatContainer.firstChild) {
    chatContainer.removeChild(chatContainer.firstChild);
  }
}

function submitMessage() {
  const userInput = document.getElementById("user-input").value;
  if (!userInput) return;

  const lowercaseInput = userInput.toLowerCase();
  const foundKeyword = keyWords.some((keyword) =>
    lowercaseInput.includes(keyword.toLowerCase())
  );

  if (foundKeyword) {
    addMessageToChat("user", userInput, "user", userInput);
    displayRequestForm();
  } else {
    addMessageToChat("user", userInput, "user", userInput);
    addBotResponse();
  }

  document.getElementById("user-input").value = "";
  scrollDown();
}

function startSpeechRecognition() {
  recognition.start();
}

document.getElementById("stop-button").onclick = function () {
  if (synth.speaking) {
    synth.cancel();
  }
};
