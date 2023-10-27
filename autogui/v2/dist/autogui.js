/** @about AutoGUI 1.2.7 @min_zeppos 2.0 @author: Silver, Zepp Health. @license: MIT */
import { getDeviceInfo } from "@zos/device";
import hmUI, { createWidget, widget, align, text_style, prop } from "@zos/ui";
import { px } from "@zos/utils";
import { getImageInfo } from '@zos/ui' // img width/height
export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const ERR_ALREADY_REMOVED = "This widget has already been removed!";
const ERR_NO_GROUP_TO_END = "No group to end. Did you forget to call startGroup()?"; // @add 1.2.2
const ERR_DEPRECATED = "This method is deprecated and will be removed in the future.";

const DEFAULT_ICON  = "icon.png";
const DEFAULT_LINE_WIDTH_STROKE = 4;
const DEFAULT_LINE_WIDTH_ARC = 20;
const DEFAULT_ANGLE = 90;
const DEFAULT_TEXT_STYLE = text_style.ELLIPSIS;

/**
 * Class representing a widget.
 */
class Widget {
  #on_release = false;
  #on_press = false;
  #on_release_callback;
  #on_press_callback;

  constructor(type, properties, gui) {
    this.type = type;
    this.properties = properties;
    this.gui = gui;
    this.needs_update = true;
    this.is_rendered = false;
  }

  /**
   * @param {none} ATTENTION INTERNAL METHOD. DO NOT USE.
   */
  default(x, y, width, height) {
    // store the default props (required by some widgets, ie FILL_RECT) @fix 1.2.2
    this.properties.x = px(x + AutoGUI.GetPadding());
    this.properties.y = px(y);
    this.properties.w = px(width - AutoGUI.GetPadding() * 2);
    this.properties.h = px(height - AutoGUI.GetPadding() * 2);

    return this.properties;
  }

  /**
   * Update the properties of the widget.
   * @param {Object} new_properties - The new properties to update. Use the official widgets approach here:
   * @example
   * ```js
   * .update({ text: "new text", color: 0xff0000, ... })
   * ```
   */
  update(new_properties) {
    this.properties = { ...this.properties, ...new_properties };

    if (this.widget) {
      this.widget.setProperty(prop.MORE, this.properties); // @fix 1.2.2
    }

    this.needs_update = true;

    // re-render the GUI
    if (this.gui) {
      this.gui.render();
    }
  }

  /**
   * Get the properties of an object.
   * @param {...string} properties - The properties to get.
   * @examples
   * ```js
   * // example: get all properties
   * .getProperties();
   * // example: get 'text' property
   * .getProperties('text');
   * // advanced example: get 'text' and 'x' properties
   * .getProperties('text', 'x');
   * ```
   * @return {object|string|undefined} The requested properties. If no arguments are passed, it returns all properties. If one argument is passed, it returns the value of that property. If multiple arguments are passed, it returns an object with those properties. If a requested property does not exist, it returns undefined for that property.
   */
  getProperties(...properties){ // @add 1.2.6
    if (properties.length === 0) {
        return this.properties; // all
    } else if (properties.length === 1) {
        return this.properties[properties[0]]; // single
    } else {
        let result = {};
        for (let prop of properties) {
            result[prop] = this.properties[prop]; // multiple
        }
        return result;
    }
  }

  /**
   * Remove this widget from GUI system.
   */
  remove() {
    // remove the widget from the GUI
    if (this.gui) {
      this.gui.removeWidget(this);
    }
  
    // delete the widget
    if (this.widget) {
      hmUI.deleteWidget(this.widget);
      this.widget = null;
    }
  
    // make sure to rerender
    if (this.gui) {
      this.gui.render();
    }
  }

