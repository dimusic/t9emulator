(function (w) {
    'use strict';

    var App = {
        t9: null,
        numStr: '',
        currentWordEl: null,
        autocompleteEl: null,
        completedWordsEl: null,
        t9Predictions: [],
        t9PredictionsIndex: 0,

        autocompletePredictions: [],

        init: function (words) {
            this.currentWordEl = document.querySelector('.num-str-input');
            this.autocompleteEl = document.querySelector('.predictions');
            this.completedWordsEl = document.querySelector('.completed-words');
            
            this.initEventHandlers();

            this.t9 = new T9Trie(words);
        },

        initEventHandlers: function () {
            var keys = [].slice.call(document.querySelectorAll('.btn-keypad'));

            //handle phone keyboard
            keys.forEach(function (el) {
                el.addEventListener('click', function (e) {
                    var numVal = el.getAttribute('value');

                    this.numStr += numVal.toString();
                    this.predict(this.numStr);
                }.bind(this));
            }.bind(this));

            // cycle t9 predictions button
            document.querySelector('.btn-action-cycle').addEventListener('click', function () {
                this.showNextPrediction();
            }.bind(this));

            // handle keyboard input
            this.currentWordEl.addEventListener('keydown', function (e) {
                // allow space, backspace, delete, tab, escape, enter, left and right
                var allowedKeys = [32, 46, 8, 9, 27, 13, 110, 39, 37],
                    keyCode = e.keyCode,
                    ch = String.fromCharCode(keyCode),
                    isNumber = /^[0-9]+$/.test(ch) && !e.shiftKey;

                if (allowedKeys.indexOf(keyCode) === -1
                    && !isNumber) {
                    console.log(allowedKeys.indexOf(keyCode) === -1, !isNumber, this.numStr);
                    e.preventDefault();
                    return ;
                }

                e.preventDefault();

                if (isNumber) {
                    // trigger keypad button event
                    var btnEvent = document.createEvent('HTMLEvents');
                    btnEvent.initEvent('click', true, false);

                    document.querySelector('.btn-keypad[value="'+ch+'"]').dispatchEvent(btnEvent);
                }
                else if (keyCode === 8) {
                    //backspace key, removing last char
                    this.numStr = this.numStr.slice(0, -1);
                    this.predict();
                }
                else if (keyCode === 32) {
                    //space key, save completed word, reset current word
                    this.completedWordsEl.textContent += this.getCurrentWord() + ' ';

                    this.setCurrentWord('');
                    this.numStr = '';
                    this.autocompletePredictions.length = 0;
                    this.t9Predictions.length = 0;
                    this.t9PredictionsIndex = 0;
                }
            }.bind(this));
        },

        /**
         * Sets predicted word in the input field
         * and fires autocomplete search
         * @param {string} word
         */
        setCurrentWord: function (word) {
            this.currentWordEl.value = word;
            if (word) {
                this.autocomplete();
            }
        },

        /**
         * Gets current predicted word from the input field
         * @return {string}
         */
        getCurrentWord: function () {
            return this.currentWordEl.value;
        },

        predict: function (query) {
            query = query || this.numStr;

            //get exact t9 predictions
            var predictions = this.t9.predict(query, true);
            //run query again, but get all possible combinations for autocomplete
            this.autocompletePredictions = this.t9.predict(query, false);

            console.log(query, predictions);

            this.t9Predictions = predictions;
            if (predictions.length > 0) {
                this.setCurrentWord(predictions[0]);
            }
            else {
                this.setCurrentWord(this.numStr);
            }
        },

        showNextPrediction: function () {
            if (this.t9Predictions.length === 0) {
                return false;
            }

            if (++this.t9PredictionsIndex >= this.t9Predictions.length) {
                this.t9PredictionsIndex = 0;
            }

            this.setCurrentWord(this.t9Predictions[this.t9PredictionsIndex]);
        },

        autocomplete: function () {
            var currentWord = this.getCurrentWord(),
                predictions = this.autocompletePredictions;

            if (currentWord.length > 3) {
                predictions = predictions.filter(function (el) {
                    return el !== currentWord
                        && el.length >= currentWord.length
                        && el.indexOf(currentWord) > -1;
                });

                if (predictions.length > 5) {
                    //sort randomly and get no more than 5 results
                    predictions = predictions.sort(function() {return 0.5 - Math.random()}).slice(0, 4);
                }

                this.updateAutocompleteEl(predictions);
            }
        },

        /**
         * Updates automoplete list
         * @param  {array} predictions
         */
        updateAutocompleteEl: function (predictions) {
            var predictionsEl = this.autocompleteEl,
                predictionsHtml = '';

            predictionsEl.innerHTML = '';

            predictions.forEach(function (prediction) {
                var li = document.createElement('li');
                li.textContent = prediction;
                predictionsEl.appendChild(li);
            })
        }
    };

    w.App = App;
})(this);