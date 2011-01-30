---
title: CSRF Protection
---

[Cross-site request forgery][2] is a technique whereby users can be tricked
into submitting a request to your app that appears to be authenticated without
their knowledge.

Ronin offers a simple mechanism for protecting against CSRF attacks. The
`XSRFTokenName` and `XSRFTokenValue` properties, available on all controllers
and templates, represent a name/value pair which will authenticate any user
request as coming from within your app.

By default, once the `XSRFTokenValue` property has been accessed in the
context of a user session, all future non-GET requests will throw an error if
a matching name/value pair is not present in the request. To use this
facility, then, all you have to do is include the following hidden input in
all of the forms in your app:

`<input type="hidden" name="${XSRFTokenName}" value="${XSRFTokenValue}">`

AJAX POST requests must also include this name/value pair; how you do so will
depend on how you're making the request.

If you'd like to change which HTTP methods to apply XSRF protection to, set
the `XSRFLevel` property on your `RoninConfig` object. Note that you'll have
to manually add the XSRF token to the URL of any GET requests.

   [2]: http://en.wikipedia.org/wiki/Cross-site_request_forgery
