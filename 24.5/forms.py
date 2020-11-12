from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.fields.html5 import EmailField
from wtforms.validators import Email, InputRequired, Length

from models import Feedback, User

class RegisterForm(FlaskForm):
    """Form for creating a new Feedback account."""

    username = StringField(
        "Username",
        validators = [InputRequired(), Length(max=User.USERNAME_LENGTH)]
    )

    password = PasswordField(
        "Password",
        validators = [InputRequired()]
    )

    first_name = StringField(
        "First Name",
        validators = [InputRequired(), Length(min=2, max=User.NAME_LENGTH)]
    )

    last_name = StringField(
        "Last Name",
        validators = [InputRequired(), Length(min=2, max=User.NAME_LENGTH)]
    )

    email = EmailField(
        "Email",
        validators = [
            InputRequired(),
            Length(max=User.EMAIL_LENGTH),
            Email(check_deliverability=True)
        ]
    )

class LoginForm(FlaskForm):
    """Form for logging in to a Feedback account."""

    username = StringField(
        "Username",
        validators = [InputRequired(), Length(max=User.USERNAME_LENGTH)]
    )

    password = PasswordField(
        "Password",
        validators = [InputRequired()]
    )

class FeedbackForm(FlaskForm):
    """Form for creating feedback."""

    title = StringField(
        "Title",
        validators = [InputRequired(), Length(max=Feedback.TITLE_LENGTH)]
    )

    content = StringField(
        "Content",
        validators = [InputRequired()]
    )

class DeleteForm(FlaskForm):
    """Intentionally blank form used for deleting feedbacks."""
