import psycopg2
import psycopg2.extras
from exceptions import DatabaseError
import os
import random


class Video:
    db = None
    conn = None

    def __init__(self):
        self.attrs = {
            'youtube_id': '',
            'rate': 0.0,
            'predictions': '',
            'thumbnail': '',
            'title': '',
            'state': ''
        }

    @classmethod
    def connect(self):
        Video.db = psycopg2.connect(os.environ['POSTGRES_CRED'])
        Video.conn = Video.db.cursor(cursor_factory=psycopg2.extras.DictCursor)

    @classmethod
    def disconnect(self):
        Video.db.close()
        Video.conn.close()

    def fetch(self, youtube_id):
        Video.conn.execute(
            '''
        SELECT * FROM videos WHERE youtube_id=%s LIMIT 1;
      ''', (youtube_id, )
        )

        result = Video.conn.fetchone()

        if result is None:
            return False

        self.set(**result)

        self.update_played()

        return self

    def attributes(self):
        return self.attrs

    def save(self):
        values = (
            self.attrs['youtube_id'],
            self.attrs['rate'],
            self.attrs['predictions'],
            self.attrs['thumbnail'],
            self.attrs['title'],
            self.attrs['state']
        )

        Video.conn.execute('''
      INSERT INTO videos (youtube_id, rate, predictions, thumbnail, title, state)
      VALUES (%s, %s, %s, %s, %s, %s);
      ''', values)

        Video.db.commit()

    def set(self, **kwargs):
        self.attrs = dict(self.attrs.items() + kwargs.items())
        return self.attrs

    def get(key):
        try:
            return self.attrs[key]
        except KeyError:
            return None

    def update_played(self):
        attrs = self.attributes()
        Video.conn.execute('''
      UPDATE videos SET played = %s WHERE youtube_id = %s
      ''', (attrs['played'] + 1, attrs['youtube_id'])
        )

        Video.db.commit()

    def get_playlist(self):
        Video.conn.execute(
            "SELECT youtube_id, thumbnail FROM videos;"
        )

        results = Video.conn.fetchall()

        if len(results) > 4:
            random.shuffle(results)
            return results[0:4]

        return results or False

    def last(self, num=1):
        Video.conn.execute(
            '''
        SELECT * FROM videos ORDER BY "videos"."played" DESC LIMIT %s;
      ''', (str(num))
        )

        if num == 1:
            results = Video.conn.fetchone()
        else:
            results = Video.conn.fetchall()

        return results['youtube_id']
