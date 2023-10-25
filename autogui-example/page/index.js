import * as style from 'zosLoader:./index.[pf].layout.js'
import { COLOR_BLACK, COLOR_BLUE, COLOR_GRAY, COLOR_GREEN, COLOR_INDIGO, COLOR_ORANGE, COLOR_RED, COLOR_VIOLET, COLOR_WHITE, COLOR_YELLOW } from '../include/constants';
//import * as C from '../include/constants' // shorter approach, C stands for CONSTANTS, capitalized to differ from a, b, c vars

import { createCalculator } from '../include/calculator';
const onBtn = createCalculator();

import AutoGUI, { multiplyHexColor } from '../../autogui/v2/autogui';
const gui = new AutoGUI();

import VisLog from '../include/libs/vis-log';
const vis = new VisLog("index");

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

/**
 * Refer to our official documentation to find more parameters that widgets accept: 
 * https://bit.ly/zepp-widgets
 */

/**
 * 1 : Hello World          : example_HelloWorld
 * 2 : Moving Arc           : example_Arc
 * 3 : Color Picker         : example_ColorPicker
 * 4 : Calculator           : example_Calculator
 * 5 : Nested Widgets       : example_NestedWidgets
 * 6 : AutoReconstruct GUI  : example_AutoReconstructGUI
 * 7 : Custom Themes        : example_CustomThemes
 * 8 : Advanced GUI         : example_AdvancedGUI     */
const SELECTED_EXAMPLE = 1;


class Index {
  init(){
		this.drawGUI();
  }

	drawGUI(){
    this.loadExample(SELECTED_EXAMPLE);
  }

  // Example #1: Hello World
  example_HelloWorld(){
    // add a text widget
    const my_text = gui.text("Hello, world!");

    // split the row
    gui.newRow();

    // add a button widget with a click event
    gui.button("Click me!", () => { 
        // update the text widget on button click
        my_text.update({ text: "Button clicked!" }); 

        // get and print text object properties
        const props =  my_text.getProperties();
        console.log(`Text: ${ props.text } Height: ${ props.h }`);
    });

    // finally render the GUI
    gui.render();
  }

  // Example #2: the Arc
  example_Arc(){
    // globally increase the text size for all widgets
    AutoGUI.SetTextSize(90);

    // create a group that contains an arc and the text in the middle
    gui.startGroup();
      this.arc = gui.arc(); // gui.arc(0, true);
      this.text = gui.text("0");
    gui.endGroup();

    setInterval(() => {
      temp_angle = (temp_angle + 5) % 360;

      // readjust angle based on the coordinate system
      let end_angle = temp_angle;
      if (!this.arc.use_original_coordinates) {
        end_angle -= 90;
      }

      // update the text and the arc with each tick
      this.arc.update({ end_angle: end_angle });
      this.text.update({ text: temp_angle + '°' });
    }, 100);

    gui.render();
  }

  // Example #3: Color Picker
  example_ColorPicker() {
    const colors_arr = [COLOR_RED, COLOR_ORANGE, COLOR_YELLOW, COLOR_GREEN, COLOR_BLUE, COLOR_INDIGO, COLOR_VIOLET];
    // create a modifiable text field
    this.txt_selected_color = gui.text("Selected color: #000000");
   
    gui.newRow();

    for (const color of colors_arr) {
      // create a fill rect object
      const rect = gui.fillRect(color);

      // assign "on release" actions
      rect.onRelease(() => {
        sound.play();
        this.txt_selected_color.update({ text: "Selected color: #" + color.toString(16) });
        rect.update({ color: color }); // reset the rect color
      });

      // assign "on press" action: dim the rect color by 30%
      rect.onPress(() => { rect.update({ color: multiplyHexColor(color, 0.7) }) }); 
    }
  
    gui.render();
  }

  // Example #4: Calculator
  example_Calculator(){
    // draw the text field
    this.my_text = gui.text("0");

    gui.newRow();

    // draw the buttons
    for(let i = 0; i < btn_layout_arr.length; i++){
      if (btn_layout_arr[i] === "n"){
        gui.newRow();
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
    gui.rowLayout(17, 33, 33, 17); 

    // finally render the whole gui
    gui.render();
  }

  // Example #5: Nested Widgets
  example_NestedWidgets(){
    // create the group
    gui.startGroup();         
      // store references to the required widgets        
      const fill    = gui.fillRect(COLOR_RED);
      const text    = gui.text("Hello"); 
      const stroke  = gui.strokeRect(COLOR_BLUE);
    // close the group  
    gui.endGroup();     
    
    // update group widget's individual elements on button clicks
    gui.button("Change\nText", ()=> { text.update({ text: randomAnimalName() }) });

    gui.newRow();

    gui.button("Change\nFill", ()=> { fill.update({ color: randomHex() }); });
    gui.button("Change\nStroke", ()=> { stroke.update({ color: randomHex(), line_width: 16 }) });
    
    // render the GUI
    gui.render();
  }

  // Example #6: GUI Auto Reconstruction
  example_AutoReconstructGUI() {
    // create 9 widgets across 3 rows (rubix' cube style)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // create the button and set to remove itself when clicked, apply random color and text
        const btn = gui.button(randomAnimalName(), ()=> btn.remove(), { normal_color: randomHex() } );
      }
      if (i < 2) { // don't create a new line after the last row
        gui.newRow();
      }
    }

    // render the GUI
    gui.render();
  }

