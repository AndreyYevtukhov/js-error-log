(function () {
  let Logger = (function () {
    /**
     * stores POST endpoint url
     */
    let url;

    /**
     * can be used for log customisation
     *
     * this object will be merged with error, before message will be send
     *
     * @type {{}}
     */
    let defaults = {};

    /**
     * initializes event listeners
     */
    function init() {
      // log unhandled JS errors
      window.onerror = function (type, location, line, position, errorObj) {
        let message;

        if (type && location && line && position) {
          // standard error
          message = 'ERROR:' +
            ' \n: ' + type +
            ' \n\nat file: ' + location + ' ' +
            ' \nat line:' + line +
            ' \nat col: ' + position;
        } else if (type !== null && typeof type === 'object') {
          // angular 2 app now sometimes wires EventErrors
          // this code will try to get information from them
          message = 'Angular 2 EventError:' +
            ' \n' + ((type.message) ? type.message : ' -- ') +
            ' \n\nat file: ' + ((type.filename) ? type.filename : ' -- ') +
            ' \nat line: ' + ((type.lineno) ? type.lineno : ' -- ') +
            ' \nat col: ' + ((type.colno) ? type.colno : ' -- ') +
            ' \n\nstack: ' + ((type.error && type.error.stack) ? type.error.stack : ' -- ');
        } else {
          // error data is invalid
          // log as much as we can
          message = 'UN-PROCESSABLE ERROR! All possible information:' +
          + type +
          ' \n\nlocation: ' + location +
          ' \nposition: ' + position +
          ' \n\nerrorObj: ' + (type !== null && typeof type === 'object') ? JSON.stringify(errorObj) : errorObj;
        }

        // fix for Safari issue
        // https://bugs.webkit.org/show_bug.cgi?id=55092
        if (errorObj && errorObj.stack) {
          message += ' \n\nStack: ' + errorObj.stack;
        }

        sendMessage(message, 'error');
      };

      // log errors inside promises
      window.addEventListener("unhandledrejection", function (err) {
        let message;

        if (err && err.reason) {
          message = 'Promise unhandled error' +
            ' \nmessage: ' + err.reason.message +
            ' \n\nstack: ' + err.reason.stack;
        } else {
          message = 'Promise unhandled error without reason.\n\n' + JSON.stringify(err);
        }

        sendMessage(message, 'error');
      });

      // log jQuery AJAX errors
      if (window.jQuery) {
        $(document).ajaxError(function (event, xhr, options, exc) {
          let message = 'jQuery AJAX Error' +
            ' \n\nurl: ' + options.url +
            ' \nmethod: ' + options.type +
            ' \nxhr.status: ' + xhr.status +
            ' \nstatusText: ' + exc +
            ' \nxhr.responseText: ' + xhr.responseText;

          sendMessage(message, 'error');
        });
      }
    }

    /**
     * sends POST request with formatted error message
     *
     * @param errorText: String
     * @param errLevel: String
     */
    function sendMessage(errorText, errLevel) {
      if (!url) {
        throw new Error('[url] is not defined. You need to initialise logger first.');
      }

      let requestData = {};
      let message = errorText + getClientInfo();

      if (errLevel) {
        requestData = Object.assign({}, defaults, {
          errlevel: errLevel,
          message: message
        });
      } else {
        requestData.message = message;
      }

      createXHR().send(JSON.stringify(requestData));
    }

    /**
     * @param i {string}
     * @param domMs {number}
     * @param loadMs {number}
     * @param resourcesTimings {string}
     */
    function sendLoadMessage(i, domMs, loadMs, resourcesTimings) {
      if (!url) {
        throw new Error('[url] is not defined. You need to initialise logger first.');
      }

      let requestData = Object.assign({}, defaults, {
        i: i,
        dom: domMs,
        load: loadMs,
        errlevel: 'load',
        message: resourcesTimings + "\n\n" + getClientInfo()
      });

      createXHR().send(JSON.stringify(requestData));
    }

    function createXHR() {
      let xhr = new XMLHttpRequest();

      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

      return xhr;
    }

    function getClientInfo() {
      return '\n\nClient info:' +
        '\nURL: ' + window.location +
        '\nCLN: ' + window.navigator.userAgent +
        '\nX*Y: ' + window.innerWidth + 'x' + window.innerHeight;
    }

    /**
     * Logger API
     */
    return {
      /**
       * Initializes logger
       *
       * @param logPostURL String
       * @param logDefaults Object
       */
      init: function (logPostURL, logDefaults) {
        if (!logPostURL || typeof logPostURL !== 'string' || logPostURL instanceof String) {
          throw new Error('[logPostURL] is required param. It must be a String.');
        }

        url = logPostURL;
        defaults = logDefaults;

        init();
      },

      sendMessage: sendMessage,

      sendLoadMessage: sendLoadMessage,

      /**
       * returns logger initialisation state
       * can be used for local debug, if you don't want to send log message some where,
       * but want to log it in console
       *
       * @example
       * if (Logger.isInit()) {
             *  Logger.sendMessage(errorMessage);
             * } else {
             *  console.error(errorMessage);
             * }
       *
       * @returns {boolean}
       */
      isInit: function () {
        return !!url;
      }
    }
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Logger;
  } else {
    window.Logger = Logger;
  }
})();