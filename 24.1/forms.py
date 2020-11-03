from flask_wtf import FlaskForm
from wtforms import BooleanField, IntegerField, SelectField, StringField, TextAreaField
from wtforms.validators import InputRequired, Length, NumberRange, Optional, URL

SPECIES_OPTIONS = ('cat', 'dog', 'porcupine', 'bird')

class AddPetForm(FlaskForm):
    """Form for adding a new pet."""

    name = StringField(
        "Pet Name",
        validators = [InputRequired()]
    )

    species = SelectField(
        "Species",
        choices = [ (species, species.capitalize()) for species in SPECIES_OPTIONS ]
    )

    photo_url = StringField(
        "Photo URL",
        validators = [Optional(), URL()]
    )

    age = IntegerField(
        "Age",
        validators = [Optional(), NumberRange(min=0, max=30)]
    )

    notes = TextAreaField(
        "Comments",
        validators = [Optional(), Length(min=10)],
    )

class EditPetForm(FlaskForm):
    """Form for editing an existing pet."""

    photo_url = StringField(
        "Photo URL",
        validators = [Optional(), URL()]
    )

    notes = TextAreaField(
        "Comments",
        validators = [Optional(), Length(min=10)],
    )

    available = BooleanField("Available?")
