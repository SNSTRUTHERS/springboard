# Unit 48.3
## JavaScript Interview Questions

> What is a potential pitfall with using `typeof bar === "object"` to determine
> if `bar` is an object? How can this pitfall be avoided?

Anything which isn't a numeric literal, boolean literal, string literal,
bigint, function, or undefined will return `"object"`, which includes things
like arrays, HTML elements, and results from expressions such as `new Boolean()`
or `new String()`. `instanceof` is a more reliable method of checking for
what type a given object is, but fails with literals. Therefore, use of both
`typeof` and `instanceof` would be preferable for literals, whilst `instanceof`
by itself is preferable for object types.

- - -

> What will the code below output to the console and why?
> ```js
> (function() {
>     var a = b = 3;
> })();
> 
> console.log("a defined? " + (typeof a !== 'undefined'));
> console.log("b defined? " + (typeof b !== 'undefined'));
> ```

Two `false`s will be outputted to the console, because `a` and `b` are defined
only within the function's scope, not the script's global scope.

- - -

> What will the code below output to the console and why?
> ```js
> var myObject = {
>     foo: "bar",
>     func: function() {
>         var self = this;
>         console.log("outer func:  this.foo = " + this.foo);
>         console.log("outer func:  self.foo = " + self.foo);
>         (function() {
>             console.log("inner func:  this.foo = " + this.foo);
>             console.log("inner func:  self.foo = " + self.foo);
>         }());
>     }
> };
> myObject.func();
> ```

`outer func:  this.foo = bar`, `outer func:  self.foo = bar`,
`inner func:  this.foo = undefined`, and `inner func:  self.foo = bar` will be
outputted to the console. In the outer function, `this` is set to the object
`myObject`, whilst the inner function doesn't have a `this` set. `self` is
accessed as a local function-scope variable in the outer function and as a
closure variable in the inner function, in which both times it is set to the
outer `this`.

- - -

> What is the significance of, and reason for, wrapping the entire content of a
> JavaScript source file in a function block?

This prevents global variables from being leaked out to the global object, as
`var` declarations in functions are local to the function instead of being added
as properties of the global object.

- - -

> What is the significance, and what are the benefits, of including
> `'use strict'` at the beginning of a JavaScript source file.

`'use strict';` sets the JavaScript interpreter into, as stated by the string,
a more strict and, consequently, safe mode of evaluation and execution by
disabling certain features and changing some behaviors.

- - -

> Consider the two functions below. Will they both return the same thing? Why or
> why not?
> ```js
> function foo1()
> {
>     return {
>         bar: "hello"
>     };
> }
> 
> function foo2()
> {
>     return
>     {
>         bar: "hello"
>     };
> }
> ```

`foo1` returns the object `{ "bar": "hello" }`, whilst `foo2` returns nothing.
This is because of how JavaScript automatically inserts semicolons between
statements during parsing.

- - -

> What will the code below output to the console and why?
> ```js
> console.log(0.1 + 0.2);
> console.log(0.1 + 0.2 == 0.3);
> ```

`0.30000000000000004` and `false` will be output to the console. JavaScript,
like other programming languages, uses **floating-point numbers** for decimal
values. Unlike other languages, JavaScriptu ses floating-point exclusively for
numbers. The use of floating-point causes precision problems, so `0.1 + 0.2` is
more of a floating-point problem rather than being a JavaScript-specific
problem.

- - -

> In what order will the numbers 1-4 be logged to the console when the code
> below is executed? Why?
> ```js
> (function() {
>     console.log(1);
>     setTimeout(function(){console.log(2)}, 1000);
>     setTimeout(function(){console.log(3)}, 0);
>     console.log(4);
> })();
> ```

The values will be logged in the order `1`, `4`, `3`, and `2`. JavaScript is a
single-threaded execution environment, meaning it executes things step-by-step.
Asynchronous function calls are accomplished by calling scheduled functions
after synchronous functions have finished being executed. `3` is given a 0
millisecond wait after the outer function has finished executing, whilst `2` is
given a one second wait. As such, `3` is output immediately after the function
is done being called, with `2` arriving one second after everyone else.

- - -

> Write a simple function (less than 160 characters) that returns a boolean
> indicating whether or not a string is a palindrome.

```js
const isPalindrome = (str) =>
    (str == str.split('').reverse().join(''));
;
```

- - -

> Write a `sum` method which will work properly when invoked using either
> syntax below:
> ```js
> console.log(sum(2,3));
> console.log(sum(2)(3));
> ```

```js
const sum = (n1, n2 = undefined) => {
    const fn = (n2) => n1 + n2;
    return n2 === undefined ? fn : fn(n2);
};
```

- - -

