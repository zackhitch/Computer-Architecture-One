# Binary review

In decimal, we have 10 digits, 0-9. Multi-digit numbers have the 1's place, the
10's place, and the 100's place, etc.

E.g. 123 has `1` in the 100's place, `2` in the 10's place, and `3` in the 1's place.

In binary, we only have two digits, 0-1. Multi-digit numbers have the 1's place,
the 2's place, the 4's place, the 8's place, the 16's place, etc.

It's convenient, as a developer, to have this sequence of powers of two
memorized at least up to 1024:

    1 2 4 8 16 32 64 128 256 512 1024
    2048 4096 8192 16384 32768 65536

These are all powers of 2. 2^0 = 1, 2^2 = 2, 2^3 = 4, etc.

*Remember that if you have a pile of apples, the count of apples in that pile is
the same regardless of whether you write it down in base 10 (decimal), or base 2
(binary). These are just two different ways of representing the same number!*

Or put another way, this prints `TRUE`:

```javascript

// is 5 decimal equal to 101 binary?

if (5 == 0b101) {
    console.log('TRUE');
}
```

Computers find it convenient to represent numbers in base 2 for a variety of
reasons. One is that it's easy to represent as a voltage on a wire: 0 volts is a
`0` and 5 volts (or whatever) is a `1`. Another is that you can do boolean logic
with `0` being `FALSE` and `1` being `TRUE`.

> *There are 10 kinds of people in the world: those who understand binary and
those who don't.*


## Convert Binary to Decimal

### In JavaScript:

```javascript
// Binary constants:

let myBinary = 0b101; // 101 binary is 5 decimal

// Converting a binary string to a Number

let myValue1 = Number('0b101');

// or

let myValue2 = parseInt('101', 2); // base 2

// All these print 5:
console.log(myBinary); // 5
console.log(myValue1); // 5
console.log(myValue2); // 5
```

### By hand:

    +------ 8's place
    |+----- 4's place
    ||+---- 2's place
    |||+--- 1's place
    ||||
    1010

The above example has one 8, zero 4s, one 2, and zero 1s. That is, it has one 8
and one 2. One 8 and one 2 is 10, `8+2=10`

`1010` binary == `10` decimal.

## Convert Decimal to Binary

### In Javascript

```javascript
// Decimal constants (just like normal)

const val = 123;

// Converting a decimal to a binary string

const binVal = val.toString(2); // convert to base 2 number string

console.log(`${val} decimal is ${binVal} in binary`);
```

Note that the result is a string. This makes sense because you already
had the number in `val` as a `Number` type; the only other way to
represent it is as a `string`.

### By Hand

This one's a little trickier, since you have to work the binary-to-decimal
conversion backwards.

Example: convert `123` decimal into binary. You have to come up with sum of the
powers of two that add up to it.

Start with the highest power of two that's lower than the number: 64. We
know we have zero 128s in the number, because it's only 123. But there
must be a 64 in there.

So let's put a 1 in the 64s place:

    1xxxxxx     All the x's are unknown

Now we compute `123-64` because we've taken the 64 out of there.
`123-64=59`. So let's go to the next power of two down: 32.

59 has a 32 in it, so that must be a 1 in the 32's place, as well:

    11xxxxx     All the x's are unknown

Then we compute `59-32=27` and go down to the next power of two: 16. There's one
16 in 27, so that's a 1 in the 16s place:

    111xxxx     All the x's are unknown

Then we compute `27-16=11` and do the next power of two: 8. There's 1 8 in 11,
so that's 1, too:

    1111xxx     All the x's are unknown

Then we compute `11-8=3` and do the next power of two: 4. There are zero 4s in
3. so that's a 0 for a change:

    11110xx     All the x's are unknown

We're still at 3 decimal, but we drop to the next power of two: 2. There is one
2 in 3, so that's a 1:

    111101x     All the x's are unknown

And we compute `3-2=1`, and drop to the last power of two: 1. There is
one 1 in 1, so that's a 1:

    1111011 binary is 123 decimal


## Hexadecimal

Hex is a base-16 numbering system. It has 6 more digits than decimal
(which is base 10). These 6 digits, which come after 9, are A, B, C, D,
E, and F.

Counting to decimal 16 in hexadecimal goes like this:

```
0 1 2 3 4 5 6 7 8 9 A B C D E F 10
```

You might have already seen hexadecimal numbers in CSS colors, such as
`#ccff00`.

### Converting Binary to Hex

Fortunately, since 16 and 2 are powers of two, there are an even number
of binary bits per hex digit: 4 bits per hex digit.

So if we have a 1-byte number, like `01101100`, we split it in segments
of 4 bits and convert each of those to a hex digit. It might be more
convenient to convert do decimal first for numbers over 9 decimal.

```
00111100
```

split into sequences of 4 bits.

```
0011 1100
```

convert to hex (or decimal then hex, if more convenient):

```
0011 1100
 3    C      (C hex == 12 decimal == 1100 binary)
```

So `0b00111100` is equivalent to `0x3c`. (Hex constants are written with
a leading `0x` in JS, C, and many other languages.)

Converting hex to binary is the same in reverse. 4 bits per hex digit.


## Exercises

* Convert 78 decimal to binary.

* Convert 1111 binary to decimal. Then convert 10000 binary to decimal.
  What conclusion can you make about binary numbers that end in a solid
  sequence of 1s?

* Convert 111 to binary.

* Convert 111 to hexadecimal.

* Convert 0x10 to decimal.

* Convert 0xe2 to decimal.

* Convert 0xff to decimal.

* Convert 0x12345678 to binary.