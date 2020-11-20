import re

from typing import *

# yoinked from https://emailregex.com
EMAIL_REGEX = re.compile(
    r"(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[" + 
    r"\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")" +
    r"@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|" +
    r"\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?" +
    r"|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-" +
    r"\x09\x0b\x0c\x0e-\x7f])+)\])"
)

def validate_required_field(fields: Mapping[str, Any], field: str) -> Optional[str]:
    """Validates that a required field is available.
    
    Parameters
    ==========
    fields: `Mapping[str, Any]`
        Collection of fields in a form.

    field: `str`
        Name of a field to validate.
    
    Returns
    =======
    `None`
        Field passes validation.

    `str`
        Error string when field fails validation.
    """
    
    if fields.get(field) in ("", None):
        return "This field is required."

def validate_email_field(fields: Mapping[str, Any], field: str) -> Optional[str]:
    """Validates an email field.
    
    Parameters
    ==========
    fields: `Mapping[str, Any]`
        Collection of fields in a form.

    field: `str`
        Name of email field to validate.
    
    Returns
    =======
    `None`
        Field passes validation.

    `str`
        Error string when field fails validation.
    """

    if fields.get(field) is not None and EMAIL_REGEX.match(str(fields.get(field))) is None:
        return "Invalid email address."

def validate_enum_field(
    fields: Mapping[str, Any],
    field: str,
    enumerators: Collection[str]
) -> Optional[str]:
    """Validates an enumeration field.
    
    Parameters
    ==========
    fields: `Mapping[str, Any]`
        Collection of fields in a form.

    field: `str`
        Name of string field to validate.

    enumerators: `Collection[str]`
        Collection of enumerator values.

    Returns
    =======
    `None`
        Field passes validation.

    `str`
        Error string when field fails validation.
    """

    if fields.get(field) not in enumerators:
        return f"Invalid value; must be one of: [{', '.join([ str(x) for x in enumerators ])}]."

def validate_range_field(
    fields: Mapping[str, Any],
    field: str,
    min: Optional[int] = None,
    max: Optional[int] = None
) -> Optional[str]:
    """Validates that a numeric field is in a given range.
    
    Parameters
    ==========
    fields: `Mapping[str, Any]`
        Collection of fields in a form.

    field: `str`
        Name of numeric field to validate.

    min: `Optional[int]` = None
        Minimum value of field.

    max: `Optional[int]` = None
        Maximum value of field.

    Returns
    =======
    `None`
        Field passes validation.
    `str`
        Error string when field fails validation.
    """

    value = None
    try:
        value = float(fields.get(field))
    except:
        return "Invalid number."
    
    if (min is not None and value < min) or (max is not None and value > max):
        return (
            "Invalid number; must be in range " +
            f"[{min if min else ''},{' ' + str(max) if max else ''}]."
        )

def validate_field(
    fields: Mapping[str, Any],
    field: str,
    errors: Mapping[str, List[str]],
    validator: Callable[[Mapping[str, Any], str], Optional[str]],
    *args: Any
):
    """Appends an error for a given field if there is an error to report.
    
    Parameters
    ==========
    fields: `Mapping[str, Any]`
        Collection of fields in a form.
    
    field: `str`
        Name of a field to validate.

    errors: `Mapping[str, List[str]]`
        Dict of errors to append to.
    
    validator: `Callable[[Mapping[str, Any], str], Optional[str]]`
        A validation function taking fields, field, and *args as parameters.
    
    *args: `Any`
        Additional parameters to pass to the validation function.
    """

    error = validator(fields, field, *args)

    if error:
        if field not in errors:
            errors[field] = []
        errors[field].append(error)
