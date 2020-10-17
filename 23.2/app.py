#!/usr/bin/env python

# == INCLUDES ==================================================================================== #

import sys
from datetime import datetime

# Flask stuff
from flask import flash, Flask, jsonify, make_response, redirect, render_template, request
from flask_accept import accept
from flask_debugtoolbar import DebugToolbarExtension
from flaskkey import get_key

# Database stuff
from models import *
from dbcred import get_database_uri

# Error strings
from errors import *

from typing import *

# == FLASK SET-UP ================================================================================ #

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
if app.config['SQLALCHEMY_DATABASE_URI'] is None:
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri("blogly", cred_file=None, save=False)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

app.config['SECRET_KEY'] = get_key()
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

# == CONVENIENCE FUNCTIONS ======================================================================= #

def check_for_and_strip_strparam(
    mapping: Mapping[str, str],
    key: str,
    errors: List[str],
    optional: bool = False
) -> Optional[str]:
    """Checks for an strips a string parameter name from a given parameter mapping.
    
    Parameters
    ----------
    mapping: `Mapping[str, str]`
        Set of parameters.

    key: `str`
        Parameter name.
    
    errors: `List[str]`
        List of errors to append to.

    optional: `bool` = True
        Whether or not omitting the argument is an error.

    Returns
    -------
    `Optional[str]`
        None on error; the whitespace-stripped string from mapping[key] otherwise.
    """
    
    rv = mapping.get(key)
    if rv is None and not optional:
        errors.append(missing_parameter(key))
    elif rv is not None:
        rv = rv.strip()
        if rv == "":
            errors.append(requires_nonwhitespace_chars(key))
            rv = None
        
    return rv

# == PAGE ROUTES ===================================================================================

@app.route("/")
def homepage():
    """Redirects to the user listing page."""

    return redirect("/users")

# ---- USER-RELATED STUFF ------------------------------------------------------------------------ #
# ------ LIST USERS ------------------------------------------------------------------------------ #

@app.route("/users", methods=["GET"])
@accept('text/html')
def user_listing():
    """Renders the user listing page."""

    return render_template("user_listing.html", users=User.get_sorted())

@user_listing.support('application/json')
def get_users():
    """Retrieves a list of users in the form of a JSON array."""

    return jsonify([user.to_dict() for user in User.get_sorted()])

# ------ CREATE NEW USER ------------------------------------------------------------------------- #

def new_user(data: Mapping[str, str]):
    """Creates a new user."""

    errors = []
    user = None

    first_name = check_for_and_strip_strparam(data, "first_name", errors)
    last_name = check_for_and_strip_strparam(data, "last_name", errors)
    
    image_url = data.get("image_url")
    if image_url is not None:
        image_url = image_url.strip()
        if image_url == "":
            image_url = None

    if len(errors) == 0:
        user = User(
            first_name = first_name,
            last_name  = last_name,
            image_url  = image_url
        )
        
        db.session.add(user)
        db.session.commit()

        return 200, user.id
    return 400, errors

@app.route("/users/new", methods=["POST"])
@accept("text/html")
def new_user_form():
    """Form entrypoint for creating a new user."""

    num, errors = new_user(request.form)

    if num == 200:
        return redirect(f"/users/{errors}")

    for error in errors:
        flash(error, "error")
    return redirect("/users/new")

@new_user_form.support('application/json')
def new_user_ajax():
    """AJAX entrypoint for creating a new user."""

    num, errors = new_user(request.json if request.json is not None else {})

    if num != 200:
        return make_response(jsonify({
            'type': 'error',
            'errors': errors
        }), num)
    
    return jsonify({
        'type': 'success',
        'user_id': errors
    })

@app.route("/users/new", methods=["GET"])
def new_user_page():
    """Renders the new user form page."""

    return render_template("new_user.html")

# ------ DISPLAY USER ---------------------------------------------------------------------------- #

@app.route("/users/<user_id>")
@accept('application/json')
def get_user(user_id: str):
    """Retrieves a user's data as a JSON object."""

    user = User.query.get(user_id)
    if user is None:
        return make_response(jsonify({
            'type': 'error',
            'errors': ["Invalid user ID"]
        }), 404)
    return jsonify({
        'type': 'success',
        'user': user.to_dict()
    })

@get_user.support('text/html')
def user_page(user_id: str):
    """Renders a user's page."""

    user = User.query.get_or_404(user_id)
    return render_template("user.html", user=user)

