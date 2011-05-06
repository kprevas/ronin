---
title: Ronin Tutorial
layout: default
---

This tutorial will walk you through the process of building a simple blogging
app using the Gosu programming language and the Ronin web framework. It's
meant to introduce you to both the language and the framework, so no
familiarity with either is required; however, I'll assume that you understand
the basic concepts of web applications and object-oriented programming, and in
particular that you understand HTML and SQL. I'll be drawing parallels
specifically to Java, as Gosu runs on the JVM and was designed for an easy
transition from Java; if you're more familiar with another language, hopefully
you will be able to draw the appropriate parallels yourself.

## Getting set up

Download the [latest distribution of Gosu][3]. There is plenty of useful
information on the Gosu site, so feel free to explore and learn about the
language at your own pace; this tutorial will only scratch the surface of what
you can do with Gosu. Unzip the file you downloaded to a directory, and make
sure the "bin" directory is on your PATH. (See e.g. [here][4] for instructions
on how to do so.) If you are running OS X or Linux, open a command prompt or
terminal, navigate to the "bin" directory within the Gosu distribution, and
type

`chmod +x gosu.sh`

I encourage you to check out the [Eclipse plugin for Gosu][5], as many of the
benefits of Gosu emerge when using Eclipse features such as auto-completion.
However, at the time of this writing, the Eclipse plugin does not yet support
some of the advanced features we'll be relying on in this tutorial, so the
remainder of this tutorial will assume that you will be editing files via
Gosu's built-in editor and running Gosu from the command line.

If you'd like to get your feet wet with Gosu, just type `gosu.sh` (OS X/Linux)
or `gosu.cmd` (Windows) at the command line. An editor window will appear,
where you can type and execute Gosu code. Try typing

`print("Hello world")`

and clicking the "Run" button in the toolbar.

Next, download the Aardvark build system [here][6]. Note that Ronin 0.9.1 will only
work with version 0.3.2 of Aardvark, due to an API change in 0.3.3; this will be addressed
in the next release of Ronin.
Ronin uses Aardvark to
automate several common tasks, like verifying that your code parses correctly
and running a server. Put Aardvark's "bin" directory on your PATH, and for OS
X or Linux, run `chmod +x` on the "vark" script as you did above for Gosu.

The next step is to download the Ronin framework. Download ronin.zip (or
ronin.tgz) by clicking one of the download links on the left side of this page,
then unzip it. It contains a script named "roninit"
which will initialize your Ronin application for you. `chmod +x` it if
necessary, then run it as follows:

`roninit init my_app`

This will create a Ronin application in the "my_app" folder. Inspect the
contents of this folder; they will look like this:

      /build.vark - The Aardvark file for your project
      /src - Where all gosu source code will go
          /controller - Where your controllers will go
          /config/RoninConfig.gs - Allows you to programmatically configure your Ronin app on startup
          /view - Where your view templates will go
          /db - .ddl file(s) containing schema information for your database(s)
      /env - environment-specific classpath resources, including database connection info (see [Server environments](Environments.html))
      /support - Contains non-core support files
      /lib - Contains core support files (e.g. ronin.jar and any other libraries you might want)
      /test - Contains your test source
      /html - The root of the Ronin applications war file
        /WEB-INF/web.xml - A thin web.xml file that will get your Ronin application bootstrapped in a servlet container
        /public - A place you can put static resources, such as images, HTML files or Javascript files.

## Running a Ronin server

From the "my_app" folder, run the following:

`vark server`

If you've installed everything correctly, you should see a few lines of
output, then you will have a server running at `http://localhost:8080`.

(The first time you run `vark server`, it will download the necessary third-party dependencies.  This may take a few minutes.)

## Hello World, Ronin-style

So now you've got a server running, but it's not necessarily doing anything
interesting. If you try to access it from your browser, you'll get a
placeholder page.

In Ronin, there are generally two components involved in responding to a
user's request: a **controller** and a **view**. The controller will perform
any necessary actions, and then will delegate to a view, which will create the
HTML (or other response) that is sent back to the user's browser.

