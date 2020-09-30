from flaskkey import get_key
from convert import codes, currency_convert, Decimal
from typing import *

from flask import Flask, flash, get_flashed_messages, jsonify, make_response, redirect, render_template, request
from flask_accept import accept

app = Flask(__name__)
app.config["SECRET_KEY"] = get_key()

@app.route("/", methods=["GET"])
@accept('text/html')
def homepage():
    """Renders the main page."""

    return render_template("forex.html")

@app.route("/", methods=["POST"])
@accept('text/html')
def convert():
    """Handles a conversion request & redirects to the homepage with the converted value or errors."""

    amount = request.values.get('amount')
    try:
        amount = Decimal(amount)
    except:
        pass

    value = currency_convert(
        request.values.get('from'),
        request.values.get('to'),
        amount
    )

    if isinstance(value, Decimal):
        c_from = request.values.get('from')
        c_to   = request.values.get('to')
        flash(f'{codes.get_symbol(c_from)}{round(amount, 2)} => {codes.get_symbol(c_to)}{round(value, 2)}', "value")
    else:
        for error in value:
            flash(error, "error")

    return redirect("/")

def json_convert_entry(values: Mapping[str, str]):
    """Entrypoint for JSON data into the foreign exchange conversion API.

    
    Parameters
    ----------
    values: `Mapping[str, str]`
        Array of values retreived from a response to get variables from.

    Returns
    -------
    `flask.Response`
        A Flask response containing the JSON data corresponding to the input values.
    """

    amount = values.get('amount')
    try:
        amount = Decimal(amount)
    except:
        pass

    value = currency_convert(values.get('from'), values.get('to'),amount)

    response = None
    if isinstance(value, Decimal):
        response = jsonify({ "type": "success", "value": value })
    else:
        response = make_response(jsonify({ "type": "error", "errors": value }), 400)
    
    return response

@homepage.support('application/json')
def get_json():
    """JSON GET entrypoint."""
    
    return json_convert_entry(request.values)

@convert.support('application/json')
def post_json():
    """JSON POST entrypoint."""
    
    return json_convert_entry(request.json)

if __name__ == "__main__":
    app.run()
