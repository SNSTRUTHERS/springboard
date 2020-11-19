"""User model tests."""

# run these tests like:
#
#    python -m unittest test_user_model.py


import os
from unittest import TestCase
from sqlalchemy.exc import IntegrityError

from models import db, User, Message, Follows

# BEFORE we import our app, let's set an environmental variable
# to use a different database for tests (we need to do this
# before we import our app, since that will have already
# connected to the database

os.environ['DATABASE_URL'] = os.environ.get('DATABASE_URL', "postgresql:///warbler-test")


# Now we can import app

from app import app

# Create our tables (we do this here, so we only create the tables
# once for all tests --- in each test, we'll delete the data
# and create fresh new clean test data

db.create_all()


class UserModelTestCase(TestCase):
    """Test views for messages."""

    def setUp(self):
        """Create test client, add sample data."""

        User.query.delete()
        Message.query.delete()
        Follows.query.delete()

        self.testuser = User.signup(
            username = "testuser",
            email = "test@test.com",
            password = "testuser",
            image_url = None
        )
        self.testuser.id = 0xabcd

        self.testuser2 = User.signup(
            username = "testuser2",
            email = "other@test.com",
            password = "abcd1234efgh5678",
            image_url = None
        )
        self.testuser2.id = 0xdcba

        db.session.commit()

        self.client = app.test_client()

    def tearDown(self):
        retval = super().tearDown()
        db.session.rollback()
        return retval

    def test_user_model(self):
        """Does basic model work?"""

        u = User(
            email="number3@test.com",
            username="testuser3",
            password="HASHED_PASSWORD"
        )

        db.session.add(u)
        db.session.commit()

        # User should have no messages & no followers
        self.assertEqual(len(u.messages), 0)
        self.assertEqual(len(u.followers), 0)

    def test_user_follows(self):
        """Tests the following/followers relationships."""

        self.testuser.following.append(self.testuser2)
        db.session.commit()

        self.assertEqual(len(self.testuser.followers), 0)
        self.assertEqual(len(self.testuser.following), 1)
        self.assertEqual(len(self.testuser2.followers), 1)
        self.assertEqual(len(self.testuser2.following), 0)

        self.assertEqual(self.testuser.following[0].id, self.testuser2.id)
        self.assertEqual(self.testuser2.followers[0].id, self.testuser.id)

    def test_is_following(self):
        """Tests the is_following function."""

        self.testuser.following.append(self.testuser2)
        db.session.commit()

        self.assertTrue(self.testuser.is_following(self.testuser2))
        self.assertFalse(self.testuser2.is_following(self.testuser))
    
    def test_is_followed_by(self):
        """Tests the is_followed_by function."""

        self.testuser.following.append(self.testuser2)
        db.session.commit()

        self.assertTrue(self.testuser2.is_followed_by(self.testuser))
        self.assertFalse(self.testuser.is_followed_by(self.testuser2))

    def test_authentication(self):
        """Tests the authenticate function."""

        user = User.authenticate(self.testuser.username, "testuser")
        self.assertIsNot(user, False)
        self.assertEqual(user.id, self.testuser.id)

    def test_invalid_username(self):
        """Tests that unregistered usernames aren't valid for authentication."""

        self.assertFalse(User.authenticate("nvidia", "sucks"))

    def test_invalid_credentials(self):
        """Tests that invalid credentials aren't valid for authentication."""

        self.assertFalse(User.authenticate(self.testuser.username, "x86_32"))

    def test_register(self):
        """Tests that registration works correctly."""

        user = User.signup("testuser3", "number3@gmail.com", "password", None)
        user_id = 0xbeef
        user.id = user_id
        db.session.commit()

        user = User.query.get(user_id)
        
        self.assertIsNotNone(user)
        self.assertEqual(user.username, "testuser3")
        self.assertEqual(user.email, "number3@gmail.com")
        self.assertNotEqual(user.password, "password")
    
    def test_bad_username_register(self):
        """Tests that registering with an invalid username is rejected."""

        user = User.signup(None, "number3@gmail.com", "password", None)
        user_id = 0xbeef
        user.id = user_id

        with self.assertRaises(IntegrityError) as context:
            db.session.commit()
        
    def test_bad_email_register(self):
        """Tests that registering with an invalid username is rejected."""

        user = User.signup("testuser3", None, "password", None)
        user_id = 0xbeef
        user.id = user_id

        with self.assertRaises(IntegrityError) as context:
            db.session.commit()

    def test_bad_password_register(self):
        """Tests that registering with an invalid password is rejected."""

        with self.assertRaises(ValueError) as context:
            User.signup("testuser3", "number3@gmail.com", "", None)
        
        with self.assertRaises(ValueError) as context:
            User.signup("testuser3", "number3@gmail.com", None, None)
