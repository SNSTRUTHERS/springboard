"""Utilities related to Boggle game."""

from random import choice
from typing import *
import string

class Boggle():
    """Class containing functionality for a Boggle game."""

    RESULT_OK = "ok"
    RESULT_NOT_WORD = "not-word"
    RESULT_NOT_ON_BOARD = "not-on-board"

    def __init__(self, dict_path: str = "words.txt"):
        """Base class for Boggle games."""

        self.words = self.read_dict(dict_path)

    def read_dict(self, dict_path: str) -> Collection[str]:
        """Read and return all words in dictionary."""

        dict_file = open(dict_path)
        words = {w.strip() for w in dict_file}
        dict_file.close()
        return words

    def make_board(self, board_size: int = 5) -> List[List[str]]:
        """Make and return a random boggle board."""

        board = []

        for y in range(board_size):
            row = [choice(string.ascii_uppercase) for i in range(board_size)]
            board.append(row)

        return board

    def check_valid_word(self, board: List[List[str]], word: str) -> str:
        """Check if a word is a valid word in the dictionary and/or the boggle board"""

        word_exists = word in self.words
        valid_word = self.find(board, word.upper())

        if word_exists and valid_word:
            result = Boggle.RESULT_OK
        elif word_exists and not valid_word:
            result = Boggle.RESULT_NOT_ON_BOARD
        else:
            result = Boggle.RESULT_NOT_WORD

        return result

    def find_from(self,
        board: List[List[str]],
        word: str,
        y: int,
        x: int,
        seen: Set[Tuple[int, int]] = set(),
        path: List[Tuple[int, int]] = []
    ) -> bool:
        """Can we find a word on board, starting at x, y?"""

        if len(board) != len(board[0]):
            raise ValueError("board must be a square list")

        # Out of range
        if y < 0 or y >= len(board)or x < 0 or x >= len(board):
            return False

        # This is called recursively to find smaller and smaller words
        # until all tries are exhausted or until success.

        # Base case: this isn't the letter we're looking for.

        if board[y][x] != word[0]:
            return False

        # Base case: we've used this letter before in this current path

        if (y, x) in seen:
            return False

        # Base case: we are down to the last letter --- so we win!

        if len(word) == 1:
            return True

        # Otherwise, this letter is good, so note that we've seen it,
        # and try of all of its neighbors for the first letter of the
        # rest of the word
        # This next line is a bit tricky: we want to note that we've seen the
        # letter at this location. However, we only want the child calls of this
        # to get that, and if we used `seen.add(...)` to add it to our set,
        # *all* calls would get that, since the set is passed around. That would
        # mean that once we try a letter in one call, it could never be tried again,
        # even in a totally different path. Therefore, we want to create a *new*
        # seen set that is equal to this set plus the new letter. Being a new
        # object, rather than a mutated shared object, calls that don't descend
        # from us won't have this `y,x` point in their seen.
        #
        # To do this, we use the | (set-union) operator, read this line as
        # "rebind seen to the union of the current seen and the set of point(y,x))."
        #
        # (this could be written with an augmented operator as "seen |= {(y, x)}",
        # in the same way "x = x + 2" can be written as "x += 2", but that would seem
        # harder to understand).

        seen = seen | {(y, x)}

        # adding diagonals

        if y > 0:
            if self.find_from(board, word[1:], y - 1, x, seen):
                return True

        if y < len(board):
            if self.find_from(board, word[1:], y + 1, x, seen):
                return True

        if x > 0:
            if self.find_from(board, word[1:], y, x - 1, seen):
                return True

        if x < len(board):
            if self.find_from(board, word[1:], y, x + 1, seen):
                return True

        # diagonals
        if y > 0 and x > 0:
            if self.find_from(board, word[1:], y - 1, x - 1, seen):
                return True

        if y < len(board) and x < len(board):
            if self.find_from(board, word[1:], y + 1, x + 1, seen):
                return True

        if x > 0 and y < len(board):
            if self.find_from(board, word[1:], y + 1, x - 1, seen):
                return True

        if x < len(board) and y > 0:
            if self.find_from(board, word[1:], y - 1, x + 1, seen):
                return True
        # Couldn't find the next letter, so this path is dead

        return False

    def find(self, board: List[List[str]], word: str) -> bool:
        """Can word be found in board?"""

        # Find starting letter --- try every spot on board and,
        # win fast, should we find the word at that place.
        
        for y in range(0, 5):
            for x in range(0, 5):
                if self.find_from(board, word, y, x):
                    return True

        # We've tried every path from every starting square w/o luck.
        return False
