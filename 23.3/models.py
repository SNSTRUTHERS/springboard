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

    serialize_only = ('id', 'first_name', 'last_name', 'image_url')

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
        default = "/static/default0.png",
        nullable = False
    )

    posts = db.relationship('Post', cascade="all,delete")

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

class Post(db.Model, SerializerMixin):
    """A Blogly post."""
    
    serialize_only = ('id', 'title', 'content', 'created_at', 'updated_at', 'user_id')

    __tablename__ = "posts"

    id = db.Column(
        db.Integer,
        primary_key = True,
        autoincrement = True
    )

    title = db.Column(
        db.Text,
        nullable = False
    )

    content = db.Column(
        db.Text,
        nullable = False
    )

    created_at = db.Column(
        db.DateTime,
        nullable = False
    )

    updated_at = db.Column(
        db.DateTime,
        nullable = False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable = False
    )
    
    user = db.relationship('User')

    @property
    def created_timestamp(self):
        """Retrieve the timestamp of when a post was first created as a string."""
        return self.created_at.strftime("%d %a %Y at %H:%M:%S UTC")

    @property
    def updated_timestamp(self):
        """Retrieve the timestamp of when a post was last updated as a string."""
        return self.updated_at.strftime("%d %a %Y at %H:%M:%S UTC")

class PostTag(db.Model):
    """Tag on a Blogly post."""

    __tablename__ = "post_tags"

    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), primary_key=True)

class Tag(db.Model, SerializerMixin):
    """Blogly tag."""

    __tablename__ = "tags"

    serialize_only = ('id', 'name')

    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.Text, nullable = False, unique = True)

    posts = db.relationship('Post',
        secondary="post_tags",
        backref="tags"
    )
