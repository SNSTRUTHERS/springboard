#!/usr/bin/env python

def print_upper_words(words, must_start_with={'e'}):
    """Prints words from a list in upper case that start with a letter
    within a subset of must_start_with."""
    for word in words:
        if word[0].upper() in must_start_with or word[0].lower() in must_start_with:
            print(word.upper())

# should print:
# > HELLO
# > HEY
# > YO
# > YES
print_upper_words(["hello", "hey", "goodbye", "yo", "yes"],
                   must_start_with={"h", "y"})
