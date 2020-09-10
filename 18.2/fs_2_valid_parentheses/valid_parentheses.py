#!/usr/bin/env python

def valid_parentheses(parens):
    """Are the parentheses validly balanced?

        >>> valid_parentheses("()")
        True

        >>> valid_parentheses("()()")
        True

        >>> valid_parentheses("(()())")
        True

        >>> valid_parentheses(")()")
        False

        >>> valid_parentheses("())")
        False

        >>> valid_parentheses("((())")
        False

        >>> valid_parentheses(")()(")
        False
    """
    
    num_parens = 0
    for char in parens:
        if char == ')':
            if num_parens == 0:
                return False
            num_parens -= 1
        elif char == '(':
            num_parens += 1
    return num_parens == 0
