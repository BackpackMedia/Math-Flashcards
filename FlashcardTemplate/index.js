'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

//Giving info
//Come back and fix this
function getSpeechDescription(item){
    let sentence = item.Multiple + " times " + counter + " is ";
    return sentence;
}
//How to phrase question
/*Need to work with property and not on counter*/
function getQuestion(counter, num1, num2){
    return "Question " + counter + ". What is " + num1 + " times " + num2+ "?";
}

//return answer
function getAnswer(num1, num2, answer){
    return num1 + " times " + num2 + " is " + answer + " ";
}

function getFinalScore(score)

//positive re-enforcement
const speechConsCorrect = ["Booya", "Bam", "Bazinga", "Bingo", "Bravo",
"Hip hip hooray", "Hurrah", "Hurray", "Huzzah", "Kaboom", "Kaching", "Oh snap",
"Righto", "Way to go", "Well done", "Whee", "Woo hoo", "Yay", "Wowza", "Yowsa"];

//wrong answer
const speechConsWrong = ["Aw man", "Bummer","Le sigh", "Ruh roh", "Shucks", "Uh oh","Whoops a daisy"];

//welcome message without intent
const WELCOME_MESSAGE = "Welcome to the multiplication flashcard game! I can quiz you. When ready say start quiz."

//message for the start of quiz
const START_QUIZ_MESSAGE = "I am going to ask 10 questions.";

//message for the end
const EXIT_SKILL_MESSAGE = "Thank you for playing this game! Let's play again soon!"

//message post ask
const REPROMT_SPEECH = "Which number table would you like to learn?";

//help message
const HELP_MESSAGE = "I can quiz you on your times tables. When ready say start quiz."

//unexpected response
function getBadAnswer(item) { return "I'm sorry but I don't understand." + HELP_MESSAGE}

const USE_CARDS_FLAG = true;

function getCardTitle(item) { return "Multiplication Practice"}

const counter = 0;

const states = {
    START: "_START",
    QUIZ: "_QUIZ", 
    REVIEW: "_Review"
};