# ------ EDIT USER ------------------------------------------------------------------------------- #

def edit_user(user_id: str, data: Mapping[str, str]):
    """Edits a given user's information."""

    user = User.query.get(user_id)
    if user is None:
        return 404, ["Invalid user ID"]

    if data is None:
        data = {}

    updated = False
    errors = []

    first_name = check_for_and_strip_strparam(data, 'first_name', errors, True)
    if first_name is not None and first_name != user.first_name:
        user.first_name = first_name
        updated = True

    last_name = check_for_and_strip_strparam(data, 'last_name', errors, True)
    if last_name is not None and last_name != user.last_name:
        user.last_name = last_name
        updated = True

    image_url = check_for_and_strip_strparam(data, 'image_url', errors, True)
    if image_url != user.last_name and 'image_url' in data:
        if image_url == None:
            image_url = "/static/default0.png"
        if image_url != user.last_name:
            user.image_url = image_url
            updated = True
        
    if len(errors) > 0:
        return 400, errors

    if updated:
        db.session.add(user)
        db.session.commit()

    return 200, errors

@app.route("/users/<user_id>", methods=["PATCH"])
def edit_user_ajax(user_id: str):
    """AJAX entrypoint for editing a given user's information."""
    
    num, errors = edit_user(user_id, request.json)

    if num == 200:
        return jsonify({ 'type': 'success' })
    return make_response(jsonify({
        "type": "error",
        "errors": errors
    }), num)

@app.route("/users/<user_id>/edit", methods=["POST"])
def edit_user_form(user_id: str):
    """Form entrypoint for editing a given user's information."""
    
    num, errors = edit_user(user_id, request.form)

    if num == 200:
        return redirect(f"/users/{user_id}")
    elif num == 404:
        return 404
    
    for error in errors:
        flash(error, "error")
    return redirect(f"/users/{user_id}/edit")

@app.route("/users/<user_id>/edit", methods=["GET"])
def edit_user_page(user_id: str):
    """Renders a user's edit page."""

    user = User.query.get_or_404(user_id)
    return render_template("new_user.html", user=user)

# ------ DELETE USER ----------------------------------------------------------------------------- #

def delete_user(user: User):
    """Removes a given user from the database."""

    db.session.delete(user)
    db.session.commit()

@app.route("/users/<user_id>", methods=["DELETE"])
def delete_user_ajax(user_id: str):
    """AJAX entrypoint for removing a user from the database."""

    user = User.query.get(user_id)
    if user is None:
        return make_response(jsonify({
            'type': 'error',
            'errors': ['Invalid user ID']
        }), 404)

    delete_user(user)
    return jsonify({ 'type': 'success' })

@app.route("/users/<user_id>/delete", methods=["POST"])
def delete_user_form(user_id: str):
    """Form entrypoint for removing a user from the database."""

    user = User.query.get_or_404(user_id)
    delete_user(user)
    return redirect("/users")

# ---- POST-RELATED STUFF ------------------------------------------------------------------------ #
# ------ RETRIEVE POSTS -------------------------------------------------------------------------- #

@app.route("/users/<user_id>/posts", methods=["GET"])
@accept("application/json")
def get_posts(user_id: str):
    """Returns a JSON array of posts from a given user."""

    user = User.query.get(user_id)
    if user is None:
        return make_response(jsonify({
            'type': 'error',
            'errors': ['Invalid user ID']
        }), 404)
    return jsonify({
        'type': 'success',
        'posts': [ post.to_dict() for post in user.posts ]
    })
    
# ------ CREATE POST ----------------------------------------------------------------------------- #

def new_post(user_id: str, data: Mapping[str, str]):
    """Creates a new post."""

    errors = []
    post = None

    user = User.query.get(user_id)
    if user is None:
        return 404, ['Invalid user ID']

    title = check_for_and_strip_strparam(data, "title", errors)
    content = check_for_and_strip_strparam(data, "content", errors)

    if len(errors) == 0:
        post = Post(
            title = title,
            content = content,
            created_at = datetime.utcnow(),
            updated_at = datetime.utcnow(),
            user_id = user_id
        )

        db.session.add(post)
        db.session.commit()

        return 200, post.id

    return 400, errors