Let's create the simplest possible controller and view. A Ronin controller is
defined via a Gosu **class**. Classes in Gosu are very similar to classes in
Java; they are defined in their own file, and the name of the file (plus the
directory in which it lives) determines the name of the class. Ronin has a
special rule that controller classes must live in the "controller" package
(`my_app/src/controller`). Since our goal is to create a blogging application,
let's create a controller class which will eventually contain all of the code
for viewing and manipulating blog posts.

Change to the "src" directory and type:

`gosu.sh -g controller/PostCx.gs`

The `-g` argument tells Gosu to open its built-in editor to edit the specified
file. Since the file doesn't exist yet, it will create it, and open an empty
editor. Type the following into the editor:

{% highlight js %}
    package controller

    uses ronin.RoninController

    class PostCx extends RoninController {

    }
{% endhighlight %}

Let's take a moment to examine the anatomy of this class. The `package`
statement simply restates which package this class lives in. The `uses`
statement identifies a class in another package which we want to reference in
this class; this is the equivalent of `import` in Java. Finally, the `class`
statement restates the name of the class, and identifies its superclass.

Note that unlike a Java `import` statement, the `uses` statement doesn't end
in a semicolon. Ending statements with a semicolon is not required in Gosu
(though it is permitted).

When I tell you later on to add a `uses` statement to this class, add it after
the existing `uses` statement and before the `class` statement.

Throughout this tutorial, we'll be using a convention where controller classes
have names ending in "Cx" (short for "Controller"). In general you may name a
controller class however you like.

Now let's add a function to this class. Each function on the controller class
will be responsible for responding to requests from a single URL. Add the
following `uses` statement to your class:

{% highlight js %}
    uses view.ViewPost
{% endhighlight %}

and the following code in between the curly braces of the `class` statement:

{% highlight js %}
    function viewPost() {
      ViewPost.render(Writer)
    }
{% endhighlight %}

Gosu functions are defined using the `function` keyword. They have public
access by default, and are assumed to have a void return value unless
specified otherwise.

This is the simplest possible controller method - all it does is delegate to a
view for rendering. In this case, the view will be `view.ViewPost`, which we
haven't defined yet; the Gosu editor will underline it in red to indicate an
error, which we'll ignore for now. We call the `render()` method on the view,
and pass it the contents of the `Writer` property, which we've inherited from
our superclass. A **property** in Gosu encapsulates what would be "get" and
"set" methods on a Java class; you can use its value or assign a value to it
like you would any other variable.

Let's fix the errors on this class by defining our view. Most Ronin views will
be defined as Gosu **templates**. A template is a special kind of Gosu file
(with the extension `.gst`) which mixes plain text with Gosu code to produce
the desired output (somewhat like a JSP). Ronin does not require that views
live in the "view" package, but it's not a bad convention to adopt. Use the
Gosu editor to create a file in the "view" directory named `ViewPost.gst` with
the following contents:

{% highlight html %}
    <%@ extends ronin.RoninTemplate %>
    <html>
      <body>
        This is a post.
      </body>
    </html>
{% endhighlight %}

The first line of this template is a **template directive**, as it is
surrounded by `<%@` and `%>`. The `extends` directive defines a "superclass"
for this template; this isn't a true superclass in terms of inheritance, but
it allows the template to call static methods on the given class without
qualifying them. In this case, we're extending `RoninTemplate`, which contains
some useful methods for Ronin templates.

The rest of the template is simply plain HTML which will be rendered to the
user's browser. Let's see this in action. First, run `vark verify-app` from the
command line.  This will make sure that there are no errors in your application.
It's a good idea to run `verify-app` between making changes to your code and starting
the server, especially if you're not using the Gosu editor.  (If `verify-app` reports any errors,
read over the above instructions again to make sure you didn't make any typos or miss any steps.)

Next, start the Ronin server as you
did earlier. The URL to access for the controller method you've defined will
be `http://localhost:8080/PostCx/viewPost` - that's the controller class name
followed by the controller method name. If you access this URL in your
browser, you should see the text "This is a post."

