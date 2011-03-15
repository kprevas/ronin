---
title: Admin console
layout: default
---

Ronin provides a powerful admin console to help you perform administrative tasks on a server, or just
to poke around your development instance.

The admin console is started by calling `AdminConsole.start()` from your `RoninConfig`.  The default
`RoninConfig` that was generated for you will start an admin console in development mode only, on port
8022.

## Configuring the admin console

Simply calling `AdminConsole.start()`, as is done by the default `RoninConfig`, will start an admin
console on port 8022 which will accept all logins from the local host in development mode, and deny
all logins in any other mode.  `start()` takes two optional arguments which allow you to further
configure the admin console:

  * `authorizedUsers` is a list of usernames indicating which users are allowed to access the admin
    console.  (See [User authentication](User-Authentication.html) for details on how to set up a user
    authentication manager.)  If this parameter is provided but no authentication manager has been set
    up, all logins will be denied.  Users will use their regular password when logging in to the console.
    
  * `port` allows you to use a port other than 8022.
  
## Using the admin console

The admin console is set up as an SSH server.  You have two options for connecting to it:

  * Use an SSH client.  On OS X or Linux, you should be able to run `ssh -l [user name] -p 8022 localhost`.
  
  * Run `vark console`.  See [Aardvark in Ronin](Aardvark-in-Ronin.html).
  
Once you've logged in, you'll see a prompt.  The admin console functions mostly the same as the Gosu
interactive shell, which means you can enter any Gosu expression or statement, and you can hit TAB for
auto-completion of method and property names.  The Gosu expressions are run in the context of your Ronin
app, so if for instance you're using [Tosa](Tosa.html) as your model layer, all of the database types
exposed by Tosa are available, and any queries you run are run on your actual database.

## A word of warning

The admin console is very powerful.  To see just how powerful, type the following:

{% highlight js %}
    java.lang.System.exit(0)
{% endhighlight %}

This will terminate your Ronin app.

Needless to say, you shouldn't use the admin console in production unless you have a really good reason
to, and if you do, you should limit access to the absolute minimum number of users.  Any user to whom
you wouldn't give root access on the machine your app is running on probably shouldn't have access to
the admin console.