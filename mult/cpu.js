/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require('fs');

// Instructions

const HLT  = 0b00011011; // Halt CPU
const LDI  = 0b00000100; // LDI R,I(mmediate)
const MUL  = 0b00000101; // MUL R,R
const PRN  = 0b00000110; // Print numeric

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
        this.reg.PC  = 0; // Program Counter
        this.reg.IR  = 0; // Instruction Register

		this.setupBranchTable();
    }
	
	/**
	 * Sets up the branch table
	 */
	setupBranchTable() {
		let bt = {};

		bt[HLT] = this.HLT;
		bt[LDI] = this.LDI;
		bt[MUL] = this.MUL;
		bt[PRN] = this.PRN;

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
     */
    alu(op, regA, regB, immediate) {
        let valA, valB;

        // Load valA from regA
        valA = this.reg[regA];

        // Load valB from regB or immediate
        if (regB !== null && regB !== undefined) {
            valB = this.reg[regB];
        } else {
            valB = immediate;
        }

        switch (op) {
            case 'MUL':
                this.reg[regA] = (valA * valB) & 255;
                break;

            case 'ADD':
                this.reg[regA] = (valA + valB) & 255;
                break;

            case 'INC':
                this.reg[regA] = (valA + 1) & 0xff;
                break;
        }
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register from the current PC
        this.reg.IR = this.ram.read(this.reg.PC);

        //console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

        // Based on the value in the Instruction Register, jump to the
        // appropriate hander
		const handler = this.branchTable[this.reg.IR];

		if (handler === undefined) {
			console.log(`ERROR: invalid instruction ${this.reg.IR.toString(2)}`);
			this.stopClock();
			return;
		}

		// We need to use call() so we can set the "this" value inside
		// the handler (otherwise it will be undefined in the handler)
		handler.call(this);
    }

    // INSTRUCTION HANDLER CODE:

    /**
     * HLT
     */
    HLT() {
        this.stopClock();
    }

    /**
     * LDI R,I
     */
    LDI() {
        const reg = this.ram.read(this.reg.PC + 1);
        const val = this.ram.read(this.reg.PC + 2);

        this.reg[reg] = val;

        this.alu('ADD', 'PC', null, 3); // Next instruction
    }

    /**
     * MUL R,R
     */
    MUL() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('MUL', regA, regB);

        this.alu('ADD', 'PC', null, 3); // Next instruction
    }

    /**
     * PRN R
     */
    PRN() {
        const reg = this.ram.read(this.reg.PC + 1);

        fs.writeSync(process.stdout.fd, this.reg[reg] + '\n');

        this.alu('ADD', 'PC', null, 2); // Next instruction
    }
}

module.exports = CPU;
