const INIT = 0b00000001;
const SET  = 0b00000010;
const SAVE = 0b00000100;

class CPU {
    constructor() {
        this.mem = new Array(256);
        this.mem.fill(0);

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
            [SAVE]: this.SAVE
        };
    }

    /**
     * Poke values into memory
     */
    poke(address, value) {
        this.mem[address] = value;
    }

    /**
     * start the clock
     */
    startClock() {
        this.clock = setInterval(() => { this.tick(); }, 500);
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
        const currentInstruction = this.mem[this.reg.PC];

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
        console.log("INIT");
        this.curReg = 0;

        this.reg.PC++; // go to next instruction
    }

    /**
     * Handle SET
     */
    SET() {
        const reg = this.mem[this.reg.PC + 1];
        console.log("SET " + reg);

        this.curReg = reg;

        this.reg.PC += 2;  // go to next instruction
    }

    /**
     * Handle SAVE
     */
    SAVE() {
        const val = this.mem[this.reg.PC + 1];
        console.log("SAVE " + val);

        // Store the value in the current register
        this.reg[this.curReg] = val;

        this.reg.PC += 2;  // go to next instruction
    }
}

module.exports = CPU;