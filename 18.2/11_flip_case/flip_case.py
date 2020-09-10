#!/usr/bin/env python

def flip_case(phrase, to_swap):
    """Flip [to_swap] case each time it appears in phrase.

        >>> flip_case('Aaaahhh', 'a')
        'aAAAhhh'

        >>> flip_case('Aaaahhh', 'A')
        'aAAAhhh'

        >>> flip_case('Aaaahhh', 'h')
        'AaaaHHH'

    """

    def map_letter(letter):
        nonlocal to_swap
        if letter.islower() and letter == to_swap.lower():
            return letter.upper()
        elif letter.isupper() and letter == to_swap.upper():
            return letter.lower()
        return letter

    return "".join([ map_letter(char) for char in phrase ])