  /**
   * Attach an event listener for the 'on release' event.
   * @param {function} callback - The callback function to execute when the event is triggered.
   */
  onRelease(callback) {
    this.#on_release_callback = callback;
    
    if (this.is_rendered) {
      this.widget.addEventListener(hmUI.event.CLICK_UP, this.#on_release_callback);
    } 
  }

  /**
   * Attach an event listener for the 'on press' event.
   * @param {function} callback - The callback function to execute when the event is triggered.
   */
  onPress(callback) {
    this.#on_press_callback = callback;
    
    if (this.is_rendered) {
      this.widget.addEventListener(hmUI.event.CLICK_DOWN, this.#on_press_callback);
    }
  }

  /**
   * @param {none} ATTENTION INTERNAL METHOD. DO NOT USE.
   */
  attachEvents() {
    if (this.#on_release_callback) {
      this.widget.addEventListener(hmUI.event.CLICK_UP, this.#on_release_callback);
    }
    if (this.#on_press_callback) {
      this.widget.addEventListener(hmUI.event.CLICK_DOWN, this.#on_press_callback);
    }
  }

  /**
   * Remove all event listeners from the widget.
   */
  removeEventListeners() {
    if (this.#on_release) {
      this.widget.removeEventListener(hmUI.event.CLICK_UP);
      this.#on_release = false;
    }
    if (this.#on_press) {
      this.widget.removeEventListener(hmUI.event.CLICK_DOWN);
      this.#on_press = false;
    }
  }

  /**
   * @param {none} ATTENTION INTERNAL METHOD. DO NOT USE.
   */
  render(x, y, width, height) {
    if (!this.widget) {
      const default_props = this.default(x, y, width, height);
      this.widget = createWidget(this.type, { ...default_props, ...this.properties });
      
      // attach event listeners after rendering
      if (this.#on_release) {
        this.onRelease(callback);
      } 
      
      if (this.#on_press) {
        this.onPress(callback);
      }
      
      this.is_rendered = true; 
      
      // re-render the GUI
      if (this.gui && this.needs_update) {
        this.gui.render();
        this.needs_update = false;
      }
    }
  }
}

class GroupWidget extends Widget {  // @add 1.2.2
  constructor() {
    super("group_widget");
    this.children = [];
  }

  addChild(widget) {
    this.children.push(widget);
    widget.gui = this.gui;
    this.last_added_child = widget;
  }

  removeChild(widget) {
    const index = this.children.indexOf(widget);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  attachEvents() {
    // attach events to each child
    for (let child of this.children) {
      child.attachEvents();
    }
  }

  render(x, y, width, height) {
    for (let child of this.children) {
      child.render(x, y, width, height);
    }
  }
}

class TextWidget extends Widget {
  constructor({text, ...options}) {
    super("text", { text: text, ...options });
  }

  render(x, y, width, height) {
    if (!this.widget) {
      this.widget = createWidget(widget.TEXT, {
        ...super.default(x, y, width, height),
        color: AutoGUI.GetTextColor(),
        text_size: AutoGUI.GetTextSize(),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: DEFAULT_TEXT_STYLE, // @upd 1.2.2
        text: this.properties.text || AutoGUI.GetText(),
        ...this.properties,
      });
    }
    return this.widget;
  }
}

class ButtonWidget extends Widget {
  constructor(text, click_func, options = {}) {
    super("button", { text: text, click_func: click_func, ...options });
  }

  render(x, y, width, height) {
    if (!this.widget) {
      this.widget = createWidget(widget.BUTTON, {
        ...super.default(x, y, width, height),
        radius: this.properties.radius || AutoGUI.GetBtnRadius(),
        text: this.properties.text || AutoGUI.GetText(),
        text_size: AutoGUI.GetTextSize(),
        color: AutoGUI.GetTextColor(),
        click_func: this.properties.click_func,
        ...this.#getSourceOrColor(),
        ...this.properties,
      });
    }
    return this.widget;
  }

  #getSourceOrColor() {
    if (this.properties.normal_src) {
      return {
        press_src: this.properties.press_src || this.properties.normal_src,
      };
    } else {
      const default_color = this.properties.normal_color || AutoGUI.GetColor();
      return {
        normal_color: this.properties.normal_color  || default_color,
        press_color: this.properties.press_color    || btnPressColor(default_color, 1.3),
      };
    }
  }
}

class ImageWidget extends Widget {
  constructor({src, centered = true, ...options}) {
    super("img", { src: src || DEFAULT_ICON, centered: centered, ...options }); // @fix 1.2.7
  }

  render(x, y, width, height) {
    if (!this.widget) {
      // get image info
      const img_info = getImageInfo(this.properties.src);

      // calculate x and y for centering the image within its cell
      let center_x = x;
      let center_y = y;
      if (this.properties.centered) {
        center_x = x + (width - img_info.width) / 2;
        center_y = y + (height - img_info.height) / 2;
      }

      this.widget = createWidget(widget.IMG, {
        ...super.default(center_x, center_y, img_info.width, img_info.height),
        src: this.properties.src,
        ...this.properties,
      });
    }
    return this.widget;
  }
}

class CircleWidget extends Widget {
  constructor({color, ...options}) {
    super("circle", { color: color, ...options });
  }

  render(x, y, width, height) {
    if (!this.widget) {
      this.widget = createWidget(widget.CIRCLE, {
        ...super.default(x, y, width, height),
        center_x: x + width / 2,
        center_y: y + height / 2,
        radius: Math.min(width, height) / 2 - AutoGUI.GetPadding(),
        color: this.properties.color || AutoGUI.GetColor(),
        ...this.properties,
      });
    }
    return this.widget;
  }
}

class ArcWidget extends Widget {
  constructor({end_angle, ...options}, use_original_coordinates = false) {
    super("arc", { end_angle: end_angle, ...options });
    this.use_original_coordinates = use_original_coordinates;
  }

  render(x, y, width, height) {
    if (!this.widget) {
      let start_angle = 0;
      let end_angle = this.properties.end_angle || DEFAULT_ANGLE;

      // adjust angles if we're not using the original coordinate system
      if (!this.use_original_coordinates) {
        start_angle -= DEFAULT_ANGLE;
        end_angle -= DEFAULT_ANGLE;
      }

      this.widget = createWidget(widget.ARC, {
        ...super.default(x, y, width, height),
        start_angle: start_angle,
        end_angle: end_angle,
        line_width: this.properties.line_width || DEFAULT_LINE_WIDTH_ARC,
        color: this.properties.color || AutoGUI.GetColor(),
        ...this.properties,
      });
    }
    return this.widget;
  }
}

class FillRectWidget extends Widget {
  constructor({color, ...options}) {
    super("fill_rect", { color: color, ...options });
  }

  render(x, y, width, height) {
    if (!this.widget) {
      this.widget = createWidget(widget.FILL_RECT, {
        ...super.default(x, y, width, height),
        ...this.properties,
        color: this.properties.color || AutoGUI.GetColor(),
      });
    }
    return this.widget;
  }
}

class StrokeRectWidget extends Widget {
  constructor({color, ...options}) {
    super("stroke_rect", { color: color, ...options });
  }

  render(x, y, width, height) {
    if (!this.widget) {
      this.widget = createWidget(widget.STROKE_RECT, {
        ...super.default(x, y, width, height),
        ...this.properties,
        color: this.properties.color || AutoGUI.GetColor(),
        line_width: this.properties.line_width || DEFAULT_LINE_WIDTH_STROKE,
      });
    }
    return this.widget;
  }
}

/**
 * Class representing a GUI system.
 */
class AutoGUI {
	#active_widgets_arr = []; // ignore removed widgets
	#layout = [];
	#widgets_arr;
  #row_height;
  #current_row_arr;
  #current_group = null;  // @add 1.2.2
  
  /**
   * Create a GUI system.
   */
  constructor() {
    this.#widgets_arr = [];
    this.#row_height = 0;
    this.#current_row_arr = [];
  }

  /**
   * Set layout percentages for each line in GUI system.
   * @param {...number} percentages - The layout percentages for each line in GUI system.
   */
  rowLayout(...percentages) { // @upd 1.3.0
    let row = this.#layout[this.#layout.length - 1];

    // assign the specified percentages to the widgets in the row/line
    for (let i = 0; i < row.length; i++) {
      if (i < percentages.length) {
        row[i].percentage = percentages[i];
      } else if (row[i].percentage === undefined) {
        row[i].percentage = null;
      }
    }
  }

  /**
   * @deprecated This method is deprecated and will be removed in the future. Please use rowLayout instead.
   */
  lineLayout(...percentages) {
    console.log(ERR_DEPRECATED, "Please use rowLayout instead.");
    this.rowLayout(...percentages);
  }
  
  /**
   * Add a text element in GUI system.
   * @param {string} text - The text to display.
   * @param {object} options - Optional parameters for the text:
   * @examples
   * ```js
   * // example: initialize text widget with the specified text
   * .text("new text"); 
   * // advanced example: initialize custom text and *optionally the color
   * .text("new text", { color: 0x00ff00, ... });
   * ```
   * @return {Widget} The created widget.
   */
  text(text, options = {}) {
    return this.#addWidget(new TextWidget({ text: text, ...options || AutoGUI.GetText() }));
  }

  /**
   * Add a button in GUI system.
   * @param {string} text - The text to display on the button.
   * @param {function} click_func - The function to execute when the button is clicked.
   * @param {object} options - Optional parameters for the button:
   * @examples
   * ```js
   * // example: draw a button with specified text and on click event
   * .button("click me", ()=> {...}); 
   * // advanced example: specify text and attach a long press (700ms) event
   * .button("click me", ()=> {...}, { longpress_func: ()=>{...}, ... });
   * ```
   * @return {Widget} The created widget.
   */
  button(text, click_func, options = {}) {
    return this.#addWidget(new ButtonWidget(text, click_func, options));
  }

  /**
   * Add an image in GUI system.
   * @param {string} src - The source URL of the image.
   * @param {object} options - Optional parameters for the image:
   * @examples
   * ```js
   * // example: draw a default image with auto scale enabled
   * .image(); 
   * // advanced example: specify image path and disable auto scale
   * .image("icon.png", { auto_scale: false, ... });
   * ```
   * @return {Widget} The created widget.
   */
	image(src, options = {}) {
    return this.#addWidget(new ImageWidget({ src: src, ...options || DEFAULT_ICON }));
  }
  
  /**
   * Add a circle in GUI system.
   * @param {number} color - The color of the circle.
   * @param {object} options - Optional parameters for the circle:
   * @examples
   * ```js
   * // example: draw a circle with a default color
   * .circle(); 
   * // advanced example: specify color and optionally the radius
   * .circle(0x0000ff, { radius: 50, ... });
   * ```
   * @return {Widget} The created widget.
   */
  circle(color, options = {}) {
    return this.#addWidget(new CircleWidget({ color: color, ...options || AutoGUI.#color }));
  }

  /**
   * Add an arc in GUI system.
   * @param {number} end_angle - The end angle of the arc.
   * @param {boolean} use_original_coordinates - Whether to use original coordinates for the arc.
   * @param {object} options - Optional parameters for the arc:
   * @examples
   * ```js
   * .arc(90); // example: initialize the arc with an end angle
   * // advanced example: specify end angle and the color of the arc
   * .arc(90, { color: 0xff0000, ... }); 
   * ```
   * @return {Widget} The created widget.
   */
  arc(end_angle, use_original_coordinates, options = {}) {
    return this.#addWidget(new ArcWidget({ end_angle: end_angle, ...options }, use_original_coordinates));
  }

  /**
   * Add a filled rectangle in GUI system.
   * @param {number} color - The color of the rectangle.
   * @param {object} options - Optional parameters for the filled rectangle:
   * @examples
   * ```js
   * // example: draw a filled rect with a default color
   * .fillRect(); 
   * // advanced example: specify fill's color and the radius
   * .fillRect(0xffffff, { radius: 16, ... })
   * ```
   * @return {Widget} The created widget.
   */
  fillRect(color, options = {}) {
    return this.#addWidget(new FillRectWidget({ color: color, ...options  }));
  }

  /**
   * Add a stroked rectangle in GUI system.
   * @param {number} color - The color of the rectangle's stroke.
   * @param {object} options - *Optional parameters for the stroked rectangle:
   * @examples
   * ```js
   * // example: draw a stroke rect with a default color
   * .strokeRect(); 
   * // advanced example: specify stroke's color and the width
   * .strokeRect(0xffffff, { line_width: 16, ... });
   * ```
   * @return {Widget} The created widget.
   */
  strokeRect(color, options = {}) {
    return this.#addWidget(new StrokeRectWidget({ color: color, ...options }));
  }

  /**
   * Add a new row in GUI system (split the screen vertically by even chunks).
   */
  newRow() { // @upd 1.2.5
    if (this.#current_row_arr.length > 0) {
        // update the layout percentages for the current row
        let row = this.#layout[this.#layout.length - 1];
        let default_percentage = 100 / this.#current_row_arr.length;
        for (let item of row) {
            if (!item.percentage) {
                item.percentage = default_percentage;
            }
        }

        this.#widgets_arr.push(this.#current_row_arr);
        this.#current_row_arr = [];
    }
    // making sure it's properly recalculated
    this.#updateLayoutPercentages();

    // add a new row to the layout
    this.#layout.push([]);
  }
  /**
  * @deprecated This method is deprecated and will be removed in the future. Please use newRow instead.
  */
  newLine(){
    console.log(ERR_DEPRECATED, "Please use newRow instead.");
    this.newRow();
  }

  /**
   * Add a spacer in GUI system.
   * @return {Object} The created spacer.
   */
   spacer() { // doesn't create a windget, rather simple math placeholder
    let spacer = { gui: null };
    this.#addWidget(spacer);
  }

  /**
   * Start a new group of widgets.
   * This method creates a new GroupWidget, ads it to the GUI system, and sets it as the current group.
   * This allows subsequent widgets to be added to this group, enabling nested widgets.
   * @return {AutoGUI} The current AutoGUI instance, allowing for method chaining.
   * @since 1.2.2
   */
  startGroup() { // keep track of the current group & return the aGUI chained instance // @add 1.2.2
    const group = new GroupWidget();
    this.#addWidget(group);
    this.#current_group = group;
  }

  /**
   * End the current group of widgets.
   * This method clears the current group. If there is no current group, it logs an error message.
   */
  endGroup() {
    if (this.#current_group) {
      this.#current_group = null;
    } else {
      console.log(ERR_NO_GROUP_TO_END);
    }
  }

  /**
   * Renders all widgets on the screen.
   * 
   * This method calculates the layout of the widgets based on their specified or default percentages,
   * and then renders each widget at its calculated position. If a widget needs an update or if the 
   * 'forced' parameter is set to true, the widget is re-rendered.
   *
   * @param {boolean} [forced=false] - If true, all widgets are forcibly re-rendered regardless of whether they need an update.
   */
  render(forced = false) { // @add 1.2.2 
    if (this.#current_row_arr.length > 0) {
      this.#widgets_arr.push(this.#current_row_arr);
      this.#current_row_arr = [];
    }
  
    if (forced){
      this.#removeAllWidgets();
    }

    this.#calculateRowHeight();
  
    let y = AutoGUI.GetPadding() * 2; // start y with top padding
  
    for (let i = 0; i < this.#layout.length; i++) {
      const row = this.#layout[i];
      let x = AutoGUI.GetPadding(); // start x with left padding
  
      // calculate the total specified percentage and the number of widgets without a specified percentage
      let ttl_specified_percentage = 0;
      let num_unspecified_widgets = row.filter(item => item.percentage === null).length;
      for (let item of row) {
        if (item.percentage) {
          ttl_specified_percentage += item.percentage;
        } else {
          num_unspecified_widgets++;
        }
      }
  
      // calculate the default percentage for widgets without a specified layout
      let default_percentage = (100 - ttl_specified_percentage) / num_unspecified_widgets;
      for (let j = 0; j < row.length; j++) {
        const item = row[j];
  
        // use the specified percentage if available, otherwise use the default percentage @fix 1.2.2
        const widget_width = item.widget === spacer ? 0 : (DEVICE_WIDTH - AutoGUI.GetPadding() * 2) * ((item.percentage || (item.widget !== spacer && default_percentage)) / 100);

        if (item.widget instanceof Widget && (forced || item.widget.needs_update)) { 
          item.widget.render(
            x,
            y,
            widget_width,
            this.#row_height
          );
  
          // attach events
          item.widget.attachEvents();
  
          item.widget.needs_update = false;
        }
        x += widget_width;
      }
      y += this.#row_height;
    }
  }

  /**
   * Remove a specific widget from GUI system.
   * @param {Widget} widget - The specific widget to remove from GUI system. 
   */
	removeWidget(widget) {
		const index = this.#active_widgets_arr.indexOf(widget);
		if (index === -1) {
			console.log(ERR_ALREADY_REMOVED);
			return;
		}

    // remove event listeners (if any)
    widget.removeEventListeners();

		// remove widget from active widgets arr
		this.#active_widgets_arr.splice(index, 1);

    // if the widget is part of a group, remove it from the group
    if (widget.gui instanceof GroupWidget) {
      widget.gui.removeChild(widget);
      // mark all remaining widgets in the group as needing an update
      for (const child of widget.gui.children) {
        child.needs_update = true;
      }
      // making sure it's properly recalculated
      this.#updateLayoutPercentages();
    }

		// del all widgets
    this.#removeAllWidgets();

    for (let i = 0; i < this.#layout.length; i++) {
      const row = this.#layout[i];
      const index = row.findIndex(item => item.widget === widget);
      if (index !== -1) {
        row.splice(index, 1);
        // if the row is now empty, remove it from layout
        if (row.length === 0) {
          this.#layout.splice(i, 1);
          // also update this.#widgets_arr
          this.#widgets_arr.splice(i, 1);
        }
        break;
      }
    }
  
    // recalculate the whole GUI after the layout is updated
    this.#calculateRowHeight();

    // after removing the widget, recalculate percentages for remaining widgets in the row
    this.#updateLayoutPercentages();

    // mark all remaining widgets as needed an update
    for (const row of this.#widgets_arr) {
      for (const item of row) {
        if (item instanceof Widget) {
          item.needs_update = true;
        }
      }
    }

    // auto re-render the GUI
    this.render();
  }

  #addWidget(widget) {
    if (this.#current_group) {  // @add 1.2.2
      this.#current_group.addChild(widget);
    } else {
      this.#active_widgets_arr.push(widget);
      this.#current_row_arr.push(widget);
      widget.gui = this;
    
      // if there's no current row in the layout, create one
      if (this.#layout.length === 0) {
        this.#layout.push([]);
      }
    
      // add the widget to the layout without a default percentage
      this.#layout[this.#layout.length - 1].push({ widget: widget });
    }
    return widget;
  }

  #updateLayoutPercentages() {
    for (let row of this.#layout) {
      let default_percentage = 100 / row.length;
      for (let item of row) {
        item.percentage = default_percentage;
      }
    }
  }
  
  #calculateRowHeight() {
    const num_rows = this.#widgets_arr.length;
    // double subtract the padding from DEVICE_HEIGHT before division
    this.#row_height = (DEVICE_HEIGHT - AutoGUI.GetPadding() * 2) / num_rows;
  }

	#removeAllWidgets() {
    for (let i = 0; i < this.#widgets_arr.length; i++) {
      const row = this.#widgets_arr[i];
      for (const item of row) {
        if (item instanceof Widget && item.widget) {
          hmUI.deleteWidget(item.widget);
          item.widget = null;
        } else if (item instanceof GroupWidget) {
          for (const child of item.children) {
            if (child.widget) {
              hmUI.deleteWidget(child.widget);
              child.widget = null;
            }
          }
        }
      }
    }
  }

