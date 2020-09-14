from flask import Flask, request
import operations as operations
app = Flask(__name__)

@app.route("/add")
def add():
    """Add query params "a" and "b""""
    
    return str(operations.add(int(request.args["a"]), int(request.args["b"])))

@app.route("/sub")
def sub():
    """Subtract query params "a" and "b""""

    return str(operations.sub(int(request.args["a"]), int(request.args["b"])))

@app.route("/mult")
def mult():
    """Multiply query params "a" and "b""""

    return str(operations.mult(int(request.args["a"]), int(request.args["b"])))

@app.route("/div")
def div():
    """Divide query params "a" and "b""""

    return str(operations.div(int(request.args["a"]), int(request.args["b"])))


@app.route("/math/<operation>")
def math(operation):
    """Perform a mathematical operation on query params "a" and "b""""

    if hasattr(operations, operation):
        callback = getattr(operations, operation)
        return str(callback(int(request.args["a"]), int(request.args["b"])))

if __name__ == "__main__":
    app.run()
