# Unit 28
## Conceptual Exercise

Answer the following questions below:

> What is *REST*ful routing?

A **RESTful API** is a web API that follows the conventions and design patterns of *REST* in
regards to the API's routes (i.e. entrypoints, function calls). Examples of routes in a RESTful
API would include getting information about collection of resources (e.g. `GET /api/flowers`), for
getting information about a specific resource within a collection (e.g. `GET /api/flowers/<id>`),
modifying a specific resource within a collection (e.g. `PATCH /api/flowers/<id>`), or removing a
resource from a collection (e.g. `DELETE /api/flowers/<id>`).

> What is a resource?

A resource is an object that a web API can provide information about.

> When building a JSON API, why do you not include routes to render a form that when submitted
> creates a new user?

A purely JSON API, as the name implies, targets JSON as the exit format of data. As such, an
HTML form is redundant and ultimately unnecessary to include.

> What does idempotent mean? Which HTTP verbs are idempotent?

**Idempotence** describes an action which, whether performed once or multiple times, has the exact
same effect on the output. The `GET`, `PUT`, and `DELETE` HTTP verbs are idempotent.

> What is the difference between `PUT` and `PATCH`?

`PATCH` modifies an existing resource. `PUT` can modify a resource if it exists, but creates a new
resource if it doesn't exist.

> What is one-way encryption?

**One-way encryption** is a method of encryption that is used to securely store sensitive
information (e.g. passwords, personal identification information) and is difficult to reverse
without an associated secret.

> What is the purpose of a *salt* when hashing a password?

**Hashing salt** is used to randomize the output of a hashing algorithm when provided an
identical password as a brute-force deterance mechanism.

> What is the purpose of the Bcrypt module?

The `Bcrypt` module is a Python module to enable ease-of-use with the `bcrypt` password hashing
function.

> What is the difference between authorization and authentication?

**Authentication** is the process of validating a log in attempt to a user account.
**Authorization** is the process of validating that a given user account is allowed or able to
perform a particular action.
