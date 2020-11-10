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

class Cupcake(db.Model):
    """A cupcake."""

    __tablename__ = "cupcakes"
    DEFAULT_IMAGE = "https://tinyurl.com/demo-cupcake"

    id = db.Column(db.Integer,
        primary_key = True,
        autoincrement = True
    )
    
    flavor = db.Column(db.Text,
        nullable = False
    )
    
    size = db.Column(db.Text,
        nullable = False
    )
    
    rating = db.Column(db.Float,
        nullable = False
    )
    
    image = db.Column(db.Text,
        nullable = False,
        default = DEFAULT_IMAGE
    )

    def to_dict(self):
        """Serialize cupcake to a dict to be JSONified."""

        return {
            "id": self.id,
            "flavor": self.flavor,
            "rating": self.rating,
            "size": self.size,
            "image": self.image,
        }