  // static props (with defaults)
  static #padding = 4; // default = 4px @upd 1.2.2
  static #color = 0xfc6950; // orange
  static #text_color = 0xffffff; // white
  static #text_size = DEVICE_WIDTH / 16; // 30px @480
  static #text = "my text";
  static #btn_radius = 5;

  /**
   * Set the padding value.
   * @param {number} value - The new padding value.
   */
  static SetPadding(value) { this.#padding = value; }

  /**
   * Get the current padding value.
   * @return {number} The current padding value.
   */
	static GetPadding() { return this.#padding; }

  /**
   * Set the default color value.
   * @param {number} value - The new default color value.
   */
  static SetColor(value) { this.#color = value; }

  /**
   * Get the current default color value.
   * @return {number} The current default color value.
   */
  static GetColor() { return this.#color; }

  /**
   * Set the default text color value.
   * @param {number} value - The new default text color value.
   */
  static SetTextColor(value) { this.#text_color = value; }

  /**
   * Get the current default text color value.
   * @return {number} The current default text color value.
   */
  static GetTextColor() { return this.#text_color; }

  /**
   * Set the default text size.
   * @param {number} value - The new default text size.
   */
  static SetTextSize(value) { this.#text_size = value; }

  /**
   * Get the current default text size.
   * @return {number} The current default text size.
   */
  static GetTextSize() { return this.#text_size; } // @add 1.0.6

  /**
   * Set the default text.
   * @param {string} value - The new default text.
   */
  static SetText(value) { this.#text = value; }

  /**
   * Get the current default text.
   * @return {string} The current default text.
   */
  static GetText() { return this.#text; }

  /**
   * Set the default text.
   * @param {string} value - The new default text.
   */
  static SetBtnRadius(value) { this.#btn_radius = value; }

  /**
   * Get the current default text.
   * @return {string} The current default text.
   */
  static GetBtnRadius() { return this.#btn_radius; }
}

/** HELPERS */

/**
 * Multiplies/Divides each component (red, green, blue) of a hexadecimal color by a multiplier.
 * @param {number} hex_color - The hexadecimal color to multiply.
 * @param {number} multiplier - The multiplier/divider. [example 1]: 1.3 = +30% [example 2]: 0.7 = -30%.
 * @return {string} The resulting hexadecimal color after multiplication.
 */
 export function multiplyHexColor(hex_color, multiplier) {
  hex_color = Math.floor(hex_color).toString(16).padStart(6, "0"); // @fix 1.0.6

  let r = parseInt(hex_color.substring(0, 2), 16);
  let g = parseInt(hex_color.substring(2, 4), 16);
  let b = parseInt(hex_color.substring(4, 6), 16);

  r = Math.min(Math.round(r * multiplier), 255);
  g = Math.min(Math.round(g * multiplier), 255);
  b = Math.min(Math.round(b * multiplier), 255);

  const result = "0x" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  return result;
}

/**
 * Adjusts the brightness of a hexadecimal color based on a multiplier.
 * If any color component (red, green, blue) is at its maximum value (255) and the multiplier is greater than 1, the color is made dimmer by dividing it by the multiplier.
 * Otherwise, the color is made brighter by multiplying it by the multiplier.
 * @param {number} hex_color - The hexadecimal color to adjust. This should be a number that will be converted to a hexadecimal string.
 * @param {number} multiplier - The factor by which to adjust the brightness of the color. If greater than 1, the color will be made brighter, unless any color component is already at its maximum value. If less than 1, the color will be made dimmer.
 * @return {string} The resulting hexadecimal color after adjustment.
 */
function btnPressColor(hex_color, multiplier){ // @add 1.0.6
  hex_color = Math.floor(hex_color).toString(16).padStart(6, "0");

  let r = parseInt(hex_color.substring(0, 2), 16);
  let g = parseInt(hex_color.substring(2, 4), 16);
  let b = parseInt(hex_color.substring(4, 6), 16);
  
  // check if any of the color components are at their maximum value
  if (r === 255 || g === 255 || b === 255) {
    // and if so + the multiplier is greater than 1, divide the color
    if (multiplier > 1) {
      return multiplyHexColor("0x" + hex_color, 1 / multiplier); // inverse
    }
  }
  // otherwise usual multiplication
  return multiplyHexColor("0x" + hex_color, multiplier);
}

export default AutoGUI;

/**
 * @changelog
 * 1.0.0
 * - initial release
 * 1.0.6
 * - @fix widgets centered
 * - @fix typos
 * - @fix button default text use
 * - @add setter/getter for default text
 * - @fix multiplyHexColor() invalid color parse approach
 * - @add btnPressColor() - robust approach for button light up/dim down
 * 1.2.2
 * - @add nested widgets support (one level)
 * - @fix default properties storage
 * - @fix autopadding
 * - @upd default padding 2px -> 4px
 * - @add setter/getter for button radius
 * - @add optional parameters for all widgets
 * - @fix multiple minor fixes, refinements
 * - @add button widget image support hack getSourceOrColor
 * - @rem magic numbers
 * - @upd extended widget docs
 * - @rem button's requirement for press_src. normal_src is enough now
 * - @add events suport for nested widgets
 * - @add image auto-centering with an additional "centered" flag set to true by default
 * - @rem image default auto-scale removed
 * - @upd event method naming changes onClickUp -> onRelease, onClickDown -> onPress
 * - @add flag to force widgets update in render(forced = false), expensive operation
 * 1.2.6
 * - @add getter getProperties() that returns object's stored props
 * - @upd newLine() was deprecated to avoid confusion with drawing lines. use newRow() instead
 * - @upd lineLayout() was deprecated. use rowLayout() instead
 * - @fix naming consistency
 * 1.2.7
 * - @fix .image() no params
 */