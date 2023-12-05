/** Requirements 
 * @express npm i express
 * @bodyparser npm i body-parser
 * @websockets npm i ws
*/

/** ngrok setup
 * 1. download suitable client from https://ngrok.com
 * 2. register an account
 * 3. ngrok config add-authtoken <your-auth-token>
 * 4. ngrok http 33333
 * 5. grab the server IP/port from ngrok's console and paste into your apps URL_NGROK (constants.js)
 * 6. rebuild your app
 * 7. done
 */

/** (!) live environment only (!)
  1. Update the iptables of your firewall
    sudo iptables -A INPUT -p tcp --dport 33333
    sudo iptables -A INPUT -p tcp --dport 33334
  2. 
  // in index.html -> replace
  const ws = new WebSocket('ws://localhost:33334');
  // with 
  const ws = new WebSocket('ws://your_server_ip:33334');

  // test if the server is working properly
  curl -X POST -H "Content-Type: application/json" -d '{ "hr":60 }' http://localhost:33333/hr
 */

// make sure our server doesn't bind ipv6
const LOCALHOST_IPV4 = "0.0.0.0";
const SERVER_PORT = 33333;
const WEBSOCKET_PORT = 33334;

const HR_MAX_ENTRIES = 40;

const SPEED_RUN = 2.4;
const SPEED_WALK = 0.4;

const express = require('express');
const body_parser = require('body-parser');
const WebSocket = require('ws');

const app = express();
app.use(body_parser.json());
app.use(express.static('public')); // serve static files from public folder

let data = {
  hr: [],
  steps: 0,
  min: null,
  avg: null,
  max: null,
  trend: "Idle",
  state: "idle",
  steps_history: [],
};

// post endpoints
app.post("/data", (req, res) => {
  const hr_err = processHR(req.body.hr);
  const steps_err = processSteps(req.body.steps);

  // update the fall state
  if (req.body.state == "fall") {
    data.state = "fall";
  }

  console.log(`Time: ${ new Date().toLocaleTimeString() } | HR: ${ req.body.hr } | Steps: ${ req.body.steps } | State: ${data.state}`);

  if (hr_err) {
    res.status(400).send(hr_err);
    console.log(hr_err);
    return;
  }

  if (steps_err) {
    res.status(400).send(steps_err);
    console.log(steps_err);
    return;
  }

  // broadcast data to all connected WebSocket clients
  ws_server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

function processHR(hr) {
  if (typeof hr !== 'number') {
    return "Invalid data. Please send a number for HR.";
  }

  data.hr.push(hr);

  // limit hr arr
  if (data.hr.length > HR_MAX_ENTRIES) {
    data.hr = data.hr.slice(-HR_MAX_ENTRIES);
  }

  // calculate hr stats
  data.min = Math.min(...data.hr);
  data.avg = Math.round(data.hr.reduce((a, b) => a + b, 0) / data.hr.length);
  data.max = Math.max(...data.hr);

  // calculate hr trend
  if (data.hr.length >= 10) {
    const last_10 = data.hr.slice(-10);
    const avg_last_10 = last_10.reduce((a, b) => a + b, 0) / last_10.length;
    const diff = Math.abs(hr - avg_last_10);
    const threshold = 5; // max hr deviation to be considered Idle

    if (diff < threshold) {
      data.trend = 'Idle';
    } else {
      data.trend = hr > avg_last_10 ? 'Rising' : 'Falling';
    }
  }

  return null;
}

function processSteps(steps) {
  const cur_time = Date.now();

  // push the current time and steps count to the history
  data.steps_history.push({ time: cur_time, steps: steps });

  // if we have at least two data points, calculate the speed
  if (data.steps_history.length >= 2) {
    const prev = data.steps_history[data.steps_history.length - 2];
    const time_diff = cur_time - prev.time; // time difference in milliseconds
    const steps_diff = steps - prev.steps; // steps difference

    // speed is steps per second
    const speed = steps_diff / (time_diff / 1000);
    
    // determine the state based on the speed
    let state;
    if (speed > SPEED_RUN) {
      state = 'running';
    } else if (speed > SPEED_WALK) {
      state = 'walking';
    } else {
      state = 'idle';
    }

    data.speed = speed;
    data.state = state;
  }

  data.steps = steps;

  return null;
}

// HTTP serv
app.listen({ host: LOCALHOST_IPV4, port: SERVER_PORT }, () => {
  console.log("HTTP Server is running on port:", SERVER_PORT);
});

// WebSocket serv
const ws_server = new WebSocket.Server({ host: LOCALHOST_IPV4, port: WEBSOCKET_PORT }, () => {
  console.log("WebSocket server is running on port:", WEBSOCKET_PORT);
});