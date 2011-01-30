---
title: Caching
layout: default
---

Ronin provides a simple way to cache values in various stores, the `cache()`
method:

{% highlight js %}
      function myExpensiveFunction() : String {
        return cache( \-> computeTheExpensiveString() )
      }
{% endhighlight %}

The `cache()` method takes a block and returns the value of the block or, if
it has already been computed, returns the cached value.

By default, the cached value will last for the duration of a single request.

## Stores

Sometimes caching for a single request isn't good enough. Ronin provides three
different stores: `REQUEST` (the default), `SESSION` (associated with the
users session) and `APPLICATION` (global). Let's change the code above to
store the value in the session, for additional perf win:

{% highlight js %}
      function myExpensiveFunction() : String {
        return cache( \-> computeTheExpensiveString(), :store = SESSION )
      }
{% endhighlight %}

Now the value produced by `computeTheExpensiveString()` will be only computed
once per user session, rather than on every request.

Once you start storing caches at the session level, you are probably going to
have to worry about invalidating them as well. This can be done by giving the
cache a name:

{% highlight js %}
      function myExpensiveFunction() : String {
        return cache( \-> computeTheExpensiveString(), :store = SESSION, :name = "MySweetCache" )
      }
{% endhighlight %}

Allowing you to invalidate the cache with the `invalidate()` method:

{% highlight js %}
      function updateExpensiveFunctionsValue()  {
        updateTheDataThatTheExpensiveStringDependsOn()
        invalidate( "MySweetCache" )
      }
{% endhighlight %}

Note that cache names must be unique within their store.

## Caching Strategery

> "There are only two hard problems in Computer Science: cache invalidation
and naming things."
> - Phil Karlton

Well, here you've got both of these problems, so humility is the best policy.

Caches should be few, minimal and judicious, striking at the optimal place in
the call stack to cut off expensive computations. You should always, always,
always have empirical evidence that a cache is needed before you introduce
this complexity to your app.
