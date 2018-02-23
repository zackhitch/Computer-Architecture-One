/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require('fs');

// Instructions

const HLT  = 0b00011011; // Halt CPU
// !!! IMPLEMENT ME
// LDI
// MUL
// PRN

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers
        
        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg.IR = 0; // Instruction Register

		this.setupBranchTable();
    }
	
	/**
	 * Sets up the branch table
	 */
	setupBranchTable() {
		let bt = {};

        bt[HLT] = this.HLT;
        // !!! IMPLEMENT ME
        // LDI
        // MUL
        // PRN

		this.branchTable = bt;
	}

    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1);
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }

    /**
     * ALU functionality
     * 
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        switch (op) {
            case 'MUL':
                // !!! IMPLEMENT ME
                break;
        }
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register (OR) from the current PC
        // !!! IMPLEMENT ME

        // Debugging output
        //console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

        // Based on the value in the Instruction Register, locate the
        // appropriate hander in the branchTable
        // !!! IMPLEMENT ME
        // let handler = ...

        // Check that the handler is defined, halt if not (invalid
        // instruction)
        // !!! IMPLEMENT ME

        // We need to use call() so we can set the "this" value inside
        // the handler (otherwise it will be undefined in the handler)
        handler.call(this, operandA, operandB);

        // Increment the PC register to go to the next instruction
        // !!! IMPLEMENT ME
    }

    // INSTRUCTION HANDLER CODE:

    /**
     * HLT
     */
    HLT() {
        // !!! IMPLEMENT ME
    }

    /**
     * LDI R,I
     */
    LDI() {
        // !!! IMPLEMENT ME
    }

    /**
     * MUL R,R
     */
    MUL() {
        // !!! IMPLEMENT ME
    }

    /**
     * PRN R
     */
    PRN() {
        // !!! IMPLEMENT ME
    }
}

module.exports = CPU;