A little more detail on how templates work: Gosu reads in the `.gst` file and
creates a **type** for it. For all intents and purposes, this type works the
same as a Gosu class. A template type automatically has a static method called
`render`, which is what we're calling from `viewPost()`.

## Using Gosu code in templates

Let's make this example slightly more interesting. Modify `ViewPost.gst` as
follows:

{% highlight html %}
    <%@ extends ronin.RoninTemplate %>
    <% uses java.util.Date %>
    <html>
      <body>
        The current time is ${new Date()}.
      </body>
    </html>
{% endhighlight %}

There are two new types of template tags here. The first is surrounded by `<%`
and `%>`; note that there is no `@` like in the directive tags. This type of
tag contains Gosu code which is executed as soon as the template encounters
it; here, we're using it to add a `uses` statement. The tag will not be
present in the output text.

The second is surrounded by `${` and `}`. This type of tag contains Gosu code
which evaluates to a value; that value is then inserted into the output text.

Restart the server and visit the same URL again. This time, you should see the
current date and time. That's because the expression between `${` and `}` was
evaluated as Gosu code, converted to a String, and inserted into the template.

## Parameters

Our application is still rather uninteresting in that it doesn't really accept
any input from the user. Let's address that by parameterizing our controller
and view.

Modify the `viewPost` method in `PostCx.gs` as follows:

{% highlight js %}
    function viewPost(post : String) {
      ViewPost.render(Writer, post)
    }
{% endhighlight %}

and `ViewPost.gst` as follows:

{% highlight html %}
    <%@ extends ronin.RoninTemplate %>
    <%@ params (post : String) %>
    <html>
      <body>
        ${post}
      </body>
    </html>
{% endhighlight %}

We've added a parameter to the `viewPost` method; its name is `post`, and its
type is `String`. (Note that unlike in Java, the name comes first and the type
second.) We've also added a similar parameter to the `ViewPost` template,
using the `params` directive. When Gosu sees this, it modifies the template
type's `render` method to take an additional parameter - if we had added the
directive but not modified `viewPost()` to pass in an additional argument,
that method call would not have compiled.

When Ronin handles a URL which calls a method with one or more parameters, the
values given to those parameters are derived from the arguments in the URL.
For instance:

`http://localhost:8080/PostCx/viewPost?post=Hello+world`

will assign the string "Hello world" to the `post` parameter of `viewPost()`.
If you access the URL without a `post` parameter, as we did before, the value
of the `post` parameter will be `null`.

In a web application, it's important to ensure that you never render user
input directly to your HTML (as we have done above), since a user could insert
malicious code into your page. The `RoninTemplate` class provides a method
called `h()` to help with this. Change the line that says `${post}` to
`${h(post)}`, and the user's input will be properly escaped for inclusion in
an HTML page.

## Layout and blocks

Before we go crazy adding controllers and views to our application, here's an
observation: the `<html>` and `<body>` tags aren't likely to change too much
between views. It would be nice if there was an easy way to extract the
content that's common to all views to a single place, so that it's easier to
change and maintain.

Fortunately, there is. Create a file in your view directory called
`Layout.gst` with the following contents:

{% highlight html %}
    <%@ extends ronin.RoninTemplate %>
    <%@ params(content()) %>
    <html>
      <head>
        <title>Blog</title>
      </head>
      <body>
        <div id="content"><% content() %></div>
      </body>
    </html>
{% endhighlight %}

The parameter we've defined in this template looks a bit different from our
previous template. That's because it's a **block** (also known as a "closure",
"first-class function", or "lambda"). The `content` parameter is itself a
function, taking no parameters and returning nothing. As you can see in the
body of the template, a block can be invoked like any other function. Here,
we're invoking it in order to render the content of the page within the
structure we've defined. We can now remove the `<html>` and `<body>` tags from
`ViewPost.gst`.

If you're a Java programmer, it may help to think of a block as being like an
instance of `Runnable`, and invoking the block being like calling the `run()`
method. Unlike a `Runnable`, however, a block can take parameters and return a
value, and it can access variables from the scope where it's declared.

Let's modify the `viewPost()` function to make use of our layout template.
Change the contents of the function to:

