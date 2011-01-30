---
title: Tips and Tricks
layout: default
---

## Headers/footers

A web application will often have a static header and footer surrounding a
chunk of generated content. You can implement this pattern in Ronin using
`beforeRequest()` and `afterRequest()` on each controller; however, a more
flexible implementation is described here which uses **blocks**, which are
Gosu objects that encapsulate some functionality (also called "closures" or
"lambdas".)

Define a template for your header/footer - let's call it `Layout.gst`:

{% highlight html %}
    <%@ extends ronin.RoninTemplate %>
    <%@ params(content()) %>
    <html>
    [header content goes here]
    <% content() %>
    [footer content goes here]
    </html>
{% endhighlight %}

The parameter specified here, `content()`, is a **block** which takes no
arguments and has no return value.

Then, in your controller method, render the `Layout` template, passing in a
block which renders your dynamic content:

{% highlight js %}
    view.Layout.render(Writer, \ -> view.MyView.render(Writer, args))
{% endhighlight %}

`Layout` will render the header, then invoke your block, rendering the dynamic
content, then render the footer.

Consult the Gosu documentation for more information about blocks.

## AJAX

Using AJAX with Ronin is quite straightforward - an AJAX request to a Ronin
URL is handled like any other request. Ronin view templates can render XML or
JSON (or any other data format) instead of HTML, so they can be used for
responding to AJAX calls.

If you're using AJAX to dynamically refresh some subsection of a page, here's
an elegant way of doing so. Define a controller method which is responsible
for rendering the section of the page you'd like to refresh. From the view
template for the main page, insert a Gosu snippet which calls that method in
the place where that section goes, and it will render the initial contents of
the section. Point the AJAX call for the refresh at the URL for the method,
and you'll get back the new HTML for the section.
