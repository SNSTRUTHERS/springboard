#!/usr/bin/env python

import sys

from flask import flash, Flask, redirect, render_template, url_for
from flask_debugtoolbar import DebugToolbarExtension
from flaskkey import get_key

from dbcred import get_database_uri
from models import *
from forms import *

# == SET UP FLASK APP ============================================================================ #

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
if app.config['SQLALCHEMY_DATABASE_URI'] is None:
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri("adopt", cred_file=None, save=False)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

app.config['SECRET_KEY'] = get_key()
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

# == APPLICATION ROUTES ========================================================================== #

@app.route('/')
def pet_listing():
    """Lists all pets."""
    
    pets = Pet.query.all()
    return render_template("pet_listing.html", pets=pets)

@app.route('/add', methods=["GET", "POST"])
def add_pet_pages():
    """Adds a pet."""

    form = AddPetForm()

    if form.validate_on_submit():
        data = { key: val for key, val in form.data.items() if key != "csrf_token" }
        new_pet = Pet(**data)

        db.session.add(new_pet)
        db.session.commit()
        return redirect(url_for('pet_listing'))
    
    return render_template("add_pet.html", form=form)

@app.route('/<int:pet_id>', methods=["GET", "POST"])
def edit_pet_pages(pet_id: int):
    """Edits a pet."""

    pet = Pet.query.get_or_404(pet_id)
    form = EditPetForm(obj=pet)

    if form.validate_on_submit():
        pet.notes = form.notes.data
        pet.available = form.available.data
        pet.photo_url = form.photo_url.data

        db.session.commit()
        return redirect(url_for('pet_listing'))
    
    return render_template("edit_pet.html", form=form, pet=pet)

# == START APPLICATION =========================================================================== #

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri(
            sys.argv[3] if len(sys.argv) > 3 else "blogly",
            sys.argv[1],
            sys.argv[2]
        )
    print(app.config['SQLALCHEMY_DATABASE_URI'])

    debug = DebugToolbarExtension(app)
    connect_db(app)
    db.create_all()
    app.run()