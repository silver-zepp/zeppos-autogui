/** @about Visual Logger 1.0.0 @zeppos 1.0 @author: Silver, Zepp Health. @license: MIT */
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } =
  hmSetting.getDeviceInfo();

const PREFIX_INFO = "INFO";
const PREFIX_WARN = "WARN";
const PREFIX_ERR = "ERR";
const PREFIX_INFO_U = "ⓘ";
const PREFIX_WARN_U = "⚠";
const PREFIX_ERR_U = "⊗";

// scroll
const DEFAULT_LINE_COUNT = 5; // debug array buffer
let messages = new Array(DEFAULT_LINE_COUNT).fill("");
let repeats = 0;

const COLOR_WHITE = 0xffffff;
const DEFAULT_BACKGROUND_COLOR = 0x333333;
const DEFAULT_TEXT_Y_POS = 28;
const DEFAULT_PADDING = 1.5;
const DEFAULT_TEXT_SIZE = 16;
const DEFAULT_TEXT_STYLE = hmUI.text_style.ELLIPSIS;
const DEFAULT_INITIAL_TIMEOUT = 5000;
const DEFAULT_NEXT_TIMEOUT = 2000;

const TEXT_STYLE = {
  h: px(0),
  w: px(DEVICE_WIDTH),
  color: COLOR_WHITE,
  text_size: DEFAULT_TEXT_SIZE,
  align_h: hmUI.align.CENTER_H, // CENTER_H LEFT
  text_style: DEFAULT_TEXT_STYLE, // WRAP NONE ELLIPSIS
};
// background
const BG_STYLE = {
  x: px(0),
  y: px(0),
  h: px(0),
  w: px(DEVICE_WIDTH),
  color: DEFAULT_BACKGROUND_COLOR,
};

export default class VisLog {
  #filename;
  #text_size = DEFAULT_TEXT_SIZE;
  #text_style = DEFAULT_TEXT_STYLE;
  #text_color = COLOR_WHITE;
  #background_color = DEFAULT_BACKGROUND_COLOR;
  #line_count = DEFAULT_LINE_COUNT;
  #log_from_top = false;
  #console_log_enabled = true;
  #prefix_enabled = true;
  #timeout_enabled = true;
  #visual_log_enabled = true;
  #text_widget = null;
  #background_widget = null;
  #timer = null;
  #is_widgets_created = false;
  #background_enabled = true;

