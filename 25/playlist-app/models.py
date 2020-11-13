"""Models for Playlist app."""

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

class Playlist(db.Model):
    """Playlist."""

    __tablename__ = "playlists"

    id = db.Column(db.Integer,
        primary_key = True,
        autoincrement = True
    )

    name = db.Column(db.Text, nullable=False)

    description = db.Column(db.Text)

    songs = db.relationship('Song',
        secondary='playlists_songs',
        backref='playlists'
    )

class Song(db.Model):
    """Song."""

    __tablename__ = "songs"

    id = db.Column(db.Integer,
        primary_key = True,
        autoincrement = True
    )

    title = db.Column(db.Text, nullable=False)

    artist = db.Column(db.Text, nullable=False)

class PlaylistSong(db.Model):
    """Mapping of a playlist to a song."""

    __tablename__ = "playlists_songs"

    id = db.Column(db.Integer,
        primary_key = True,
        autoincrement = True
    )

    playlist_id = db.Column(db.Integer,
        db.ForeignKey(Playlist.id),
        nullable = False
    )

    song_id = db.Column(db.Integer,
        db.ForeignKey(Song.id),
        nullable = False
    )
