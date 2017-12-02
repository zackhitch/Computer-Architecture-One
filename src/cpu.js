const fs = require('fs');

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
const LDRI = 0b00010010; // Load-Register-Indirect R

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
const JMP  = 0b00010001; // JMP
const JEQ  = 0b00010011; // JEQ
const JNE  = 0b00010100; // JNE
const CMPI = 0b00010101; // CMP I
const CMP  = 0b00010110; // CMP R

// Increment/Decrement Extension
const INC  = 0b00010111; // INC
const DEC  = 0b00011000; // DEC

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor() {
        // CPU flags
        this.flags = {
            equal: false
        };

        this.reg = new Array(256); // General-purpose registers

        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg.IR = 0; // Intruction Register
        this.reg.SP = 0; // Stack Pointer

        this.mem = new Array(256); // Memory (RAM)

		this.setupBranchTable();
    }
	
	/**
	 * Sets up the branch table
	 */
	setupBranchTable() {
		let bt = {};

		bt[HALT] = this.HALT;
		bt[INIT] = this.INIT;
		bt[SET] = this.SET;
		bt[SAVE] = this.SAVE;
		bt[MUL] = this.MUL;
		bt[PRN] = this.PRN;
		bt[PRA] = this.PRA;
		bt[LD] = this.LD;
		bt[ST] = this.ST;
		bt[LDRI] = this.LDRI;
		bt[PUSH] = this.PUSH;
		bt[POP] = this.POP;
		bt[ADD] = this.ADD;
		bt[SUB] = this.SUB;
		bt[DIV] = this.DIV;
		bt[CALL] = this.CALL;
		bt[RET] = this.RET;
		bt[JMP] = this.JMP;
		bt[JEQ] = this.JEQ;
		bt[JNE] = this.JNE;
		bt[CMPI] = this.CMPI;
		bt[CMP] = this.CMP;
		bt[INC] = this.INC;
		bt[DEC] = this.DEC;

		this.branchTable = bt;
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
        this.reg.IR = this.mem[this.reg.PC];
        //console.log(`${this.reg.PC}: ${IR.toString(2)}`);

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

    /**
     * HALT
     */
    HALT() {
        this.stopClock();
    }

    /**
     * INIT
     */
    INIT() {
        this.flags.equal = false;
        this.curReg = 0;
        this.reg.fill(0, 0, 256);
        this.reg.PC++;
    }

    /**
     * SET R
     */
    SET() {
        this.curReg = this.mem[this.reg.PC+1];
        this.reg.PC += 2;
    }

    /**
     * SAVE I
     */
    SAVE() {
        this.reg[this.curReg] = this.mem[this.reg.PC+1];
        this.reg.PC += 2;
    }

    /**
     * MUL R R
     */
    MUL() {
        const regNum0 = this.mem[this.reg.PC+1];
        const regNum1 = this.mem[this.reg.PC+2];
        const regVal0 = this.reg[regNum0];
        const regVal1 = this.reg[regNum1];

        this.reg[this.curReg] = regVal0 * regVal1;
        this.reg.PC += 3;
    }

    /**
     * PRN
     */
    PRN() {
        fs.writeSync(process.stdout.fd, this.reg[this.curReg]);
        this.reg.PC++;
    }

    /**
     * PRA
     */
    PRA() {
        fs.writeSync(process.stdout.fd, String.fromCharCode(this.reg[this.curReg]));
        this.reg.PC++;
    }

    /**
     * LD M
     */
    LD() {
        const addr = this.mem[this.reg.PC+1];
        this.reg[this.curReg] = this.mem[addr];
        this.reg.PC += 2;
    }

    /**
     * ST M
     */
    ST() {
        const addr = this.mem[this.reg.PC+1];
        this.mem[addr] = this.reg[this.curReg];
        this.reg.PC += 2;
    }

    /**
     * LDRI R
     */
    LDRI() {
        const reg = this.mem[this.reg.PC+1];
        const regVal = this.reg[reg];
        const memVal = this.mem[regVal];
        this.reg[this.curReg] = memVal;

        this.reg.PC += 2;
    }

    /**
     * Internal push helper, doesn't move PC
     */
    _push(val) {
        // Decrement SP, stack grows down from address 255
        this.reg.SP--;

        // Clamp in range 0-255, wrapping around
        if (this.reg.SP < 0) { this.reg.SP = 255; }

        this.mem[this.reg.SP] = val;
    }

    /**
     * PUSH
     */
    PUSH() {
        this._push(this.reg[this.curReg]);
        this.reg.PC++;
    }

    /**
     * Internal pop helper, doesn't move PC
     */
    _pop() {
        const val = this.mem[this.reg.SP];

        // Increment SP, stack grows down from address 255
        this.reg.SP++;

        // Clamp in range 0-255, wrapping around
        if (this.reg.SP > 255) { this.reg.SP = 0; }

        return val;
    }

    /**
     * POP
     */
    POP() {
        this.reg[this.curReg] = this._pop();
        this.reg.PC++;
    }

    /**
     * ADD R R
     */
    ADD() {
        const regNum0 = this.mem[this.reg.PC+1];
        const regNum1 = this.mem[this.reg.PC+2];
        const regVal0 = this.reg[regNum0];
        const regVal1 = this.reg[regNum1];

        this.reg[this.curReg] = regVal0 + regVal1;
        this.reg.PC += 3;
    }

    /**
     * SUB R R
     */
    SUB() {
        const regNum0 = this.mem[this.reg.PC+1];
        const regNum1 = this.mem[this.reg.PC+2];
        const regVal0 = this.reg[regNum0];
        const regVal1 = this.reg[regNum1];

        this.reg[this.curReg] = regVal0 - regVal1;
        this.reg.PC += 3;
    }

    /**
     * DIV R R
     */
    DIV() {
        const regNum0 = this.mem[this.reg.PC+1];
        const regNum1 = this.mem[this.reg.PC+2];
        const regVal0 = this.reg[regNum0];
        const regVal1 = this.reg[regNum1];

        if (regVal1 === 0) {
            console.log('ERROR: divide by 0');
            this.stopClock();
        }

        this.reg[this.curReg] = regVal0 / regVal1;
        this.reg.PC += 3;
    }

    /**
     * CALL
     */
    CALL() {
        // Save the return address on the stack
        this._push(this.reg.PC + 1); // +1 to make the next instruction the return address

        // Address we're going to call to
        const addr = this.reg[this.curReg];
        this.reg.PC = addr;
    }

    /**
     * RET
     */
    RET() {
        // Pop the return address off the stack and put straight in PC
        this.reg.PC = this._pop();
    }

    /**
     * JMP
     */
    JMP() {
        this.reg.PC = this.reg[this.curReg];
    }

    /**
     * JEQ
     */
    JEQ() {
        if (this.flags.equal) {
            this.reg.PC = this.reg[this.curReg];
        } else {
            this.reg.PC++;
        }
    }

    /**
     * JNE
     */
    JNE() {
        if (!this.flags.equal) {
            this.reg.PC = this.reg[this.curReg];
        } else {
            this.reg.PC++;
        }
    }

    /**
     * CMPI
     */
    CMPI() {
        const val = this.mem[this.reg.PC+1];
        this.flags.equal = this.reg[this.curReg] === val;
        this.reg.PC += 2;
    }

    /**
     * CMP
     */
    CMP() {
        const val = this.reg[this.reg.PC+1];
        this.flags.equal = this.reg[this.curReg] === val;
        this.reg.PC += 2;
    }

    /**
     * INC
     */
    INC() {
        let val = this.reg[this.curReg];

        val++;
        // 8-bit values wrap at 256
        if (val > 255) { val = 0; }

        this.reg[this.curReg] = val;

        this.reg.PC++;
    }

    /**
     * DEC
     */
    DEC() {
        let val = this.reg[this.curReg];

        val--;
        // 8-bit values wrap at -1
        if (val < 0) { val = 255; }

        this.reg[this.curReg] = val;

        this.reg.PC++;
    }
}

module.exports = CPU;
