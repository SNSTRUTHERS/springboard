#!/usr/bin/env python

from flask import Flask, flash, redirect, render_template
from flask_debugtoolbar import DebugToolbarExtension
from flaskkey import get_key

from models import db, connect_db, Playlist, Song, PlaylistSong
from forms import NewSongForPlaylistForm, SongForm, PlaylistForm

from dbcred import get_database_uri

import sys

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
if app.config['SQLALCHEMY_DATABASE_URI'] is None:
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri(
        "playlist-app",
        cred_file = None,
        save = False
    )
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

connect_db(app)
db.create_all()

app.config['SECRET_KEY'] = get_key()

debug = DebugToolbarExtension(app)
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

# == ROUTES ====================================================================================== #

@app.route("/")
def root():
    """Homepage: redirect to /playlists."""

    return redirect("/playlists")

# ---- PLAYLIST ROUTES --------------------------------------------------------------------------- #

@app.route("/playlists")
def show_all_playlists():
    """Return a list of playlists."""

    playlists = Playlist.query.all()
    return render_template("playlists.html", playlists=playlists)

@app.route("/playlists/<int:playlist_id>")
def show_playlist(playlist_id: int):
    """Show detail on specific playlist."""

    playlist = Playlist.query.get_or_404(playlist_id)
    return render_template("playlist.html", playlist=playlist)

@app.route("/playlists/add", methods=["GET", "POST"])
def add_playlist():
    """Handle add-playlist form:

    - if form not filled out or invalid: show form
    - if valid: add playlist to SQLA and redirect to list-of-playlists
    """

    form = PlaylistForm()

    if form.validate_on_submit():
        data = { key: val for key, val in form.data.items() if key != "csrf_token" }
        playlist = Playlist(**data)

        db.session.add(playlist)
        db.session.commit()

        return redirect("/playlists")

    return render_template("new_playlist.html", form=form)

# ---- SONG ROUTES ------------------------------------------------------------------------------- #

@app.route("/songs")
def show_all_songs():
    """Show list of songs."""

    songs = Song.query.all()
    return render_template("songs.html", songs=songs)

@app.route("/songs/<int:song_id>")
def show_song(song_id: int):
    """return a specific song"""

    song = Song.query.get_or_404(song_id)
    return render_template("song.html", song=song)

@app.route("/songs/add", methods=["GET", "POST"])
def add_song():
    """Handle add-song form:

    - if form not filled out or invalid: show form
    - if valid: add playlist to SQLA and redirect to list-of-songs
    """

    form = SongForm()

    if form.validate_on_submit():
        data = { key: val for key, val in form.data.items() if key != "csrf_token" }
        song = Song(**data)

        db.session.add(song)
        db.session.commit()

        return redirect("/songs")

    return render_template("new_song.html", form=form)

@app.route("/playlists/<int:playlist_id>/add-song", methods=["GET", "POST"])
def add_song_to_playlist(playlist_id):
    """Add a playlist and redirect to list."""

    playlist = Playlist.query.get_or_404(playlist_id)
    form = NewSongForPlaylistForm()

    # Restrict form to songs not already on this playlist
    curr_on_playlist = [ song.id for song in playlist.songs ]
    form.song.choices = [
        (song.id, song.title) for song in Song.query.filter(
            Song.id.notin_(curr_on_playlist)
        ).all()
    ]

    if len(form.song.choices) == 0:
        flash("No songs are available to add to this playlist.")
        return redirect(f"/playlists/{playlist_id}")

    if form.validate_on_submit():
        playlist_song = PlaylistSong(song_id=form.song.data, playlist_id=playlist_id)
          
        db.session.add(playlist_song)
        db.session.commit()

        return redirect(f"/playlists/{playlist_id}")

    return render_template("add_song_to_playlist.html",
        playlist = playlist,
        form = form
    )

# == RUN APPLICATION ============================================================================= #

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri(
            sys.argv[3] if len(sys.argv) > 3 else "playlist-app",
            sys.argv[1],
            sys.argv[2]
        )

    connect_db(app)
    db.create_all()
    app.run()
