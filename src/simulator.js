const fs = require('fs');
const Computer = require('./computer');

/**
 * Load the file into the Computer from stdin
 */
function loadFileFromStdin(comp, onComplete) {
    let content = '';

    function processFile() {
        // Pointer to the memory address in the Computer that we're
        // loading a value into:
        let curAddr = 0;
        const lines = content.split('\n');

        // Loop through each line of machine code

        for (let line of lines) {
            // Hunt for a comment
            const commentIndex = line.indexOf('#');

            if (commentIndex != -1) {
                line = line.substr(0, commentIndex);
            }

            // Remove whitespace from either end
            line = line.trim();

            if (line === '') {
                // Line was blank or only a comment
                continue;
            }

            // At this point, the line should just be the 1s and 0s

            // Convert from binary string to number
            const binValue = parseInt(line, 2); // Base 2 == binary

            // Check to see if the parsing failed
            if (isNaN(binValue)) {
                console.error('Invalid binary number: ' + line);
                process.exit(1);
            }

            // Ok, we have a good value, so store it into memory:
            //console.log(`storing ${binValue}, ${line}`);
            comp.store(curAddr, binValue);

            // And on to the next one
            curAddr++;
        }

        onComplete(comp);
    }

    // Read everything from standard input, stolen from:
    // https://stackoverflow.com/questions/13410960/how-to-read-an-entire-text-stream-in-node-js
    process.stdin.resume();
    process.stdin.on('data', function(buf) { content += buf.toString(); });
    process.stdin.on('end', processFile);
}

/**
 * On File Loaded
 * 
 * Computer is set up, start it running
 */
function onFileLoaded(comp) {
    comp.startClock();
}

/**
 * Main
 */

let comp = new Computer();
loadFileFromStdin(comp, onFileLoaded);
