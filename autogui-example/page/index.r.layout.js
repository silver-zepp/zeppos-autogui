import { px } from "@zos/utils";

import { multiplyHexColor } from "../include/helpers"
import * as C from "../include/constants"

export const BUTTON = {
  x: px(C.SCREEN_CENTER_X - C.BTN_WIDTH / 2),
  y: px(C.SCREEN_CENTER_X - C.BTN_HEIGHT / 2),
  w: px(C.BTN_WIDTH),
  h: px(C.BTN_HEIGHT),
  normal_color: C.COLOR_ORANGE,
  press_color: multiplyHexColor(C.COLOR_ORANGE, 1.3),
  text: 'HELLO',
  radius: 5,
}

export const TEXT_STYLE = {
  x: px(0),
  y: px(0),
}
