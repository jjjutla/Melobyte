from flask import Flask, redirect, url_for, session, render_template
from flask_oauthlib.client import OAuth

app = Flask(__name__)
app.secret_key = 'random_secret'
oauth = OAuth(app)

# Google OAuth setup
google = oauth.remote_app(
    'google',
    consumer_key='YOUR_GOOGLE_CLIENT_ID',
    consumer_secret='YOUR_GOOGLE_CLIENT_SECRET',
    request_token_params={
        'scope': 'email'
    },
    base_url='https://www.googleapis.com/oauth2/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
)

# Spotify OAuth setup
spotify = oauth.remote_app(
    'spotify',
    consumer_key='YOUR_SPOTIFY_CLIENT_ID',
    consumer_secret='YOUR_SPOTIFY_CLIENT_SECRET',
    request_token_params={
        'scope': 'user-read-email'
    },
    base_url='https://api.spotify.com/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.spotify.com/api/token',
    authorize_url='https://accounts.spotify.com/authorize',
)

@app.route('/')
def index():
    return 'Welcome! <a href="/trigger_login">Trigger Login</a>'

@app.route('/trigger_login')
def trigger_login():
    # Here you can decide which service to use for login (e.g., based on user choice or other logic)
    # For this example, I'll default to Google
    return redirect(url_for('login_with_google'))

@app.route('/login_with_google')
def login_with_google():
    return google.authorize(callback=url_for('google_authorized', _external=True))

@app.route('/login_with_spotify')
def login_with_spotify():
    return spotify.authorize(callback=url_for('spotify_authorized', _external=True))

@app.route('/google_authorized')
def google_authorized():
    response = google.authorized_response()
    if response is None or response.get('access_token') is None:
        return 'Access denied by Google: reason={} error={}'.format(
            request.args['error_reason'],
            request.args['error_description']
        )

    session['google_token'] = (response['access_token'], '')
    user_info = google.get('userinfo')
    # Here, you can create or retrieve the Stellar account for the user
    return 'Logged in with Google as: ' + user_info.data['email']

@app.route('/spotify_authorized')
def spotify_authorized():
    response = spotify.authorized_response()
    if response is None or response.get('access_token') is None:
        return 'Access denied by Spotify.'

    session['spotify_token'] = (response['access_token'], '')
    user_info = spotify.get('me')
    # Here, you can create or retrieve the Stellar account for the user
    return 'Logged in with Spotify as: ' + user_info.data['email']

@google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')

@spotify.tokengetter
def get_spotify_oauth_token():
    return session.get('spotify_token')

if __name__ == '__main__':
    app.run(debug=True)
