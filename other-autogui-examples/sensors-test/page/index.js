// import requirements
import AutoGUI from '@silver-zepp/autogui';
const gui = new AutoGUI();

import { Step, HeartRate, BloodOxygen } from "@zos/sensor";
const step = new Step();
const spo2 = new BloodOxygen();
const hr = new HeartRate();

class IndexPage {
  init(){
    // create your gui
    const txt_steps = gui.text("Steps: 0", { text_size: 60 });

    gui.newRow();

    const txt_spo2 = gui.text("SpO2: 0");
    const txt_hr = gui.text("HR: 0");

    gui.newRow();

    gui.button("Measure SpO2", ()=> {
      spo2.start();
      txt_spo2.update({ text: "Hold on for 10s..." });
      setTimeout(() => {
        spo2.stop();
        txt_spo2.update({ text: spo2.getCurrent().value });
      }, 10 * 1000);
    });

    // render your gui
    gui.render();

    // setup callbacks
    const cb_Steps = () => {
      txt_steps.update({ text: "Steps:" + step.getCurrent() });
    };

    const cb_HR = () => {
      txt_hr.update({ text: "HR:" + hr.getCurrent() })
    }

    const cb_SpO2 = () => {
      txt_spo2.update({ text: "SpO2:" + spo2.getCurrent().value  })
    }

    // and on change events
    step.onChange(cb_Steps)
    hr.onCurrentChange(cb_HR)
    spo2.onChange(cb_SpO2)
  }
  destroy(){
    spo2 && spo2.stop();
  }
}

Page({
  build(){
    this.indexPage = new IndexPage();
    this.indexPage.init();
  },
  onDestroy(){
    this.indexPage.destroy();
  }
})


/** HELPERS */

// don't turn off the screen for 600 seconds
import { setPageBrightTime } from '@zos/display'
const result = setPageBrightTime({
  brightTime: 600 * 1000,
})

// don't turn off the screen on wrist down for 600 seconds
import { pauseDropWristScreenOff } from '@zos/display'
pauseDropWristScreenOff({
  duration: 600 * 1000,
})