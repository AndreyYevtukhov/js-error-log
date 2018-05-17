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
                    message = 'type: ' + type +
                        ' \nat file: ' + location + ' ' +
                        ' \nat line:' + line +
                        ' \nat col: ' + position;
                } else if (type !== null && typeof type === 'object') {
                    // angular 2 app now sometimes wires EventErrors (???)
                    // this code will try to get information from them
                    message = 'type: ' + ((type.message) ? type.message : ' -- ') +
                        ' \nat file: ' + ((type.filename) ? type.filename : ' -- ') +
                        ' \nat line: ' + ((type.lineno) ? type.lineno : ' -- ') +
                        ' \nat col: ' + ((type.colno) ? type.colno : ' -- ') +
                        ' \nstack: ' + ((type.error && type.error.stack) ? type.error.stack : ' -- ');
                } else {
                    // error data is invalid
                    // log as much as we can
                    message = 'UN-PROCESSABLE ERROR FIRED.!!! All possible information:' +
                    '\ntype = ' + type +
                    '\nlocation = ' + location +
                    '\nposition = ' + position +
                    '\nerrorObj = ' + (type !== null && typeof type === 'object') ? JSON.stringify(errorObj) : errorObj;
                }

                // fix for Safari issue
                // https://bugs.webkit.org/show_bug.cgi?id=55092
                if (errorObj !== undefined && errorObj.stack) {
                    message += '\n Stack: ' + errorObj.stack;
                }

                sendMessage(message);
            };

            // log errors inside promises
            window.addEventListener("unhandledrejection", function (err) {
                let message = ' Promise unhandled error ' +
                    '\nmessage: ' + err.reason.message +
                    '\nstack: ' + err.reason.stack;

                sendMessage(message);
            });

            // log jQuery AJAX errors
            if (window.jQuery) {
                $(document).ajaxError(function (event, xhr, options, exc) {
                    let message = ' JQUERY-' + event.type +
                        '\nurl: ' + options.url +
                        '\nmethod: ' + options.type +
                        '\nstatus: ' + xhr.status +
                        '\nstatusText: ' + exc +
                        '\nresponse: ' + xhr.responseText;

                    sendMessage(message);
                });
            }
        }

        /**
         * sends POST request with formatted error message
         *
         * @param message: String
         */
        function sendMessage(message) {
            if (!url) {
                throw new Error('[url] is not defined. You need to initialise logger first.');
            }

            let x = new XMLHttpRequest();

            x.open('POST', url, true);
            x.setRequestHeader('Content-type', 'application/json; charset=utf-8');

            let requestData = {};
            let pageInfo = '\n[' + window.location + ']' +
                '\n[' + window.navigator.userAgent + ']' +
                '\n[' + window.innerWidth + 'x' + window.innerHeight + ']' +
                '\nerror: ' + message;

            if (defaults) {
                requestData = Object.assign(defaults, {message: pageInfo});
            } else {
                requestData.message = pageInfo;
            }

            x.send(JSON.stringify(requestData));
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

            /**
             * sends log message, if needed
             */
            sendMessage: sendMessage,

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
    }
    else {
        window.Logger = Logger;
    }
})();