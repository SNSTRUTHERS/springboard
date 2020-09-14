from flask import Flask
app = Flask(__name__)

@app.route("/welcome")
def welcome():
    """Greets the user with "welcome""""

    return "welcome"

@app.route("/welcome/home")
def welcome_home():
    """Greets the user with "welcome home""""

    return "welcome home"

@app.route("/welcome/back")
def welcome_back():
    """Greets the user with "welcome back""""

    return "welcome back"

if __name__ == "__main__":
    app.run()
