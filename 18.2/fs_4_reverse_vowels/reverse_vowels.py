#!/usr/bin/env python

def reverse_vowels(s):
    """Reverse vowels in a string.

    Characters which are not vowels do not change position in string, but all
    vowels (y is not a vowel), should reverse their order.

    >>> reverse_vowels("Hello!")
    'Holle!'

    >>> reverse_vowels("Tomatoes")
    'Temotaos'

    >>> reverse_vowels("Reverse Vowels In A String")
    'RivArsI Vewols en e Streng'

    reverse_vowels("aeiou")
    'uoiea'

    reverse_vowels("why try, shy fly?")
    'why try, shy fly?''
    """

    vowels = {'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'}
    vowel_indices = { i if s[i] in vowels else None for i in range(len(s)) }
    vowel_indices = tuple(filter(lambda x: x != None, vowel_indices))
    
    new_str = ""
    for i in range(len(s)):
        if i in vowel_indices:
            new_str += s[vowel_indices[-vowel_indices.index(i) - 1]]
        else:
            new_str += s[i]
    return new_str
