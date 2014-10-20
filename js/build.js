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

            if (currentWord.length > 2) {
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
(function (w) {
    'use strict';

    var T9Trie = function (words) {
        this.tree = {};

        this.keyMap = {
            2: 'абвг',
            3: 'дежз',
            4: 'ийкл',
            5: 'мноп',
            6: 'рсту',
            7: 'фхцч',
            8: 'шщъы',
            9: 'ьэюя'
        };

        // this.keyMap = {
        //     2: 'abc',
        //     3: 'def',
        //     4: 'ghi',
        //     5: 'jkl',
        //     6: 'mno',
        //     7: 'pqrs',
        //     8: 'tuv',
        //     9: 'wxyz'
        // }

        this.buildTree(words);
    }

    // initialize dictionary
    T9Trie.prototype.buildTree = function (words) {
        var word,
            node,
            letter,
            exist,
            ch;

        for (var i = 0; i < words.length; i++) {
            word = words[i].toLowerCase();
            node = this.tree;

            //skip empty words
            if (!word.length) {
                continue;
            }

            for (var j = 0; j < word.length; j++) {
                letter = word[j];
                exist = node[letter];

                // keep going if leaf already exists
                // or create it if it doesn't
                if (exist) {
                    node = node[letter];
                }
                else {
                    node[letter] = {};
                    node = node[letter];
                }
            }

            // mark node with '$' at the end of the word
            if (!node.$) {
                node.$ = true;
            }
        };

        console.log('words count:', words.length);
    };

    T9Trie.prototype.predict = function (numStr, exact) {
        return this.searchNum(numStr, exact);;
    };

    /**
     * Searches tree for sequence of number from phone keyboard 
     * @param  {string} numStr search string as numbers from phone keyboard
     * @param  {bool} exact if true, searches for word of the same length as numStr, otherwise search for all words which start with numStr 
     * @param  {obj} node current tree level
     * @param  {string} currentWord word we're looking for
     * @param  {array} words found words
     * @param  {int} depth how deep are we in a tree
     * @return {array} search result
     */
    T9Trie.prototype.searchNum = function (numStr, exact, node, currentWord, words, depth) {
        var numStr = numStr.toString(),
            node = node || this.tree,
            currentWord = currentWord || '',
            words = words || [],
            depth = depth || 0;

        // force exact for words with less than 3 characters
        if (numStr.length < 3) {
            exact = true;
        }

        for (var prop in node) {
            var key = numStr.charAt(depth),
                // check if current keymap has character from this tree level
                keyMapHasChar = key && this.keyMap.hasOwnProperty(key) && this.keyMap[key].indexOf(prop) > -1;

            if (prop === '$' && depth >= numStr.length) {
                // end of the word found, add word
                words.push(currentWord);
            }

            if (keyMapHasChar || (!key && !exact)) {
                if (currentWord.length > depth) {
                    // dont let the word get longer than current depth
                    currentWord = currentWord.slice(0, depth);
                }
                currentWord += prop;

                // search deeper in the tree
                words = this.searchNum(numStr, exact, node[prop], currentWord, words, depth+1);

                if (!words.length) {
                    // no words found deeper, remove last letter
                    currentWord = currentWord.slice(0, -1);
                }
            }
        }

        return words;
    };

    /**
     * Search all words which start with str
     * @param  {string} str
     * @return {array} search result
     */
    T9Trie.prototype.search = function (str) {
        var node = this.tree,
            chars = str.split(''),
            ch;

        if (str.length === 0) {
            return [];
        }

        // lookup string in the tree
        while (node && (ch = chars.shift())) {
            node = node[ch];
        }

        // convert tree to array if found
        return node ? this.nodeToArray(node, [], str) : [];
    };

    /**
     * Converts tree node to array of words
     * @param  {object} node current tree node
     * @param  {array} words
     * @param  {string} prefix word prefix
     * @return {array} words
     */
    T9Trie.prototype.nodeToArray = function (node, words, prefix) {
        if (node.$) {
            // end of word found on current level - add word
            words.push(prefix);
        }

        for (var prop in node) {
            if (prop !== '$' && node.hasOwnProperty(prop)) {
                // keep digging until word found
                this.nodeToArray(node[prop], words, prefix + prop);
            }
        }

        return words;
    };

    w.T9Trie = T9Trie;
})(this);