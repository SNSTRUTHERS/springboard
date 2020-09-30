def missing_argument_error(argname: str) -> str:
    """Formats an error for a missing argument."""

    return f'Missing argument "{argname}"'

def not_a_number_error(argname: str) -> str:
    """Formats an error for when a given parameter is not a number."""

    return f'"{argname}" is not a number'

def invalid_currency_code_error(code: str) -> str:
    """Formats an error for an invalid currency code."""
    
    return f'Invalid currency code {code}'
