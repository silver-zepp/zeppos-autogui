// === COMMUNICATIONS === //
import { BasePage } from "@zeppos/zml/base-page";

// === SENSORS === //
import { Step, HeartRate, Accelerometer } from "@zos/sensor";
const steps = new Step();
const hr = new HeartRate();
const accelerometer = new Accelerometer();

// === HELPERS === //
import { setPageBrightTime } from '@zos/display'
import { pauseDropWristScreenOff } from '@zos/display'

// === GUI === //
import AutoGUI from "@silver-zepp/autogui";
const gui = new AutoGUI();

import VisLog from "@silver-zepp/vis-log";
const vis = new VisLog("index");

// === OTHER === //
import * as CONST from "./constants";

let cur_hr = 0;
let cur_steps = 0;

class IndexPage {
  constructor(base_page){
    // zml
    this.link = base_page;

    // accel (fall detection)
    this.state = "none";
    this.last_fall_time = 0;

    this.simulation = null;

    // callbacks as props
    // ------------------
    // heart rate
    this.cb_HR = ()=> {
      cur_hr = hr.getCurrent();
      this.txt_hr.update({ text: "HR:\n" + cur_hr });
    }
    // steps
    this.cb_Steps = ()=> {
      cur_steps = steps.getCurrent();
      this.txt_steps.update({ text: "STEPS:\n" + cur_steps });
    };
    
    // accel
    this.cb_Accelerometer = ()=> {
      if (this.state === "fall") return;

      const acceleration = parseFloat(accelerometer.getCurrent().z).toFixed(0);

      // check if the watch is in free fall
      if (Math.abs(acceleration) >= CONST.FALL_ACCEL_THRESHOLD && this.state !== "fall"){
        this.state = "fall";
        vis.log("FALL DETECTED!");

        // post the data to the server immediately when a fall is detected
        this.post(CONST.ENDPOINT_DATA, { hr: cur_hr, steps: cur_steps, state: this.state });

        // reset the state after 5 seconds
        setTimeout(() => {
          this.state = "none";
        }, CONST.FALL_TIMEOUT);
      }
    }
  }

  init(){
    this.drawGUI();
    this.subscribe();
    // init the main loop
    setInterval(() => this.loop(), CONST.LOOP_TIME);
  }

  subscribe(){
    hr.onCurrentChange(this.cb_HR);
    steps.onChange(this.cb_Steps);
    accelerometer.onChange(this.cb_Accelerometer);

    // start
    accelerometer.start();
  }
  
  unsubscribe(){
    // unsub
    hr.offCurrentChange(this.cb_HR);
    steps.offChange(this.cb_Steps);
    accelerometer.offChange(this.cb_Accelerometer);
    // stop
    accelerometer.stop();
  }

  drawGUI(){
    gui.startGroup();
      gui.strokeRect();
      this.txt_hr = gui.text("HR:\n0");
    gui.endGroup();

    gui.startGroup();
      gui.strokeRect();
      this.txt_steps = gui.text("STEPS:\n0");
    gui.endGroup();

    gui.newRow();

    this.button = gui.button("SIMULATE", ()=> { 
      this.simulate();
    });

    gui.render();
  }
  
  simulate(){
    if (this.simulation) {
      // stop the simulation
      clearInterval(this.simulation);
        this.simulation = null;
        this.button.update({ text: "SIMULATE", click_func: ()=> { this.simulate(); } });
      } else {
        // start the simulation
        this.simulation = setInterval(() => {
          const random_hr = get_next_hr();
          cur_steps += Math.round(Math.random() * 10); // increase steps by a random amount
          this.txt_hr.update({ text: "HR:\n" + random_hr });
          this.txt_steps.update({ text: "STEPS:\n" + cur_steps });
          this.post(CONST.ENDPOINT_HR, { hr: random_hr }); 
        }, CONST.SIMULATION_SPEED); // sim speed in ms
    
        this.button.update({ text: "STOP", click_func: ()=> { this.simulate(); } });
      }
  }

  post(endpoint, data){
    //vis.log(`Posting data: ${data} to ${endpoint}`);

    this.link.httpRequest({
      method: 'post',
      url: CONST.SERVER + endpoint,
      body: JSON.stringify(data), // make sure we send JSON
    })
    .then((response) => {
      const result = response.data;
      //vis.log("Data sent successfully:", result);
    })
    .catch((error) => {
      //vis.error("Error sending data:", JSON.stringify(error));
    });
  }

  get(){
    vis.log("Getting data...");
  
    this.link.httpRequest({
      method: 'get',
      url: CONST.SERVER + CONST.ENDPOINT_HR,
    })
    .then((response) => {
      console.log("All keys in the response:", Object.keys(response));
      const result = response.body;
      const result_str = JSON.stringify(result);
      this.txt_hr.update({ text: result_str });
      vis.log("Data received successfully:", result_str);
    })
    .catch((error) => {
      vis.error("Error getting data:", JSON.stringify(error));
    });
  }

  loop(){ 
    if (cur_hr == 0 || cur_steps == 0 || this.state == "fall") return;
    // post data every specified amount of seconds (if applicable)
    this.post(CONST.ENDPOINT_DATA, { hr: cur_hr, steps: cur_steps, state: "none" });
  }

  quit(){
    this.unsubscribe();
  }
}

Page(
  BasePage({
    onInit() {
      // don't turn off the screen for 10 minutes
      setPageBrightTime({ brightTime: 6E5 });
      // don't turn off the screen on wrist down for 10 minutes
      pauseDropWristScreenOff({ duration: 6E5 });

      this.indexPage = new IndexPage(this); // pass BasePage as "this" -> link
      this.indexPage.init();
    },
    build(){
      //vis.updateSettings({ visual_log_enabled: false });
    },
    onDestroy() {
      this.indexPage.quit();
    },
  })
);





// === HELPERS === //
// hr sinewave simulator (TODO: move it to a proper place)
let hr_min = 40;
let hr_max = 180;
let hr_range = hr_max - hr_min;
let hr_mid = (hr_max + hr_min) / 2;
let hr_freq = 0.01; // oscillation frequency
let hr_phase = 0;
let hr_mult = 20;

function get_next_hr() {
  let hr = hr_mid + hr_range / 2 * Math.sin(hr_phase);
  hr_phase += hr_freq * hr_mult;
  return Math.round(hr);
}