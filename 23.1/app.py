#!/usr/bin/env python

import sys

# Flask stuff
from flask import Flask, jsonify, redirect, render_template, request
from flask_accept import accept
from flask_debugtoolbar import DebugToolbarExtension
from flaskkey import get_key

# Database stuff
from models import *
from dbcred import get_database_uri

# == FLASK SET-UP ==================================================================================

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
if app.config['SQLALCHEMY_DATABASE_URI'] is None:
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri("blogly", cred_file=None, save=False)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

app.config['SECRET_KEY'] = get_key()
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

# == PAGE ROUTES ===================================================================================

@app.route("/")
def homepage():
    """Redirects to the user listing page."""

    return redirect("/users")

@app.route("/users", methods=["GET"])
@accept('text/html')
def user_listing():
    """Renders the user listing page."""

    return render_template("user_listing.html", users=User.get_sorted())

@user_listing.support('application/json')
def get_users():
    """Retrieves a list of users in the form of a JSON array."""

    return jsonify([user.to_dict() for user in User.get_sorted()])

@app.route("/users/new", methods=["GET"])
def new_user():
    """Renders the new user form page."""

    return render_template("new_user.html")

@app.route("/users/new", methods=["POST"])
def create_new_user():
    """Creates a new user. Redirects to user listing page."""
    
    user = User(
        first_name = request.form["first_name"],
        last_name  = request.form["last_name"],
        image_url  = request.form["image_url"] if request.form["image_url"] != "" else None
    )
    
    db.session.add(user)
    db.session.commit()

    return redirect("/users")

@app.route("/users/<user_id>")
@accept('text/html')
def user_page(user_id: str):
    """Renders a user's page."""

    user = User.query.get_or_404(user_id)
    return render_template("user.html", user=user)

@user_page.support('application/json')
def get_user(user_id: str):
    """Retrieves a user's data as a JSON object."""

    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@app.route("/users/<user_id>/edit", methods=["GET"])
def edit_user_page(user_id: str):
    """Renders a user's edit page."""

    user = User.query.get_or_404(user_id)
    return render_template("new_user.html", user=user)

@app.route("/users/<user_id>/edit", methods=["POST"])
def edit_user(user_id: str):
    """Edits a given user's information."""
    
    user = User.query.get_or_404(user_id)

    user.first_name = request.form["first_name"]
    user.last_name = request.form["last_name"]
    user.image_url = request.form["image_url"] if request.form["image_url"] != "" else None

    db.session.add(user)
    db.session.commit()

    return redirect("/users")

@app.route("/users/<user_id>/delete", methods=["POST"])
def delete_user(user_id: str):
    """Removes a given user from the database."""

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()

    return redirect("/users")

# == START APPLICATION =============================================================================

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
