/**
 * Simple program that converts a string into binary bytes for use in source
 * code for the simulated computer
 */

str = 'Hello, world!\n';

/**
 * Convert a value into a binary string of at least 8 bits
 */
function makeBinString(val) {
    let str = val.toString(2);
 
    while (str.length < 8) {
        str = '0' + str;
    }

    return str;
}

// Print out the values in the string
for (let i = 0; i < str.length; i++) {
    const val = str.charCodeAt(i);
    const binVal = makeBinString(val);

    const ascii = val >= 32 && val <= 126? str[i]: '??';
    console.log(`${binVal} # ${ascii}`);
}