---
JSONP Support
---

Ronin provides a simple way to respond to [JSONP][2] requests. Simply use the
`@JSONP` annotation, and pass it the name of the request parameter which will
contain the callback method name:

```js
    class MyCx extends RoninController {
      @JSONP("callback")
      function myAction() {
        Writer.write("{\"foo\": \"bar\"}")
      }
    }
```

Given this controller method, a request to

`http://[server address]/MyCx/myAction?callback=myCallback`

will respond with

```js
    myCallback({"foo": "bar"})
```

   [2]: http://en.wikipedia.org/wiki/JSON#JSONP
