/** @about AutoGUI 1.0.0 @min_zeppos 2.0 @author: Silver, Zepp Health. @license: MIT */
import { getDeviceInfo } from "@zos/device";
export const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();
import hmUI, { createWidget, widget, align, text_style, prop } from "@zos/ui";
import { px } from "@zos/utils";

const ERR_ALREADY_REMOVED = "This widget has already been removed!";
const BTN_RADIUS    = 5;
const DEFAULT_ICON  = "icon.png";
const DEFAULT_TEXT  = "my text";

/**
 * Class representing a widget.
 */
class Widget {
  #on_click_up = false;
  #on_click_down = false;
  #on_click_up_callback;
  #on_click_down_callback;

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
    return {
      x: px(x + AutoGUI.GetPadding()),
      y: px(y),
      w: px(width - AutoGUI.GetPadding() * 2),
      h: px(height - AutoGUI.GetPadding() * 2),
    }
  }
  /**
   * Update the properties of the widget.
   * @param {Object} new_properties - The new properties to update. Use the official widgets approach here example - .update({ text: "new text", color: 0xFF0000, ... })
   */
  update(new_properties) {
    this.properties = { ...this.properties, ...new_properties };
  
    if (this.widget) {
      this.widget.setProperty(prop.MORE, new_properties);
    }
  
    this.needs_update = true;
  
    // re-render the GUI
    if (this.gui) {
      this.gui.render();
    }
  }
  /**
   * @param {none} ATTENTION INTERNAL METHOD. DO NOT USE.
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
   * Attach an event listener for the 'click up' event.
   * @param {function} callback - The callback function to execute when the event is triggered.
   */
  onClickUp(callback) {
    this.#on_click_up_callback = callback;
    
    if (this.is_rendered) {
      this.widget.addEventListener(hmUI.event.CLICK_UP, this.#on_click_up_callback);
    } 
  }
  /**
   * Attach an event listener for the 'click down' event.
   * @param {function} callback - The callback function to execute when the event is triggered.
   */
  onClickDown(callback) {
    this.#on_click_down_callback = callback;
    
    if (this.is_rendered) {
      this.widget.addEventListener(hmUI.event.CLICK_DOWN, this.#on_click_down_callback);
    }
  }
  /**
   * @param {none} ATTENTION INTERNAL METHOD. DO NOT USE.
   */
  attachEvents() {
    if (this.#on_click_up_callback) {
      this.widget.addEventListener(hmUI.event.CLICK_UP, this.#on_click_up_callback);
    }
    if (this.#on_click_down_callback) {
      this.widget.addEventListener(hmUI.event.CLICK_DOWN, this.#on_click_down_callback);
    }
  }
  /**
   * Remove all event listeners from the widget.
   */
  removeEventListeners() {
    if (this.#on_click_up) {
      this.widget.removeEventListener(hmUI.event.CLICK_UP);
      this.#on_click_up = false;
    }
    if (this.#on_click_down) {
      this.widget.removeEventListener(hmUI.event.CLICK_DOWN);
      this.#on_click_down = false;
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
      if (this.#on_click_up) {
        this.onClickUp(callback);
      } 
      
      if (this.#on_click_down) {
        this.onClickDown(callback);
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

class TextWidget extends Widget {
  constructor(properties) {
    super("text", properties);
  }

  render(x, y, width, height) {
    if (!this.widget) {
      this.widget = createWidget(widget.TEXT, {
        ...super.default(x, y, width, height),
        color: AutoGUI.GetTextColor(),
        text_size: AutoGUI.GetTextSize(),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.NONE,
        ...this.properties,
      });
    }
    return this.widget;
  }

}

class ButtonWidget extends Widget {
  constructor(text, click_func) {
    super("button", { text: text, click_func: click_func });
  }

  render(x, y, width, height) {
		if (!this.widget) {
      const default_color = AutoGUI.GetColor();
			this.widget = createWidget(widget.BUTTON, {
				...super.default(x, y, width, height),
				radius: BTN_RADIUS,
				normal_color: default_color,
				press_color: multiplyHexColor(default_color, 1.3),
				text: this.properties.text,
        text_size: AutoGUI.GetTextSize(),
        color: AutoGUI.GetTextColor(),
				click_func: this.properties.click_func,
			});
		}
    return this.widget;
  }
}

class ImageWidget extends Widget {
  constructor(properties) {
    super("img", properties);
  }

  render(x, y, width, height) {
		if (!this.widget) {
			this.widget = createWidget(widget.IMG, {
				...super.default(x, y, width, height),
				auto_scale: true,
				...this.properties,
			});
		}
    return this.widget;
  }
}

class CircleWidget extends Widget {
  constructor(properties) {
    super("circle", properties);
  }

  render(x, y, width, height) {
		if (!this.widget) {
			this.widget = createWidget(widget.CIRCLE, {
				...super.default(x, y, width, height),
				center_x: x + width / 2,
				center_y: y + height / 2,
				radius: Math.min(width, height) / 2 - AutoGUI.GetPadding(),
				...this.properties,
			});
		}
    return this.widget;
  }
}

class ArcWidget extends Widget {
  constructor(end_angle, use_original_coordinates = false) {
    super("arc", { end_angle: end_angle });
    this.use_original_coordinates = use_original_coordinates;
  }

  render(x, y, width, height) {
    if (!this.widget) {
      let start_angle = 0;
      let end_angle = this.properties.end_angle || 90;

      // adjust angles if we're not using the original coordinate system
      if (!this.use_original_coordinates) {
        start_angle -= 90;
        end_angle -= 90;
      }

      this.widget = createWidget(widget.ARC, {
        ...super.default(x, y, width, height),
        start_angle: start_angle,
        end_angle: end_angle,
        line_width: 20,
        color: AutoGUI.GetColor(),
      });
    }
    return this.widget;
  }
}

class FillRectWidget extends Widget {
  constructor(color) {
    super("fill_rect", { color: color });
  }

  render(x, y, width, height) {
    if (!this.widget) {
      this.widget = createWidget(widget.FILL_RECT, {
        ...super.default(x, y, width, height),
        color: this.properties.color || AutoGUI.GetColor(),
      });
    }
    return this.widget;
  }
}

class StrokeRectWidget extends Widget {
  constructor(color) {
    super("stroke_rect", { color: color });
  }

  render(x, y, width, height) {
    if (!this.widget) {
      this.widget = createWidget(widget.STROKE_RECT, {
        ...super.default(x, y, width, height),
        color: this.properties.color || AutoGUI.GetColor(),
        line_width: 4,
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
  lineLayout(...percentages) {
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
		// del all widgets
    this.#removeAllWidgets();

    for (let i = 0; i < this.#widgets_arr.length; i++) {
      const row = this.#widgets_arr[i];
      const index = row.indexOf(widget);
      if (index !== -1) {
        row.splice(index, 1);
        // if the row is now empty, remove it from widgets_arr
        if (row.length === 0) {
          this.#widgets_arr.splice(i, 1);
        }
        break;
      }
    }

    // mark all remaining widgets as needed an update
    for (const row of this.#widgets_arr) {
      for (const item of row) {
        if (item instanceof Widget) {
          item.needs_update = true;
        }
      }
    }
  }
  /**
   * Add a new line in GUI system. 
   */
  newLine() {
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
	
		// add a new row to the layout
		this.#layout.push([]);
	}
  /**
   * Add a text element in GUI system.
   * @param {string} text - The text to display.
   * @return {Widget} The created widget.
   */
  text(text) {
    return this.#addWidget(new TextWidget({ text: text || DEFAULT_TEXT }));
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
   * Add a button in GUI system.
   * @param {string} text - The text to display on the button.
   * @param {function} click_func - The function to execute when the button is clicked.
   * @return {Widget} The created widget.
   */
  button(text, click_func) {
    return this.#addWidget(new ButtonWidget(text, click_func));
  }
  /**
   * Add an image in GUI system.
   * @param {string} src - The source URL of the image.
   * @return {Widget} The created widget.
   */
	image(src) {
    return this.#addWidget(new ImageWidget({ src: src || DEFAULT_ICON }));
  }
  /**
   * Add a circle in GUI system.
   * @param {number} color - The color of the circle.
   * @return {Widget} The created widget.
   */
  circle(color) {
    return this.#addWidget(new CircleWidget({ color: color || AutoGUI.#default_color }));
  }
  /**
   * Add an arc in GUI system.
   * @param {number} end_angle - The end angle of the arc.
   * @param {boolean} use_original_coordinates - Whether to use original coordinates for the arc.
   * @return {Widget} The created widget.
   */
  arc(end_angle, use_original_coordinates) {
    return this.#addWidget(new ArcWidget(end_angle, use_original_coordinates));
  }
  /**
   * Add a filled rectangle in GUI system.
   * @param {number} color - The color of the rectangle.
   * @return {Widget} The created widget.
   */
  fillRect(color) {
    return this.#addWidget(new FillRectWidget(color));
  }
  /**
   * Add a stroked rectangle in GUI system.
   * @param {number} color - The color of the rectangle's stroke.
   * @return {Widget} The created widget.
   */
  strokeRect(color) {
    return this.#addWidget(new StrokeRectWidget(color));
  }
  /**
   * Render all widgets on the screen. 
   */
  render() {
    if (this.#current_row_arr.length > 0) {
      this.#widgets_arr.push(this.#current_row_arr);
      this.#current_row_arr = [];
    }
  
    this.#calculateRowHeight();
  
    for (let i = 0; i < this.#layout.length; i++) {
      const row = this.#layout[i];
      let x = 0;
  
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
      let defaultPercentage = (100 - ttl_specified_percentage) / num_unspecified_widgets;
      for (let j = 0; j < row.length; j++) {
        const item = row[j];
      
        // use the specified percentage if available, otherwise use the default percentage
        const widget_width = item.widget === spacer ? 0 : DEVICE_WIDTH * ((item.percentage || (item.widget !== spacer && defaultPercentage)) / 100);
        
        if (item.widget instanceof Widget && item.widget.needs_update) { 
          item.widget.render(
            x,
            i * this.#row_height + AutoGUI.#padding,
            widget_width - AutoGUI.#padding * 2,
            this.#row_height - AutoGUI.#padding * 2
          );
  
          // attach events
          item.widget.attachEvents();

          item.widget.needs_update = false;
        }
  
        x += widget_width;
      }
    }
  }
  #addWidget(widget) {
    this.#active_widgets_arr.push(widget);
    this.#current_row_arr.push(widget);
    widget.gui = this;
  
    // if there's no current row in the layout, create one
    if (this.#layout.length === 0) {
      this.#layout.push([]);
    }
  
    // add the widget to the layout without a default percentage
    this.#layout[this.#layout.length - 1].push({ widget: widget });
  
    return widget;
  }

	// calculate the height of each row to distribute even space
  #calculateRowHeight() {
    const num_rows = this.#widgets_arr.length;
    this.#row_height = DEVICE_HEIGHT / num_rows;
  }

	#removeAllWidgets() {
    for (let i = 0; i < this.#widgets_arr.length; i++) {
      const row = this.#widgets_arr[i];
      for (const item of row) {
        if (item instanceof Widget && item.widget) {
          hmUI.deleteWidget(item.widget);
          item.widget = null;
        }
      }
    }
  }
  // static props
  static #padding = 2; // default = 2px
  static #default_color = 0xfc6950; // orange
  static #dafault_text_color = 0xffffff; // white
  static #default_text_size = DEVICE_WIDTH / 16; // 30px @480
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
  static SetColor(value) { this.#default_color = value }
  /**
   * Get the current default color value.
   * @return {number} The current default color value.
   */
  static GetColor() { return this.#default_color }
  /**
   * Set the default text color value.
   * @param {number} value - The new default text color value.
   */
  static SetTextColor(value) { this.#dafault_text_color = value }
  /**
   * Get the current default text color value.
   * @return {number} The current default text color value.
   */
  static GetTextColor() { return this.#dafault_text_color }
  /**
   * Set the default text size.
   * @param {number} value - The new default text size.
   */
  static SetTextSize(value) { this.#default_text_size = value }
  /**
   * Get the current default text size.
   * @return {number} The current default text size.
   */
  static GetTextSize() { return this.#default_text_size }
}

/**
 * Multiplies/Divides each component (red, green, blue) of a hexadecimal color by a multiplier.
 * @param {number} hexColor - The hexadecimal color to multiply.
 * @param {number} multiplier - The multiplier/divider. [example 1]: 1.3 = +30% [example 2]: 0.7 = -30%.
 * @return {string} The resulting hexadecimal color after multiplication.
 */
export function multiplyHexColor(hexColor, multiplier) {
  hexColor = Math.floor(hexColor).toString(16); 

  let r = parseInt(hexColor.substring(0, 2), 16);
  let g = parseInt(hexColor.substring(2, 4), 16);
  let b = parseInt(hexColor.substring(4, 6), 16);

  r = Math.min(Math.round(r * multiplier), 255);
  g = Math.min(Math.round(g * multiplier), 255);
  b = Math.min(Math.round(b * multiplier), 255);

  return "0x" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export default AutoGUI;

/**
 * @changelog
 * 1.0.0
 * - initial release
 */