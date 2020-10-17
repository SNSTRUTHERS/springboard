from secrets import token_urlsafe
from os import path

def get_key(key_file: str = ".flaskkey", num_bytes: int = 64) -> str:
    """Generates a cryptographically random key and saves it
    to a given file for reuse.

    >>> get_key() == get_key()
    True
    
    Parameters
    ----------
    key_file: `str` = ".flaskkey"
        The file to save the key to.
    num_bytes: `int` = 64
        Length of the generated key in bytes.
    
    Returns
    -------
    `str`
        A random key *num_bytes* in length.
    """

    if path.exists(key_file):
        with open(key_file, 'r') as f:
            return f.read()
    else:
        key = token_urlsafe(num_bytes)
        with open(key_file, 'w') as f:
            f.write(key)
        return key
