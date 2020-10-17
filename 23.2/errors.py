def missing_parameter(param: str) -> str:
    """Returns error string for a missing parameter."""
    
    return f'Missing parameter "{param}"'

def requires_nonwhitespace_chars(param: str) -> str:
    """Returns error string for a string requiring at least one nonwhitespace char."""

    return f'"{param}" must have at least one nonwhitespace character'

