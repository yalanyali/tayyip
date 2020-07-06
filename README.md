# tayyip
An AI that fixes Tayyip Erdogan.

The UI is a webpage where you can load a Youtube video. When detected, Erdogan's voice gets replaced with silence or a noise of users' choosing, which reduces stress.

This is an experimental, relatively simple python machine learning pipeline that extracts Mel Frequency Cepstral Coefficient (MFCC) voice features from Youtube videos and trains a Gradient Boosting algorithm. The training data was around 10 minutes of Tayyip Erdogan speaking in different environments and equivalent time of random people talking. The results were quite acceptable even with a small training data sample but the model can be HIGHLY improved.

To train and test, you'd need:

- [scikit-learn](http://scikit-learn.org/stable/index.html) for the ML algorithm
- [YAAFE](http://yaafe.sourceforge.net/) for feature extraction
- [Flask](http://flask.pocoo.org/)
- [youtube-dl](https://rg3.github.io/youtube-dl/)
- [postgresql](https://www.postgresql.org/)
- [redis](http://redis.io/) + [celery](http://www.celeryproject.org/) to handle the recognition background job
