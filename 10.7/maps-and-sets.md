# Maps & Sets Exercise
## Answers - Simon Struthers

## Object Destructuring

> What does the following code print/return?
> ```js
> new Set([1,1,2,2,3,4])
> ```

```
> new Set([1,1,2,2,3,4]);
Set(4) [ 1, 1, 2, 2, 3, 4 ]
```


> What does the following code print/return?
> ```js
> [...new Set("referee")].join("")
> ```

```
> [...new Set("referee")].join("");
"ref"
```


> What does the Map **_m_** look like after running the following code?
> ```js
> let m = new Map();
> m.set([1,2,3], true);
> m.set([1,2,3], false);
> ```

```
> m;
Map(2) {
    [ 1, 2, 3 ] => true,
    [ 1, 2, 3 ] => false
}
```
