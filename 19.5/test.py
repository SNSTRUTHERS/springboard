from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle

class FlaskTests(TestCase):
    """A set of tests for the Boggle game's server API."""

    def test_homepage(self):
        """Tests the homepage's required features: to maintain the
        same board across sessions and to create a new board when
        explicitly asked."""

        with app.test_client() as client:
            resp = client.get("/")
            self.assertIn(resp.status_code, {200, 302})
            prev_board = session["board"]

            # test return to prior game
            resp = client.get("/")
            self.assertEqual(resp.status_code, 200)
            self.assertEqual(session["board"], prev_board)

            # test reset/new game
            resp = client.get("/?reset=1")
            self.assertEqual(resp.status_code, 302)
            self.assertNotEqual(session["board"], prev_board)

    def test_submit(self):
        """Tests the submit entrypoint for checking if words are
        on a session's given board."""

        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session["board"] = [
                    [ 'T', 'E', 'K', 'A', 'N' ],
                    [ 'R', 'A', 'S', 'T', 'R' ],
                    [ 'X', 'M', 'T', 'C', 'E' ],
                    [ 'C', 'D', 'I', 'R', 'H' ],
                    [ 'F', 'J', 'K', 'A', 'L' ]
                ]
            
            # test words
            words = (
                ("asdaf",  Boggle.RESULT_NOT_WORD),
                ("common", Boggle.RESULT_NOT_ON_BOARD),
                ("dire",   Boggle.RESULT_OK),
                ("raster", Boggle.RESULT_OK),
                ("treat",  Boggle.RESULT_OK)
            )
            for (word, result) in words:
                resp = client.post("/submit", json={"word": word})
                self.assertEqual(resp.status_code, 200)
                self.assertIn("result", resp.json)
                self.assertEqual(resp.json["result"], result)
    
    def test_statistics(self):
        """Tests the highscore entrypoint for submitting scores,
        retrieving a session's highscore, and for incrementing the
        number of completed games a player has had."""

        with app.test_client() as client:
            resp = client.get("/highscore")
            self.assertEqual(resp.json["score"], 0)

            # update score with higher value
            client.post("/highscore", json={"score": 15})
            resp = client.get("/highscore")
            self.assertEqual(resp.json["score"], 15)
            self.assertEqual(session["games"], 1)

            # attempt to update score with lower value
            client.post("/highscore", json={"score": 10})
            resp = client.get("/highscore")
            self.assertEqual(resp.json["score"], 15)
            self.assertEqual(session["games"], 2)
