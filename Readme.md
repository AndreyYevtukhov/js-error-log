## Info

Sends log messages for logging with ajax `POST` request.

All log messages are `application/json` data.

After initialisation `Logger` listens for:
1. JS errors
2. jQuery `.ajaxError` (only if jQuery is used)
3. unhandled rejection in promises

## Install
`npm i js-error-log`

## How to use
1. Add `js-error-log.js` on your page / bundle
2. Call `Logger.init('/url/to/send/your/log-messages')`
3. That's all :)

## Logger API
1. `.init(logPostURL, logDefaults)` - initialised event listeners
   1. `logPostURL` - logging POST requests endpoint url, required
   1. `logDefaults` - object, that contains additional logging data, if needed (check initialisation demo in demo/index.html for details)
1. `.sendMessage(message)` - sends POST request with given message
1. `isInit()` - returns logger initialisation state


## Log messages examples
#### js error

```
[http://localhost:63342/js-error-log/demo/index.html?_ijt=801749sfdfouqaf0man5aklvu6]
[Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36]
[765x1012]
error:
Uncaught Error: Unhandled js error at http://localhost:63342/js-error-log/demo/index.html?_ijt=801749sfdfouqaf0man5aklvu6:14:11
 Stack: Error: Unhandled js error
    at http://localhost:63342/js-error-log/demo/index.html?_ijt=801749sfdfouqaf0man5aklvu6:14:11
```

#### jQuery `.ajaxError`

```
[http://localhost:63342/js-error-log/demo/index.html?_ijt=801749sfdfouqaf0man5aklvu6]
[Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36]
[765x1012]
error:  JQUERY-ajaxError
url: /test
method: GET
status: 404
statusText: Not Found
response: <!doctype html><title>404 Not Found</title><h1 style="text-align: center">404 Not Found</h1><hr/><p style="text-align: center">WebStorm 2017.2</p>
```

#### unhandled rejection in promises

```
[http://localhost:63342/js-error-log/demo/index.html?_ijt=801749sfdfouqaf0man5aklvu6]
[Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36]
[765x1012]
error:  Promise unhandled error
message: afsdfs is not defined
stack: ReferenceError: afsdfs is not defined
    at http://localhost:63342/js-error-log/demo/index.html?_ijt=801749sfdfouqaf0man5aklvu6:21:9
    at new Promise (<anonymous>)
    at http://localhost:63342/js-error-log/demo/index.html?_ijt=801749sfdfouqaf0man5aklvu6:20:5
```
