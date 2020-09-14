#!/usr/bin/env python

"""Python serial number generator."""

class SerialGenerator:
    """Machine to create unique incrementing serial numbers.
    
    >>> serial = SerialGenerator(start=100)

    >>> serial.generate()
    100

    >>> serial.generate()
    101

    >>> serial.generate()
    102

    >>> serial.reset()

    >>> serial.generate()
    100
    """

    def __init__(self, start=0):
        """Make a new generator, starting at start."""

        self.__start = self.__next = start
    
    def generate(self):
        """Return the next item in the serial generation."""
        
        self.__next += 1
        return self.__next - 1
    
    def reset():
        """Reset the generator to the initial start setting."""
        
        self.__next = self.__start

    def __repr__(self):
        """Return string reprsentation of the generator."""

        return f"<SerialGenerator start={self.__start} next={self.__next}>"
