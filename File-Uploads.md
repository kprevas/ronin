---
title: File Uploads
layout: default
---

Ronin provides seamless support for files uploaded via HTTP requests (e.g. via
a "file" type input in an HTML form).

Uploaded files are treated just like any other [controller arguments](Controller-Arguments.html). The
type of the method parameter can be either `byte[]` or `InputStream`; in the
former case, the entire contents of the file will be read into the array,
while the latter case provides stream-based access, which may be more
appropriate for larger files.

For example, given the following HTML form:

{% highlight html %}
    <% using(target(FileCx#uploadFile(byte[]))) { %>
      <form enctype="multipart/form-data" action="${TargetURL}" method="POST">
        <input type="file" name="${n(byte[])}"/>
      </form>
    <% } %>
{% endhighlight %}

and the following controller method:

{% highlight js %}
    function uploadFile(myFile : byte[]) {
      ...
    }
{% endhighlight %}

the `myFile` parameter will contain the bytes of the uploaded file.
