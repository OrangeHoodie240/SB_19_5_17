
class BoggleApp {
    constructor(){
        this.boardForm = document.getElementById('board-form');
        this.answerBox = document.getElementById('answers');
        this.message = document.getElementById('message');
        this.score = document.getElementById('score');
        this.input = document.getElementById('guess');
        this.button = document.querySelector('button');
        this.timer = document.getElementById('timer');
        this.stats = document.getElementById('stats');
        this.time = 0;
        this.interval  = null; 
        this.startTimer();
        this.boardForm.addEventListener('submit', this.submissionHandler);
    }
    async startTimer(){
        this.time = 60; 
        this.timer.innerText = this.time;
        this.interval = setInterval(this.timerIteration, 1000);
    }
    timerIteration = async ()=>{
        this.time -= 1; 
        this.timer.innerText = this.time;
        if(this.time === 0){
            this.gameover(); 
        }
    }
    async gameover() {
        this.input.setAttribute('disabled', true);
        this.button.setAttribute('disabled', true);
        this.message.innerText = `GAME OVER! YOU ARE OUT OF TIME! FINAL SCORE: ${this.score.innerText}`;
        clearInterval(this.interval);
    
        const data = await this.updatePlayerStats(); 
        this.reportStats(data);
    }

    async updatePlayerStats(){
        const body = JSON.stringify({'score': this.score.innerText});
        const method = 'POST'
        const headers = {'Content-Type': 'application/json'}; 
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

    reportStats(data){
        let msg = `Stats: ${data.new_highscore ? "NEW HIGHSCORE" : "Highscore"}: ${data.highscore} Games Played: ${data.games}`
        this.stats.innerText = msg; 
    } 

    
    submissionHandler = async (evt) => {
        evt.preventDefault();

        const body = JSON.stringify({ "guess": this.input.value });
        const method = "POST";
        const resp = await fetch('/guess', { method, body, headers: { 'Content-Type': 'application/json' } })
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
        this.processResult(resp)
    }

    processResult({ result }) {
        if (result === 'ok') {
            if (!this.answerBox.innerText.includes(this.input.value)) {
                this.answerBox.innerText += ' ' + this.input.value;
                this.message.innerText = `Great job! ${this.input.value} is worth ${this.input.value.length} points!`
                this.addToScore(this.input);
            }
            else {
                this.message.innerText = `You've already answered with ${this.input.value}`
            }
        }
        else {
            this.message.innerText = `Wrong. ${this.input.value} is not a valid answer.`
        }
        this.input.value = '';
    }

    addToScore() {
        const total = parseInt(this.score.innerText) + parseInt(this.input.value.length);
        this.score.innerText = total;
    }
}

const app = new BoggleApp(); 

