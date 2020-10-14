"""Models for Blogly."""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy_serializer import SerializerMixin

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

class User(db.Model, SerializerMixin):
    """A Blogly user."""

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key = True,
        autoincrement = True
    )

    first_name = db.Column(
        db.String(64),
        nullable = False
    )

    last_name = db.Column(
        db.String(64),
        nullable = False
    )

    image_url = db.Column(
        db.Text(),
        server_default = "/static/default0.png"
    )

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @classmethod
    def get_sorted(cls):
        """Retrieves a list of Users sorted in ascending order of last_name, first_name."""

        return cls.query.order_by(cls.last_name.asc(), cls.first_name.asc()).all()

    def __repr__(self):
        """Returns a string representation of the current User object."""
        
        return f"<User id={self.id} name={self.full_name} image_url={self.image_url}>"
