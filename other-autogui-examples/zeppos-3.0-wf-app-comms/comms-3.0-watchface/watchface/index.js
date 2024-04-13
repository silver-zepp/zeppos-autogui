import AutoGUI, { multiplyHexColor } from "@silver-zepp/autogui";
import VisLog from "../libs/vis-log"
import { COLOR_GREEN, COLOR_WHITE } from "../libs/colors";
const vis = new VisLog("GlucoWF");
const gui = new AutoGUI;

class IndexPageWF {
  init(){
    this.drawGUI();
    this.initVIS(); // logger should be init after the GUI was drawn
    this.update();  // start the loop
  }

  initVIS(){
    vis.updateSettings({ log_from_top: true, line_count: 3 });
  }

  drawGUI(){
    // create a group that will contain a big app name text surrounded with a rectangle
    gui.startGroup();
      gui.strokeRect(0x666666, { line_width: 8 });
      gui.text("GlucoWF", { text_size: 40 });
    gui.endGroup();

    // goto the second row
    gui.newLine();

    // this is your REUSABLE textfield
    this.text = gui.text("Waiting for glucose...");
    
    // goto the third row
    gui.newLine();

    // last row - read
    gui.button("READ", ()=> { this.read() });

    // render the GUI
    gui.render();
  }
  update(){
    // parse glucose every 10 seconds
    const refresh_time = 30;
    timer.createTimer(1000, 1000 * refresh_time, ()=> this.read());
  }

  read(){
    const mini_app_id = 77777;
    const file_name = "glucose.txt";
  
    let str_result = "";
    try {
      const fh = hmFS.open(file_name, hmFS.O_RDONLY, {
        appid: mini_app_id
      })
  
      const len = 1024;
      let array_buffer = new ArrayBuffer(len);
      hmFS.read(fh, array_buffer, 0, len);
      hmFS.close(fh);
  
      str_result = ab2str(array_buffer);
    } catch (error) {
      str_result = "FAIL: No access to hmFS.";
    }
  
    // change the text
    vis.warn(str_result);
    this.text.update({ text: str_result });
  }

  quit(){
    // clean up
  }
}

WatchFace({
  build() {
    // set up AutoGUI before creating the page
    AutoGUI.SetTextSize(24);
    AutoGUI.SetColor(multiplyHexColor(COLOR_WHITE, 0.2));
    AutoGUI.SetTextColor(COLOR_GREEN);

    this.indexWF = new IndexPageWF();
    this.indexWF.init();
  },

  onDestroy() {
    this.indexWF.quit();
  },
})


//********************************//
//**          HELPERS           **//
//********************************//
function str2ab(str) {
  var buf = new ArrayBuffer(str.length); 
  var buf_view = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    buf_view[i] = str.charCodeAt(i);
  }
  return buf;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}