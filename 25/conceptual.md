# Unit 25
## Conceptual Exercises

Answer the following questions below:

> What is PostgreSQL?
> 
**PostgreSQL** is an database management application.

> What is the difference between SQL and PostgreSQL?

**SQL** is a database querying & structuring language. **PostgreSQL** implements a strict dialect
of SQL for querying the databases it manages.

> In `psql`, how do you connect to a database?

```psql
\c (database_name)
```

> What is the difference between `HAVING` and `WHERE`?

`WHERE` filters data per record, whereas `HAVING` filters data in groups -- i.e. `HAVING` is
typically seen after a `GROUP BY` clause.

> What is the difference between an `INNER` and `OUTER` join?

An inner-join combines shared foreign data between two database tables A and B. An outer-join
combines all data of two database tables A and B.

> What is the difference between a `LEFT OUTER` and `RIGHT OUTER` join?

A left-outer-join of two database tables A and B combines all data in table A with shared data
between tables A and B. A right-outer-join combines shared data between tables A and B with all
data in table B.

> What is an ORM? What do they do?

An **o**bject-**r**elational **m**apping is a programming technique in which an object or structure
type in a programming language can be used to modify database content rather than manually
inputting SQL queries.

> What are some differences between making HTTP requests using AJAX and from the server side using
> a library like `requests`?

Some web APIs require an authorization key or some form of payment to access

> What is CSRF? What is the purpose of the CSRF token?

**CSRF** stands for **C**ross-**s**ite **R**equest **F**orgery. To prevent malicious forms on
other websites from making form requests to the server, a unique token is generated when rendering
a form on the server-side. This token is difficult to recreate with external tools, preventing
external websites and web forms from maliciously accessing form routes.

> What is the purpose of `form.hidden_tag()`?

To render all of the hidden tags in a given form at once, including the *CSRF token*, such that,
when iterating over the visible tags, no styling is applied to reveal them to the end-user.
