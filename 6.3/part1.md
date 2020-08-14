# Branching Exercise - Part 1
## Answers - Simon Struthers

> What `git` command creates a branch?

`git branch {branch_name}`

> What is the difference between a fast-forward and recursive merge?

A *fast-forward merge* is the most basic merging strategy used by `git`, and is used when `git` can easily tell when a series of commits have occured in chronological order between two branches.

A *recursive merge* is used when different commits occur at different times bewtween two branches, in which the above merging strategy is insufficient.

> What `git` command changes to another branch?

`git checkout {branch_name}`

> What `git` command deletes a branch?

 - `git branch -d {branch_name}` if the branch's commits have been merged into another branch.
 - `git branch -D {branch_name}` to forcibly remove a branch, even if its changes haven't been merged into another branch.

> How do merge conflicts happen?

A merge conflict occurs when a file in a merging or to-be-merged branch has sepearate changes across the different branches.

