#!/usr/bin/env python

def count_up(start, stop):
    """Print all numbers from start up to and including stop.

    For example:

        count_up(5, 7)

    should print:

        5
        6
        7
    """

    for i in range(start, stop + 1):
        print(i)


count_up(5, 7)        