@app.route("/users/<user_id>/posts/new", methods=["POST"])
@accept("text/html")
def new_post_form(user_id: str):
    """Form entrypoint for creating a new post."""

    num, errors = new_post(user_id, request.form)
    if num == 404:
        return 404
    elif num == 200:
        return redirect(f"/posts/{errors}")
    
    for error in errors:
        flash(error, "error")
    
    return redirect(f"/users/{user_id}/posts/new")

@new_post_form.support("application/json")
def new_post_ajax(user_id: str):
    """AJAX entrypoint for creating a new post."""

    num, errors = new_post(user_id, request.json if request.json is not None else {})

    if num != 200:
        return make_response(jsonify({
            'type': 'error',
            'errors': errors
        }), num)
    
    return jsonify({'type': 'success', 'post_id': errors})

@app.route("/users/<user_id>/posts/new", methods=["GET"])
def new_post_page(user_id: str): 
    """Shows a form for a user to add a new post to a form."""

    user = User.query.get_or_404(user_id)
    return render_template("new_post.html", user=user)

# ------ SHOW POSTS ------------------------------------------------------------------------------ #

@app.route("/posts/<post_id>", methods=["GET"])
@accept("text/html")
def show_post_html(post_id: str):
    """Renders a page with a given post ID."""

    post = Post.query.get_or_404(post_id)
    return render_template("post.html", post=post)

@show_post_html.support("application/json")
def show_post_ajax(post_id: str):
    """Retrieve post data in a JSON format."""

    post = Post.query.get(post_id)
    if post is None:
        return make_response(jsonify({
            'type': 'error',
            'errors': ["Invalid post ID"]
        }), 404)
    
    return jsonify({
        'type': 'success',
        'post': post.to_dict()
    })

# ------ EDITING POSTS --------------------------------------------------------------------------- #

def edit_post(post_id: str, data: Mapping[str, str]):
    """Edits a given post."""

    errors = []

    post = Post.query.get(post_id)
    if post is None:
        return 404, ["Invalid post ID"]
    
    title = check_for_and_strip_strparam(data, 'title', errors, True)
    if title is not None and title != post.title:
        post.title = title
        updated = True
    
    content = check_for_and_strip_strparam(data, 'content', errors, True)
    if content is not None and content != post.content:
        post.content = content
        updated = True
    
    if len(errors) == 0:
        post.updated_at = datetime.utcnow()
        db.session.add(post)
        db.session.commit()

        return 200, errors
    return 400, errors

@app.route("/posts/<post_id>", methods=["PATCH"])
def edit_post_ajax(post_id: str):
    """Entrypoint for editing a post from AJAX."""

    num, errors = edit_post(post_id, request.json if request.json is not None else {})
    
    if num == 200:
        return jsonify({ 'type': 'success' })
    return make_response(jsonify({
        "type": "error",
        "errors": errors
    }), num)

@app.route("/posts/<post_id>/edit", methods=["POST"])
def edit_post_form(post_id: str):
    """Entrypoint for editing a post from the post page."""

    num, errors = edit_post(post_id, request.form)

    if num == 200:
        return redirect(f"/posts/{post_id}")
    elif num == 404:
        return 404
    
    for error in errors:
        flash(error, "error")
    return redirect(f"/posts/{post_id}/edit")

@app.route("/posts/<post_id>/edit", methods=["GET"])
def edit_post_page(post_id: str):
    """Renders a form for editing a given post."""

    post = Post.query.get_or_404(post_id)
    return render_template("new_post.html", post=post)

# ------ DELETE POST ----------------------------------------------------------------------------- #

def delete_post(post: Post):
    """Deletes a given post."""

    db.session.delete(post)
    db.session.commit()

@app.route("/posts/<post_id>", methods=["DELETE"])
def delete_post_ajax(post_id: str):
    """AJAX entrypoint for deleting a post."""

    post = Post.query.get(post_id)
    if post is None:
        return make_response(jsonify({
            'type': 'error',
            'errors': ['Invalid post ID']
        }), 404)

    delete_post(post)
    return jsonify({ 'type': 'success' })

@app.route("/posts/<post_id>/delete", methods=["POST"])
def delete_post_form(post_id: str):
    """Form entrypoint for deleting a post."""

    post = Post.query.get_or_404(post_id)
    delete_post(post)
    return redirect(f"/users/{post.user_id}")

# == START APPLICATION =========================================================================== #

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
