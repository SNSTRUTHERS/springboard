from forex_python.converter import CurrencyCodes, CurrencyRates
from decimal import Decimal
from typing import *
from errors import *

rates = CurrencyRates()
codes = CurrencyCodes()

def currency_convert(c_from: str, c_to: str, amount: Union[float, Decimal]) -> Union[Union[float, Decimal], Container[str]]:
    """Converts between one currency to another.

    >>> currency_convert("USD", "USD", 1.0)
    1.0

    Parameters
    ----------
    c_from: `str`
        Currency code you are converting from.
    c_to: `str`
        Currency code you are converting to.
    amount: `Union[float, Decimal]`
        Numeric amount of *c_from* you are converting.
    
    Returns
    -------
    `Union[float, Decimal]`
        The equivalent of *amount* in whatever currency *c_to* represents.
    `Container[str]`
        Container of strings with errors if erroneous inputs are received.
    """

    errs = []

    if c_from is None:
        errs.append(missing_argument_error("from"))
    if c_to is None:
        errs.append(missing_argument_error("to"))
    if amount is None:
        errs.append(missing_argument_error("amount"))
    elif not isinstance(amount, (float, Decimal)):
        errs.append(not_a_number_error("amount"))

    if c_from is not None and c_to is not None:
        c_from = c_from.upper()
        c_to   = c_to.upper()
        
        cur_rates = None
        try:
            cur_rates = rates.get_rates(c_from)
            if c_to not in cur_rates:
                errs.append(invalid_currency_code_error(c_to))
        except:
            errs.append(invalid_currency_code_error(c_from))

            try:
                rates.get_rates(c_to)
            except:
                errs.append(invalid_currency_code_error(c_to))
    
    if len(errs) > 0:
        return tuple(errs)
    
    return type(amount)(cur_rates[c_to]) * amount
