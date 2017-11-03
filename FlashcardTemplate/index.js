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
function getQuestion(counter, property, item){
    return "What is " + item.Multiple + " times " + formatCasing(property) + "?";
}

//return answer
function getAnswer(property, item){
    return item.Multiple + " times " + formatCasing(property) + " is " + item[property] + " ";
}

//positive re-enforcement
const speechConsCorrect = ["Booya", "Bam", "Bazinga", "Bingo", "Bravo",
"Hip hip hooray", "Hurrah", "Hurray", "Huzzah", "Kaboom", "Kaching", "Oh snap",
"Righto", "Way to go", "Well done", "Whee", "Woo hoo", "Yay", "Wowza", "Yowsa"];

//wrong answer
const speechConsWrong = ["Aw man", "Bummer","Le sigh", "Ruh roh", "Shucks", "Uh oh","Whoops a daisy"];

//welcome message without intent
const WELCOME_MESSAGE = "Welcome to the multiplication flashcard game! I can help you review or I can quiz you. What would you like to do?"

//message for the start of quiz
const START_QUIZ_MESSAGE = "We are going to ask 10 questions.";

//message for the end
const EXIT_SKILL_MESSAGE = "Thank you for playing this game! Let's play again soon!"

//message post ask
const REPROMT_SPEECH = "Which number table would you like to learn?";

//help message
const HELP_MESSAGE = "I know all the times tables. Let me know which one you need help with or I can quiz you."

//unexpected response
function getBadAnswer(item) { return "I'm sorry but I don't know about " + item + "." + HELP_MESSAGE}

const USE_CARDS_FLAG = true;

function getCardTitle(item) { return item.Multiple}

/**
 * Arrays containing times tables
 */
const data = [
    { Multiple: 1, zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10},
    { Multiple: 2, zero: 0, one: 2, two: 4, three: 6, four: 8, five: 10, six: 12, seven: 14, eight: 16, nine: 18, ten: 20},
    { Multiple: 3, zero: 0, one: 3, two: 6, three: 9, four: 12, five: 15, six: 18, seven: 21, eight: 24, nine: 27, ten: 30},
    { Multiple: 4, zero: 0, one: 4, two: 8, three: 12, four: 16, five: 20, six: 24, seven: 28, eight: 32, nine: 36, ten: 40},
    { Multiple: 5, zero: 0, one: 5, two: 10, three: 15, four: 20, five: 25, six: 30, seven: 35, eight: 40, nine: 45, ten: 50},
    { Multiple: 6, zero: 0, one: 6, two: 12, three: 18, four: 24, five: 30, six: 36, seven: 42, eight: 48, nine: 54, ten: 60},
    { Multiple: 7, zero: 0, one: 7, two: 14, three: 21, four: 28, five: 35, six: 42, seven: 49, eight: 56, nine: 63, ten: 70},
    { Multiple: 8, zero: 0, one: 8, two: 16, three: 24, four: 32, five: 40, six: 48, seven: 56, eight: 64, nine: 72, ten: 80},
    { Multiple: 9, zero: 0, one: 9, two: 18, three: 27, four: 36, five: 45, six: 54, seven: 63, eight: 72, nine: 81, ten: 90},
    { Multiple: 10, zero: 0, one: 10, two: 20, three: 30, four: 40, five: 50, six: 60, seven: 70, eight: 80, nine: 90, ten: 100},  
];

const counter = 0;

const states = {
    START: "_START",
    QUIZ: "_QUIZ"
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
        this.handler.state = states.Start;
        this.emitWithState("AnswerIntent");
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
                this.response.cardRenderer(getCardTitle(item), getTextDescription(item));            }
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

        let random = getRandom(0, data.length-1);
        let item = data[random];

        let propertyArray = Object.getOwnPropertyNames(item);
        let property = propertyArray[getRandom(1, propertyArray.length-1)];

        this.attributes["quizitem"] = item;
        this.attributes["quizproperty"] = property;
        this.attributes["counter"]++;

        let question = getQuestion(this.attributes["counter"], property, item);
        let speech = this.attributes["response"] + question;

        this.emit(":ask", speech, question);
    },
    "AnswerIntent": function() {
        let response = "";
        let speechOutput = "";
        let item = this.attributes["quizitem"];
        let property = this.attributes["quizproperty"]

        let correct = compareSlots(this.event.request.intent.slots, item[property]);

        if (correct)
        {
            response = getSpeechCon(true);
            this.attributes["quizscore"]++;
        }
        else
        {
            response = getSpeechCon(false);
        }

        response += getAnswer(property, item);

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
        let question = getQuestion(this.attributes["counter"], this.attributes["quizproperty"], this.attributes["quizitem"]);
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

function compareSlots(slots, value)
{
    for (let slot in slots)
    {
        if (slots[slot].value != undefined)
        {
            if (slots[slot].value.toString().toLowerCase() == value.toString().toLowerCase())
            {
                return true;
            }
        }
    }
    return false;
}

function getRandom(min, max)
{
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getItem(slots)
{
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