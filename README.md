# Computer Architecture

Welcome to the first class on classical Computer Science! Beginning now, you will be studying the underpinnings of the programming lessons that you have practiced previously.

The first pair of sprints in this coursework are about your computer itself: computer architecture. Generic computers are just a large and careful collection of basic electronics components and wires connecting them. Computer architecture is the specific design of a computer.

## Basic Computer Engineering

We can't start our study of computers without a brief discussion of computer engineering. Know what the following words mean:

- Transistor
- Logic gate
- RS Flip Flop

## Architecture

![Basic Architecture](https://www.lucidchart.com/publicSegments/view/8e06c9e0-0087-4c53-9486-c5aaca137ff3/image.png)

Computers have grown radically in transistor density and clock speed, but the overall design of your computer has not changed tremendously since the 8086 in 1976 [1](https://en.wikipedia.org/wiki/X86). Modern computers utilized a fixed component architecture, where separate components can be upgraded, swapped, or redesigned for the next version with minimal impact on other components. It helps to visualize these components on a full size ATX form-factor motherboard:

![Image of motherboard](https://www.dropbox.com/s/7jc00mllz3vs8ta/Lambda%20School%20Motherboard.jpg?raw=1)
An image of an older motherboard - many of the base components are the same, but the front size bus is missing on modern motherboards because it is now inside of the CPU.

![LGA-1151 socket](https://upload.wikimedia.org/wikipedia/commons/c/c9/Core_i7_bottom.png)
The pins on the bottom of the CPU that connect it with the rest of the system components: clock controls, buses, serial interfaces, interrupts, power

![i7 CPU on motherboard](https://commons.wikimedia.org/wiki/File:Intel_i7_4770_CPU_on_an_ASUS_Gryphon_Z87_uATX_motherboard.jpg)

![Kaby Lake Quad Core](https://en.wikichip.org/w/images/thumb/d/dc/kaby_lake_%28quad_core%29_%28annotated%29.png/800px-kaby_lake_%28quad_core%29_%28annotated%29.png)

![Quad core manual diagram](https://www.dropbox.com/s/3xli0imznavxdnf/Kaby%20Lake%20Core%20design.png?raw=1)

[Amazing explanation of Kaby Lake CPU architecture](https://en.wikichip.org/wiki/intel/microarchitectures/kaby_lake)

# Elements of the CPU

CPU, Clock(s), Program Counter, Instruction Register, Arithmetic Logic Unit, bus(es), RAM, Registers, Operations

- CPU - a general purpose hardware component built with custom hardware to: read and write memory, perform arithmetic

- Clock(s) - Special pieces of electronics hardware that cause a small voltage cycle at an insanely fast speed. Kaby Lake clocks: base, core, ring, IGP, eDRAM, Mem

- Registers - Small memory locations within the CPU used for retrieving instructions, reading and writing memory, and executing commands.

- Instruction Register - A special memory register that decodes, pipelines, and executes the current instruction (which was read from the memory pointed to by the program counter). In our small example the instruction register will handle a single instruction, memory address, or data, but in a modern CPU at least 64 bits are available and the instruction can be combined with data like (MUL register1address register2address).

- Arithmetic Logic Unit - Part of the CPU that handles basic arithmetic and boolean comparisons.

- Operations - Single numeric values that indicate to the CPU the next step or series of steps.

- Cache - Memory located inside of the CPU for low latency and high throughput. RAM located outside of CPU fundamentally must be slower, because it is so far away.

- bus - A set of wires that connects the CPU with other system components such as RAM and peripherals. The CPU has internal buses, and modern systems have different buses for different components: DMA bus, PCI bus, 

- RAM - A grid of bits

Reading:

[Bus](https://en.wikipedia.org/wiki/Bus_(computing))

[RAM](https://en.wikipedia.org/wiki/Random-access_memory)

## Interrupting the CPU

Polling, Interrupts, and DMA

I/O Bus

### APIC
[Advanced Programmable Interrupt Controller](https://en.wikipedia.org/wiki/Advanced_Programmable_Interrupt_Controller)

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

Note that the result is a string. This makes sense because you already had the
number in `val` as a `Number` type; the only other way to represent it is as a
`string`.

### By Hand

This one's a little trickier, since you have to work the binary-to-decimal
conversion backwards.

Example: convert `123` decimal into binary. You have to come up with sum of the
powers of two that add up to it.

Start with the highest power of two that's lower than the number: 64. We know we
have zero 128s in the number, because it's only 123. But there must be a 64 in
there.

So let's put a 1 in the 64s place:

    1xxxxxx     All the x's are unknown

Now we compute `123-64` because we've taken the 64 out of there. `123-64=59`. So let's go to the next power of two down: 32.

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

And we compute `3-2=1`, and drop to the last power of two: 1. There is one 1 in 1, so that's a 1:

    1111011 binary is 123 decimal

# Assignment - The Most Basic CPU

You're going to write an emulator for the world-famous LambdaSchool-8 computer,
otherwise known as LS-8! This is an 8-bit computer with 8-bit memory addressing,
which is about as simple as it gets.

An 8 bit CPU is one that only has 8 wires available for addresses (specifying
where something is), computations, and instructions. With 8 bits, our CPU has a
total of 256 bytes of memory and can only compute values up to 255. The CPU
could support 256 instrutions, as well, but we won't need them.

The following file is a very simple program that runs on our CPU.

    # mult.ls8

    00000001 # initialize
    00000010 # SET current register
    00000000 # register R0
    00000100 # SAVE next
    00001000 # 8
    00000010 # SET current register
    00000001 # register R1
    00000100 # SAVE next
    00001001 # 9
    00000010 # SET current register
    00000010 # register R2
    00000101 # MUL into current register
    00000000 # register R0
    00000001 # register R1  (we've computed R2 = R0 * R1)
    00000010 # SET current register
    00000010 # register R2
    00000110 # PRN (print numeric) (should print 72)
    00000000 # HALT

Your goal is to write a simple CPU that supports the above instructions. You
will need to read the file (as an argument or a stream) via NodeJS into an array
of memory addresses (RAM). Then you will create a _program counter_ (PC) that
points to the index of the current instruction, reads it, decodes it, and
executes it. You should use `setInterval()` to create a timer (the _clock_) and
execute one instruction per clock tick.

When the CPU processes a `HALT` instruction, use `clearInterval()` to stop the
clock so that NodeJS exits.

Supported instructions:

    SET    Set the address of the next byte to be the active register

    SAVE   Save the value of the next byte into the active register

    MUL    Multiply the values stored in the registers identified by the next
           two bytes, saving them into the currently SET register

    PRN    Print Numeric--console.log the integer value of the active register

The following command line input:

    node ls8.js inputfile

Should produce

    72

`console.log(72)` is not sufficient.

Once the basic solution is implemented, continue with the following additional
goals.

## Add `PRA`, _Print Alpha_

Create one new instruction, `PRA` (_Print Alpha_), which will output the value
of the active register as an ASCII character instead of an integer. Output
`Hello World!` using the above Most Basic 8-bit CPU.

The following command line input:

    node ls8.js hello.ls8

Should produce

    Hello World!

Using the above specified architecture. `console.log('Hello World!')` is not sufficient.

## Add More Math Instructions

Add `ADD`, `SUB`, and `DIV` instructions.

Halt the CPU with an error message if the user attempts to divide by zero.


## Add `INC` and `DEC`

Increment and decrement. Increases the value in the current register by 1, or
decreases the value in the current register by 1. Since this is an 8 bit
machine, 256 should wrap to 0, and -1 should wrap to 255.

## Add a Stack, and `PUSH` and `POP`

Add a stack. Stacks in CPUs generally start high at the top of memory (address
255) and grows down as you push onto them.

Add a `PUSH` and `POP` instruction. These push the current register (from `SET`)
onto the stack or pop the stack into the current register.

## Add subroutines, `CALL` and `RET`

Add subroutine calls. These are analogous to functions in higher-level
languages, but don't have any concept of parameters or return values.

A `CALL` instruction should be followed by an address to jump to.

It should push the next instruction address onto the stack (from the stack
section, above).

A `RET` instruction should pop the return address from the stack and put it in
the Program Counter.

## Memory Manipulation with Load and Store

Add load and store. These are instructions that allow you to read and write
memory addresses directly.

`LD` instruction is followed by an address. It takes the value from that address
and loads it into the current register.

`ST` instruction is followed by an address. It takes the value the current
register and stores it in that address.

`LDRI` (load register indirect) instruction is followed by a register number.
That register contains an address. This instruction takes the value at that
address and stores it in the current register.

`STRI` (store register indirect) instruction is followed by a register number.
That register contains an address. This instruction takes the value of the
current register and stores it in that address.

## Comparisons and Branching

`JMP` followed by an address to jump to. Set the PC to the new address.

`CMP` followed by a register number. Compare the current register to that
register. Set the `equal` flag to true if they're equal.

`JEQ` followed by an address to jump to. Jump to that address if the `equal`
flag is set.

`JNE` followed by an address to jump to. Jump to that address if the `equal`
flag is clear.

# Links

[Instruction Register](https://en.wikipedia.org/wiki/Instruction_register)

[RAM](https://en.wikipedia.org/wiki/Random-access_memory)

[PCE Express](https://en.wikipedia.org/wiki/PCI_Express)
