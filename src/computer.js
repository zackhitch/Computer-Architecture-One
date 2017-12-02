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
        this.PC = 0;
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
        let _this = this;

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
        let IR = this.mem[this.PC];
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
     * SET
     */
    SET() {
        this.curReg = this.mem[this.PC+1];
        this.PC += 2;
    }

    /**
     * SAVE
     */
    SAVE() {
        this.reg[this.curReg] = this.mem[this.PC+1];
        this.PC += 2;
    }

    /**
     * MUL
     */
    MUL() {
        let regNum0 = this.mem[this.PC+1];
        let regNum1 = this.mem[this.PC+2];
        let regVal0 = this.reg[regNum0];
        let regVal1 = this.reg[regNum1];

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
}

module.exports = Computer;