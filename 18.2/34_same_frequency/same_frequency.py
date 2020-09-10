#!/usr/bin/env python

def same_frequency(num1, num2):
    """Do these nums have same frequencies of digits?
    
        >>> same_frequency(551122, 221515)
        True
        
        >>> same_frequency(321142, 3212215)
        False
        
        >>> same_frequency(1212, 2211)
        True
    """

    str1 = str(num1)
    str2 = str(num2)
    return all(str1.count(char) == str2.count(char) for char in set(str1))
