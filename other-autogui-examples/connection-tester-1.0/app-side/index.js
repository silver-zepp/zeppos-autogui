import { MessageBuilder } from "../shared/message";

const messageBuilder = new MessageBuilder();
const logger = Logger.getLogger("app-side");
// logger.log("hello");

async function fetchData(ctx, url) {
  try {
    const response = await fetch(url, {
      method: 'GET'
    });
    const res_body = await response.json();

    ctx.response({
      data: { result: res_body },
    });
  } catch (error) {
    ctx.response({
      data: { result: "ERROR", error: error.message },
    });
  }
};

AppSideService({
  onInit() {
    messageBuilder.listen(() => { });

    messageBuilder.on("request", (ctx) => {
      const json_rpc = messageBuilder.buf2Json(ctx.request.payload);

      logger.log("Request received:", json_rpc);

      if (json_rpc.method === "GET_DATA") {
        const url = json_rpc.params?.url; // extract the URL from the request parameters
        if (url) {
          return fetchData(ctx, url);
        } else {
          ctx.response({ data: { result: "ERROR", error: "No URL provided" } });
        }
      }
    });
  },

  onRun() { },

  onDestroy() { },
});