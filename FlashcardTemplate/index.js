'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

//Come back and fix this
/*function getSpeechDescription(item){
    let sentence = "Started " + item.Operation + " quiz";
    return sentence;
}*/

function getQuestion(counter, property, num1, num2){
    if(property === "Addition")
        return "Question " + counter + ". What is " + num1 + " plus " + num2+ "?";
    else
        return "Question " + counter + ". What is " + num1 + " times " + num2+ "?";
}

function getAnswer(property, num1, num2, answer){
    if(property === "Addition")
        return num1 + " plus " + num2 + " is " + answer;
    else
        return num1 + " times " + num2 + " is " + answer;
}

//positive re-enforcement
const speechConsCorrect = ["Booya", "Bam", "Bazinga", "Bingo", "Bravo",
"Hip hip hooray", "Hurrah", "Hurray", "Huzzah", "Kaboom", "Kaching", "Oh snap",
"Righto", "Way to go", "Well done", "Whee", "Woo hoo", "Yay", "Wowza", "Yowsa"];

//wrong answer
const speechConsWrong = ["Aw man", "Bummer","Le sigh", "Ruh roh", "Shucks", "Uh oh","Whoops a daisy"];

//welcome message without intent
const WELCOME_MESSAGE = "Welcome to the flashcard game! I can quiz you. When ready say start quiz.";

//message for the start of quiz
const START_QUIZ_MESSAGE = "I am going to ask 10 questions.";

//message for the start of review
const START_REVIEW_MESSAGE = "I am going to go thru 10 practice problems";

//ask for the operation
const GET_OPERATION_MESSAGE = "What operation would you like? Say 0 for Add or 1 for Multiply";

//message for the end
const EXIT_SKILL_MESSAGE = "Thank you for playing this game! Let's play again soon!";

//message post ask
const REPROMT_SPEECH = "Which number table would you like to learn?";

//help message
const HELP_MESSAGE = "I can quiz you on your times tables. When ready say start quiz.";

//lost message
const LOST_MESSAGE = "I don't understand. Please repeat your statement.";

//unexpected response
function getBadAnswer(item) { return "I'm sorry but I don't understand. " + HELP_MESSAGE;}

const USE_CARDS_FLAG = true;


const states = {
    START: "_START",
    QUIZ: "_QUIZ", 
    SETUP: "_SETUP"
};

const handlers = {
    'LaunchRequest': function () {
        this.handler.state = states.START;
        this.emitWithState("Start");
    },
    'TableIntent': function () {
        this.handler.state = states.SETUP;
        this.emitWithState("Setup");
    },
    'AnswerIntent': function () {
        this.handler.state = states.START;
        this.emitWithState("AnswerIntent");
    },
    'OperationIntent': function () {
        this.handler.state = states.Quiz;
        this.emitWithState("Quiz");
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

        if (item != undefined){
            if (USE_CARDS_FLAG){
                this.response.cardRenderer("Math Practice");
            }else{
                //this.response.speak(getSpeechDescription(item)).listen(REPROMPT_SPEECH);
            }
        }else{
            this.response.speak(getBadAnswer(item)).listen(getBadAnswer(item));
        }
        this.emit(":responseReady");
    },
    "TableIntent": function() {
        this.handler.state = states.SETUP;
        this.emitWithState("Setup");
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


const setupHandlers = Alexa.CreateStateHandler(states.SETUP,{
    "Setup": function() {
        this.attributes["response"] = "";
        this.attributes["counter"] = 0;
        this.attributes["property"] = "";
        this.attributes["operation"] = null;
        this.emitWithState("AskQuestion");
    },
    "AskQuestion": function() {
        if (this.attributes["counter"] == 0)
        {
            this.attributes["response"] = START_QUIZ_MESSAGE + " " + GET_OPERATION_MESSAGE + " ";
        }
        let speech = this.attributes["response"];
        this.emit(":ask", speech); 
    },
    "AnswerIntent": function() {
        let operation = this.attributes["operation"];
        if(operation == null){
            operation = parseInt(this.event.request.intent.slots.number.value);
            switch(operation){
                case 0:
                    this.attributes["property"] = "Addition";
                break;
                case 1:
                    this.attributes["property"] = "Multiplication";
                break;
                default:
                    this.emitWithState("RepeatIntent");
                break;
            }
        }
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "AMAZON.RepeatIntent": function() {
        let question = this.attributes["response"];
        this.response.speak(question).listen(question);
        this.emit(":responseReady");
    },
    "AMAZON.StartOverIntent": function() {
        this.emitWithState("Setup");
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
        this.emitWithState("AskQuestion");
    }
});

const quizHandlers = Alexa.CreateStateHandler(states.QUIZ,{
    "Quiz": function() {
        this.attributes["response"] = "";
        this.attributes["quizscore"] = 0;
        this.emitWithState("AskQuestion");
    },
    "AskQuestion": function() {
        let prop = this.attributes["property"];
        let num1 = getRandom(0, 12);
        let num2 = getRandom(0, 12);

        this.attributes["quiznum2"] = num2;
        this.attributes["quiznum1"] = num1;
        this.attributes["counter"]++;

        let question = getQuestion(this.attributes["counter"], prop, num1, num2);
        let speech = this.attributes["response"] + question;

        this.emit(":ask", speech);
    },
    "AnswerIntent": function() {
        let response = "";
        let speechOutput = "";
        let correct;
        let num2 = this.attributes["quiznum2"];
        let num1 = this.attributes["quiznum1"];
        let prop = this.attributes["property"];

        if(prop === "Addition")
            correct = num1 + num2;
        else
            correct = num1 * num2;
        
        if (parseInt(this.event.request.intent.slots.number.value) == correct)
        {
            response = getSpeechCon(true);
            this.attributes["quizscore"]++;
        }
        else
        {
            response = getSpeechCon(false);
        }

        response += getAnswer(prop, num1, num2, correct);

        if (this.attributes["counter"] < 10)
        {
            //response += getCurrentScore(this.attributes["quizscore"], this.attributes["counter"]);
            this.attributes["response"] = response;
            this.emitWithState("AskQuestion");
        }
        else
        {
            //response += getFinalScore(this.attributes["quizscore"], this.attributes["counter"]);
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

function getRandom(min, max){
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getItem(slots){
    let propertyArray = Object.getOwnPropertyNames(data[0]);
    let value;

    for (let slot in slots)
    {
        if (slots[slot].value !== undefined)
        {
            value = slots[slot].value;
            for (let property in propertyArray)
            {
                let item = data.filter(x => x[propertyArray[property]].toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
                if (item.length > 0)
                {
                    return item[0];
                }
            }
        }
    }
    return value;
}

function getSpeechCon(type){
    let speechCon = "";
    if (type) return "<say-as interpret-as='interjection'>" + speechConsCorrect[getRandom(0, speechConsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + speechConsWrong[getRandom(0, speechConsWrong.length-1)] + " </say-as><break strength='strong'/>";
}

function formatCasing(key){
    key = key.split(/(?=[A-Z])/).join(" ");
    return key;
}

/*Come back and fix to make cards more informative*/
function getTextDescription(item){
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
    alexa.registerHandlers(handlers, startHandlers, setupHandlers, quizHandlers);
    alexa.execute();
};