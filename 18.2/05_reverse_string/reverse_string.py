#!/usr/bin/env python

def reverse_string(phrase):
    """Reverse string,

        >>> reverse_string('awesome')
        'emosewa'

        >>> reverse_string('sauce')
        'ecuas'
    """
    
    lst = list(phrase)
    lst.reverse()
    return "".join(lst)
