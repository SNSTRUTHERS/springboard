"""Message model tests."""


import os
from unittest import TestCase

from models import db, User, Message, Likes

os.environ['DATABASE_URL'] = os.environ.get('DATABASE_URL', "postgresql:///warbler-test")

from app import app

# Create our tables (we do this here, so we only create the tables
# once for all tests --- in each test, we'll delete the data
# and create fresh new clean test data

db.create_all()


class MessageModelTestCase(TestCase):
    """Test models for messages."""

    def setUp(self):
        """Create test client, add sample data."""

        User.query.delete()
        Message.query.delete()

        self.testuser = User.signup(
            username = "testuser",
            email = "test@test.com",
            password = "testuser",
            image_url = None
        )
        self.testuser.id = 0xabcd

        self.client = app.test_client()

    def tearDown(self):
        retval = super().tearDown()
        db.session.rollback()
        return retval

    def test_message_model(self):
        """Does the basic model itself work?"""

        message = Message(text="hello world", user_id=self.testuser.id)

        db.session.add(message)
        db.session.commit()

        self.assertEqual(len(self.testuser.messages), 1)
        self.assertEqual(self.testuser.messages[0].text, "hello world")

    def test_message_likes(self):
        """Do message likes work correctly?"""

        message = Message(text="hello world", user_id=self.testuser.id)

        user = User.signup(
            username = "testuser2",
            email = "other@test.com",
            password = "abcd1234efgh5678",
            image_url = None
        )
        
        db.session.add_all((message, user))
        db.session.commit()

        user_id = user.id

        user.likes.append(message)

        db.session.commit()

        likes = Likes.query.filter(Likes.user_id == user_id).all()
        self.assertEqual(len(likes), 1)
        self.assertEqual(likes[0].message_id, message.id)
