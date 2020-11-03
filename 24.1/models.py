from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def connect_db(app: Flask):
    """Connects a Flask application to the database.

    Parameters
    ==========
    app `Flask`
        The Flask application to connect.
    """

    db.app = app
    db.init_app(app)

# == DATABASE MODELS ============================================================================= #

class Pet(db.Model):
    """A pet."""

    __tablename__ = "pets"
    DEFAULT_IMAGE = "/static/pets/default0.png"

    id = db.Column(
        db.Integer,
        primary_key = True,
        autoincrement = True
    )

    name = db.Column(
        db.Text,
        nullable = False
    )

    species = db.Column(
        db.Text,
        nullable = False
    )

    photo_url = db.Column(
        db.Text,
        default = DEFAULT_IMAGE
    )

    age = db.Column(db.Integer)

    notes = db.Column(db.Text)

    available = db.Column(
        db.Boolean,
        default = True
    )

    def image_url(self):
        return self.photo_url or Pet.DEFAULT_IMAGE
