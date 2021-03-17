from boggle import Boggle
from flask import Flask, jsonify, render_template, session, request, redirect
from flask_debugtoolbar import DebugToolbarExtension

boggle_game = Boggle()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'some secret key here'

debug = DebugToolbarExtension(app)


@app.route('/')
def index():
    """
        returns main page on which boggle is played
        if session not initialized, first redirects to proper route
    """

    if(session.get('game', False) == False):
        return redirect('/initialize-game')
    return render_template('index.html')


@app.route('/initialize-game', methods=['POST', 'GET'])
def initialize_board():
    """
    Create boggle board and answers list, adds to the session and redirects back to the home page

    """
    if(session.get('game', False) == False):
        board = boggle_game.make_board()
        answers = []
        session['game'] = {'board': board, 'answers': answers}
    return redirect('/')


@app.route('/guess', methods=['POST'])
def guess():
    """
        takes the word that was submitted and checks to see if it is valid
        appends guess to answers list if it is valid 
        returns results to front end
    """
    guess = request.get_json().get('guess')
    guess = guess.strip()
    result = boggle_game.check_valid_word(session.get('game').get('board'), guess)
    append_to_game_answers(session, result, guess)
    return jsonify({'result': result})


def append_to_game_answers(session, result, guess):
    """
        take real word and, if not included in answers list already, adds it to it.
    """
    if(result == 'ok'):
        temp_answers = session.get('game').get('answers')
        if(guess not in temp_answers):
            temp_answers.append(guess)
            board = session.get('game').get('board')
            session['game'] = {'board': board, 'answers': temp_answers}


@app.route('/gameover', methods=['POST'])
def gameover():
    """
        updates highscore and total number of games played 
        returns stats to front end
    """

    score = request.get_json().get('score')
    score = int(score)

    highscore = session.get('highscore', 0)
    highscore = int(highscore)
    new_highscore = False

    if(score > highscore):
        session['highscore'] = score
        highscore = score
        new_highscore = True

    games = session.get('finished', 0)
    games += 1
    session['finished'] = games


    results = {'highscore': highscore, 'games': games, 'new_highscore': new_highscore}
    return jsonify(results)
