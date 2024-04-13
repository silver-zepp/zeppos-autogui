import AutoGUI, { multiplyHexColor } from "@silver-zepp/autogui";
import VisLog from "@silver-zepp/vis-log"
import { readFileSync, writeFileSync } from "@zos/fs";
import { COLOR_GREEN, COLOR_WHITE } from "../libs/colors";

const vis = new VisLog("GlucoApp");
const gui = new AutoGUI;

class IndexPage {
  init(){
    this.drawGUI();
    this.initVIS(); // logger should be init after the GUI was drawn
  }

  initVIS(){
    // set up logger: 1. logs from the top; 2. limit the line count
    vis.updateSettings({ log_from_top: true, line_count: 2 });
  }

  drawGUI(){
    // create a group that will contain a big app name text surrounded with a rectangle
    gui.startGroup();
      gui.strokeRect(0x666666, { line_width: 8 });
      gui.text("GlucoApp", { text_size: 40 });
    gui.endGroup();

    // goto the second row
    gui.newRow();

    // this is your REUSABLE textfield
    this.text = gui.text("Waiting for glucose...");
    
    // goto the third row
    gui.newRow();

    // last row - two buttons
    gui.button("READ", ()=> { this.read() });
    gui.button("WRITE", ()=> { this.write() });

    // render the GUI
    gui.render();
  }

  write(){
    vis.log("Writing gluco...");
  
    const file_name = "glucose.txt";
  
    // get random glucose and convert it to buffer
    const buffer = str2ab(getRandomGluco());
    
    writeFileSync({
      path: file_name,
      data: buffer
    })

    this.text.update({ text: "New gluco value written.\nNow read it." });
  }
  
  read(){
    const file_name = "glucose.txt";

    const result = readFileSync({
      path: file_name
    })
  
    // change the text
    const str_result = ab2str(result);
    vis.log(`Gluco: ${str_result}`);
    this.text.update({ text: str_result });
  }

  quit(){
    // clean up
  }
}

Page({
  build() {
    // set up AutoGUI before creating the page
    AutoGUI.SetColor(multiplyHexColor(COLOR_WHITE, 0.2));
    AutoGUI.SetTextColor(COLOR_GREEN);

    this.index = new IndexPage();
    this.index.init();
  },

  onDestroy() {
    this.index.quit();
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

function getRandomGluco(){
  const rand = Math.random() * 9 + 1;
  const str_gluco = rand.toFixed(2) + " mmol/L";
  return str_gluco;
}