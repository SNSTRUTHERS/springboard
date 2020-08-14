# Terminal Exercises - Part 2
## Answers - Simon Struthers

> 1) What does the `man` command do? Type in `man rm`. How do you scroll and get out?
`man` is short for "manual", and allows you to read manual/documentation pages for a given command line utility, operating system subsystem, or programming language library.

You can navigate `man` via the cursor keys (up/down) or page up & page down. Pressing `:q` returns to the terminal.

> 2) Look at the `man` for `ls`. What does the `-l` flag do? What does the `-a` flag do?

The `-l` flag for `ls` prints more verbose output regarding all the files (what the man page calls "long" output). It includes information such as the creation date of the file, file permissions, and the user that created the file.

The `-a` flag for `ls` prints all files in the current directory, including hidden files that start with `.`, including the symbollic `.` and `..` files that allow one to navigate to the current or parent directory.

> 3) How do you jump between words in the terminal?

SHIFT + left  to go to the previous word.
SHIFT + right to go to the next word.

> 4) How do you get to the end of a line in the terminal?

CTRL + e

> 5) How do you move your cursor to the beginning in the terminal?

CTRL + a

> 6) How do you delete a word (without pressing backspace multiple times) in the terminal?

CTRL + w; deletes the word beneath where your cursor is hovering.

> 7) What is the difference between a terminal and a shell?

A shell is the program responsible for processing commands and printing output from run programs. A terminal is a device that displays shell output. In the 1970s and '80s, this was a physical device consisting of a monitor & keyboard (called a _teletype_, i.e. **tty**), but in modern times this has been abstracted via software through the use of _terminal emulators_.

> 8) What is an absolute path?

An absolute path is a string that denotes to a singular, precise location in a hierarchical file system from the root down.

> 9) What is a relative path?

A relative path is a string that denotes a location in a hierarchical file system relative to the current working directory.

> 10) What is a flag? Give three examples of flags you have used.

A flag is a command line option that modifies the behavior of a program run in the terminal.

The examples of flags that have been used so far in the course are as follows:
 - `ls -a` - List all files (hidden files included) in the given directory.
 - `ls -l` - Print long output for all files listed in the given directory.
 - `rm -f` - Forcefully delete a given file.

> 11) What do the `-r` and `-f` flags do with the `rm` command?

`rm -r` recursively removes files in a given directory, including the directory itself. `rm -f` forcefully removes the files given to `rm` as arguments.

