from unittest import TestCase

from app import app
from models import *

from dbcred import get_database_uri

import re

app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri("blogly_test", save=False)
app.config['SQLALCHEMY_ECHO'] = False

connect_db(app)
db.drop_all()
db.create_all()

class FlaskTests(TestCase):
    """Tests for Blogly routes."""

    def __init__(self, method_name):
        self.ul_regex = re.compile(r".*?<ul>\n*(.*?)\n*</ul>", re.M | re.S)
        self.li_regex = re.compile(r"<li>.*<a.*?>\n*(.*?)\n*</a>.*</li>", re.M | re.S)

        self.first_name_regex = re.compile(
            r".*?<input.*?id=\"first_name\".*value=\"(.*?)\".*?name=\"first_name\".*>",
            re.M | re.S
        )
        self.last_name_regex = re.compile(
            r".*?<input.*?id=\"last_name\".*value=\"(.*?)\".*?name=\"last_name\".*>",
            re.M | re.S
        )
        self.image_url_regex = re.compile(
            r".*?<input.*?id=\"image_url\".*value=\"(.*?)\".*?name=\"image_url\".*>",
            re.M | re.S
        )

        self.users = (
            {'first_name': "John", 'last_name': "Sir"},
            {'first_name': "Steve", 'last_name': "Ross"},
            {'first_name': "Ethan", 'last_name': "Byrd"}
        )

        super().__init__(method_name)

    def setUp(self):
        """Clean up any existing Users."""

        User.query.delete()
        
        for user in self.users:
            db.session.add(User(**user))
        db.session.commit()
    
    def tearDown(self):
        """Clean up any erroneous database transactions."""

        db.session.rollback()

    def test_homepage(self):
        """Tests that the homepage is a redirect."""

        with app.test_client() as client:
            response = client.get("/")
            self.assertEqual(response.status_code, 302)

    def test_user_listing_html(self):
        """Tests that the user listing HTML route is sorted."""

        with app.test_client() as client:
            response = client.get('/users',
                headers = {'accept': 'text/html'}
            )
            self.assertEqual(response.status_code, 200)
            
            match = self.ul_regex.match(str(response.data))
            self.assertIsNotNone(match)

            lst = match.group(1)
            i = 0
            prev = None
            while match:
                match = self.li_regex.match(lst, i)

                if not match:
                    break
                
                first, last = match.group(1).split(' ', 1)
                if not prev:
                    prev = (first, last)
                    continue

                l = [prev[1], last]
                l.sort()
                self.assertEqual(l[0], prev[1])

                if l[0] == l[1]:
                    l = [prev[0], first]
                    l.sort()
                    self.assertEqual(l[0], prev[0])

    def test_user_listing_json(self):
        """Tests that the user listing JSON route is sorted."""

        with app.test_client() as client:
            response = client.get('/users',
                headers = {'accept': 'application/json'}
            )
            self.assertEqual(response.status_code, 200)

            json = response.get_json()
            self.assertIsNotNone(json)

            if len(json) > 0:
                prev = json[0]
                for user in json[1:]:
                    l = [prev['last_name'], user['last_name']]
                    l.sort()
                    self.assertEqual(l[0], prev['last_name'])

                    if l[0] == l[1]:
                        l = [prev['first_name'], user['first_name']]
                        l.sort()
                        self.assertEqual(l[0], prev['first_name'])
    
    def test_edit_user(self):
        """Tests that an edit user page displays the proper data."""
        
        with app.test_client() as client:
            users = User.get_sorted()
            max_id = 0

            for user in users:
                max_id = max(max_id, user.id)

                response = client.get(f'/users/{user.id}/edit')
                self.assertEqual(response.status_code, 200)

                data = str(response.data)

                match = self.first_name_regex.match(data)
                self.assertIsNotNone(match)
                self.assertEqual(match.group(1), user.first_name)
                
                match = self.last_name_regex.match(data)
                self.assertIsNotNone(match)
                self.assertEqual(match.group(1), user.last_name)
                
                match = self.image_url_regex.match(data)
                self.assertIsNotNone(match)
                self.assertEqual(match.group(1), user.image_url)

            # invalid user should 404
            response = client.get(f'/users/{max_id + 1}/edit')
            self.assertEqual(response.status_code, 404)

    def test_json_user(self):
        """Tests that a user JSON is in the correct format."""

        with app.test_client() as client:
            max_id = 0

            for user in User.query.all():
                max_id = max(max_id, user.id)

                response = client.get(f'/users/{user.id}',
                    headers = {'accept': 'application/json'}
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json['first_name'], user.first_name)
                self.assertEqual(response.json['last_name'], user.last_name)
                self.assertEqual(response.json['image_url'], user.image_url)

            # invalid user should 404
            response = client.get(f'/users/{max_id + 1}',
                headers = {'accept': 'application/json'}
            )
            self.assertEqual(response.status_code, 404)
