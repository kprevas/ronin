---
title: Transactions
---

Sometimes you want to make a set of changes to your database all at once; if
one of the changes fails for some reason, you don't want the rest to go
through. Consider this code:

```js
    var myAccount = Account.fromID(5)
    var theirAccount = Account.fromID(7)
    myAccount.Balance -= 5000
    theirAccount.Balance += 5000
    myAccount.update()
    theirAccount.update()
```

If the first update succeeds, but the second update fails, $5000 has just
disappeared.

Fortunately, RoninDB provides basic transaction semantics to avoid such a
dilemma:

```js
    var myAccount = Account.fromID(5)
    var theirAccount = Account.fromID(7)
    myAccount.Balance -= 5000
    theirAccount.Balance += 5000
    using(db.mydb.Transaction.Lock) {
     myAccount.update()
     theirAccount.update()
    }
```

`Transaction` is a type that is automatically created in each package
corresponding to a .dbc file. Changes to the database made during the `using`
statement only take effect once execution has successfully reached the end of
the statement. If the second update fails (or some other code you place
between the two updates throws an uncaught exception), the first one will not
take effect.
