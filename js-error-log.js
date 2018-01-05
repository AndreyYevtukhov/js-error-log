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
            let message = ' \n' + type + ' at' +
                ' ' + location + ':' + line + ':' + position + ' ';

            // fix for Safari issue
            // https://bugs.webkit.org/show_bug.cgi?id=55092
            if (errorObj !== "undefined") {
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
            if (!logPostURL) {
                throw new Error('[logPostURL] is not defined.');
            }

            url = logPostURL;
            defaults = logDefaults;

            init();
        },

        /**
         * sends log message, if needed
         */
        sendMessage: sendMessage
    }
})();