> Consider the following code snippet:
> ```js
> for (var i = 0; i < 5; i++) {
>     var btn = document.createElement('button');
>     btn.appendChild(document.createTextNode('Button ' + i));
>     btn.addEventListener('click', function(){ console.log(i); });
>     document.body.appendChild(btn);
> }
> ```
> 
> **(a)** What gets logged to the console when the user clicks on "Button 4"
> and why?
> 
> **(b)** Provide one or more alternate implementations that will work as
> expected.

**(a)**
`5` gets logged to the console. `i` in the event listener is a closure variable
by reference, meaning the value at the time of its creation is not preserved
prior to it being called. As such, it uses the final value of `i` prior to the
loop being exited, which is 5.

**(b)**
```js
for (var i = 0; i < 5; i++) {
    var btn = document.createElement('button');
    btn.appendChild(document.createTextNode('Button ' + i));
    btn.addEventListener('click', ((i) => console.log(i)).bind(this, i));
    document.body.appendChild(btn);
}
```

- - -

> Assuming `d` is an "empty" object in scope, what is accomplished using the
> following code?
> ```js
> [ 'zebra', 'horse' ].forEach(function(k) {
>     d[k] = undefined;
> });
> ```

`d` is given two named fields called `"zebra"` and `"horse"`, each with the
value `undefined`.

- - -

> What will the code below output to the console and why?
> ```js
> var arr1 = "john".split('');
> var arr2 = arr1.reverse();
> var arr3 = "jones".split('');
> arr2.push(arr3);
> console.log("array 1: length=" + arr1.length + " last=" + arr1.slice(-1));
> console.log("array 2: length=" + arr2.length + " last=" + arr2.slice(-1));
> ```

`array 1: length=5 last=j,o,n,e,s` and `array 2: length: 5 last=j,o,n,e,s` get
output to the console. The two arrays are the same because `Array.reverse`
reverses an array in-place alongside returning it. This means `arr1` and `arr2`
refer to the same array, which means anything done to one can be seen via the
other.

When pushing `arr3` to the back of `arr2`, `arr3` in its entirety is pushed to
the back as a singular object, rather than concatenating the two arrays
together.

A negative index into `Array.slice` is interpreted as an index relative to the
end of the given array.

- - -

> What will the code below output to the console and why?
> ```js
> console.log(1 +    "2" + "2");
> console.log(1 +   +"2" + "2");
> console.log(1 +   -"1" + "2");
> console.log(+"1" + "1" + "2");
> console.log("A" - "B" + "2");
> console.log("A" - "B" + 2);
> ```

`122`, `32`, `02`, `112`, `NaN2`, and `NaN` are output the console.

In the first line, adding a number to a string converts the number into a
string, turning the rest of the expression into a string concatenation..

In the second line, a prefix `+` before a string converts it into a number,
hence the first digit being `3` in the output. The same goes for prefix `-` in
the third line, hence the first digit there being `0`.

In the fourth line, prefix `+` applies to the first item in the expression
before getting turned back into a string.

In the fifth line, subtraction always results in a number being returned, and
because `A` and `B` don't refer to valid numbers, the number `NaN` is the
result. It is then converted back into a string to be concatenated with `2`.

The same goes for the sixth line, except we're adding a number to `NaN`, hence
only `NaN` is printed.

- - -

> The following recursive code will cause a stack overflow if the array list is
> too large. How can you fix this and still retain the recursive pattern?
> ```js
> var list = readHugeList();
> 
> var nextListItem = function() {
>     var item = list.pop();
>     
>     if (item) {
>         // process the list item...
>         nextListItem();
>     }
> };
> ```

```js
var list = readHugeList();

var nextListItem = function() {
    var item = list.pop();

    if (item) {
        // process the list item...
        setTimeout(nextListItem, 0);
    }
};
```

This asynchronizes the code, clearing each stack frame and, as such, fixes the
problem.

- - -

> What is a "closure" in JavaScript? Provide an example.

A closure is a function which refers to a variable contained within the parent
of its scope, even if said parent scope has been exited. An example is as
follows:

```js
function createCounter() {
    let c = 0; // closure variable
    return () => c++; // closure
}
```

- - -

> What will the code below output to the console and why?
> ```js
> console.log("0 || 1 = "+(0 || 1));
> console.log("1 || 2 = "+(1 || 2));
> console.log("0 && 1 = "+(0 && 1));
> console.log("1 && 2 = "+(1 && 2));
> ```

`0 || 1 = 1`, `1 || 2 = 1`, `0 && 1 = 0`, and `1 && 2 = 2` will be output to the
console. In JavaScript, the logical boolean operators act on truthy and falsy
values instead of exclusively true and false, returning the last evaluated
value of a given comparison. Because of this, the first truthy value and
last falsy value is returned in a `||` chain, whilst the first falsy value and
last truthy value is returned in a `&&` chain.

