# LS-8 Microcomputer Spec v1.0

## Registers

8 general-purpose 8-bit numberic registers R0-R7.

R5 is reserved as the interrupt mask (IM)
R6 is reserved as the interrupt status (IS)
R7 is reserved as the stack pointer (SP)

Many instructions operate on the _current register_ (_CR_), which is a
reference to one of the general-purpose registers. The current register
can be changed with the `SET` instruction. The current register can be
set to refer to any of the general purpose registers.


## Internal Registers

* `PC`: Program Counter, address of the currently executing instruction
* `IR`: Instruction Register, contains a copy of the currently executing instruction
* `MAR`: Memory Address Register, holds the memory address we're reading or writing
* `MDR`: Memory Data Register, holds the value to write or the value just read


## Flags

* `equal`: Flag is set (true) if latest `CMP` was equal


## Memory

The LS-8 has 8-bit addressing, so can address 256 bytes of RAM total.

Memory map:

```
      top of RAM
+-----------------------+
| FF  I7 vector         |    Interrupt vector table
| FE  I6 vector         |
| FD  I5 vector         |
| FC  I4 vector         |
| FB  I3 vector         |
| FA  I2 vector         |
| F9  I1 vector         |
| F8  I0 vector         |
| F7  Top of Stack      |    Stack grows down
|                       |
| ...                   |
|                       |
| 00 Program entry      |    Program loaded upward in memory starting at 0
+-----------------------+
    bottom of RAM
```

## Stack

The SP points at the value at the top of the stack, or at address `F8`
if the stack is empty.

## Interrupts

There are 8 interrupts, I0-I7.

When an interrupt occurs from an external source or from an `INT`
instruction, the CPU follows the steps outlined in the reference for the
`INT` instruction, below.


## Instruction Set

Glossary:

**CR**: Current Register, see above
**immediate**: takes a constant integer value as an argument
**register**: takes a register number as an argument
**memory**: takes a memory address as an argument

`mmmmmmmm`: 8-bit memory address
`iiiiiiii`: 8-bit immediate value
`00000rrr`: Register number
`00000aaa`: Register number (altnerate)
`00000bbb`: Register number (altnerate)
`00000ttt`: Interrupt number

### ADD

`ADD register register`

Add two registers and store the result in CR.

Machine code:
```
00001100 00000aaa 00000bbb
```

### CALL

`CALL`

Calls a subroutine (function) at the address stored in the CR.

Before the call is made, the address of the _next_ instruction that will execute is pushed onto the stack.

Machine code:
```
00001111
```

### CMP

`CMP register`

Compare the value in CR with that in the given register.

If the are equal, set the `equal` flag to true.
If the are not equal, set the `equal` flag to false.

Machine code:
```
00010110 00000rrr
```

### DEC

`DEC`

Decrement the value in the current register.

Machine code:
```
00011000
```

### DIV

`DIV register register`

Divide the value in the first register by the value in the second,
storing the result in CR.

If the value in the second register is 0, the system should print an
error message and halt.

Machine code:
```
0b00001110 00000aaa 00000bbb
```

### HALT

`HALT`

Halt the CPU (and exit the emulator).

Machine code:
```
00000000
```

### INC

`INC`

Increment the value in the current register.

Machine code:
```
00010111
```

### INIT

`INIT`

Initialize the registers by setting R0-R5 to 0.

Machine code:
```
00000001
```

### INT

`INT`

Issue the interrupt number stored in the CR.

The following steps are executed:

1. The address of the next instruction is pushed on the stack.
2. Registers R0-R5 are pushed on the stack in that order.
3. The address (_vector_ in interrupt terminiology) of the appropriate
   handler is looked up from the interrupt vector table. The PC is set
   to the appropriate value in the vector table.

Machine code:
```
00011001
```

### IRET

`IRET`

Return from an interrupt handler.

The following steps are executed:

1. Registers R5-R0 are popped off the stack in that order.
2. The return address is popped off the stack and stored in PC.

Machine code:
```
00011010
```

### JEQ

`JEQ`

If `equal` flag is set (true), jump to the address stored in CR.

Machine code:
```
00010011
```

### JMP

`JMP`

Jump to the address stored in the CR.

Set the PC to the address stored in the CR.

Machine code:
```
00010001
```

### JNE

`JNE`

If `equal` flag is clear (false), jump to the address stored in CR.

Machine code:
```
00010100
```

### LD

`LD memory`

Load value at address into CR.

Machine code:
```
00001000 mmmmmmmm
```

### LDRI

`LDRI register`

Load Register Indirect. Loads the CR with the value at the address stored in the given register.

Machine code:
```
00010010 00000rrr
```

### MUL

`MUL register register`

Multiply two registers together and store the result in CR.

Machine code:
```
00000101 00000aaa 00000bbb
```

### POP

`POP`

Pop the value at the top of the stack into the CR.

Machine code:
```
00001011
```

### PRA

`PRA` pseudo-instruction

Print alpah character value stored in the CR.

Machine code:
```
00000111
```

### PRN

`PRN` pseudo-instruction

Print numeric value stored in the CR.

Machine code:
```
00000110
```

### PUSH

`PUSH`

Push the CR on the stack.

Machine code:
```
00001010
```

### RET

`RET`

Return from subroutine.

Pop the value from the top of the stack and store it in the PC.

Machine Code:
```
00010000
```

### SAVE

`SAVE immediate`

Save a value in the CR.

Machine code:
```
00000100 iiiiiiii
```

### SET

`SET register`

Set the CR to refer to the given register

Machine code:
```
00000010 00000rrr
```

# ST

`ST memory`

Store value in CR in specified memory address.

Machine code:
```
00001001 mmmmmmmm
```

### STRI

`STRI register`

Store Register Indirect. Stores the value in the CR in the memory
address stored in the given register.

Machine code:
```
00011100 00000rrr
```

### SUB

`SUB register register`

Subtract the value in the second register from the first, storing the
result in CR.

Machine code:
```
00001101 00000aaa 00000bbb
```
