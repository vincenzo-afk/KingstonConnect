from flask_wtf import FlaskForm
from wtforms import StringField, DateField
from wtforms.validators import DataRequired, Length, ValidationError


def isNumber(form, field):
    if not field.data.isdigit():
        raise ValidationError('Register number is invalid.')


class InputForm(FlaskForm):
    register_no = StringField(
        label='Register No',
        validators=[
            DataRequired(message='Register number required.'),
            Length(min=8, max=20),
            isNumber,
        ]
    )
    dob = DateField(
        label='Date of Birth',
        format="%d-%m-%Y",
        validators=[DataRequired(message='Date of Birth required.')]
    )