- - -

> What will the code below output to the console and why?
> ```js
> console.log(false == '0');
> console.log(false === '0');
> ```

`true` and `false` will be output to the console. In JavaScript, `==` is a
loose/truthy comparison, whilst `===` is a strict/type-coherent comparison.
The string `'0'` and boolean literal `false` are both falsy, and as such are
seen as equal in truthy comparisons. Meanwhile, they are of different types,
and as such are seen as not equal in strict comparisons.

- - -

> What will the code below output to the console and why?
> ```js
> var a={},
>     b={key:'b'},
>     c={key:'c'};
> 
> a[b]=123;
> a[c]=456;
> 
> console.log(a[b]);
> ```

`456` will be output to the console. JavaScript objects, when used as keys in
JavaScript objects, are usually serialized to the string `[object Object]`
regardless of contents, and as such two different object keys will refer to the
same value when attempting to access it in this way.

- - -

> What will the code below output to the console and why?
> ```js
> console.log((function f(n){return ((n > 1) ? n * f(n-1) : n)})(10));
> ```

`3628800` will be output to the console, otherwise known as 10 factorial (or
`10!`).

The inline function listed is a naive, albeit mostly functional
(`0!` is supposed to equal 1 but the function instead returns 0) recursive
factorial implementation. Said inline function is also invoked inline with the
initial input of 10, hence the output of 10 factorial.

- - -

> What will the code below output to the console and why?
> ```js
> (function(x) {
>     return (function(y) {
>         console.log(x);
>     })(2)
> })(1);
> ```

`1` will be output to the console. The outer function parameter `x` is
referenced as a closure parameter from the inner function that is immediately
called within it. The inner function's parameter, `y`, goes unused.

- - -

> What will the code below output to the console and why?
> ```js
> var hero = {
>     _name: 'John Doe',
>     getSecretIdentity: function () {
>         return this._name;
>     }
> };
> 
> var stoleSecretIdentity = hero.getSecretIdentity;
> 
> console.log(stoleSecretIdentity());
> console.log(hero.getSecretIdentity());
> ```
> 
> What is the issue with the code and how can it be fixed?

`undefined` and `John Doe` will be output to the console. The first console
printout calls a member function of `hero` in the global context via an alias,
meaning that `this` when the function is called is set to the `window` or
`global` object, neither of which has a `_name` property. The second console
printout does invoke the member function of `hero` with the proper context.

To fix the code, the `stoleSecretIdentity` alias must be set as a bound
version of `hero.getSecretIdentity` in which the `thisArg` is explicitly set
to `hero`:

```js
var stoleSecretIdentity = hero.getSecretIdentity.bind(hero);
```

- - -

> Create a function that, given a DOM Element on the page, will visit the
> element itself and *all* of its descendents (not just its immediate children).
> For each element visited, the function should pass that element to a provided
> callback function. The arguments to the function should be:
> - a DOM element
> - a callback function (that takes a DOM element as its argument)

```js
const traverse = (element, callback) => {
    callback(element);
    for (const child of element.children)
        traverse(child, callback);
};
```

- - -

> What will the code below output to the console and why?
> ```js
> var length = 10;
> function fn() {
>     console.log(this.length);
> }
> 
> var obj = {
>     length: 5,
>     method: function(fn) {
>         fn();
>         arguments[0]();
>     }
> };
> 
> obj.method(fn, 1);
> ```

`10` and `2` are output to the console.

On the first callback call, `fn` is called directly as passed when `method` was
invoked. `this` is thus set to the context in which the passed parameter was
declared, which was the global scope. Because `var` declarations set properties
of the global object, `this.length` in that context refers to the `10` at the
top of the code block.

On the second callback call, `fn` as called via an index into `arguments`, a
special object consisting of the arguments passed when calling `obj.method`.
Though this isn't an array, it does contain a length property, here set to `2`
because two parameters were passed when calling `obj.method`: `fn` and `1`.
When calling a callback function indirectly this way, the object from which
`fn` was fetched becomes the `this` context, thus retrieving and printing the
length `2`.

- - -

> What will the code below output to the console and why?
> ```js
> (function () {
>     try {
>         throw new Error();
>     } catch (x) {
>         var x = 1, y = 2;
>         console.log(x);
>     }
>     console.log(x);
>     console.log(y);
> })();
> ```

This will output `1`, `undefined`, and `2` to the console. `var` declarations
are hoisted without initialization to the top of the scope it was declared in.
This doesn't apply to `catch` blocks, for `catch` blocks do not have their own
function scope. As such, `x` and `y` can both be accessed prior to the
`try`-`catch` with their values undefined. Within the `catch` block, however,
`y` is assigned to `2`, hence why `2` is logged. Meanwhile, the `catch` block
shadows `x` as an identifier to store the caught error. Because of this, the
`catch` block's `x` is set to `1` and is subsequently printed, whilst the outer
`x` remains undefined when it eventually gets printed.

