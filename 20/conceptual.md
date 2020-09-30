# Unit 20
## Conceptual Exercises

Answer the following questions below:

> What are important differences between Python and JavaScript?


1. JavaScript has "C-like" block syntax through the use of curly braces:

```javascript
function fn_name(e) {
    // scope
}
```

Python uses indentation to denote code blocks:
```python
def fn_name(e):
    pass # scope
```

2. Python is more strict than JavaScript, e.g. in regards to object properties and function call parameters:

```javascript
function fn_name(e) {
    // scopre
}

let x = fn_name(); // e in fn_name will be undefined
console.log(x.a); // prints undefined
```

vs

```python
x = fn_name() # raises TypeError
print(x.a) # raises AttributeError
```

3. JavaScript has a global object. Python does not.

4. ~~JavaScript is a worse language; Python is objectively better.~~

> Given a dictionary like ``{"a": 1, "b": 2}``: , list two ways you can try to get a missing key (like "c") *without* your program crashing.

The n00b method:
```python
d = {"a": 1, "b": 2}
value = None
if "c" in d:
    value = d["c"]
```

The chad method:
```python
d = {"a": 1, "b": 2}
value = d["c"] if "c" in d else None
```

The lame method:
```python
d = {"a": 1, "b": 2}
value = d.get("c") # returns None if key not in dict
```

> What is a unit test?

A set of code designed to check if a specific piece of functionality works as intended.

> What is an integration test?

A set of code designed to check if multiple pieces of functionality interoperate together as intended.

> What is the role of web application framework, like Flask?

To ease the creation of web applications by providing a simple yet flexible layer to build said applications upon; rather than the alternative of having to create a web server from scratch.

> You can pass information to Flask either as a parameter in a route URL (e.g.`/foods/pretzel`) or using a URL query param (e.g. `foods?type=pretzel`). How might you choose which one is a better fit for an application?

URL parameters are better suited for 

> How do you collect data from a URL placeholder parameter using Flask?

By declaring the placeholder name in the route of the corresponding decorator by surrounding it with angle brackets and declaring the function with a matching parameter name:

```python
@app.route("/profile/<id>")
def profile(id):
    pass
```

> How do you collect data from the query string using Flask?

`flask.args` is an immutable Python dictionary that allows one to access query string arguments.

> How do you collect data from the body of the request using Flask?

`flask.json` is an immutable Python dictionary that allows one to access a JSON-formatted body of an HTTP request. `flask.form` is used when accessing data send by an HTML `<form>` element sending data via a `POST` request.

> What is a cookie and what kinds of things are they commonly used for?

HTTP cookies are a form of modifiable client storage that can be set by both an HTTP client and server, allowing for state to be stored & changed via HTTP requests, as the HTTP protocol itself is a stateless protocol. They are limited to 4 kibibytes in size, as they are transferred via HTTP request headers. They are commonly used for keeping track of login and session credentials on a given browser.

> What is the `session` object in Flask?

`flask.session` is a dictionary that contains data specific to a given instance of a user accessing the website.

> What does Flask's `jsonify()` do?

`flask.jsonify()` creates an HTTP response that is meant to return JSON data. It takes a Python dictionary as an object, which is serialized into a JSON string through this function call.
