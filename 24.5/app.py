#!/usr/bin/env python

import sys

from flask import Flask, jsonify, redirect, render_template, request, session
from flask_debugtoolbar import DebugToolbarExtension
from flaskkey import get_key
from werkzeug.exceptions import Unauthorized

from dbcred import get_database_uri
from forms import *
from models import *

# == SET UP FLASK APP ============================================================================ #

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
if app.config['SQLALCHEMY_DATABASE_URI'] is None:
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri(
        "feedback",
        cred_file = None,
        save = False
    )
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

app.config['SECRET_KEY'] = get_key()
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

# == APPLICATION ROUTES ========================================================================== #

@app.route("/")
def homepage():
    return redirect("/register")

@app.route("/register", methods=["GET", "POST"])
def register():
    """Shows the register form."""

    if "username" in session:
        return redirect(f"/users/{session['username']}")

    form = RegisterForm()

    if form.validate_on_submit():
        failed = False
        if User.query.filter_by(username=form.data["username"]).count() > 0:
            form.username.errors.append("Username already taken")
            failed = True

        if User.query.filter_by(email=form.data["email"]).count() > 0:
            form.email.errors.append("Email already taken")
            failed = True

        if failed:
            return render_template("register.html", form=form)

        data = { key: val for key, val in form.data.items() if key != "csrf_token" }
        new_user = User.register(**data)

        db.session.add(new_user)
        db.session.commit()

        session["username"] = new_user.username
        return redirect(f"/users/{new_user.username}")
    
    return render_template("register.html", form=form)

@app.route("/login", methods=["GET", "POST"])
def login():
    """Shows the login form."""

    if "username" in session:
        return redirect(f"/users/{session['username']}")

    form = LoginForm()

    if form.validate_on_submit():
        user = User.authenticate(form.data["username"], form.data["password"])
        if user is None:
            if User.query.filter_by(username=form.data["username"]).count() == 0:
                form.username.errors.append("Invalid username")
            else:
                form.password.errors.append("Invalid credentials")
            return render_template("login.html", form=form)

        session["username"] = user.username
        return redirect(f"/users/{user.username}")
    
    return render_template("login.html", form=form)

@app.route("/logout", methods=["GET"])
def logout():
    """Logs out the current user."""

    session.pop("username")
    return redirect("/login")

# ---- USER-RELATED ENTRYPOINTS ------------------------------------------------------------------ #

@app.route("/users/<username>", methods=["GET"])
def user_page(username: str):
    """Shows a user's page."""

    if "username" not in session:
        raise Unauthorized()

    user = User.query.get_or_404(username)
    form = DeleteForm()
    
    return render_template("user.html", user=user, form=form)

@app.route("/users/<username>/delete", methods=["POST"])
def delete_user(username: str):
    """Deletes a registered user."""
    
    if "username" not in session or session["username"] != username:
        raise Unauthorized()

    user = User.query.get(username)
    db.session.delete(user)
    db.session.commit()
    session.pop("username")

    return redirect("/login")

# ---- FEEDBACK-RELATED ENTRYPOINTS -------------------------------------------------------------- #

@app.route("/users/<username>/feedback/add", methods=["GET", "POST"])
def new_feedback(username: str):
    """Shows a form to add feedback for a user."""

    if "username" not in session:
        raise Unauthorized()

    form = FeedbackForm()

    if form.validate_on_submit():
        data = { key: val for key, val in form.data.items() if key != "csrf_token" }

        feedback = Feedback(**data, from_username=session["username"], to_username=username)
        db.session.add(feedback)
        db.session.commit()

        return redirect(f"/users/{username}")

    return render_template("feedback.html",
        form = form,
        username = session["username"],
        fusername = username
    )

@app.route("/feedback/<int:feedback_id>/update", methods=["GET", "POST"])
def update_feedback(feedback_id: int):
    """Shows a piece of feedback as JSON."""

    feedback = Feedback.query.get_or_404(feedback_id)

    if "username" not in session or session["username"] != feedback.from_username:
        raise Unauthorized()

    form = FeedbackForm(obj=feedback)
    if form.validate_on_submit():
        feedback.title = form.title.data
        feedback.content = form.content.data

        db.session.commit()

        return redirect(f"/users/{feedback.to_username}")

    return render_template("feedback.html",
        form = form,
        feedback = feedback,
        username = session["username"]
    )

@app.route("/feedback/<int:feedback_id>/delete", methods=["POST"])
def delete_feedback(feedback_id: int):
    """Deletes a piece of feedback."""

    feedback = Feedback.query.get_or_404(feedback_id)

    if "username" not in session or session["username"] not in {
        feedback.from_username,
        feedback.to_username
    }:
        raise Unauthorized()

    form = DeleteForm()
    if form.validate_on_submit():
        db.session.delete(feedback)
        db.session.commit()

    return redirect(f"/users/{feedback.to_username}")

# == START APPLICATION =========================================================================== #

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri(
            sys.argv[3] if len(sys.argv) > 3 else "feedback",
            sys.argv[1],
            sys.argv[2]
        )
    print(app.config['SQLALCHEMY_DATABASE_URI'])

    debug = DebugToolbarExtension(app)
    connect_db(app)
    db.create_all()
    app.run()
