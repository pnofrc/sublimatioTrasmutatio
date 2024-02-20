document.addEventListener("DOMContentLoaded", () => {
//  const ws = new WebSocket('wss://trasmutatio.federicoponi.it/ws:8080');
const ws = new WebSocket("wss://socketsbay.com/wss/v2/8/cdf64fa4af7500cab77d6152a26305b2/")
  let jsonContent = null;
  let lightContent = null;
  let currentIndex = 0;
  let currentLightIndex = 0;

  const lightContainer = document.getElementById("lightContainer");
  const jsonContainer = document.getElementById("jsonContainer");

  function sendData(data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    } else {
      console.error('WebSocket connection is not open.');
    }
  }

  function sendWebSocketMessage() {
    if (jsonContent && jsonContent.length > 0) {
      let data = jsonContent[currentIndex];
      let type = data["TIPO_ESTREMALE"];
      let value = data["VALORE"];
      let title = data["TITOLO"];
      let message = JSON.stringify({ type, value, title });
      sendData(message);
    }
  }

  function displayCurrentArray() {
    if (jsonContent && jsonContent.length > 0) {
      let data = jsonContent[currentIndex];
      let type = data["TIPO_ESTREMALE"];
      let value = data["VALORE"];
      let title = data["TITOLO"];
      if (type == 'max') {
        jsonContainer.innerHTML = value;
        jsonContainer.innerHTML += title;
      } else {
        jsonContainer.innerHTML = value;
        jsonContainer.innerHTML += title;
      }
    }
  }

  const readFileButton = document.getElementById("readFile");
  readFileButton.addEventListener("click", () => {
    const filePath = "prev.json";
    const lightPath = "minmax.json";

    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("File not found");
        }
        return response.json();
      })
      .then((data) => {
        jsonContent = data;
        currentIndex = -1;
        displayCurrentArray();
        sendWebSocketMessage();
      })
      .catch((error) => {
        jsonContainer.textContent = "Error: " + error.message;
      });

    fetch(lightPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("File not found");
        }
        return response.json();
      })
      .then((data) => {
        lightContent = data;
      })
      .catch((error) => {
        jsonContainer.textContent = "Error: " + error.message;
      });
  });

const stop_sine = document.getElementById("stop_sine")
  const lightButton = document.getElementById("lightStart");
  const stopButton = document.getElementById("lightStop");
  let interval;

  stop_sine.addEventListener("click", () => {
    let value = 'stop_sine';
    let message = JSON.stringify({ value });
    lightContainer.innerHTML = 'FINE';
    sendData(message);
  });




  lightButton.addEventListener("click", () => {
    interval = setInterval(() => {
      if (lightContent && lightContent.length > 0) {
        let data = lightContent[currentLightIndex];
        let value = data["valore"];
        let type = "light";
        let message = JSON.stringify({ type, value });
        lightContainer.innerHTML = value;
        sendData(message);
      }

      currentLightIndex++;
      console.log(currentLightIndex);

    }, 2500);
  });

  stopButton.addEventListener("click", () => {
    clearInterval(interval);
    let value = -50;
    let type = "light";
    let message = JSON.stringify({ type, value });
    lightContainer.innerHTML = 'FINE';
    sendData(message);
  });

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      displayCurrentArray();
      sendWebSocketMessage();
    }
  });
  document.body.appendChild(prevButton);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.addEventListener("click", () => {
    if (currentIndex < jsonContent.length - 1) {
      currentIndex++;
      displayCurrentArray();
      sendWebSocketMessage();
    }
  });
  document.body.appendChild(nextButton);
});
