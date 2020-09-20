from flask import Flask, flash, request, redirect, render_template
from flask_debugtoolbar import DebugToolbarExtension

import surveys

app = Flask(__name__)
app.config['SECRET_KEY'] = "its_a_secret_to_everyone"
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
debug = DebugToolbarExtension(app)

responses = []
survey = surveys.satisfaction_survey

@app.route('/')
def homepage():
    """Renders the survey homepage."""

    return render_template("survey.html",
        title=survey.title,
        instructions=survey.instructions
    )

@app.route('/questions/<q>')
def question(q):
    """Renders a survey question page.
    Redirects the client if the question being accessed has already been completed
    or is invalid."""

    if len(responses) == len(survey.questions):
        flash("Attempted to access completed survey page; redirected")
        return redirect('/complete')

    q = int(q)
    if q != len(responses):
        flash("Attempted to access invalid/completed survey page; redirected")
        return redirect(f"/questions/{len(responses)}")

    return render_template("question.html",
        q=q,
        question=survey.questions[q].question,
        choices=survey.questions[q].choices
    )

@app.route('/answer', methods=["POST"])
def answer():
    """Handles survey question answers."""

    global responses
    responses += list(request.form.values())
    return redirect(f"/questions/{len(responses)}")

@app.route('/complete')
def complete():
    """Renders the survey complete page."""

    if len(responses) != len(survey.questions):
        flash("Attempted to access invalid/completed inaccessible survey page; redirected")
        
        return redirect(f"/questions/{len(responses)}")
    return render_template("complete.html")

if __name__ == "__main__":
    app.run()
