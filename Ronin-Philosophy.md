## It's Just Code

Everything in Ronin should be done with Gosu code. Your logic should be
written 100% in Gosu code. The piece that figures out which of your methods to
call when a request comes in should be Gosu code. The complicated `for` loops
that you put all over your page templates because you were never very good at
following MVC should be Gosu code.

XML is great for... well, something, probably. Flow control sure isn't it. The
only XML you should need for a Ronin app is a `web.xml`, if your servlet
container requires one. Everything else should be Gosu code, which means that
given a functional Gosu debugger, you can see everything that happens from the
moment a request comes in to the moment a response goes back out.

## It's Just Method Calls

A web framework shouldn't dictate the architecture of your app. It shouldn't
require you to store a whole bunch of state server-side, or bend over
backwards to make the "Back" button work. It should let you build a REST app,
or a CRUD app, or a single-page AJAX app, or an app where everything goes
through a single URL passing some ridiculous serialized state object in the
cookies.

In Ronin, every call from the client to the server is really just a remote
method call. It should provide you with some conveniences for what we think
are some pretty good ways to write a webapp, but at the end of the day, you're
writing the methods, so you should be able to do whatever you want.

## Write Your UI However You Want

There are lots of different ways to write a UI. Some people like to use
Javascript widget frameworks like Dojo. Some people like to go the old-
fashioned route and hand-code HTML inputs. Some people are even writing native
UIs for a mobile platform.

Ronin shouldn't try to second-guess you on how your UI should be written. It
shouldn't just generate HTML tags for you, or fence you in to yet another
widget library. You should be responsible for getting the content you need
into the response, whether that be a full HTML page or a chunk of data. What
it should do is give you convenient and type-safe utilities for generating
things like URLs and request parameter names - things which are used for
further communication from the client (whatever it may be) to the server.

## Store Your Data However You Want

On the other end of MVC, Ronin shouldn't place any restrictions on how you
store your data. All it should need is a way to retrieve an object given a key
passed in as part of a request, and that should be easy to bolt on to an
existing persistence layer. (Of course, even that should be optional, since
you can always do the retrieval yourself.)

## You Can Use It With Ronin

Can I use my favorite dependency injection framework with Ronin? Yes. Can I
use my custom typeloaders with Ronin? Yes. Can I use my favorite logging
framework with Ronin? Yes. We're not setting out to reinvent a lot of wheels
here, so you should be able to use existing, proven components that you're
already familiar with for just about anything but the core functions of Ronin.

## Type Safety Whenever Possible

The chief advantage of Ronin over a web framework written in a dynamic
language is that it can leverage Gosu's type safety features. So it should do
so whenever possible, except where it would make things unnecessarily complex
for the end user.
