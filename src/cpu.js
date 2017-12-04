/**
 * LS8 CPU implementation
 * 
 * Bits and pieces
 *   o Branch table
 *   o Basic instructions
 *   o PC
 *   o IR
 *   o MAR/MDR
 *   o ALU
 * 
 *   o Additional math
 *   o Load/Store
 *   o Load/Store register indirect
 *   o Push/Pop stack
 *   o Call/Return
 *   o Compare/Branch, flags
 *   o Inc/Dec
 * 
 * Memory map:
 * 
 *   00: code entry
 *   ..:
 *   F7: top of stack
 *   F8: interrupt vector 0
 *   ..:
 *   FF: interrupt vector 7
 */

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
const CMP  = 0b00010110; // CMP R

// Increment/Decrement Extension
const INC  = 0b00010111; // INC
const DEC  = 0b00011000; // DEC

// Interrupts
const INT  = 0b00011001; // Software interrupt
const IRET = 0b00011010; // Return from interrupt

// System-utilized general purpose registers
const IS = 0xfd;  // Interrupt status register
const IM = 0xfe;  // Interrupt mask register
const SP = 0xff;  // Stack pointer

// Interrupt numbers
const INT_TIMER_MASK = (0x1 << 0); // Timer interrupt

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
            equal: false,
            interruptsEnabled: true
        };

        this.reg = new Array(256); // General-purpose registers

        // Special-purpose registers
        this.reg.PC  = 0; // Program Counter
        this.reg.IR  = 0; // Intruction Register
        this.reg.MAR = 0; // Memory Address Register
        this.reg.MDR = 0; // Memory Data Register

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
		bt[CMP] = this.CMP;
		bt[INC] = this.INC;
		bt[DEC] = this.DEC;
		bt[INT] = this.INT;
		bt[IRET] = this.IRET;

		this.branchTable = bt;
	}

    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.reg.MAR = address;
        this.reg.MDR = value;
        this.storeMem();
    }

    /**
     * Store in mem location MAR the value MDR
     */
    storeMem() {
        this.mem[this.reg.MAR] = this.reg.MDR;
    }

    /**
     * Load from memory into MDR from MAR
     */
    loadMem(address) {
        this.reg.MDR = this.mem[this.reg.MAR];
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1);

        this.timerInterrupt = setInterval(() => {
            // Set the timer bit in the IS register
            _this.reg[IS] |= INT_TIMER_MASK;
        }, 1000);
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
        clearInterval(this.timerInterrupt);
    }

    /**
     * ALU functionality
     */
    alu(op, r0, r1) {
        let regVal0, regVal1;

        switch (op) {
            case 'MUL':
                regVal0 = this.reg[r0];
                regVal1 = this.reg[r1];

                this.reg[this.curReg] = regVal0 * regVal1;
                break;

            case 'ADD':
                regVal0 = this.reg[r0];
                regVal1 = this.reg[r1];

                this.reg[this.curReg] = regVal0 + regVal1;
                break;

            case 'SUB':
                regVal0 = this.reg[r0];
                regVal1 = this.reg[r1];

                this.reg[this.curReg] = regVal0 - regVal1;
                break;

            case 'DIV':
                regVal0 = this.reg[r0];
                regVal1 = this.reg[r1];

                if (regVal1 === 0) {
                    console.log('ERROR: divide by 0');
                    this.stopClock();
                }

                this.reg[this.curReg] = regVal0 / regVal1;
                break;

            case 'INC':
                regVal0 = this.reg[r0] + 1;
                if (regVal0 > 255) { regVal0 = 0; }
                this.reg[r0] = regVal0;
                break;

            case 'DEC':
                regVal0 = this.reg[r0] - 1;
                if (regVal0 < 0) { regVal0 = 255; }
                this.reg[r0] = regVal0;
                break;
        }

    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Check to see if there's an interrupt
        if (this.flags.interruptsEnabled) {
            // Take the current interrupts and mask them out with the interrupt
            // mask
            const maskedInterrupts = this.reg[IS] & this.reg[IM];

            // Check all the masked interrupts to see if they're active
            for (let i = 0; i < 8; i++) {
                
                // If it's still 1 after being masked, handle it
                if (((maskedInterrupts >> i) & 0x01) === 1) {
                    // Clear this interrupt in the status register
                    this.reg[IS] &= ~i;

                    // Look up the vector (handler address) in the interrupt
                    // vector table
                    this.reg.MAR = 0xff - i;
                    this.loadMem();
                    const vector = this.reg.MDR;

                    // We need to come back here
                    this._push(this.reg.PC);
                    this.reg.PC = vector; // Jump to it

                    // Only handle one interrupt at a time
                    this.flags.interruptsEnabled = false;
                    break;
                }
            }
        }

        // Load the instruction register from the current PC
        this.reg.MAR = this.reg.PC;
        this.loadMem();
        this.reg.IR = this.reg.MDR;

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

        this.alu('INC', 'PC'); // Next instruction
    }

    /**
     * SET R
     */
    SET() {
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        this.curReg = this.reg.MDR;

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
    }

    /**
     * SAVE I
     */
    SAVE() {
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        this.reg[this.curReg] = this.reg.MDR;

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
    }

    /**
     * MUL R R
     */
    MUL() {
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        const regNum0 = this.reg.MDR;

        this.reg.MAR = this.reg.PC + 2;
        this.loadMem();
        const regNum1 = this.reg.MDR;

        this.alu('MUL', regNum0, regNum1);

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
        this.alu('INC', 'PC');
    }

    /**
     * PRN
     */
    PRN() {
        fs.writeSync(process.stdout.fd, this.reg[this.curReg]);
        this.alu('INC', 'PC'); // Next instruction
    }

    /**
     * PRA
     */
    PRA() {
        fs.writeSync(process.stdout.fd, String.fromCharCode(this.reg[this.curReg]));
        this.alu('INC', 'PC'); // Next instruction
    }

    /**
     * LD M
     */
    LD() {
        // First get the address we want to load from
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        const addr = this.reg.MDR;

        // Then load the data from that address
        this.reg.MAR = addr;
        this.loadMem();
        const value = this.reg.MDR;

        // Then store it in the register
        this.reg[this.curReg] = value;

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
    }

    /**
     * ST M
     */
    ST() {
        // First get the address we want to store to
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        const addr = this.reg.MDR;

        // Then store the register value at that address
        this.reg.MAR = addr;
        this.reg.MDR = this.reg[this.curReg];
        this.storeMem();

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
    }

    /**
     * LDRI R
     * 
     * Load register indirect. Load the value into the current register that the
     * given register points to.
     */
    LDRI() {
        // First, get the pointer register number
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        const reg = this.reg.MDR;

        // Get the address stored in that register
        const addr = this.reg[reg];

        // Load the value at that address
        this.reg.MAR = addr;
        this.loadMem();

        // Store the result in the current register
        this.reg[this.curReg] = this.reg.MDR;

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
    }

    /**
     * Internal push helper, doesn't move PC
     */
    _push(val) {
        // Decrement SP, stack grows down from address 255
        this.alu('DEC', SP);

        // Store value at the current SP
        this.reg.MAR = this.reg[SP];
        this.reg.MDR = val;
        this.storeMem();
    }

    /**
     * PUSH
     */
    PUSH() {
        this._push(this.reg[this.curReg]);

        this.alu('INC', 'PC'); // Next instruction
    }

    /**
     * Internal pop helper, doesn't move PC
     */
    _pop() {
        this.reg.MAR = this.reg[SP];
        this.loadMem();
        const val = this.reg.MDR;

        // Increment SP, stack grows down from address 255
        this.alu('INC', SP);

        return val;
    }

    /**
     * POP
     */
    POP() {
        this.reg[this.curReg] = this._pop();

        this.alu('INC', 'PC'); // Next instruction
    }

    /**
     * ADD R R
     */
    ADD() {
        // Load first operand
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        const regNum0 = this.reg.MDR;

        // Load second operand
        this.reg.MAR = this.reg.PC + 2;
        this.loadMem();
        const regNum1 = this.reg.MDR;
        
        this.alu('ADD', regNum0, regNum1);

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
        this.alu('INC', 'PC');
    }

    /**
     * SUB R R
     */
    SUB() {
        // Load first operand
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        const regNum0 = this.reg.MDR;

        // Load second operand
        this.reg.MAR = this.reg.PC + 2;
        this.loadMem();
        const regNum1 = reg.MDR;
        
        this.alu('SUB', regNum0, regNum1);

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
        this.alu('INC', 'PC');
    }

    /**
     * DIV R R
     */
    DIV() {
        // Load first operand
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        const regNum0 = this.reg.MDR;

        // Load second operand
        this.reg.MAR = this.reg.PC + 2;
        this.loadMem();
        const regNum1 = this.reg.MDR;
        
        this.alu('DIV', regNum0, regNum1);

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
        this.alu('INC', 'PC');
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
            this.alu('INC', 'PC'); // Next instruction
        }
    }

    /**
     * JNE
     */
    JNE() {
        if (!this.flags.equal) {
            this.reg.PC = this.reg[this.curReg];
        } else {
            this.alu('INC', 'PC'); // Next instruction
        }
    }

    /**
     * CMP
     */
    CMP() {
        // Load register number to compare
        this.reg.MAR = this.reg.PC + 1;
        this.loadMem();
        const regNum = this.reg.MDR;

        const val = this.reg[regNum];

        // Set flag if equal
        this.flags.equal = this.reg[this.curReg] === val;

        this.alu('INC', 'PC'); // Next instruction
        this.alu('INC', 'PC');
    }

    /**
     * INC
     */
    INC() {
        this.alu('INC', this.curReg);
        this.alu('INC', 'PC'); // Next instruction
    }

    /**
     * DEC
     */
    DEC() {
        this.alu('DEC', this.curReg);
        this.alu('INC', 'PC'); // Next instruction
    }

    /**
     * INT
     */
    INT() {
        // Get interrupt number from current register
        const intNum = this.reg[this.reg.curReg];

        // Unmask this interrupt number
        this.reg[IM] |= intNum;

        this.alu('INC', 'PC'); // Next instruction
    }

    /**
     * IRET
     */
    IRET() {
        // Pop the return address off the stack and put straight in PC
        this.reg.PC = this._pop();
        this.interruptsEnabled = true;
    }
}

module.exports = CPU;
