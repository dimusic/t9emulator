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