const LDI  = 0b00000100; // LDI R,I
const MUL  = 0b00000101; // MUL R,R
const PRN  = 0b00000110; // Print numeric
const HALT = 0b00011011; // Halt CPU

function debug(s) {
    //console.log(s);
}

class CPU {
    constructor(ram) {
        this.ram = ram;

        // Registers R0-R7
        this.reg = new Array(8);
        this.reg.fill(0);

        this.reg.PC = 0;

        this.buildBranchTable();
    }

    /**
     * Build the branch table
     */
    buildBranchTable() {
        this.branchTable = {
            [HALT]: this.HALT,
            [LDI]: this.LDI,
            [MUL]: this.MUL,
            [PRN]: this.PRN,
        };
    }

    /**
     * Poke values into memory
     */
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * start the clock
     */
    startClock() {
        this.clock = setInterval(() => { this.tick(); }, 1);
    }

    /**
     * Stop the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }

    /**
     * Each tick of the clock
     */
    tick() {
        // Run the instructions
        const currentInstruction = this.ram.read(this.reg.PC);

        const handler = this.branchTable[currentInstruction];

        if (handler === undefined) {
            console.error("ERROR: invalid instruction " + currentInstruction);
            this.stopClock();
            return;
        }

        handler.call(this);  // set this explicitly in handler
    }

    /**
     * Handle HALT
     */
    HALT() {
        this.stopClock();
    }

    /**
     * Handle LDI R,I
     */
    LDI() {
        const reg = this.ram.read(this.reg.PC + 1);
        const val = this.ram.read(this.reg.PC + 2);
        debug(`LDI ${reg} ${val}`);

        // Store the value in the current register
        this.reg[reg] = val;

        this.reg.PC += 3;  // go to next instruction
    }

    /**
     * Handle MUL R,R
     */
    MUL() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);
        debug(`MUL ${regA} ${regB}`);

        this.reg[regA] = this.reg[regA] * this.reg[regB];

        this.reg.PC += 3;  // go to next instruction
    }

    /**
     * Handle PRN R, print numeric
     */
    PRN() {
        const reg = this.ram.read(this.reg.PC + 1);

        console.log(this.reg[reg]);

        this.reg.PC += 2; // go to next instruction
    }
}

module.exports = CPU;