  constructor(filename = "") {
    this.#filename = filename;
  }
  /**
   * Log a message with an "INFO" prefix.
   * @param {...any} args - The message to log, as one or more arguments that will be joined into a single string.
   */
  log(...args) {
    this.#logWithPrefix(PREFIX_INFO_U, PREFIX_INFO, ...args);
  }
  /**
   * Log a message with a "WARN" prefix.
   * @param {...any} args - The message to log, as one or more arguments that will be joined into a single string.
   */
  warn(...args) {
    this.#logWithPrefix(PREFIX_WARN_U, PREFIX_WARN, ...args);
  }
  /**
   * Log a message with an "ERR" prefix.
   * @param {...any} args - The message to log, as one or more arguments that will be joined into a single string.
   */
  error(...args) {
    this.#logWithPrefix(PREFIX_ERR_U, PREFIX_ERR, ...args);
  }
  #recreateWidgets() {
		// destroy
		if (this.#is_widgets_created) {
			this.#destroyWidgets();
		}
		if (this.#background_enabled) {
			this.#background_widget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
				...BG_STYLE,
			});
		}
		this.#text_widget = hmUI.createWidget(hmUI.widget.TEXT, {
			...TEXT_STYLE,
		});
		this.#is_widgets_created = true;
	}
  #logWithPrefix(prefixVisual, prefixConsole, ...args) {
    let msg = args.join(" ");

    if (this.#prefix_enabled) {
      msg = `${prefixVisual} ${msg}`;
    }

    if (msg !== messages[0]) {
      for (let i = this.#line_count - 1; i >= 0; i--) {
        messages[i + 1] = messages[i];
      }
      messages[0] = msg;
      // if we have repeats
      if (repeats > 0) {
        // add a counter to the prev executed command
        messages[1] = `[${repeats + 1}] ` + messages[1];
        repeats = 0;
      }
      if (this.#timeout_enabled) {
        if (!this.#timer) {
          this.#timer = timer.createTimer(DEFAULT_INITIAL_TIMEOUT, 0, () => {
            this.#removeOldestMessage()
          });
        } else {
          timer.stopTimer(this.#timer);
          this.#timer = timer.createTimer(DEFAULT_INITIAL_TIMEOUT, 0, () =>
            this.#removeOldestMessage()
          );
        }
      }
    } else {
      repeats++;
    }

    if (this.#visual_log_enabled) {
      this.#renderText();
    }
    this.#consoleLog(prefixConsole, args.join(" "));
  }
  /**
   * Clear all messages from the logger.
   */
  clear() {
    messages.fill("");
    repeats = 0;
  }
  /**
   * Refreshing the widget will help it appear on top of other widgets as well as fixing the missing background.
   */
  refresh() {
    this.#is_widgets_created = false;
    this.#renderText();
  }
  #getNumMessages() {
    const MAX_MESSAGES = Math.min(
      this.#line_count,
      Math.floor(DEVICE_HEIGHT / (this.#text_size * DEFAULT_PADDING))
    );
    return Math.min(messages.filter((msg) => msg).length, MAX_MESSAGES);
  }
  #removeOldestMessage() {
    const num_messages = this.#getNumMessages();

    if (num_messages > 0) {
      messages.pop();
      messages.unshift();

      if (this.#visual_log_enabled) {
        this.#renderText();
      }

      if (this.#timer) {
        timer.stopTimer(this.#timer);

        if (num_messages > 0 && this.#timeout_enabled) {
          this.#timer = timer.createTimer(DEFAULT_NEXT_TIMEOUT, 0, () =>
            this.#removeOldestMessage()
          );
          repeats = 0;
        }
      }
    } else {
      if (this.#timer) timer.stopTimer(this.#timer);
      this.#timer = null;
    }
  }
  #renderText() {
    let msg = "";
    for (let i = 0; i < this.#line_count; i++) {
      if (messages[i]) {
        // if we have repeats -> draw them in the square brackets
        if (repeats > 0 && i === 0) msg += `[${repeats + 1}] `;
        msg += messages[i];
        msg += "\n";
      }
    }

    const num_messages = this.#getNumMessages();
    const text_height = num_messages * this.#text_size * DEFAULT_PADDING;

    let y_pos;
    if (this.#log_from_top) {
      y_pos = DEFAULT_TEXT_Y_POS;
    } else {
      
      y_pos = DEVICE_HEIGHT - this.#text_size * DEFAULT_PADDING * num_messages;
    }

		// z-sorting fix
    if (!this.#is_widgets_created) this.#recreateWidgets();

    // update background
    if (this.#background_widget) {
      this.#background_widget.setProperty(hmUI.prop.MORE, {
        x: px(0),
        y: px(y_pos),
        h: px(text_height),
        w: px(DEVICE_WIDTH),
        color: this.#background_color,
      });
    }

    // update text
    if (this.#visual_log_enabled) {
      if (this.#text_widget) {
        this.#text_widget.setProperty(hmUI.prop.MORE, {
          y: px(y_pos),
          h: px(text_height),
          text: msg,
          text_size: this.#text_size,
          text_style: this.#text_style,
          color: this.#text_color,
        });
      }
    }
  }
  #destroyWidgets() {
    if (this.#text_widget) {
      hmUI.deleteWidget(this.#text_widget);
      this.#text_widget = null;
    }
    if (this.#background_widget) {
      hmUI.deleteWidget(this.#background_widget);
      this.#background_widget = null;
    }
  }
  // console
  #consoleLog(prefix, msg) {
    if (this.#console_log_enabled) {
      if (this.#prefix_enabled) {
        msg = `[${prefix}] ${msg}`;
      }
      if (this.#filename !== "") {
        console.log(`[${this.#filename}] ${msg}`);
      } else {
        console.log(msg);
      }
    }
  }
  /**
   * Update the settings for this VisLog instance.
   * @param {Object} settings - An object containing the settings to update.
   * @param {boolean} [settings.log_from_top] - Whether to position the logger at the top or the bottom of the screen.
   * @param {boolean} [settings.console_log_enabled] - Whether to enable console logging.
   * @param {boolean} [settings.prefix_enabled] - Whether to include a prefix in log messages.
   * @param {boolean} [settings.timeout_enabled] - Whether to automatically remove old messages after a timeout.
   * @param {boolean} [settings.visual_log_enabled] - Whether to enable visual logging.
   * @param {boolean} [settings.background_enabled] - Whether to enable background behind the text.
   * @param {number} [settings.text_size] - The size of the text in the visual log.
   * @param {number} [settings.text_style] - The style of the text in the visual log.
   * @param {number} [settings.text_color] - The color of the text in the visual log.
   * @param {number} [settings.background_color] - The color of the background in the visual log.
   * @param {number} [settings.line_count] - Maximum amount of vertical lines for the visual log.
   */
  updateSettings(settings) {
    if (typeof settings.log_from_top === "boolean") {
      this.#log_from_top = settings.log_from_top;
    }
    if (typeof settings.console_log_enabled === "boolean") {
      this.#console_log_enabled = settings.console_log_enabled;
    }
    if (typeof settings.prefix_enabled === "boolean") {
      this.#prefix_enabled = settings.prefix_enabled;
    }
    if (typeof settings.timeout_enabled === "boolean") {
      this.#timeout_enabled = settings.timeout_enabled;
    }
    if (typeof settings.visual_log_enabled === "boolean") {
			this.#visual_log_enabled = settings.visual_log_enabled;
			if (this.#visual_log_enabled && this.#text_widget) {
				this.#text_widget.setProperty(
					hmUI.prop.VISIBLE,
					settings.visual_log_enabled
				);
			}
		}
    if (typeof settings.background_enabled === "boolean") {
			this.#background_enabled = settings.background_enabled;
			if (this.#background_widget) {
				this.#background_widget.setProperty(
					hmUI.prop.VISIBLE,
					settings.background_enabled
				);
			}
		}
    if (typeof settings.text_size === "number") {
      this.#text_size = settings.text_size;
    }
    if (typeof settings.text_style === "number") {
      this.#text_style = settings.text_style;
    }
    if (typeof settings.text_color === "number") {
      this.#text_color = settings.text_color;
    }
    if (typeof settings.background_color === "number") {
      this.#background_color = settings.background_color;
    }
    if (typeof settings.line_count === "number") {
      this.#line_count = settings.line_count;
    }
    this.#renderText(); // @fix 1.0.4
  }
}