{% highlight js %}
    Layout.render(Writer, \ -> {
      ViewPost.render(Writer, post)
    })
{% endhighlight %}

and add the following uses statement:

{% highlight js %}
    uses view.Layout
{% endhighlight %}

The second argument to `Layout.render()` is a block, which is initiated with
the backslash character. As the block takes no arguments, it's followed
immediately by an arrow (`->`), then the contents of the block surrounded by
curly brackets. When this block is invoked, the `ViewPost` template will be
rendered.

## Database interaction

A blogging application needs a way to store and retrieve data - specifically,
posts and comments. Ronin allows you to use any mechanism you like for this
purpose, but it is particularly well-suited for use with Tosa, a data
persistence layer that takes advantage of some powerful features of Gosu to
make simple database operations very convenient.

Tosa plugs in to Gosu's type system to generate types based on a pre-
defined database schema; unlike with many other similar frameworks, you don't
explicitly define classes for the entities stored in your database. Before you
can start using Tosa in your Gosu code, then, you need to define your
database schema.

Roninit created a file called `model.ddl` in `my_app/src/db`, which is meant to contain the data
definition for your database. Paste the following SQL in to that file, replacing
the sample schema that's currently there, to create the database schema:

{% highlight sql %}
    CREATE TABLE "Post"(
        "id" BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        "Title" TEXT,
        "Body" TEXT,
        "Posted" TIMESTAMP
    );
    CREATE TABLE "Comment"(
        "id" BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        "Post_id" BIGINT,
        "Name" VARCHAR(255),
        "Text" TEXT,
        "Posted" TIMESTAMP
    );
{% endhighlight %}

then, from my_app, run `vark reset-db`.

Each entity (`Post` and `Comment`) is represented by a table in the database.
Each table has one primary key column named "`id`", and some number of other
columns containing information about the entity. A `Comment` has a foreign key
to the `Post` on which it was made, as denoted by the column named
"`Post_id`".

The next step is to make Gosu aware of your database. Tosa tells Gosu to
look for files with the extension `.dbc` in its classpath, which contain
information about how to connect to a database. Fortunately, Roninit has
already done this for you. Inspect the `model.dbc` file in `my_app/env/mode/dev/db`:

`jdbc:h2:runtime/h2/devdb`

If you're familiar with JDBC, this is a standard JDBC URL for your database.
Based on the directory and file name of this file, Gosu will create a package
named `db.model`, and place all of the types it generates from your database
tables in there. For this schema, it will generate the types `db.model.Post`
and `db.model.Comment`.

## Creating entities

Our database isn't very interesting without any data in it, so let's create a
page where the user can enter a new post. Add this `uses` statement to
`PostCx`:

{% highlight js %}
    uses db.model.Post
{% endhighlight %}

and these methods:

{% highlight js %}
    function create() {
      Layout.render(Writer, \ -> {
        EditPost.render(Writer, new Post())
      })
    }

    function save(post : Post) {
      // we will fill this in later.
    }
{% endhighlight %}

The `create()` method will render a template named `EditPost` (as we will be
using the same template for creating a new post and editing an existing post),
passing in a new instance of `Post`. Note that we never defined a Gosu class
called `db.model.Post`; that type is generated for us by Tosa because it is
a table in the database. When we create a new instance here, we are not yet
performing any database operations - we're simply creating an object in memory
which can be read from or persisted to the `Post` table.

(If the Gosu editor shows an error on `db.model.Post`, you may have to restart
it in order for it to find the database types.)

Create the `EditPost.gst` template in the `view` directory with the following
contents:

