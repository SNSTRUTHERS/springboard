from os import path
from typing import *

def get_database_uri(
    database: Optional[str] = None,
    username: Optional[str] = None,
    password: Optional[str] = None,
    format: str =
        "postgresql://{username}{':' if password else ''}{password}{'@' if credentials else ''}/{database}",
    cred_file: str = ".dbcred",
    save: bool = True
) -> Optional[str]:
    """Retrieves the database URI with credentials from a given file for use in a given format.

    The given parameters are overwritten by the saved values from cred_file if they are None

    >>> get_database_uri("test", "postgres", "12345", None)
    postgresql://postgres:12345@/test
    >>> get_database_uri()
    None

    Parameters
    ----------
    database: `Optional[str]` = None
        The name of the database being used.
    username: `Optional[str]` = None
        The database username to login with.
    password: `Optional[str]` = None
        The password associated with username.
    format: `str`
        A format string to fill in with database login info.
    cred_file: `str` = ".dbcred"
        Where to save the database credentials to. None to not save to the filesystem.
    save: `bool`
        Whether to save credentials to cred_file or not.
    
    Returns
    -------
    `str`
        URI to access the database with provided or saved credentials.
    `None`
        If database or format are None when no values have been saved for them or if
        format is malformed.
    """

    if database is None:
        database = ""
    if username is None:
        username = ""
    if password is None:
        password = ""
    if format is None:
        format = ""

    db = ""
    un = ""
    pw = ""
    fm = ""

    if cred_file is not None and path.exists(cred_file):
        with open(cred_file, 'r') as f:
            db = f.readline().rstrip()
            if database == "":
                database = db
            
            un = f.readline().rstrip()
            if username == "":
                username = un

            pw = f.readline().rstrip()
            if password == "":
                password = pw
            
            fm = f.readline().rstrip()
            if format == "":
                format = fm

    if cred_file is not None and save:
        with open(cred_file, 'w') as f:
            db = db if database == "" else database
            f.write(db + "\n")

            un = un if username == "" else username
            f.write(un + "\n")

            pw = pw if password == "" else password
            f.write(pw + "\n")

            fm = fm if format == "" else format
            f.write(fm + '\n')

    if database == "" or format == "":
        return None

    loc = {
        "credentials": (not not username) or (not not password),
        "username": username,
        "password": password,
        "database": database
    }
    
    try:
        exec(f'x = f"{format}"', None, loc)
        return loc['x']
    except:
        return None

