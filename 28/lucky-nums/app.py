#!/usr/bin/env python

import requests, random

# Flask stuff
from flask import Flask, jsonify, request

# form validation functions
from validate import *

app = Flask(__name__)

# == ENTRYPOINTS ================================================================================= #

@app.route("/api/get-lucky-num", methods=["POST"])
def get_lucky_num():
    """API entrypoint for getting info for a lucky number."""

    VALID_COLORS = ('red', 'green', 'orange', 'blue')
    REQUIRED_FIELDS = ("name", "email", "year", "color")

    errors = {}

    data = request.json if request.json else {}

    # check that all required fields are available
    for field in REQUIRED_FIELDS:
        validate_field(data, field, errors, validate_required_field)

    # check that email is valid
    validate_field(data, "email", errors, validate_email_field)
    
    # check that color is a valid enumeration value
    validate_field(data, "color", errors, validate_enum_field, VALID_COLORS)

    # check that year is between 1900 and 2000
    validate_field(data, "year", errors, validate_range_field, 1900, 2000)
    
    if len(errors) > 0:
        print(errors)
        return jsonify(errors=errors)

    year_info = requests.get(f"http://numbersapi.com/{data['year']}/year").text

    num = random.randrange(1, 100)
    num_info = requests.get(f"http://numbersapi.com/{num}").text

    return jsonify({
        "year": { "fact": year_info, "year": data['year'] },
        "num": { "fact": num_info, "num": num }
    })

# == PAGE ROUTES ================================================================================= #

@app.route("/")
def homepage():
    """Show homepage."""

    return app.send_static_file("index.html")

# == RUN APPLICATION ============================================================================= #

if __name__ == "__main__":
    app.run()
