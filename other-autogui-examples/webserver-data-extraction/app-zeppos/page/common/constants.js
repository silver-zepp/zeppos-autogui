// online server
const URL_LIVE = "http://your_server_ip:33333";
// ngrok -> replace with *.ngrok.io domain. Do not specify port for this one.
const URL_NGROK = "https://11c3-138-199-31-16.ngrok.io";
// localhost (simulator only)
const URL_LOCAL = "http://127.0.0.1:33333";
// finally select a specific server
export const SERVER = URL_NGROK;

export const ENDPOINT_HR = "/hr";
export const ENDPOINT_STEPS = "/steps";
export const ENDPOINT_DATA = "/data";

export const LOOP_TIME = 3 * 1000;

export const SIMULATION_SPEED = 1000;

export const FALL_TIMEOUT = 5000;
export const FALL_ACCEL_THRESHOLD = 3000;

export const COLOR_GREEN = 0x00ff00;
export const COLOR_RED = 0xff0000;