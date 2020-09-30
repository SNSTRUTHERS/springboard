from unittest import TestCase
from app import app, Decimal
from werkzeug.datastructures import Headers
from flask import Response
from typing import *
from errors import *

class FlaskTests(TestCase):
    """A set of tests for the Currency Exchange server API."""

    def __init__(self, method_name: str = "test_html_post"):
        """Creates a new test case instance for the Currency Exchange server API."""

        self.tests = (
            (
                (),
                {'from': 'USD', 'to': 'USD', 'amount': 15}
            ),

            (
                (missing_argument_error('amount'),),
                {'from': 'USD', 'to': 'USD'}
            ),

            (
                (missing_argument_error("to"),),
                {'from': 'USD', 'amount': 15}
            ),

            (
                (missing_argument_error("from"),),
                {'to': 'USD', 'amount': 15}
            ),

            (
                (
                    missing_argument_error("from"),
                    missing_argument_error("amount")
                ),
                {'to': 'USD'}
            ),

            (
                (
                    missing_argument_error("from"),
                    missing_argument_error("to"),
                    missing_argument_error("amount")
                ),
                {}
            ),

            (
                (invalid_currency_code_error('XXD'),),
                {'from': 'USD', 'to': 'XXD', 'amount': 15}
            ),

            (
                (
                    invalid_currency_code_error('XXD'),
                    invalid_currency_code_error('XXA')
                ),
                {'from': 'XXD', 'to': 'XXA', 'amount': 15}
            ),

            (
                (
                    invalid_currency_code_error('XXD'),
                    invalid_currency_code_error('XXA'),
                    not_a_number_error('amount')
                ),
                {'from': 'XXD', 'to': 'XXA', 'amount': ""}
            ),

            (
                (
                    missing_argument_error("from"),
                    missing_argument_error("to"),
                    not_a_number_error("amount")
                ),
                {'amount': "AAA"}
            )
        )

        self.values = ('success', 'error')

        super().__init__(method_name)

    def common_test(self, test: Tuple[int, Mapping[str, Union[str, int]]], response: Response):
        """Common test for all entrypoints."""

        self.assertEqual(response.json["type"], self.values[int(bool(len(test[0])))])
        if len(test[0]) == 0:
            self.assertEqual(response.json["value"], test[1]['amount'])
        else:
            for error in test[0]:
                self.assertIn(error, response.json["errors"])
        
    def test_html_post(self):
        """Tests that the HTML form POST entrypoint from the homepage redirects
        back to the homepage."""

        with app.test_client() as client:
            response = client.post('/',
                headers={'accept': 'text/html'},
                data=self.tests[0][1]
            )

            # expect redirect to homepage
            self.assertEqual(response.status_code, 302)

    def test_json_get(self):
        """Tests the JSON GET entrypoint for proper conversion and for correct error handling."""

        with app.test_client() as client:
            for test in self.tests:
                url = '/?' + '&'.join([ f'{k}={v}' for k, v in test[1].items() ])
                response = client.get(url, headers={'accept': 'application/json'})
                self.common_test(test, response)

    def test_json_post(self):
        """Tests the JSON POST entrypoint."""

        with app.test_client() as client:
           for test in self.tests:
                response = client.post('/',
                    headers={'accept': 'application/json'},
                    json=test[1]
                )
                self.common_test(test, response)
    