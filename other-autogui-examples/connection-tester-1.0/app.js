import "./shared/device-polyfill";
import { MessageBuilder } from "./shared/message";

App({
  globals: { messageBuilder: null },
  onCreate(options) {
    let app_id;
    if (!hmApp.packageInfo) {
      // appId = XXX // Modify appId
      throw new Error('Set appId,  appId needs to be the same as the configuration in app.json');
    } else {
      app_id = hmApp.packageInfo().appId;
    }
    this.globals.messageBuilder = new MessageBuilder({
      appId: app_id,
    });
    this.globals.messageBuilder.connect();
  },

  onDestroy(options) {
    this.global.messageBuilder.disConnect();
  },
});
