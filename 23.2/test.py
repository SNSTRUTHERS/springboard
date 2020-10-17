from unittest import TestCase

from app import app
from models import *
from errors import *

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

        db.drop_all()
        db.create_all()

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
    
    def test_edit_user_page(self):
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

    def test_get_user_ajax(self):
        """Tests the AJAX entrypoint for retrieving a user."""

        with app.test_client() as client:
            max_id = 0

            for user in User.query.all():
                max_id = max(max_id, user.id)

                response = client.get(f'/users/{user.id}',
                    headers = { 'accept': 'application/json' }
                )
                self.assertEqual(response.status_code, 200)
                self.assertIsNotNone(response.json.get('type'))
                self.assertEqual(response.json['type'], 'success')

                juser = response.json['user']
                self.assertEqual(juser['first_name'], user.first_name)
                self.assertEqual(juser['last_name'], user.last_name)
                self.assertEqual(juser['image_url'], user.image_url)

            # invalid user should 404
            response = client.get(f'/users/{max_id + 1}',
                headers = {'accept': 'application/json'}
            )
            self.assertEqual(response.status_code, 404)
            self.assertIsNotNone(response.json.get('type'))
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(response.json['errors'][0], 'Invalid user ID')

    def test_new_user_ajax(self):
        """Tests the AJAX entrypoint for creating a new user."""

        with app.test_client() as client:
            response = client.post('/users/new',
                json = { 'first_name': "Simon", 'last_name': "Bolivar" },
                headers = { 'accept': 'application/json' }
            )
            self.assertEqual(response.status_code, 200)
            self.assertIsNotNone(response.json.get('type'))
            self.assertEqual(response.json['type'], 'success')
            self.assertIsNotNone(response.json.get('user_id'))
            self.assertGreater(response.json['user_id'], 0)

            response = client.post('/users/new',
                json = { 'first_name': "   ", 'last_name': "Bolivar" },
                headers = { 'accept': 'application/json' }
            )
            self.assertEqual(response.status_code, 400)
            self.assertIsNotNone(response.json.get('type'))
            self.assertEqual(response.json['type'], 'error')
            self.assertIsNotNone(response.json.get('errors'))
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(
                response.json['errors'][0],
                requires_nonwhitespace_chars('first_name')
            )

            response = client.post('/users/new',
                json = { 'first_name': "Simon", 'last_name': "" },
                headers = { 'accept': 'application/json' }
            )
            self.assertEqual(response.status_code, 400)
            self.assertIsNotNone(response.json.get('type'))
            self.assertEqual(response.json['type'], 'error')
            self.assertIsNotNone(response.json.get('errors'))
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(
                response.json['errors'][0],
                requires_nonwhitespace_chars('last_name')
            )

            response = client.post('/users/new',
                json = { 'first_name': "", 'last_name': "" },
                headers = { 'accept': 'application/json' }
            )
            self.assertEqual(response.status_code, 400)
            self.assertIsNotNone(response.json.get('type'))
            self.assertEqual(response.json['type'], 'error')
            self.assertIsNotNone(response.json.get('errors'))
            self.assertEqual(len(response.json['errors']), 2)
            self.assertIn(
                requires_nonwhitespace_chars('first_name'),
                response.json['errors']
            )
            self.assertIn(
                requires_nonwhitespace_chars('last_name'),
                response.json['errors']
            )

            response = client.post('/users/new',
                json = { 'last_name': "" },
                headers = { 'accept': 'application/json' }
            )
            self.assertEqual(response.status_code, 400)
            self.assertIsNotNone(response.json.get('type'))
            self.assertEqual(response.json['type'], 'error')
            self.assertIsNotNone(response.json.get('errors'))
            self.assertEqual(len(response.json['errors']), 2)
            self.assertIn(
                missing_parameter('first_name'),
                response.json['errors']
            )
            self.assertIn(
                requires_nonwhitespace_chars('last_name'),
                response.json['errors']
            )

    def test_edit_user_ajax(self):
        """Tests the AJAX entrypoint for editing a user."""

        with app.test_client() as client:
            response = client.patch('/users/1000')
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(response.json['errors'][0], 'Invalid user ID')

            first_user = User.query.first()
            response = client.patch(f'/users/{first_user.id}')
            self.assertEqual(response.status_code, 200)
            
            first_user.first_name = "Lindsay"
            response = client.patch(f'/users/{first_user.id}',
                json = { 'first_name': first_user.first_name }
            )
            self.assertEqual(response.status_code, 200)
            juser = client.get(f'/users/{first_user.id}',
                headers = { 'accept': 'application/json' }
            ).json['user']
            self.assertEqual(juser['first_name'], first_user.first_name)
            self.assertEqual(juser['last_name'],  first_user.last_name)
            self.assertEqual(juser['image_url'],  first_user.image_url)
            
            first_user.last_name = "Graham"
            response = client.patch(f'/users/{first_user.id}',
                json = { 'last_name': first_user.last_name }
            )
            self.assertEqual(response.status_code, 200)
            juser = client.get(f'/users/{first_user.id}',
                headers = { 'accept': 'application/json' }
            ).json['user']
            self.assertEqual(juser['first_name'], first_user.first_name)
            self.assertEqual(juser['last_name'],  first_user.last_name)
            self.assertEqual(juser['image_url'],  first_user.image_url)
            
            response = client.patch(f'/users/{first_user.id}',
                json = { 'first_name': "  ", 'last_name': "" }
            )
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 2)
            self.assertIn(
                requires_nonwhitespace_chars('first_name'),
                response.json['errors']
            )
            self.assertIn(
                requires_nonwhitespace_chars('last_name'),
                response.json['errors']
            )

    def test_new_post_ajax(self):
        """Tests the AJAX entrypoint for creating a new post."""
        
        with app.test_client() as client:
            response = client.post('/users/1000/posts/new',
                headers = { "accept": "application/json" },
                json = { 'title': "Hello World", 'content': "Test content" }
            )
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(response.json['errors'][0], 'Invalid user ID')

            first_user = User.query.first()
            response = client.post(f'/users/{first_user.id}/posts/new',
                headers = { "accept": "application/json" }
            )
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 2)
            self.assertIn(
                missing_parameter('title'),
                response.json['errors']
            )
            self.assertIn(
                missing_parameter('content'),
                response.json['errors']
            )

            response = client.post(f'/users/{first_user.id}/posts/new',
                json = { 'title': "Hello World", 'content': "Test content" },
                headers = { "accept": "application/json" }
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['type'], 'success')

    def test_get_post_ajax(self):
        """Tests the AJAX entrypoint for retrieving a given post."""
        
        with app.test_client() as client:
            response = client.get('/posts/1000',
                headers = { "accept": "application/json" }
            )
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(response.json['errors'][0], 'Invalid post ID')

            first_user = User.query.first()
            title = "Hello World"
            content = "Test content"
            response = client.post(f'/users/{first_user.id}/posts/new',
                json = { 'title': title, 'content': content },
                headers = { "accept": "application/json" }
            )
            post_id = response.json['post_id']

            response = client.get(f'/posts/{post_id}',
                headers = { "accept": "application/json" }
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['type'], 'success')
            jpost = response.json['post']
            self.assertEqual(jpost['user_id'], first_user.id)
            self.assertEqual(jpost['title'], title)
            self.assertEqual(jpost['content'], content)

    def test_get_posts_ajax(self):
        """Tests the AJAX entrypoint for retrieving a user's posts."""

        with app.test_client() as client:
            response = client.get('/users/1000/posts',
                headers = { "accept": "application/json" }
            )
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(response.json['errors'][0], 'Invalid user ID')

            first_user = User.query.first()
            response = client.get(f'/users/{first_user.id}/posts',
                headers = { "accept": "application/json" }
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.json['posts']), 0)

            response = client.post(f'/users/{first_user.id}/posts/new',
                json = { 'title': "Hello World", 'content': "Test content" },
                headers = { "accept": "application/json" }
            )
            post_id = response.json['post_id']

            first_user = User.query.first()
            response = client.get(f'/users/{first_user.id}/posts',
                headers = { "accept": "application/json" }
            )
            self.assertEqual(len(response.json['posts']), 1)
            self.assertEqual(response.json['posts'][0]['id'], post_id)
            self.assertEqual(response.json['posts'][0]['user_id'], first_user.id)

    def test_edit_post_ajax(self):
        """Tests the AJAX entrypoint for editing an existing post."""

        with app.test_client() as client:
            response = client.patch('/posts/1000')
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(response.json['errors'][0], 'Invalid post ID')

            title = "Hello World"
            content = "Test content"

            first_user = User.query.first()
            response = client.post(f'/users/{first_user.id}/posts/new',
                json = { 'title': title, 'content': content },
                headers = { "accept": "application/json" }
            )
            post_id = response.json['post_id']

            response = client.patch(f'/posts/{post_id}',
                json = { 'title': "" }
            )
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(
                response.json['errors'][0],
                requires_nonwhitespace_chars('title')
            )

            response = client.patch(f'/posts/{post_id}',
                json = { 'content': "" }
            )
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(
                response.json['errors'][0],
                requires_nonwhitespace_chars('content')
            )

            content = "New string"
            response = client.patch(f'/posts/{post_id}',
                json = { 'content': content }
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['type'], 'success')

            response = client.get(f'/posts/{post_id}',
                headers = { "accept": "application/json" }
            )
            jpost = response.json['post']
            self.assertEqual(jpost['title'], title)
            self.assertEqual(jpost['content'], content)

    def test_delete_post_ajax(self):
        """Tests the AJAX entrypoint for deleting an existing post."""

        with app.test_client() as client:
            response = client.delete('/posts/1000')
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json['type'], 'error')
            self.assertEqual(len(response.json['errors']), 1)
            self.assertEqual(response.json['errors'][0], 'Invalid post ID')

            first_user = User.query.first()
            response = client.post(f'/users/{first_user.id}/posts/new',
                json = { 'title': "A", 'content': "B" },
                headers = { "accept": "application/json" }
            )
            post_id = response.json['post_id']
            response = client.delete(f'/posts/{post_id}')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['type'], 'success')
            self.assertIsNone(Post.query.get(post_id))
