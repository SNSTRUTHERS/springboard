# How the Web Works Exercise - Quiz
## Part 1: Solidify Terminology
## Answers - Simon Struthers

> What is HTTP?
HTTP is short for *HyperText Transfer Protocol*, and is the main communications protocol used by servers to serve web pages.

> What is a URL?
URL is short for Universal Resource Identifier. It is a string that allows one to specify how they would like to receive data over the Internet, including which protocol to use, which server to talk to, which port to access from, which resource to receive, and any additional query parameters.

> What is DNS?
DNS is short for *Domain Name Service*, and is used to attach easy-to-remember names to IP addresses.

> What is a query string?
The last part of a URL, separated from the resource name by a `?` character, is the query string. It is used to provide additional parameters via the URL to the server in an HTTP request.

It follows the format `?key1=val1&key2=val2`, with `+` characters acting as spaces.

> What are two HTTP verbs and how are they different?
- `GET` -- requests data from a server without causing any side effects.
- `POST` -- sends data to a server that can cause side effects (i.e. add an entry to a database).

> What is an HTTP request?
An HTTP request is sent by a web browser and received by a server, asking for content to give to the user.

> What is an HTTP response?
An HTTP response is sent by a server and received by a web browser, containing the data requested from an earlier HTTP request, in addition to other information regarding whether the request was successful.

> What is an HTTP header? Give a couple of examples of request & response headers you have seen.
An HTTP header is a string prepended to the body of an HTTP request or response specifying specific parameters regarding how the request should be processed or the format of the data in a response. Some header examples include:

- `Accept-Charset` (request) -- character encodings that can be received.
- `Authorization` (request) -- credentials for HTTP authentication.
- `User-Agent` (request) -- the user agent string identifying what is making the request.
- `Content-Language` (response) -- the natural language the requested document text is in.
- `Date` (response) -- the date & time the response was sent.
- `Location` (response) -- the URL of a resource in a redirect response.

> What are the processes that happen when you type `http://somesite.com/some/page.html` into a browser?
1) The hostname `somesite.com` is converted to an IP address via DNS.
2) An HTTP request is sent to whatever IP address `somesite.com` refers to, with `/some/page.html` set as the resource being requested and `http` as the communication protocol.
3) An HTTP response is received from the server.
4) The body of the response is parsed into a DOM by an HTML parser and subsequently displayed to the screen.
5) Any additional resources found during the parsing phase are requested in separate HTTP requests.