const handlers = {
    'LaunchRequest': function () {
        this.handler.state = states.START;
        this.emitWithState("Start");
    },
    'TableIntent': function () {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    'AnswerIntent': function () {
        this.handler.state = states.START;
        this.emitWithState("AnswerIntent");
    },
    'ReviewIntent': function () {
        this.handler.state = states.REVIEW;
        this.emitWithState("Review");
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function(){
        this.handler.state = states.START;
        this.emit(":responseReady");
    }
};

const startHandlers = Alexa.CreateStateHandler(states.START,{
    "Start": function() {
        this.response.speak(WELCOME_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "AnswerIntent": function() {
        let item = getItem(this.event.request.intent.slots);

        if (item && item[Object.getOwnPropertyNames(data[0])[0]] != undefined)
        {
          console.log("\nFlashcard Practice\n");
            if (USE_CARDS_FLAG)
            {
                //let imageObj = {smallImageUrl: getSmallImage(item), largeImageUrl: getLargeImage(item)};
                //this.response.speak(getSpeechDescription(item)).listen(REPROMPT_SPEECH);
                this.response.cardRenderer(getCardTitle(item));            }
            else
            {
                //this.response.speak(getSpeechDescription(item)).listen(REPROMPT_SPEECH);
            }
        }
        else
        {
            this.response.speak(getBadAnswer(item)).listen(getBadAnswer(item));

        }

        this.emit(":responseReady");
    },
    "TableIntent": function() {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("Start");
    }
});


const quizHandlers = Alexa.CreateStateHandler(states.QUIZ,{
    "Quiz": function() {
        this.attributes["response"] = "";
        this.attributes["counter"] = 0;
        this.attributes["quizscore"] = 0;
        this.emitWithState("AskQuestion");
    },
    "AskQuestion": function() {
        if (this.attributes["counter"] == 0)
        {
            this.attributes["response"] = START_QUIZ_MESSAGE + " ";
        }

        let num1 = getRandom(0, 12);
        let num2 = getRandom(0, 12);

        this.attributes["quiznum2"] = num2;
        this.attributes["quiznum1"] = num1;
        this.attributes["counter"]++;

        let question = getQuestion(this.attributes["counter"], num1, num2);
        let speech = this.attributes["response"] + question;

        this.emit(":ask", speech, question);
    },
    "AnswerIntent": function() {
        let response = "";
        let speechOutput = "";
        let num2 = this.attributes["quiznum2"];
        let num1 = this.attributes["quiznum1"];

        let correct = num1 * num2;

        if (parseInt(this.event.request.intent.slots.number.value) == correct)
        {
            response = getSpeechCon(true);
            this.attributes["quizscore"]++;
        }
        else
        {
            response = getSpeechCon(false);
        }

        response += getAnswer(num1, num2, correct);

        if (this.attributes["counter"] < 10)
        {
            this.attributes["response"] = response;
            this.emitWithState("AskQuestion");
        }
        else
        {
            response += getFinalScore(this.attributes["quizscore"], this.attributes["counter"]);
            speechOutput = response + " " + EXIT_SKILL_MESSAGE;

            this.response.speak(speechOutput);
            this.emit(":responseReady");
        }
    },
    "AMAZON.RepeatIntent": function() {
        let question = getQuestion(this.attributes["counter"], this.attributes["num1"], this.attributes["num2"]);
        this.response.speak(question).listen(question);
        this.emit(":responseReady");
    },
    "AMAZON.StartOverIntent": function() {
        this.emitWithState("Quiz");
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("AnswerIntent");
    }
});

/*const reviewHandlers = Alexa.CreateStateHandler(states.REVIEW,{
    "Review": function() {
        this.attributes["response"] = "";
        this.attributes["counter"] = 0;
        this.emitWithState("AskQuestion");
    },
    "ResponseIntent": function() {
        if (this.attributes["counter"] == 0)
        {
            this.attributes["response"] = START_REVIEW_MESSAGE + " ";
        }
        this.attributes["response"] = "";
        let number = parseInt(this.event.request.intent.slots.number.value);

        this.attributes["counter"]++;

        let question = getReview(this.attributes["counter"], number);
        let speech = this.attributes["response"] + question;

        this.emit(":ask", speech, question);
    },
    "AnswerIntent": function() {
        let response = "";
        let speechOutput = "";
        let num2 = this.attributes["quiznum2"];
        let num1 = this.attributes["quiznum1"];

        let correct = num1 * num2;

        if (parseInt(this.event.request.intent.slots.number.value) == correct)
        {
            response = getSpeechCon(true);
            this.attributes["quizscore"]++;
        }
        else
        {
            response = getSpeechCon(false);
        }

        response += getAnswer(num1, num2, correct);

        if (this.attributes["counter"] < 10)
        {
            this.attributes["response"] = response;
            this.emitWithState("AskQuestion");
        }
        else
        {
            speechOutput = response + " " + EXIT_SKILL_MESSAGE;

            this.response.speak(speechOutput);
            this.emit(":responseReady");
        }
    },
    "AMAZON.RepeatIntent": function() {
        let question = getQuestion(this.attributes["counter"], this.attributes["quizproperty"], this.attributes["num2"]);
        this.response.speak(question).listen(question);
        this.emit(":responseReady");
    },
    "AMAZON.StartOverIntent": function() {
        this.emitWithState("Review");
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("AnswerIntent");
    }
});*/

function getRandom(min, max)
{
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getSpeechCon(type)
{
    let speechCon = "";
    if (type) return "<say-as interpret-as='interjection'>" + speechConsCorrect[getRandom(0, speechConsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + speechConsWrong[getRandom(0, speechConsWrong.length-1)] + " </say-as><break strength='strong'/>";
}

function formatCasing(key)
{
    key = key.split(/(?=[A-Z])/).join(" ");
    return key;
}

//fix for card
function getTextDescription(item)
{
    let text = "";

    for (let key in item)
    {
        text += formatCasing(key) + ": " + item[key] + "\n";
    }
    return text;
}

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers, startHandlers, quizHandlers);
    alexa.execute();
};