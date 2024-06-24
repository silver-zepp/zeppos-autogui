import AutoGUI from "@silver-zepp/autogui";
const gui = new AutoGUI();

const logger = DeviceRuntimeCore.HmLogger.getLogger("fetch_api");
const { messageBuilder } = getApp().globals;

Page({
  state: {
    is_https: false,
    results_arr: [
      { status: 'pending', text: '► ZH1' }, 
      { status: 'pending', text: '► ZH2' }, 
      { status: 'pending', text: '► ZH3' }, 
      { status: 'pending', text: '► IP' },
      { status: 'pending', text: '► OWM' },
      { status: 'pending', text: '► ERR' },
    ], //Array(6).fill({ status: 'pending', text: '►' }),
    urls_arr: [
      'http://zepp-os.zepp.com/',
      'http://zepp-os-staging.zepp.com/',
      'http://zepp.com/',
      'http://ip-api.com/json/',
      'http://api.openweathermap.org/data/3.0/onecall',
      'http://thisurldoesnotexist.ok', //jsonplaceholder.typicode.com/todos/1
    ],
    text_widgets_arr: [],
  },
  build() {
    // text widgets for displaying test results
    this.state.results_arr.forEach((result, index) => {
      const text_widget = gui.text(result.text);
      this.state.text_widgets_arr.push(text_widget);

      if ((index + 1) % 3 === 0) {
        gui.newLine(); // Start a new row after every 3 text widgets
      }
    });

    // btn to toggle between HTTP and HTTPS
    const btn_protocol = gui.button("HTTP", () => {
      this.state.is_https = !this.state.is_https;
      btn_protocol.update({ text: this.state.is_https ? "HTTPS" : "HTTP" });
      gui.render();
    });

    // btn to initiate tests
    const btn_widget = gui.button("INIT TEST", () => {
      logger.log("Initiate Test");
      this.initTest();
    });

    // last row sizing
    gui.lineLayout(30, 70);

    gui.render();
  },
  updateTestResults(index, status, text) {
    this.state.results_arr[index] = { status, text };
    
    const text_widget = this.state.text_widgets_arr[index];
    if (text_widget) {
      text_widget.update({ text });
      gui.render();
    }
  },
  initTest() {
    const urls_arr = this.state.urls_arr.map(url => 
      url.replace(/^https?:\/\//, '') // rem existing protocol from the url
    );
    
    // this is recursive
    const processUrl = (index) => {
      if (index < urls_arr.length) {
        this.fetchData(urls_arr[index], index);
        setTimeout(() => processUrl(index + 1), 1000); // 1s delay
      }
    };
  
    processUrl(0);
  },
  fetchData(url, index) {
    const protocol = this.state.is_https ? "https://" : "http://";
    const full_url = protocol + url;
    // send a request to the app side with passed url
    messageBuilder
      .request({
        method: "GET_DATA",
        params: { url: full_url }
      })
      .then((data) => {
        logger.log("Data received:", data);
  
        // check if the response has an "ERROR" message
        if (data && data.result === "ERROR") {
          this.updateTestResults(index, 'error', '⊗ FAIL');
        }
        // HTTP status code errors in the result
        else if (data && data.result && data.result.cod && data.result.cod !== 200) {
          const errorMessage = data.result.message ? ` (${data.result.message})` : '';
          this.updateTestResults(index, 'error', `⊗ API`);
        }
        // empty error objects
        else if (data && data.result && data.result.error) {
          this.updateTestResults(index, 'error', '⊗ FAIL');
        }
        // if none of the above = success
        else {
          this.updateTestResults(index, 'success', '✓ OK');
        }
      })
      .catch((error) => {
        // network errors + other request issues
        logger.log("Fetch error:", error);
        this.updateTestResults(index, 'error', '⊗ FAIL');
      });
  }
});
