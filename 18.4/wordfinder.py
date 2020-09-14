#!/usr/bin/env python

"""Word Finder: finds random words from a dictionary."""

import random

class WordFinder:
    """Class for obtaining random words from a dictionary.
    
    >>> wf = WordFinder("shortwords.txt")
    3 words read

    >>> wf.random() in {"apple", "orange", "banana"}

    >>> wf.random() in {"apple", "orange", "banana"}
    True

    >>> wf.random() in {"apple", "orange", "banana"}
    True
    """

    def __init__(self, filename):
        """Reads a dictionary file & reports number of items read."""
        
        self.words = self.parse(filename)
        print(f"{len(self.words)} word{len("s" self.words != 1 else "")} read")
    
    def parse(self, filename):
        """Parses a dictionary file into a list of words."""

        with open(filename, 'r') as file:
            return [word.strip() for word in file]

    def random(self):
        """Retrieves a random word."""
        return random.choice(self.words)

class SpecialWordFinder(WordFinder):
    """Specialized variant of WordFinder that excludes blank lines & comments.

    >>> wf = SpecialWordFinder("categorizedwords.txt")
    4 words read

    >>> wf.random() in {"apple", "orange", "carrot", "cauliflower"}
    True

    >>> wf.random() in {"apple", "orange", "carrot", "cauliflower"}
    True

    >>> wf.random() in {"apple", "orange", "carrot", "cauliflower"}
    True

    >>> wf.random() in {"apple", "orange", "carrot", "cauliflower"}
    True
    """

    def parse(self, filename):
        """Parses a dictionary file into a list of words, skipping blank lines + comments."""

        with open(filename, 'r') as file:
            return [word.strip() for word in file if word.strip() and not word.startswith("#")]
