import * as style from 'zosLoader:./index.[pf].layout.js'
import { COLOR_BLACK, COLOR_BLUE, COLOR_GRAY, COLOR_GREEN, COLOR_INDIGO, COLOR_ORANGE, COLOR_RED, COLOR_VIOLET, COLOR_WHITE, COLOR_YELLOW } from '../include/constants';
//import * as C from '../include/constants' // shorter approach, C stands for CONSTANTS, capitalized to differ from a, b, c vars

import { createCalculator } from '../include/calculator';
const onBtn = createCalculator();

import AutoGUI, { multiplyHexColor } from '../include/libs/auto-gui';
const gui = new AutoGUI();

// just a test (doesn't work on the Simulator yet)
import { SoundPlayer } from "../include/libs/easy-media"
// actual sound object (to use with a physical device)
//const sound = new SoundPlayer("click.mp3", true);
// dummy object (to use on a simulator)
const sound = { play: function() {}, destroy: function() {} }; 

const btn_layout_arr = [ 
  "7", "8", "9", "x", "n", 
  "4", "5", "6", "+", "n", 
  "1", "2", "3", "-", "n", 
  "<", "0", ".", "/", "n",
];

let temp_angle = 0;

class Index {
  init(){
		this.drawGUI();
  }

	drawGUI(){
    //this.example_HelloWorld();
    //this.example_Arc();
    //this.example_ColorPicker();
    this.example_Calculator();
  }
  // Example #0: Hello World
  example_HelloWorld(){
    // add a text widget
    const my_text = gui.text("Hello, world!");

    // split the line
    gui.newLine();

    // add a button widget with a click event
    gui.button("Click me!", () => { 
        // update the text widget on button click
        my_text.update({ text: "Button clicked!" }); 
    });

    // finally render the GUI
    gui.render();
  }
  // Example #1: the Arc
  example_Arc(){
    this.arc = gui.arc(); // gui.arc(0, true);

    setInterval(() => {
      temp_angle = (temp_angle + 5) % 360;
      // readjust angle based on the coordinate system
      let end_angle = temp_angle;
      if (!this.arc.use_original_coordinates) {
        end_angle -= 90;
      }
      this.arc.update({ end_angle: end_angle });
    }, 100);

    gui.render();
  }
  // Example #2: Color Picker
  example_ColorPicker() {
    const colors_arr = [COLOR_RED, COLOR_ORANGE, COLOR_YELLOW, COLOR_GREEN, COLOR_BLUE, COLOR_INDIGO, COLOR_VIOLET];
    this.txt_selected_color = gui.text("Selected color: #000000");
   
    gui.newLine();

    for (const color of colors_arr) {
      const rect = gui.fillRect(color);
      rect.onClickUp(() => {
        sound.play();
        this.txt_selected_color.update({ text: "Selected color: " + color.toString(16) });
      });
    }
  
    gui.render();
  }
  // Example #3: Calculator
  example_Calculator(){
    // draw the text field with a "remove" button
    this.my_text = gui.text("0");
    gui.newLine();
    // draw the buttons
    for(let i = 0; i < btn_layout_arr.length; i++){
      if (btn_layout_arr[i] === "n"){
        gui.newLine();
      } else if (btn_layout_arr[i] === " ") {
        gui.spacer();
      } else {
        gui.button(btn_layout_arr[i], ()=> onBtn(btn_layout_arr[i], this.my_text, sound));
      }
    }
    // last line/row
    gui.spacer();
    gui.button("C", ()=> onBtn("C", this.my_text, sound));
    gui.button("=", ()=> onBtn("=", this.my_text, sound));
    gui.spacer();
    // specify layout for the buttons on the last row, in %
    // [ 17 ] [   33   ] [   33   ] [ 17 ]
    gui.lineLayout(17, 33, 33, 17); 

    // finally render the whole gui
    gui.render();
  }

  destroy(){
    sound.destroy();
  }
}

Page({
  onInit() {
    AutoGUI.SetTextSize(40);
    //AutoGUI.SetPadding(2);
    //AutoGUI.SetColor(COLOR_BLUE);
    AutoGUI.SetColor(multiplyHexColor(COLOR_WHITE, 0.2));
    AutoGUI.SetTextColor(COLOR_GREEN);
    this.indexPage = new Index;
    this.indexPage.init();
  },
  destroy() {
    this.indexPage.destroy();
  }
})