  // Example #7: Custom GUI Themes
  example_CustomThemes(){
    AutoGUI.SetTextSize(16);  

    gui.text("Customized GUI Themes!");

    gui.newRow(); // ---

    gui.button("Text size ⬆️", ()=> { AutoGUI.SetTextSize(AutoGUI.GetTextSize() + 5); gui.render(true); });
    gui.button("Text size ⬇️", ()=> { AutoGUI.SetTextSize(AutoGUI.GetTextSize() - 5); gui.render(true);});
    gui.button("Color\nCHANGE", ()=> { AutoGUI.SetColor(randomHex()); gui.render(true);  });
    gui.button("Text color\nCHANGE", ()=> { AutoGUI.SetTextColor(randomHex()); gui.render(true);  });
    
    gui.newRow(); // ---
    
    gui.button("Btn radius ⬆️", ()=> { AutoGUI.SetBtnRadius(AutoGUI.GetBtnRadius() + 10); gui.render(true);});
    gui.button("Btn radius ⬇️", ()=> { AutoGUI.SetBtnRadius(AutoGUI.GetBtnRadius() - 10); gui.render(true); });

    gui.newRow(); // ---

    gui.button("Padding ⬆️", ()=> { AutoGUI.SetPadding(AutoGUI.GetPadding() + 5); gui.render(true); });
    gui.button("Padding ⬇️", ()=> { AutoGUI.SetPadding(AutoGUI.GetPadding() - 5); gui.render(true); });

    gui.newRow(); // ---

    gui.startGroup();
      // the color of this widget won't change
      gui.fillRect(multiplyHexColor(COLOR_WHITE, 0.2)); 
      // while this one will, as it wasn't manually specified
      gui.strokeRect();
    gui.endGroup();

    // render the gui
    gui.render();
  }

  // Example #8: Advanced Rich GUI
  example_AdvancedGUI(){
    // create a text field group at the top (background image + text)
    gui.startGroup(); 
      gui.image("/icons/text-field.png");
      const text_field = gui.text("Click on one of the icons!", { color: COLOR_WHITE });
    gui.endGroup();

    // split the row
    gui.newRow();

    // describe the buttons
    const buttons_arr = [
      "Medkit",
      "Gown",
      "Mask",
      "Syringe"
    ];
    
    // create the button groups with each containing a button with an image, stroke and fill rect
    // assign "on press" and "on release" events 
    for (let i = 0; i < buttons_arr.length; i++) {
      const button_name = buttons_arr[i];
      const text_on_press = `${button_name} is being pressed!`;
      const text_on_release = `${button_name} was released!`;
      const src = `icons/${button_name.toLowerCase()}-96.png`;
      
      gui.startGroup();

        const fill = gui.fillRect(multiplyHexColor(COLOR_BLUE, 0.8), { radius: 16 });
        gui.image(src, { auto_scale: false });
        const rect = gui.strokeRect(multiplyHexColor(COLOR_BLUE, 1.3), { line_width: 6, radius: 16 });
        
        // attach events to the last widget in the group (important)
        rect.onPress(() => { 
          text_field.update({ text: text_on_press });
          fill.update({ color: multiplyHexColor(COLOR_BLUE, 1.3) });
        });
        rect.onRelease(() => { 
          text_field.update({ text: text_on_release });
          fill.update({ color: multiplyHexColor(COLOR_BLUE, 0.8) }); 
        });

      gui.endGroup();
    
      // add a new line after every two buttons
      if (i % 2 === 1) {
        gui.newRow();
      }
    }

    // render the GUI
    gui.render();
  }

  loadExample(id) {
    switch(id) {
      case 1: this.example_HelloWorld(); break;
      case 2: this.example_Arc(); break;
      case 3: this.example_ColorPicker(); break;
      case 4: this.example_Calculator(); break;
      case 5: this.example_NestedWidgets(); break;
      case 6: this.example_AutoReconstructGUI(); break;
      case 7: this.example_CustomThemes(); break;
      case 8: this.example_AdvancedGUI(); break;
      default: vis.log("Invalid example number!");
    }
  }

  destroy(){
    sound.destroy();
  }
}

Page({
  onInit() {
    AutoGUI.SetTextSize(30);
    //AutoGUI.SetPadding(0);
    //AutoGUI.SetBtnRadius(180);
    //AutoGUI.SetColor(COLOR_BLUE);
    //AutoGUI.SetColor(multiplyHexColor(COLOR_WHITE, 0.2));
    //AutoGUI.SetTextColor(COLOR_GREEN);
    this.indexPage = new Index;
    this.indexPage.init();
  },
  destroy() {
    this.indexPage.destroy();
  }
})

/** HELPERS */
const animals_arr = ['Cat', 'Dog', 'Lion', 'Giraffe', 'Lion', 'Puma', 'Panda', 'Koala', 'Penguin', 'Dolphin'];
function randomAnimalName() {
  return animals_arr[Math.floor(Math.random() * animals_arr.length)];
}

function randomHex() {
  const hexMax = 0xffffff;
  return "0x" + Math.floor(Math.random() * hexMax).toString(16).padStart(6, "0");
}