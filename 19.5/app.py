from boggle import Boggle
from flask import Flask, jsonify, make_response, redirect, request, render_template, session
from os import path
from secrets import token_urlsafe

def get_key(key_file: str = ".flaskkey", num_bytes: int = 64) -> str:
    """Generates a cryptographically random key and saves it
    to a given file for reuse.

    >>> get_key() == get_key()
    True
    
    Parameters
    ----------
    key_file: `str` = ".flaskkey"
        The file to save the key to.
    num_bytes: `int` = 64
        Length of the generated key in bytes.
    
    Returns
    -------
    `str`
        A random key *num_bytes* in length.
    """

    if path.exists(key_file):
        with open(key_file, 'r') as f:
            return f.read()
    else:
        key = token_urlsafe(num_bytes)
        with open(key_file, 'w') as f:
            f.write(key)
        return key

# set up application
app = Flask(__name__)
app.config["SECRET_KEY"] = get_key()
boggle = Boggle()

@app.route("/")
def homepage():
    """Renders the homepage and creates a new board for the given session."""

    board = session.get("board", None)
    if board is None or request.args.get("reset", False):
        session["board"] = boggle.make_board()
        session["words"] = {}
        return redirect("/")
    
    return render_template("board.html", board=session["board"])

@app.route("/submit", methods=["POST"])
def submit_word():
    """Handle request to check the validity of a word on a given session's board."""

    result = boggle.check_valid_word(session.get("board"), request.json["word"])
    return jsonify({ "result": result })

@app.route("/highscore", methods=["GET"])
def get_highscore():
    """Retreives the current session's highest score."""
    return jsonify({ "score": session.get("highscore", 0) })

@app.route("/highscore", methods=["POST"])
def post_highscore():
    """Posts the current session's score to the server. If larger than the highscore,
    it is overwritten with the given score.
    
    Also increments how many completed games the player has had."""
    if request.json["score"] > session.get("highscore", 0):
        session["highscore"] = request.json["score"]

    session["games"] = session.get("games", 0) + 1

    return ""

if __name__ == "__main__":
    app.run()
