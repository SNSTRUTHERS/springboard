#!/usr/bin/env python

import sys

from flask import Flask, jsonify, request
from flask_debugtoolbar import DebugToolbarExtension
from flaskkey import get_key

from dbcred import get_database_uri
from models import *

# == SET UP FLASK APP ============================================================================ #

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
if app.config['SQLALCHEMY_DATABASE_URI'] is None:
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri(
        "cupcake",
        cred_file = None,
        save = False
    )
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

app.config['SECRET_KEY'] = get_key()
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

# == APPLICATION ROUTES ========================================================================== #

@app.route("/", methods=["GET"])
def homepage():
    return app.send_static_file("index.html")

@app.route("/api/cupcakes", methods=["GET"])
def get_cupcakes():
    """Retrieves all cupcakes in the database."""
    
    return jsonify({
        "cupcakes": [ cupcake.to_dict() for cupcake in Cupcake.query.all() ]
    })

@app.route("/api/cupcakes/<int:cupcake_id>", methods=["GET"])
def get_cupcake(cupcake_id: int):
    """Retrieves a specific cupcake from the database."""

    cupcake = Cupcake.query.get_or_404(cupcake_id)
    return jsonify({"cupcake": cupcake.to_dict()})

@app.route("/api/cupcakes", methods=["POST"])
def create_cupcake():
    """Adds a new cupcake to the database."""

    print(request.json.get('image'), type(request.json.get('image')), flush=True)
    cupcake = Cupcake(
        flavor = request.json['flavor'],
        rating = request.json['rating'],
        size =   request.json['size'],
        image =  request.json.get('image') or None 
    )

    db.session.add(cupcake)
    db.session.commit()

    return jsonify({"cupcake": cupcake.to_dict()}), 201

@app.route("/api/cupcakes/<int:cupcake_id>", methods=["PATCH"])
def update_cupcake(cupcake_id: int):
    """Updates a cupcake in the database."""

    cupcake = Cupcake.query.get_or_404(cupcake_id)

    cupcake.flavor = request.json.get('flavor', cupcake.flavor)
    cupcake.rating = request.json.get('rating', cupcake.rating)
    cupcake.size   = request.json.get('size',   cupcake.size)
    cupcake.image  = request.json.get('image',  cupcake.image)

    db.session.add(cupcake)
    db.session.commit()

    return jsonify({"cupcake": cupcake.to_dict()})

@app.route("/api/cupcakes/<int:cupcake_id>", methods=["DELETE"])
def remove_cupcake(cupcake_id: int):
    """Removes a cupcake from the database."""

    cupcake = Cupcake.query.get_or_404(cupcake_id)
    
    db.session.delete(cupcake)
    db.session.commit()

    return jsonify({"message": "Deleted"})

# == START APPLICATION =========================================================================== #

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri(
            sys.argv[3] if len(sys.argv) > 3 else "cupcake",
            sys.argv[1],
            sys.argv[2]
        )
    print(app.config['SQLALCHEMY_DATABASE_URI'])

    debug = DebugToolbarExtension(app)
    connect_db(app)
    db.create_all()
    app.run()
