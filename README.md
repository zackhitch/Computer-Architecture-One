
# Computer Architecture One

## Objectives

* [Understanding Basic Computer Engineering](objectives/basic-comp-eng)
* [Understanding Binary](objectives/binary)

# Assignment

## Implement the LS-8 Emulator

> Objective: to gain a deeper understanding of how a CPU functions at a
> low level.

We're going to write an emulator for the world-famous LambdaSchool-8 computer,
otherwise known as LS-8! This is an 8-bit computer with 8-bit memory addressing,
which is about as simple as it gets.

An 8 bit CPU is one that only has 8 wires available for addresses (specifying
where something is), computations, and instructions. With 8 bits, our CPU has a
total of 256 bytes of memory and can only compute values up to 255. The CPU
could support 256 instructions, as well, but we won't need them.

We'll design a memory subsystem, an ALU, and the main CPU emulator code
in JS. Then we'll write code that loads a file of machine code
instructions from disk, parses the file, and loads it into memory. After
that, we'll start the emulator running and see it execute instructions!

For starters, we'll execute code that initializes the CPU, and then
stores the value 8 in a register.

    # init-and-load.ls8

    00000001 # INIT
    00000010 # SET current register
    00000000 # register R0
    00000100 # SAVE next
    00001000 # 8
    00000000 # HALT

The value on the left is the machine code value of the instruction
(_opcode_) or its immediate argument(s) (the _operands_).


## Improve the LS-8 Emulator

### Implement a Multiply and Print the Result

[See the LS-8 Spec for complete CPU details](LS8-SPEC.md). Note that the
spec is a complete document, and not all its pieces need to be
implemented to complete this assignment. You only need to implement the
instructions referenced below.

Extend your LS8 emulator to support the following program:

    # mult.ls8

    00000001 # INIT
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

You'll need to add the functionality for MUL (multiply the following two
registers together and store the result in the current register) and PRN
(print the current register as a numeric value.)

Supported instructions:

    SET    Set the address of the next byte to be the active register

    SAVE   Save the value of the next byte into the active register

    MUL    Multiply the values stored in the registers identified by the next
           two bytes, saving them into the currently SET register

    PRN    Print Numeric--console.log the integer value of the active register

    HALT   Stop the CPU (and exit the emulator)

The following command line input:

    node ls8 mult.ls8

Should produce

    72

through the process of executing the machine code in the input file.


### Implement System Stack

All CPUs manage a _stack_ that can be used to store information
temporarily. This stack resides in main memory and typically starts at
the top of memory (at a high address) and grows _downward_ as things are
pushed on. The LS-8 is no exception to this.

* Implement a system stack per the spec. Add `PUSH` and `POP` instructions.

### Implement Subroutine Calls

Back the my day, functions were called _subroutines_. In machine code,
this enables you to jump to an address with the `CALL` instruction, and
then return back to where you called from with the `RET` instruction.
This enables you to create reusable functions.

The stack is used to hold the return address, so you **must** implement
the stack, above, first.

* Add subroutine calls. `CALL` and `RET`.