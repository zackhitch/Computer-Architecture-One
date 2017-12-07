const HALT = 0b00000000; // Halt CPU
const INIT = 0b00000001; // Initialize CPU registers to zero
const SET  = 0b00000010; // SET R(egister)
const SAVE = 0b00000100; // SAVE I(mmediate)
const MUL  = 0b00000101; // MUL R R
const PRN  = 0b00000110; // Print numeric
const PRA  = 0b00000111; // Print alpha char

function debug(s) {
    //console.log(s);
}

class CPU {
    constructor(ram) {
        this.ram = ram;

        this.curReg = 0;
        this.reg = new Array(256);
        this.reg.fill(0);

        this.reg.PC = 0;

        this.buildBranchTable();
    }

    /**
     * Build the branch table
     */
    buildBranchTable() {
        this.branchTable = {
            [INIT]: this.INIT,
            [SET]: this.SET,
            [SAVE]: this.SAVE,
            [MUL]: this.MUL,
            [PRN]: this.PRN,
            [HALT]: this.HALT,
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
     * Handle INIT
     */
    INIT() {
        debug("INIT");
        this.curReg = 0;

        this.reg.PC++; // go to next instruction
    }

    /**
     * Handle SET
     */
    SET() {
        const reg = this.ram.read(this.reg.PC + 1);
        debug("SET " + reg);

        this.curReg = reg;

        this.reg.PC += 2;  // go to next instruction
    }

    /**
     * Handle MUL
     */
    MUL() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);
        debug(`MUL ${regA} ${regB}`);

        this.reg[this.curReg] = this.reg[regA] * this.reg[regB];

        this.reg.PC += 3;  // go to next instruction
    }

    /**
     * Handle SAVE
     */
    SAVE() {
        const val = this.ram.read(this.reg.PC + 1);
        debug("SAVE " + val);

        // Store the value in the current register
        this.reg[this.curReg] = val;

        this.reg.PC += 2;  // go to next instruction
    }

    /**
     * Handle PRN, print numeric
     */
    PRN() {
        console.log(this.reg[this.curReg]);

        this.reg.PC++;
    }

    /**
     * Handle HALT
     */
    HALT() {
        this.stopClock();
    }
}

module.exports = CPU;