import time
import logging
logging.basicConfig(filename='tayyiplearn.log', level=logging.DEBUG)


def log(msg):
    logging.info(time.ctime() + " -- " + msg)
