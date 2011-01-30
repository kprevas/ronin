Ronin provides a convenient framework for handling user authentication in your
app. It defines an interface, `IAuthManager`, and a default implementation
using [Apache Shiro][2]. All that you need to provide is a basic **user
model** - a way to retrieve a user object by its username, and to determine
the appropriate login credentials from that object.

The `AuthManager` property on `IRoninConfig` stores the object responsible for
handling authentication. To use the default authentication manager, insert the
following in the constructor of your `RoninConfig` class (see [[Server
Configuration]]):

```js
        AuthManager = createDefaultAuthManager(
          \ username -> User.find(new User(){:Name = username})[0],
          User#Name, User#Hash, User#Salt
        )
```

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

   [2]: http://shiro.apache.org
