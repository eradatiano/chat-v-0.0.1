// export const client = {
window.addEventListener("DOMContentLoaded", function () {
  const chatBox = document.querySelector(".chat-box");
  const tbody = document.querySelector("tbody");
  // const
  const sendMessageBtn = document.querySelector(".send-message");
  const messageInput = document.querySelector("#input-message");
  const loginContainer = document.querySelector(".login-container");
  const loginBtn = document.querySelector(".login-btn");
  const usernameInput = document.querySelector(".username-input");
  const passwordInput = document.querySelector(".pass-input");
  const baseUrl = "http://localhost:3000/";

  // display chat-box
  const displayChat = () => {
    loginContainer.style.display = "none";
    chatBox.style.display = "flex";
  };

  // Display Message Function
  const displayMessage = function (message, id) {
    // if (message.trim().length === 0) return;
    // specify message status
    let status = "received";
    if (id === userId) status = "sent"; // determine the status by userId
    // else id = "sent";

    // fill divMessage and add it to html
    const divMessage = `<tr>
    <td><div class="message ${status}">
    <p>${message}</p>
    </div></td>
    </tr>`;
    tbody.insertAdjacentHTML("beforeend", divMessage);
  };

  const messageLoading = function (reader) {
    tbody.replaceChildren();
    function readMessages() {
      reader.read().then(({ done, value }) => {
        if (done) {
          console.log("stream complete");
          return;
        }
        // console.log("chunk: ", value);
        const jsonString = new TextDecoder().decode(value);
        const messagesObject = JSON.parse(jsonString);
        delete messagesObject["0"];
        for (const key in messagesObject) {
          const [message, id] = messagesObject[key];
          displayMessage(message, id);
        }
      });
    }
    readMessages();
    
  };
  // send info to server ali1727mir
  const postInfo = async function (username, userId) {
    const res = await fetch(baseUrl + "login", {
      method: "Post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, userId: userId }),
    })
      .then((res) => res.body.getReader())
      .then(messageLoading);
  };

  // login
  const login = function (e) {
    e.preventDefault();
    // check the password
    username = usernameInput.value;
    const password = passwordInput.value;
    if (password) {
      if (password === "mir2717mir") {
        userId = "b";
        username ||= "mir";
        displayChat();
        postInfo(username, userId);
      }
      if (password === "ali1727mir") {
        userId = "a";
        username ||= "ali";
        displayChat();
        postInfo(username, userId);
      }
    }
  };

  // Send Message
  const Message = function () {
    const message = messageInput.value;
    messageInput.value = "";
    return message;
  };

  let username;
  let userId;

  loginBtn.addEventListener("click", login);

  const getMessage = async function () {
    const res = await fetch(baseUrl + "getMsg", {
      method: "GET",
      headers: { "Content-Type": "text/plain", userid: userId },
    })
      .then((res) => res.body.getReader())
      .then(messageLoading);
  };

  const sendGetMsg = async function (message) {
    const res = await fetch(baseUrl + "send-getMsg", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        userId: userId,
        message: message,
      }),
    })
      .then((res) => res.body.getReader())
      .then(messageLoading);
  };
  // mir2717mir
  // ali1727mir
  const div = document.querySelector("tbody")
  sendMessageBtn.addEventListener("click", function () {
    const message = Message();
    if (message.trim().length === 0) getMessage();
    else sendGetMsg(message);
    setTimeout(() => tbody.scrollIntoView({behavior: "instant", block: "end"}), 100)
    
    // displayMessage(message, 1);
  });

  // const scrollingElement = document.querySelector("tbody");
  // const config = { childList: true };
  // const callback = function (mutationsList, observer) {
  //   console.log(mutationsList);
  //   for (let mutation of mutationsList) {
  //     if (mutation.type === "childList") {
  //       scrollingElement.scrollTop = "500px";
  //     }
  //   }
  // };
  // const observer = new MutationObserver(callback);
  // observer.observe(scrollingElement, config);
});

// .then((response) => response.json())
// .then((data) => console.log("seccess", data))
// .catch((error) => console.log("error", error));
