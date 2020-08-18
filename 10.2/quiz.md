# let and const Exercise - Quiz
## Answers - Simon Struthers

> What is the difference between **var** and **let**?
`var` is a function-scoped weak variable declarator (i.e. it can overwrite previous identifiers of the same name in the same scope). `let` is a block-scoped strong variable declarator (i.e. it doesn't allow one to redeclare a variable with the same name using `let`).

> What is the difference between **var** and **const**?
`var` allows for variable names to be reassigned and redeclared. `const` prevents reassignment.

> What is the difference between **let** and **const**?
`let` allows variable names to be reassigned, but not redeclared. `const` prevents both.

> What is hoisting?
When using `var` for variable declarations and assignment, the variable names used in the `var` statement act as though they were declared first, prior to their assignment later. This allows one to use the `undefined` value stored in the variable name prior to the variable's written declaration in the source code.
