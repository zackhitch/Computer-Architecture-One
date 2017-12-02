// Instructions

// Basic CPU
const HALT = 0b00000000; // Halt CPU
const INIT = 0b00000001; // Initialize CPU registers to zero
const SET  = 0b00000010; // SET R(egister)
const SAVE = 0b00000100; // SAVE I(mmediate)
const MUL  = 0b00000101; // MUL R R
const PRN  = 0b00000110; // Print numeric
const PRA  = 0b00000111; // Print alpha char

// Load/Store Extension
const LD   = 0b00001000; // Load M(emory)
const ST   = 0b00001001; // Store M(emory)

// Push/Pop Extension
// Uses register 255 as the stack pointer 
const PUSH = 0b00001010; // Push
const POP  = 0b00001011; // Pop

// Math Extension
const ADD  = 0b00001100; // ADD R R
const SUB  = 0b00001101; // SUB R R
const DIV  = 0b00001110; // DIV R R

// Call/Return Extension
const CALL = 0b00001111; // Call
const RET  = 0b00010000; // Return

// Compare/Branch Extension
//CMP I 
//CMP R 
//JEQ A 

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class Computer {

    /**
     * Initialize the CPU
     */
    constructor() {
        this.PC = this.SP = 0;
        this.curReg = 0;
        this.reg = new Array(256); // registers
        this.mem = new Array(256); // memory
    }

    /**
     * Store in memory
     */
    store(address, value) {
        this.mem[address] = value;
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.timer = setInterval(() => {
            _this.tick();
        }, 1);
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.timer);
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register from the current PC
        const IR = this.mem[this.PC];
        //console.log(`Executing ${IR.toString(2)}`);

        switch (IR) {
            case HALT:
                this.stopClock();
                break;

            case INIT:
                this.INIT();
                break;

            case SET:
                this.SET();
                break;

            case SAVE:
                this.SAVE();
                break;
            
            case MUL:
                this.MUL();
                break;

            case PRN:
                this.PRN();
                break;

            case PRA:
                this.PRA();
                break;

            case LD:
                this.LD();
                break;

            case ST:
                this.ST();
                break;

            case PUSH:
                this.PUSH();
                break;

            case POP:
                this.POP();
                break;

            case ADD:
                this.ADD();
                break;

            default:
                console.error(`Invalid instruction ${IR.toString(2)}`);
                this.stopClock();
                break;
        }

    }

    /**
     * INIT
     */
    INIT() {
        this.curReg = 0;
        this.reg.fill(0);
        this.PC++;
    }

    /**
     * SET R
     */
    SET() {
        this.curReg = this.mem[this.PC+1];
        this.PC += 2;
    }

    /**
     * SAVE I
     */
    SAVE() {
        this.reg[this.curReg] = this.mem[this.PC+1];
        this.PC += 2;
    }

    /**
     * MUL R R
     */
    MUL() {
        const regNum0 = this.mem[this.PC+1];
        const regNum1 = this.mem[this.PC+2];
        const regVal0 = this.reg[regNum0];
        const regVal1 = this.reg[regNum1];

        this.reg[this.curReg] = regVal0 * regVal1;
        this.PC += 3;
    }

    /**
     * PRN
     */
    PRN() {
        console.log(this.reg[this.curReg]);
        this.PC++;
    }

    /**
     * PRA
     */
    PRA() {
        console.log(String.fromCharCode(this.reg[this.curReg]));
        this.PC++;
    }

    /**
     * LD M
     */
    LD() {
        const addr = this.mem[this.PC+1];
        this.reg[this.curReg] = this.mem[addr];
        this.PC += 2;
    }

    /**
     * ST M
     */
    ST() {
        const addr = this.mem[this.PC+1];
        this.mem[addr] = this.reg[this.curReg];
        this.PC += 2;
    }

    /**
     * Internal push helper, doesn't move PC
     */
    _push(val) {
        // Decrement SP, stack grows down from address 255
        this.SP--;

        // Clamp in range 0-255, wrapping around
        if (this.SP < 0) { this.SP = 255; }

        this.mem[this.SP] = val;
    }

    /**
     * PUSH
     */
    PUSH() {
        _push(this.reg[this.curReg]);
        this.PC++;
    }

    /**
     * Internal pop helper, doesn't move PC
     */
    _pop() {
        const val = this.mem[this.SP];

        // Increment SP, stack grows down from address 255
        this.SP++;

        // Clamp in range 0-255, wrapping around
        if (this.SP > 255) { this.SP = 0; }

        return val;
    }

    /**
     * POP
     */
    POP() {
        this.reg[this.curReg] = _pop();
        this.PC++;
    }

    /**
     * ADD R R
     */
    ADD() {
        const regNum0 = this.mem[this.PC+1];
        const regNum1 = this.mem[this.PC+2];
        const regVal0 = this.reg[regNum0];
        const regVal1 = this.reg[regNum1];

        this.reg[this.curReg] = regVal0 + regVal1;
        this.PC += 3;
    }

    /**
     * SUB R R
     */
    SUB() {
        const regNum0 = this.mem[this.PC+1];
        const regNum1 = this.mem[this.PC+2];
        const regVal0 = this.reg[regNum0];
        const regVal1 = this.reg[regNum1];

        this.reg[this.curReg] = regVal0 - regVal1;
        this.PC += 3;
    }

    /**
     * DIV R R
     */
    DIV() {
        const regNum0 = this.mem[this.PC+1];
        const regNum1 = this.mem[this.PC+2];
        const regVal0 = this.reg[regNum0];
        const regVal1 = this.reg[regNum1];

        if (regVal1 === 0) {
            console.error('ERROR: DIV 0');
            this.stopClock();
        }

        this.reg[this.curReg] = regVal0 / regVal1;
        this.PC += 3;
    }

    /**
     * CALL
     */
    CALL() {
        // Save the return address on the stack
        _push(this.PC + 1); // +1 to make the next instruction the return address

        // Address we're going to call to
        const addr = this.reg[this.curReg];
        this.PC = addr;
    }

    /**
     * RET
     */
    RET() {
        // Pop the return address off the stack and put straight in PC
        this.PC = _pop();
    }
}

module.exports = Computer;