from unittest import TestCase

from app import app
from models import connect_db, Cupcake, db
from dbcred import get_database_uri

# Use test database and don't clutter tests with SQL
app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri(
    "cupcake_test",
    save = False
)
app.config['SQLALCHEMY_ECHO'] = False

# Make Flask errors be real errors, rather than HTML pages with error info
app.config['TESTING'] = True

connect_db(app)
db.drop_all()
db.create_all()

CUPCAKE_DATA = {
    "flavor": "TestFlavor",
    "size": "TestSize",
    "rating": 5.0,
    "image": "http://test.com/cupcake.jpg"
}

CUPCAKE_DATA_2 = {
    "flavor": "TestFlavor2",
    "size": "TestSize2",
    "rating": 10.0,
    "image": "http://test.com/cupcake2.jpg"
}


class CupcakeViewsTestCase(TestCase):
    """Tests for views of API."""

    def setUp(self):
        """Make demo data."""

        Cupcake.query.delete()

        cupcake = Cupcake(**CUPCAKE_DATA)
        db.session.add(cupcake)
        db.session.commit()

        self.cupcake = cupcake

    def tearDown(self):
        """Clean up fouled transactions."""

        db.session.rollback()

    def test_list_cupcakes(self):
        with app.test_client() as client:
            response = client.get("/api/cupcakes")

            self.assertEqual(response.status_code, 200)

            for cupcake in response.json['cupcakes']:
                del cupcake['id']
            self.assertEqual(response.json, {"cupcakes": [ CUPCAKE_DATA ]})

    def test_get_cupcake(self):
        with app.test_client() as client:
            response = client.get(f"/api/cupcakes/{self.cupcake.id}")

            self.assertEqual(response.status_code, 200)
            del response.json['cupcake']['id']
            self.assertEqual(response.json, {"cupcake": CUPCAKE_DATA})

            # check for 404 on erroneous ID
            response = client.get(f"/api/cupcakes/{self.cupcake.id + 1}")
            self.assertEqual(response.status_code, 404)

    def test_create_cupcake(self):
        with app.test_client() as client:
            response = client.post("/api/cupcakes", json=CUPCAKE_DATA_2)

            self.assertEqual(response.status_code, 201)

            # don't know what ID we'll get, make sure it's an int & normalize
            self.assertIsInstance(response.json['cupcake']['id'], int)
            del response.json['cupcake']['id']

            self.assertEqual(response.json, {"cupcake": CUPCAKE_DATA_2})

            self.assertEqual(Cupcake.query.count(), 2)

    def test_update_cupcake(self):
        with app.test_client() as client:
            response = client.patch(f"/api/cupcakes/{self.cupcake.id}", json=CUPCAKE_DATA_2)
            
            self.assertEqual(response.status_code, 200)

            del response.json["cupcake"]["id"]
            self.assertEqual(response.json, {"cupcake": CUPCAKE_DATA_2})
            
            # check that data has indeed updated
            response = client.get(f"/api/cupcakes/{self.cupcake.id}")
            self.assertEqual(response.status_code, 200)

            del response.json["cupcake"]["id"]
            self.assertEqual(response.json, {"cupcake": CUPCAKE_DATA_2})

            # check for 404 on erroneous ID
            response = client.patch(f"/api/cupcakes/{self.cupcake.id + 1}", json=CUPCAKE_DATA_2)
            self.assertEqual(response.status_code, 404)

    def test_delete_cupcake(self):
        with app.test_client() as client:
            response = client.delete(f"/api/cupcakes/{self.cupcake.id}")

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json, {"message": "Deleted"})

            # verify that the cupcake ID no longer is valid
            response = client.get(f"/api/cupcakes/{self.cupcake.id}")
            self.assertEqual(response.status_code, 404)
            
            # check for 404 on erroneous ID
            response = client.get(f"/api/cupcakes/{self.cupcake.id + 1}")
            self.assertEqual(response.status_code, 404)