{% highlight html %}
    <%@ extends ronin.RoninTemplate %>
    <%@ params(aPost : db.model.Post) %>
    <% uses controller.PostCx %>
    <% uses db.model.Post %>

    <% using(target(PostCx#save(Post))) { %>
      <form method="post" action="${TargetURL}">
        <% if(not aPost._New) { %>
            <input type="hidden" name="${n(Post)}" value="${aPost.id}">
        <% } %>
        <input type="text" name="${n(Post#Title}" value="${h(aPost.Title)}"><br>
        <textarea name="${n(Post#Body)}" rows=20 columns=80>${h(aPost.Body)}</textarea><br>
        <input type="submit">
      </form>
    <% } %>
{% endhighlight %}

Let's walk through this template. The first two lines should appear familiar
to you. Note that the type of the parameter is our entity type, since that's
what we're passing in from the controller.

The first code snippet after the `uses` statements opens a **`using`
statement**. This is a Gosu construct which allows you to safely initialize
and dispose of resources used within the contained code. Here, we are calling
a method on `RoninTempate` called `target()`, and `using` the context object
that it returns.

The parameter we're passing in to `target()` is a **method literal**,
indicated by the use of the # operator (instead of a dot operator). Whereas a
dot operator would cause the method to be called, the # operator simply
represents a theoretical future call to the method, and it returns a
`MethodReference` object. `target()` takes the method literal to mean that you
are defining some part of your template in the context of a call to the
`save()` method.

(Method literals come in two flavors - those with **bound arguments** and
those with **unbound arguments**. If specific values are provided for the
method's arguments, they are said to be bound; if only the types of the
arguments are specified, as is the case here, they are unbound. `target()`
does not require bound arguments.)

The `action` attribute of the `form` tag is being set to the string returned
by the `TargetURL` property. Since we're inside the `using` statement defined
on the previous line, the `TargetURL` will be the URL to which our form should
be posted in order to invoke the `save()` method:
`http://localhost:8080/PostCx/save`.

So why not just put that URL in the `action` attribute by hand? Say you change
the name of the `save` method for some reason. If the URL were hard-coded in
your HTML, you wouldn't know anything was wrong until you ran your
application, tried to submit the form, and got an error. Using the `target()`
method, on the other hand, means that `PostCx#save(Post)` will not compile if
the method has been renamed (or its signature has been changed, etc.), so
you'll see instantly in the editor that something is wrong.

After the form tag, we have an `if` statement. If the post passed in to this
template is not a new post, we want to store its ID in a hidden input, so that
we know which post to edit when the form is posted to the server. We determine
whether the post is new by accessing the `_New` property, which is created
automatically on all Tosa entity types, and returns true as long as the
entity has not yet been saved to the database.

Since we know our post will be a new post for now, let's skip ahead. After
we've closed the `if` statement, we have a text field for the post's title.
The value of the text field is set to the title of the existing post object,
`aPost.Title` (after being escaped by the `h()` function). The name of the
field is set by a call to a helper method named `n()` (for "name"). The
argument to `n()` is a **property literal**, which is like a method literal,
but for a property instead of a method - here, for the `Title` property on
`Post`. `n()` finds the parameter to `save()` which takes a `Post`, and
generates the appropriate input name to set the `Title` property (here,
`post.Title`). The text area on the next line performs the same task for the
`Body` of the post.

Let's go over what will happen when we submit this form, say with the title
"Hi" and the body text "Hello world". The browser will access the URL
`http://localhost:8080/PostCx/save`, with the form data
`post.Title=Hi&post.Body=Hello+world`. Ronin will find the `save` function and
see that it requires a `db.model.Post` parameter; since we haven't told it a
specific one to use, it will create a new one. It will then examine the form
data, and set the `Title` property of the post to "Hi" and the `Body` property
to "Hello world". This will all happen automatically, so most of the time you
won't have to worry about it.

Now we'll go back and implement the `save()` method on `PostCx`:

{% highlight js %}
    uses java.sql.Timestamp
    uses java.lang.System
{% endhighlight %}

{% highlight js %}
      function save(post : Post) {
        if(post._New) {
          post.Posted = new Timestamp(System.currentTimeMillis())
        }
        post.update()
        redirect(#viewPost(post))
      }
{% endhighlight %}

If the post is a new post (as it is in our case), we will set its `Posted`
property to the current time. (Note that the type of the `Posted` property is
`java.sql.Timestamp`, since the `Posted` column in the database is a TIMESTAMP
column.) After we've done this, we save the post to the database by calling
its `update()` method (which is created for us by Tosa). Finally, we
redirect the user to a page where they can view the newly saved post.

This redirection bears further examination.

{% highlight js %}
redirect(#viewPost(post))
{% endhighlight %}

`redirect()` is a method we've inherited from `RoninController`. It takes a
single argument, which is a method literal with bound arguments. Note that
since the method in question is on the same class, we don't need anything
before the # operator. `redirect()` examines the method reference and
determines what URL would invoke it, then sends the browser a response telling
it to redirect to that URL.

(By sending a redirect to the browser, we're ensuring that if the user hits
the back button, they are returned to the edit screen, instead of to the URL
which saved the post - that would result in a duplicate post being saved to
the database. It's generally a good idea to redirect after any action that
changes data or is otherwise not idempotent.)

Let's quickly modify `viewPost()` to actually view a post:

{% highlight js %}
    function viewPost(post : Post) {
        view.Layout.render(Writer,
         \ -> view.ViewPost.render(Writer, post))
    }
{% endhighlight %}

And the `ViewPost.gst` template:

{% highlight html %}
    <%@ extends ronin.RoninTemplate %>
    <%@ params(post : db.model.Post) %>

    <div class="header">${h(post.Title)}</div>
    <div class="body">${h(post.Body)}</div>
    <div class="posted">Posted on ${post.Posted}</div>
{% endhighlight %}

All the pieces are in place. Restart the server, go to
`http://localhost:8080/PostCx/create`, and create a new post.

## Editing entities

Now let's say we want to edit the post we've created. As we noted above, we
can reuse the same template. Let's go back to the `if` block that we skipped
before:

{% highlight html %}
      <% if(not post._New) { %>
          <input type="hidden" name="${n(Post)}" value="${post.id}">
      <% } %>
{% endhighlight %}

If the template receives an existing post, it will create a hidden input on
the form whose value is the post's unique ID (primary key). The name of the
input is generated by calling `n()` with the `Post` type, which finds the
parameter of that type expected by `save()`, so when Ronin calls `save()`, it
will use the ID to look up the existing post in the database. The `Title` and
`Body` properties of that post will then be set using the values of those
inputs, just as they were before, and the `save()` method will update the
entity in the database.

So how do we get an existing post into the `EditPost` template? Create the
following function in `PostCx`:

{% highlight js %}
    function edit(post : Post) {
      Layout.render(Writer, \ -> {
        EditPost.render(Writer, post)
      })
    }
{% endhighlight %}

and add

{% highlight js %}
    uses view.EditPost
{% endhighlight %}

That's all there is to it. When `http://localhost:8080/PostCx/edit` is
accessed, Ronin will use the URL parameters to look up the post and pass it in
to the `edit()` method, which passes it in to the template.

## Links

Let's put it all together by creating a link on the "view post" page to edit
the post you're viewing. Add this snippet to the `ViewPost.gst` template,
wherever you'd like:

{% highlight html %}
      <a href="${urlFor(PostCx#edit(post))}">Edit post</a>
{% endhighlight %}

and this `uses` statement at the top:

{% highlight html %}
    <% uses controller.PostCx %>
{% endhighlight %}

The target of the link is generated by the `urlFor` method, which (like
`redirect()`) takes a bound method literal for the controller method you want
the link to call. Let's see how this works. Make a note of the URL you arrived
at after creating your new post earlier (or just keep that browser tab open).
Restart the server, then go back to that URL (or reload the page). You should
see the new link appear. If you look at where the link goes, it should be
something like:

`http://localhost:8080/PostCx/edit?post=1`

`urlFor` generated a URL which, when requested, will invoke the
`controller.PostCx.edit()` function, passing in the `Post` with the primary
key `1`.

## Relationships between entities

Now let's take a look at the other table in our database - comments. Ideally
we want to show all of the comments for a post on the page where we view the
post. Add the following code to the bottom of `ViewPost.gst`:

{% highlight html %}
    <% for (comment in post.Comments) { %>
      <div class="comment">
      <div class="commentAuthor">${comment.Name} - ${comment.Posted}</div>
      <div class="commentBody">${comment.Text}</div>
    <% } %>
{% endhighlight %}

This is a Gosu `for` loop, which is similar to a Java `for` loop, but with the
`in` keyword in place of the `:` character. The collection we're looping over
- `post.Comments` - is of particular interest here. You'll notice that it
doesn't correspond to a column on the `Post` table in our schema above.
Instead, it represents the `Post_id` foreign key on the `Comment` table.
`post.Comments` will return all of the `Comment`s whose `Post_id` matches the
`id` of the post.

Also note that, unlike in Java, we haven't explicitly stated the type of the
`comment` variable. Place your text cursor on that variable in the editor and
hit Ctrl+T. A pop-up will appear showing you that the type of the variable is
`db.model.Comment`. Gosu **infers** the correct type for this variable because
it knows that `post.Comments` contains objects of that type.

## Querying the database

Let's add one final piece to our application - a page which lists all of the
posts we've created, in reverse chronological order.

Add the following `uses` statement to `PostCx`:

{% highlight js %}
    uses view.AllPosts
{% endhighlight %}

and the following function:

{% highlight js %}
    function all() {
      var posts = Post.findSorted(null, Post#Posted, false)
      Layout.render(Writer, \ ->
        AllPosts.render(Writer, posts))
    }
{% endhighlight %}

The first line of the function declares a local variable. As in our `for`
loop, it is not necessary to specify the type of the variable - Gosu will
infer the correct type from the value you assign to it. Instead, you use the
`var` keyword to declare the variable.

The `findSorted` method is one of several static methods present on all types
generated by Tosa. It returns a sorted list of entities from the database.
The first parameter allows you to filter the entities returned; here we want
all posts, so we pass in `null`. The second parameter is the property by which
we want to sort the entities. We specify the `Post#Posted` property, so the
posts will be sorted chronologically. The third property is `false` for a
descending sort order (`true` would make it ascending).

We then pass the list of posts to a new template, `AllPosts.gst`. Create this
file and give it the following contents:

{% highlight html %}
    <%@ extends ronin.RoninTemplate %>
    <%@ params(posts : List<db.model.Post>) %>
    <% uses controller.PostCx %>

    <div class="header">All Posts</div>

    <% for(post in posts) { %>
      <div class="postListEntry">
        <a href="${urlFor(PostCx#viewPost(post))}">${post.Title}</a>
      </div>
    <% } %>
{% endhighlight %}

By this point, everything here should be familiar.

## Next steps

In this tutorial, I've shown you the basics of working with Gosu and Ronin. To
learn more about Gosu, visit the [Gosu documentation][20], or the excellent
overview at [http://lazygosu.org][21]. Explore this wiki to learn more about
[Ronin](Ronin.html) and [Tosa](Tosa.html).

Here are some further exercises for extending our blog application, from
easiest to most challenging:

  * Change the layout template so that different pages have different `<title>` tags.
  * Implement the ability to add comments to a post.
  * Using the `delete()` method on Tosa entities, implement the ability to delete a post or comment.
  * Implement a page which displays a snippet of each post, with a link to the full post and some text indicating how many comments have been left on the post.
  * Using the `findSortedPaged()` method, display posts 20 at a time on the `AllPosts` page.
  * Using the `findWithSql()` method, show "previous" and "next" links on the `ViewPost` page.
  * Implement user authentication by using the built-in support described [here](User-Authentication.html).
  * Refactor the comments display to a separate controller method and view, and use blocks to include it in the `ViewPost` page. Use AJAX to refresh just the comments display when the user leaves a comment.

If you need some help with these exercises, or just want to see more examples
of how to use Ronin, download and examine the full [sample RoBlog application](Sample-Application.html).

   [3]: http://gosu-lang.org/downloads.shtml

   [4]: http://www.java.com/en/download/help/path.xml

   [5]: http://gosu-lang.org/eclipse.shtml

   [6]: https://github.com/vark/Aardvark/downloads

   [7]: https://github.com/kprevas/ronin/downloads

   [20]: http://gosu-lang.org/doc/wwhelp/wwhimpl/js/html/wwhelp.htm

   [21]: http://lazygosu.org