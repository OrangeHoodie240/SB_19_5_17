

const boardForm = document.getElementById('board-form');
const answerBox = document.getElementById('answers');
const message = document.getElementById('message');
const score = document.getElementById('score');
const input = document.getElementById('guess');
const button = document.querySelector('button');
const timer = document.getElementById('timer');
const stats = document.getElementById('stats');

let time = 60;
timer.innerText = time; 
const interval = setInterval(async function(){
    time -= 1; 
    timer.innerText = time; 
    if(time == 0){
        gameover(); 
    }
}, 1000);

async function gameover() {
    input.setAttribute('disabled', true);
    button.setAttribute('disabled', true);
    message.innerText = `GAME OVER! YOU ARE OUT OF TIME! FINAL SCORE: ${score.innerText}`;
    clearInterval(interval);

    const data = await updatePlayerStats(); 
    reportStats(data);
}

async function updatePlayerStats(){
    const body = JSON.stringify({'score': score.innerText});
    method = 'POST'
    headers = {'Content-Type': 'application/json'}; 
    const data = await fetch('/gameover', {headers, method, body})
        .then(resp => {
            if(!resp.ok){
                throw new Error(`Error! Status ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            return data
        })
        .catch(err => console.error(err)); 
    
    return data; 
}

function reportStats(data){
    let msg = `Stats: ${data.new_highscore ? "NEW HIGHSCORE" : "Highscore"}: ${data.highscore} Games Played: ${data.games}`
    stats.innerText = msg; 
} 

boardForm.addEventListener('submit', async function (evt) {
    evt.preventDefault();

    body = JSON.stringify({ "guess": input.value });
    method = "POST";

    let resp = await fetch('/guess', { method, body, headers: { 'Content-Type': 'application/json' } })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Error! Status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            return data;
        })
        .catch(err => console.error(err));
    processResult(resp, input)
});

function processResult({ result }, input) {
    if (result === 'ok') {
        if (!answerBox.innerText.includes(input.value)) {
            answerBox.innerText += ' ' + input.value;
            message.innerText = `Great job! ${input.value} is worth ${input.value.length} points!`
            addToScore(input);
        }
        else {
            message.innerText = `You've already answered with ${input.value}`
        }
    }
    else {
        message.innerText = `Wrong. ${input.value} is not a valid answer.`
    }
    input.value = '';

}

function addToScore() {
    total = parseInt(score.innerText) + parseInt(input.value.length);
    score.innerText = total;
}