"""User View tests."""


import os
from unittest import TestCase

from models import db, User, Message, Likes, Follows

os.environ['DATABASE_URL'] = os.environ.get('DATABASE_URL', "postgresql:///warbler-test")

from app import app, CURR_USER_KEY

# Create our tables (we do this here, so we only create the tables
# once for all tests --- in each test, we'll delete the data
# and create fresh new clean test data

db.create_all()


app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False


class UserViewTestCase(TestCase):
    """Test views for users."""

    def setUp(self):
        """Create test client, add sample data."""

        User.query.delete()
        Message.query.delete()

        self.client = app.test_client()

        self.testuser = User.signup(
            username = "alice",
            email = "test@test.com",
            password = "testuser",
            image_url = None
        )

        self.testuser2 = User.signup(
            username = "bob",
            email = "other@test.com",
            password = "abcd1234efgh5678",
            image_url = None
        )

        self.testuser3 = User.signup(
            username = "carl",
            email = "number3@test.com",
            password = "djafaklmra",
            image_url = None
        )

        self.testuser4 = User.signup(
            username = "alvin",
            email = "alvin@test.com",
            password = "8675309",
            image_url = None
        )

        db.session.commit()

    def tearDown(self):
        retval = super().tearDown()
        db.session.rollback()
        return retval

    def test_index(self):
        """Checks that the index lists all users."""

        with self.client as c:
            response = c.get("/users")
            data = str(response.data)

            self.assertIn("@alice", data)
            self.assertIn("@bob", data)
            self.assertIn("@carl", data)
            self.assertIn("@alvin", data)

    def test_search(self):
        """Test that searching for a user works as expected."""

        with self.client as c:
            response = c.get("/users?q=al")
            data = str(response.data)

            self.assertIn("@alice", data)
            self.assertIn("@alvin", data)

            self.assertNotIn("@bob", data)
            self.assertNotIn("@carl", data)

    def test_show(self):
        """Test that a valid user page loads."""

        with self.client as c:
            response = c.get(f"/users/{self.testuser.id}")

            self.assertEqual(response.status_code, 200)
            self.assertIn("@alice", str(response.data))

    def test_like(self):
        """Tests that liking a message works correctly."""

        message = Message(text="hello world", user_id=self.testuser2.id)
        
        db.session.add(message)
        db.session.commit()
        
        message_id = message.id

        with self.client as c:
            with c.session_transaction() as session:
                session[CURR_USER_KEY] = self.testuser.id
            
            response = c.post(f"/messages/{message_id}/like", follow_redirects=True)
            
            self.assertEqual(response.status_code, 200)

            likes = Likes.query.filter(Likes.message_id==message_id).all()
            self.assertEqual(len(likes), 1)
            self.assertEqual(likes[0].user_id, self.testuser.id)

    def test_unlike(self):
        """Tests that unliking a message works correctly."""

        message = Message(text="hello world", user_id=self.testuser2.id)
        
        db.session.add(message)
        db.session.commit()

        like = Likes(message_id=message.id, user_id=self.testuser.id)
        
        db.session.add(like)
        db.session.commit()
        
        message_id = message.id

        with self.client as c:
            with c.session_transaction() as session:
                session[CURR_USER_KEY] = self.testuser.id
            
            response = c.post(f"/messages/{message_id}/like", follow_redirects=True)
            
            self.assertEqual(response.status_code, 200)

            likes = Likes.query.filter(Likes.message_id==message_id).all()
            self.assertEqual(len(likes), 0)

    def test_unauthorized_like(self):
        """Tests that attempting to like/unlike a message whilst unauthorized is rejected."""

        message = Message(text="hello world", user_id=self.testuser2.id)
        
        db.session.add(message)
        db.session.commit()

        like = Likes(message_id=message.id, user_id=self.testuser.id)
        
        db.session.add(like)
        db.session.commit()
        
        message_id = message.id

        with self.client as c:
            response = c.post(f"/messages/{message_id}/like", follow_redirects=True)
            
            self.assertEqual(response.status_code, 200)
            self.assertIn("Access unauthorized", str(response.data))

            likes = Likes.query.filter(Likes.message_id==message_id).all()
            self.assertEqual(len(likes), Likes.query.count())

    def test_following(self):
        """Tests that a user's following page works correctly."""

        follow1 = Follows(
            user_being_followed_id = self.testuser2.id,
            user_following_id = self.testuser.id
        )
        follow2 = Follows(
            user_being_followed_id = self.testuser3.id,
            user_following_id = self.testuser.id
        )

        db.session.add_all((follow1, follow2))
        db.session.commit()

        with self.client as c:
            with c.session_transaction() as session:
                session[CURR_USER_KEY] = self.testuser.id
            
            response = c.get(f"/users/{self.testuser.id}/following")
            data = str(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertIn("@bob", data)
            self.assertIn("@carl", data)
            self.assertNotIn("@alvin", data)

    def test_followers(self):
        """Tests that a user's followers page works correctly."""

        follow1 = Follows(
            user_being_followed_id = self.testuser.id,
            user_following_id = self.testuser2.id
        )
        follow2 = Follows(
            user_being_followed_id = self.testuser3.id,
            user_following_id = self.testuser.id
        )

        db.session.add_all((follow1, follow2))
        db.session.commit()

        with self.client as c:
            with c.session_transaction() as session:
                session[CURR_USER_KEY] = self.testuser.id
            
            response = c.get(f"/users/{self.testuser.id}/followers")
            data = str(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertIn("@bob", data)
            self.assertNotIn("@carl", data)
            self.assertNotIn("@alvin", data)

    def test_unauthorized_following(self):
        """Tests that accessing a following page without credentials is rejected."""

        follow = Follows(
            user_being_followed_id = self.testuser2.id,
            user_following_id = self.testuser.id
        )

        db.session.add(follow)
        db.session.commit()

        with self.client as c:
            response = c.get(f"/users/{self.testuser.id}/following", follow_redirects=True)
            data = str(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertNotIn("@bob", data)
            self.assertIn("Access unauthorized", data)

    def test_unauthorized_followers(self):
        """Tests that accessing a followers page without credentials is rejected."""

        follow = Follows(
            user_being_followed_id = self.testuser.id,
            user_following_id = self.testuser2.id
        )

        db.session.add(follow)
        db.session.commit()

        with self.client as c:
            response = c.get(f"/users/{self.testuser.id}/followers", follow_redirects=True)
            data = str(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertNotIn("@bob", data)
            self.assertIn("Access unauthorized", data)
