/** HELPERS */
/**
 * Multiplies/Divides each component (red, green, blue) of a hexadecimal color by a multiplier.
 * @param {number} hex_color - The hexadecimal color to multiply.
 * @param {number} multiplier - The multiplier/divider. [example 1]: 1.3 = +30% [example 2]: 0.7 = -30%.
 * @return {string} The resulting hexadecimal color after multiplication.
 */
export function multiplyHexColor(hex_color: number, multiplier: number): string;
export const DEVICE_WIDTH: any;
export const DEVICE_HEIGHT: any;
export default AutoGUI;
/**
 * Class representing a GUI system.
 */
declare class AutoGUI {
    static "__#3@#padding": number;
    static "__#3@#color": number;
    static "__#3@#text_color": number;
    static "__#3@#text_size": number;
    static "__#3@#text": string;
    static "__#3@#btn_radius": number;
    /**
     * Set the padding value.
     * @param {number} value - The new padding value.
     */
    static SetPadding(value: number): void;
    /**
     * Get the current padding value.
     * @return {number} The current padding value.
     */
    static GetPadding(): number;
    /**
     * Set the default color value.
     * @param {number} value - The new default color value.
     */
    static SetColor(value: number): void;
    /**
     * Get the current default color value.
     * @return {number} The current default color value.
     */
    static GetColor(): number;
    /**
     * Set the default text color value.
     * @param {number} value - The new default text color value.
     */
    static SetTextColor(value: number): void;
    /**
     * Get the current default text color value.
     * @return {number} The current default text color value.
     */
    static GetTextColor(): number;
    /**
     * Set the default text size.
     * @param {number} value - The new default text size.
     */
    static SetTextSize(value: number): void;
    /**
     * Get the current default text size.
     * @return {number} The current default text size.
     */
    static GetTextSize(): number;
    /**
     * Set the default text.
     * @param {string} value - The new default text.
     */
    static SetText(value: string): void;
    /**
     * Get the current default text.
     * @return {string} The current default text.
     */
    static GetText(): string;
    /**
     * Set the default text.
     * @param {string} value - The new default text.
     */
    static SetBtnRadius(value: string): void;
    /**
     * Get the current default text.
     * @return {string} The current default text.
     */
    static GetBtnRadius(): string;
    /**
     * Set layout percentages for each line in GUI system.
     * @param {...number} percentages - The layout percentages for each line in GUI system.
     */
    rowLayout(...percentages: number[]): void;
    /**
     * @deprecated This method is deprecated and will be removed in the future. Please use rowLayout instead.
     */
    lineLayout(...percentages: any[]): void;
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
    text(text: string, options?: object): Widget;
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
    button(text: string, click_func: Function, options?: object): Widget;
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
    image(src: string, options?: object): Widget;
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
    circle(color: number, options?: object): Widget;
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
    arc(end_angle: number, use_original_coordinates: boolean, options?: object): Widget;
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
    fillRect(color: number, options?: object): Widget;
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
    strokeRect(color: number, options?: object): Widget;
    /**
     * Add a new row in GUI system (split the screen vertically by even chunks).
     */
    newRow(): void;
    /**
    * @deprecated This method is deprecated and will be removed in the future. Please use newRow instead.
    */
    newLine(): void;
    /**
     * Add a spacer in GUI system.
     * @return {Object} The created spacer.
     */
    spacer(): any;
    /**
     * Start a new group of widgets.
     * This method creates a new GroupWidget, ads it to the GUI system, and sets it as the current group.
     * This allows subsequent widgets to be added to this group, enabling nested widgets.
     * @return {AutoGUI} The current AutoGUI instance, allowing for method chaining.
     * @since 1.2.2
     */
    startGroup(): AutoGUI;
    /**
     * End the current group of widgets.
     * This method clears the current group. If there is no current group, it logs an error message.
     */
    endGroup(): void;
    /**
     * Renders all widgets on the screen.
     *
     * This method calculates the layout of the widgets based on their specified or default percentages,
     * and then renders each widget at its calculated position. If a widget needs an update or if the
     * 'forced' parameter is set to true, the widget is re-rendered.
     *
     * @param {boolean} [forced=false] - If true, all widgets are forcibly re-rendered regardless of whether they need an update.
     */
    render(forced?: boolean): void;
    /**
     * Remove a specific widget from GUI system.
     * @param {Widget} widget - The specific widget to remove from GUI system.
     */
    removeWidget(widget: Widget): void;
    #private;
}
/**
 * Class representing a widget.
 */
declare class Widget {
    constructor(type: any, properties: any, gui: any);
    type: any;
    properties: any;
    gui: any;
    needs_update: boolean;
    is_rendered: boolean;
    /**
     * @param {none} ATTENTION INTERNAL METHOD. DO NOT USE.
     */
    default(x: any, y: any, width: any, height: any): any;
    /**
     * Update the properties of the widget.
     * @param {Object} new_properties - The new properties to update. Use the official widgets approach here:
     * @example
     * ```js
     * .update({ text: "new text", color: 0xff0000, ... })
     * ```
     */
    update(new_properties: any): void;
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
    getProperties(...properties: string[]): object | string | undefined;
    /**
     * Remove this widget from GUI system.
     */
    remove(): void;
    widget: any;
    /**
     * Attach an event listener for the 'on release' event.
     * @param {function} callback - The callback function to execute when the event is triggered.
     */
    onRelease(callback: Function): void;
    /**
     * Attach an event listener for the 'on press' event.
     * @param {function} callback - The callback function to execute when the event is triggered.
     */
    onPress(callback: Function): void;
    /**
     * @param {none} ATTENTION INTERNAL METHOD. DO NOT USE.
     */
    attachEvents(): void;
    /**
     * Remove all event listeners from the widget.
     */
    removeEventListeners(): void;
    /**
     * @param {none} ATTENTION INTERNAL METHOD. DO NOT USE.
     */
    render(x: any, y: any, width: any, height: any): void;
    #private;
}
