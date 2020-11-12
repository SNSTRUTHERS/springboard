from flask import Flask
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

from typing import *

BCRYPT = Bcrypt()
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

class User(db.Model):
    """A Feedback user."""

    __tablename__ = "users"

    USERNAME_LENGTH = 20
    NAME_LENGTH = 30
    EMAIL_LENGTH = 50

    username = db.Column(db.String(USERNAME_LENGTH),
        primary_key = True
    )

    password = db.Column(db.Text,
        nullable = False
    )

    email = db.Column(db.String(EMAIL_LENGTH),
        nullable = False,
        unique = True
    )

    first_name = db.Column(db.String(NAME_LENGTH),
        nullable = False
    )

    last_name = db.Column(db.String(NAME_LENGTH),
        nullable = False
    )

    feedback = db.relationship("Feedback",
        primaryjoin = "(Feedback.to_username == User.username)",
        backref = "from",
        cascade = "all,delete"
    )

    feedback_to_others = db.relationship("Feedback",
        primaryjoin = "(Feedback.from_username == User.username)",
        backref = "to",
        cascade = "all,delete"
    )

    @classmethod
    def register(cls, username: str, password: str, **kwargs):
        """Registers a new user w/ hashed password."""

        hashed = BCRYPT.generate_password_hash(password)

        return cls(username=username, password=hashed.decode("utf8"), **kwargs)

    @classmethod
    def authenticate(cls, username: str, password: str) -> Optional:
        """Logs in a user with a given username & password."""

        user = User.query.filter_by(username=username).first()
        if user and BCRYPT.check_password_hash(user.password, password):
            return user
        return None

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Feedback(db.Model):
    """Feedback."""

    __tablename__ = "feedback"

    TITLE_LENGTH = 100

    id = db.Column(db.Integer,
        autoincrement = True,
        primary_key = True
    )

    title = db.Column(db.String(TITLE_LENGTH),
        nullable = False
    )

    content = db.Column(db.Text,
        nullable = False
    )

    from_username = db.Column(db.String(User.USERNAME_LENGTH),
        db.ForeignKey(User.username),
        nullable = False
    )

    to_username = db.Column(db.String(User.USERNAME_LENGTH),
        db.ForeignKey(User.username),
        nullable = False
    )
