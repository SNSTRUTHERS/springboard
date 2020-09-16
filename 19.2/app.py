from stories import *
from flask import Flask, request, render_template
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = "its_a_secret_to_everyone"
debug = DebugToolbarExtension(app)

@app.route("/")
def homepage():
    return render_template("form.html", prompts=story.prompts)

@app.route("/story")
def render_story():
    return render_template("story.html", text=story.generate(request.args))

if __name__ == "__main__":
    app.run()
