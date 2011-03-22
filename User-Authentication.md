---
title: User Authentication
layout: default
---

Ronin provides a convenient framework for handling user authentication in your
app. It defines an interface, `IAuthManager`, and a default implementation
using [Apache Shiro][2]. All that you need to provide is a basic **user
model** - a way to retrieve a user object by its username, and to determine
the appropriate login credentials from that object.

The `AuthManager` property on `IRoninConfig` stores the object responsible for
handling authentication. To use the default authentication manager, insert the
following in the constructor of your `RoninConfig` class (see [Server
Configuration](Server-Configuration.html)):

{% highlight js %}
        AuthManager = createDefaultAuthManager(
          \ username -> User.find(new User(){:Name = username})[0],
          User#Name, User#Hash, User#Salt
        )
{% endhighlight %}

The actual parameters passed to `createDefaultAuthManager` will vary for your
particular application. `createDefaultAuthManager` is a method on
`DefaultRoninConfig`; if your `RoninConfig` does not extend
`DefaultRoninConfig`, you'll need to write the equivalent method.

The first parameter to `createDefaultAuthManager` is a block which takes a
username as a String and returns the corresponding user. The second, third,
and fourth parameters are references to properties on that object which
return, respectively, the user's name, a hash of the user's password, and the
salt used to construct that hash. (More on this later.)

The optional fifth parameter is a reference to a property on the user object
which returns a list of strings representing the **roles** of the user.
Typically these are used to restrict access to a particular part of the
application to a subset of users. There is no need to specify this parameter
if you don't plan on using roles.

The optional sixth and seventh parameters specify the hashing algorithm and
the number of hash iterations used when computing a password hash. The default
values here should be fine; do not pass in values for these parameters unless
you're sure you know what you're doing.

Once you've initialized the authentication manager, you can access it in all
of your controllers and templates as `AuthManager`. The properties and methods
on `IAuthManager` are:

  * `login()` takes a username and password, and attempts to log in the specified user. It returns `true` if the user was successfully logged in, and `false` otherwise.
  * `logout()` logs out the current user.
  * `CurrentUser` returns the currently logged in user (represented by the object returned by the block you provided above), or `null` if no user is logged in.
  * `CurrentUserName` returns the currently logged in user's username, or `null` if no user is logged in.
  * `currentUserHasRole()` takes a String representing a role, and returns `true` if the currently logged in user has that role. If no user is logged in, this method always returns `false`.
  * `getPasswordHashAndSalt()` takes a plaintext password and returns a pair of Strings. The first String is a hash of the password, and the second is the salt used to construct that hash. This hash/salt combination is guaranteed to be produced using the same mechanism that `login()` uses to check passwords, so you should always use this method when creating a new user or changing a user's password.

## Requiring a user to be logged in

It is likely that there are many controller methods in your application that shouldn't be accessed by
a user who isn't logged in.  Usually in such a case, you'd like to redirect the user to a login page,
and after they successfully log in, let them go to where they were originally trying to go.  Ronin automates
this pattern for you if you set the `LoginRedirect` property of your `RoninConfig`.  This property should
be set to the bound method reference for your login page; for example:

{% highlight js %}
  LoginRedirect = AdminCx#login()
{% endhighlight %}

In the controller method that processes the user's login, you can call the `postLoginRedirect()` method
to send the user back to where they were trying to get; you must provide a default target in case the user
went directly to the login page.  For example:

{% highlight js %}
    @NoAuth
    function doLogin(username : String, password : String) {
      if(AuthManager.login(name, pass)) {
        postLoginRedirect(MyCx#index())
      } else {
        redirect(#login())
      }
    }
{% endhighlight %}

Note the `@NoAuth` annotation; controller methods with this annotation (and those on a controller class
with this annotation) bypass the login check and can thus be accessed by non-logged-in users.  Needless
to say, the controller method for the login page itself should also be `@NoAuth`.

   [2]: http://shiro.apache.org