- - -

> What will the code below output to the console and why?
> ```js
> var x = 21;
> var girl = function () {
>     console.log(x);
>     var x = 20;
> };
> girl ();
> ```

`undefined` will be output to the console. `var` declarations are hoisted
without initilaization to the top of the scope they are declared in, even when
mirroring variables from parent scopes. Because of this, the `x` declarated at
the end of the `girl` function is allocated right after being called, but is
not set and subsequently printed to console.

- - -

> What will the code below output to the console and why?
> ```js
> for (let i = 0; i < 5; i++) {
>     setTimeout(function() { console.log(i); }, i * 1000);
> }
> ```

`0`, `1`, `2`, `3`, and `4` are output to the console. `let` is block-scoped,
meaning a unique `i` used per evauation of the `for` scope.

- - -

> What will the code below output to the console and why?
> ```js
> console.log(1 < 2 < 3);
> console.log(3 > 2 > 1);
> ```

`true` and `false` will be output to the console. `<` and `>` (along with the
other arithmetic comparison operators) result in a boolean literal `true` or
`false` as the value of their expression. However, any value can be placed on
the left and right side of these comparisons and are converted to `number`s for
the comparison.

In the first line, `1 < 2` gets evaluated to `true`, which is subsequently
converted to `1` when compared against `3`. `1 < 3` is `true`.

In the second line, `3 > 2` is evaluated to `true`, which is converted to `1`
when compared against `1`. `1 > 1` is `false`.

- - -

> How do you add an element at the beginning of an array? How do you add one at
> the end?

`Array.shift` appends a value to the start of an array. `Array.push` appends a
value to the back of an array.

- - -

> Imagine you have this code:
> ```js
> var a = [1, 2, 3];
> ```
>
> **a)** Will this result in a crash:
> ```js
> a[10] = 99;
> ```
> 
>  **b)** What will this output:
> ```js
> console.log(a[6]);
> ```

**a)**
No; this means that the `a` object has a property called `"10"` assigned to it
with the value `99`. This does not change `a.length`.

**b)**
`undefined` will be output to the console.

- - -

> What is the value of `typeof undefined == typeof NULL`?

The value is `true`; `typeof undefined` is `"undefined"`, and `NULL`, being an
unassigned identifier, is the value `undefined`, which means its `typeof` is
also `"undefined"`.

- - -

> What will the code below output to the console and why?
> ```js
> console.log(typeof typeof 1);
> ```

`string` will be output to the console. The result of all `typeof` expressions
in JavaScript are string literals, hence taking the `typeof` of the result of
a `typeof` expression will always result in `'string'` being the result.

- - -

> What will the code below output to the console and why?
> ```js
> for (var i = 0; i < 5; i++) {
>     setTimeout(function() { console.log(i); }, i * 1000 );
> }
> ```

`5` will be output 5 times to the console. As stated earlier, closure variables
are captured by reference, not by value, and as such the final value of `i`,
`5`, is used when logging to the console after an asynchronous, timed-out
function call.

- - -

> What is `NaN`? What is its type? How can you reliably test if a value is
> equal to `NaN`?

**NaN** is a special value representing invalid numbers (hence its name; it is
short for "not a number"). It is a number, for it usually is used as the result
of numeric operations. The `isNaN` function can be used to check if a given
value is `NaN`, as `NaN !== NaN` in JavaScript and most other languages.

- - -

> What will the code below output to the console and why?
> ```js
> var b = 1;
> function outer(){
>     var b = 2
>     function inner(){
>         b++;
>         var b = 3;
>         console.log(b);
>     }
>     inner();
> }
> outer();
> ```

`3` will be output to the console. There are three closure variables, all called
`b` and all inner function scopes mirroring the previous ones. `var` hoisting
eliminates any corruption of `outer`'s `b` value from `inner`, which is still
irrelevant because `b` gets reassigned to `3` immediately after `b++` is
evaluated.

- - -

> Discuss possible ways to write a function `isInteger(x)` that determines if
> `x` is an integer.

- returning `true` if `typeof x === 'number'`
  - **pitfalls**:
    - returns `false` for integers created via `new Number()`
    - returns `false` for decimal numbers (i.e. numbers such as `3.5`)
- returning `true` when `x instanceof Number` or `typeof x ==='number'`, and
  when `Math.floor(x)` equals `x`.

- - -

> How do you clone an object?

`Object.assign({}, object)` returns an object with the same properties as the
passed in `object`, but does not refer to the same object as `object`.

This is a *shallow copy* (i.e. inner nested objects are not copied), meaning
that inner nested objects within a given object and its copy reference the
same object.
