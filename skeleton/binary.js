AND
-----------
0 AND 0   0
0 AND 1   0
1 AND 0   0
1 AND 1   1

NAND
------------
0 NAND 0   1
0 NAND 1   1
1 NAND 0   1
1 NAND 1   0

let a = 0b1;
let b = 0b1;

let r = a & b; // bitwise-AND
let r = a | b; // bitwise-OR
let r = a ^ b; // bitwise-XOR
let r = ~a; // bitwise-NOT

DeMorgan's Laws

a = 10101010
b = 00011100 AND  mask
------------
    00001000

a = 10101010
b = 11110111 AND  mask, clearing a bit
------------
    10100010

a = 10101010
b = 00000000 OR
------------
    10101010

a = 11110000 >>2
  = 00111100

a =   11110000 <<2
  = 1111000000

a = 10000000  Is the 8th bit set?
    00000001 >>7
    00000001 AND
    --------
           1


let f = 3.14159;

let i = f|0; // what?


OR
-----------
0 OR 0   0
0 OR 1   1
1 OR 0   1
1 OR 1   1

XOR
-----------
0 XOR 0   0
0 XOR 1   1
1 XOR 0   1
1 XOR 1   0

NOT (inverter)
-----------
NOT 0  == 1
NOT 1  == 0

if (a && b) {
    // if they're both true
}

00000010 # SET

10 dec == 1010 bin

let s = '00000010';

let dec = s.parseInt(2);
let dec2 = Number('0b0000010');

1 10 100 1000  dec
1  2   4    8  bin

1 10 100 1000