from pymongo import MongoClient
from app.config import settings

class MongoDB:
    client: MongoClient = None
    db = None

    def connect(self):
        self.client = MongoClient(settings.MONGODB_URL)
        self.db = self.client[settings.MONGODB_DB_NAME]
        print("Connected to MongoDB")

    def close(self):
        if self.client:
            self.client.close()
            print("Closed MongoDB connection")

    def get_db(self):
        return self.db

mongodb = MongoDB()

def get_mongo_db():
    return mongodb.get_db()
