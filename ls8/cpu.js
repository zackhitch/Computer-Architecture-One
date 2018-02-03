/**
 * LS-8 v2.0 full emulator
 */

const fs = require('fs');

// Instructions

const ADD  = 0b10101000; // ADD R R
const AND  = 0b10110011; // AND R R
const CALL = 0b01001000; // CALL R
const CMP  = 0b10100000; // CMP R R
const DEC  = 0b01111001; // DEC R
const DIV  = 0b10101011; // DIV R R
const HLT  = 0b00000001; // Halt CPU
const INC  = 0b01111000; // INC R
const INT  = 0b01001010; // Software interrupt R
const IRET = 0b00001011; // Return from interrupt
const JEQ  = 0b01010001; // JEQ R
const JGT  = 0b01010100; // JGT R
const JLT  = 0b01010011; // JLT R
const JMP  = 0b01010000; // JMP R
const JNE  = 0b01010010; // JNE R
const LD   = 0b10011000; // Load R,R
const LDI  = 0b10011001; // LDI R,I(mmediate)
const MUL  = 0b10101010; // MUL R,R
const NOP  = 0b00000000; // NOP
const NOT  = 0b01110000; // NOT R
const OR   = 0b10110001; // OR R R
const POP  = 0b01001100; // Pop R
const PRA  = 0b01000010; // Print alpha char
const PRN  = 0b01000011; // Print numeric register
const PUSH = 0b01001101; // Push R
const RET  = 0b00001001; // Return
const ST   = 0b10011010; // Store R,R
const SUB  = 0b10101001; // SUB R R
const XOR  = 0b10110010; // XOR R R

// System-utilized general purpose registers
const IM = 0x05;  // Interrupt mask register R5
const IS = 0x06;  // Interrupt status register R6
const SP = 0x07;  // Stack pointer R7

// Interrupt mask bits
const intMask = [
    (0x1 << 0), // timer
    (0x1 << 1), // keyboard
    (0x1 << 2), // reserved
    (0x1 << 3), // reserved
    (0x1 << 4), // reserved
    (0x1 << 5), // reserved
    (0x1 << 6), // reserved
    (0x1 << 7), // reserved
];

// Flag values for the FL register, bit numbers
const FLAG_EQ = 0;
const FLAG_GT = 1;
const FLAG_LT = 2; // TODO is this right??

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
        
        this.reg[IM] = 0; // All interrupts masked
        this.reg[IS] = 0; // No interrupts active
        this.reg[SP] = 0xf8; // Stack empty

        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg.IR = 0; // Instruction Register
        this.reg.FL = 0; // Flags

        this.interruptsEnabled = true;

		this.setupBranchTable();
    }
    
    /**
     * Set or reset a flag to 0 or 1
     * 
     * @param f FLAG_EQ, FLAG_GT, FLAG_LT
     * @param v New value, 0, 1, true, false
     */
    setFlag(f, v) {
        v = +v; // convert true to 1 and false to 0

        if (v) {
            this.reg.FL |= (1 << f);
        } else {
            this.reg.FL &= ~(1 << f);
        }
    }

    /**
     * Get a flag value
     * 
     * @param f FLAG_EQ, FLAG_GT, FLAG_LT
     * @return 0 or 1
     */
    getFlag(f) {
        return (this.reg.FL & (1 << f)) >> f;
    }

	/**
	 * Sets up the branch table
	 */
	setupBranchTable() {
        let bt = {};
        
		bt[ADD]  = this.ADD;
		bt[AND]  = this.AND;
		bt[CALL] = this.CALL;
		bt[CMP]  = this.CMP;
		bt[DEC]  = this.DEC;
		bt[DIV]  = this.DIV;
		bt[HLT]  = this.HLT;
		bt[INC]  = this.INC;
		bt[INT]  = this.INT;
		bt[IRET] = this.IRET;
		bt[JEQ]  = this.JEQ;
		bt[JGT]  = this.JGT;
		bt[JLT]  = this.JLT;
		bt[JMP]  = this.JMP;
		bt[JNE]  = this.JNE;
		bt[LD]   = this.LD;
		bt[LDI]  = this.LDI;
		bt[MUL]  = this.MUL;
        bt[NOP]  = this.NOP;
        bt[NOT]  = this.NOT;
        bt[OR]   = this.OR;
		bt[POP]  = this.POP;
		bt[PRA]  = this.PRA;
		bt[PRN]  = this.PRN;
		bt[PUSH] = this.PUSH;
		bt[RET]  = this.RET;
		bt[ST]   = this.ST;
		bt[SUB]  = this.SUB;
		bt[XOR]  = this.XOR;

        // Bind all the functions to this so we can call them later
        for (let k of Object.keys(bt)) {
            bt[k] = bt[k].bind(this);
        }

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

        this.timerInterrupt = setInterval(() => {
            // Set the timer bit in the IS register
            _this.reg[IS] |= intMask[0]; // Timer
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
    alu(op, regA, regB, immediate) {
        let valA, valB;

        // Load valA from regA
        valA = this.reg[regA];

        // Load valB from regB or immediate
        if (immediate === undefined) {
            if (regB !== undefined) {
                valB = this.reg[regB];
            }
        } else {
            valB = immediate;
        }

        switch (op) {
            case 'AND':
                this.reg[regA] = valA & valB;
                break;

            case 'OR':
                this.reg[regA] = valA | valB;
                break;

            case 'NOT':
                this.reg[regA] = ~valA;
                break;

            case 'XOR':
                this.reg[regA] = valA ^ valB;
                break;

            case 'MUL':
                this.reg[regA] = (valA * valB) & 255;
                break;

            case 'ADD':
                this.reg[regA] = (valA + valB) & 255;
                break;

            case 'SUB':
                this.reg[regA] = (valA - valB) & 255;
                break;

            case 'DIV':
                if (valB === 0) {
                    console.log('ERROR: divide by 0');
                    this.stopClock();
                }

                this.reg[regA] = valA / valB;
                break;

            case 'INC':
                this.reg[regA] = (valA + 1) & 0xff;
                break;

            case 'DEC':
                this.reg[regA] = (valA - 1) & 0xff;
                break;

            case 'CMP':
                this.setFlag(FLAG_EQ, valA === valB);
                this.setFlag(FLAG_GT, valA > valB);
                this.setFlag(FLAG_LT, valA < valB);
                break;
        }

    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Check to see if there's an interrupt
        if (this.interruptsEnabled) {
            // Take the current interrupts and mask them out with the interrupt
            // mask
            const maskedInterrupts = this.reg[IS] & this.reg[IM];

            // Check all the masked interrupts to see if they're active
            for (let i = 0; i < 8; i++) {
                
                // If it's still 1 after being masked, handle it
                if (((maskedInterrupts >> i) & 0x01) === 1) {

                    // Only handle one interrupt at a time
                    this.interruptsEnabled = false;

                    // Clear this interrupt in the status register
                    this.reg[IS] &= ~intMask[i];

                    // Push return address
                    this._push(this.reg.PC);

                    // Push flags
                    this._push(this.reg.FL);

                    // Push registers R0-R6
                    for (let r = 0; r <= 6; r++) {
                        this._push(this.reg[r]);
                    }

                    // Look up the vector (handler address) in the
                    // interrupt vector table
                    const vector = this.ram.read(0xf8 + i);

                    this.reg.PC = vector; // Jump to it

                    // Stop looking for more interrupts, since we do one
                    // at a time
                    break;
                }
            }
        }

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

        // Read in the two next bytes just in case they are needed by the handler
        const operandA = this.ram.read((this.reg.PC + 1) & 0xff);
        const operandB = this.ram.read((this.reg.PC + 2) & 0xff);

		// We need to use call() so we can set the "this" value inside the
		// handler (otherwise it will be undefined in the handler).
		//
		// The handler _may_ return a new PC if it wants to set it explicitly.
		// E.g. CALL, JMP and variants, IRET, and RET all set the PC to a new
		// destination.

        const newPC = handler(operandA, operandB);
        
        if (newPC === undefined) {
            // Move the PC to the next instruction.
            // First get the instruction size, then add to PC
            const operandCount = (this.reg.IR >> 6) & 0b11; // 
            const instSize = operandCount + 1;

            this.alu('ADD', 'PC', null, instSize); // Next instruction
        } else {
            // Handler wants the PC set to exactly this
            this.reg.PC = newPC;
        }
    }

    // INSTRUCTION HANDLER CODE:

    /**
     * ADD R,R
     */
    ADD(regA, regB) {
        this.alu('ADD', regA, regB);
    }

    /**
     * AND R,R
     */
    AND(regA, regB) {
        this.alu('AND', regA, regB);
    }

    /**
     * CMP R R
     */
    CMP(regA, regB) {
        this.alu('CMP', regA, regB);
    }

    /**
     * DIV R,R
     */
    DIV(regA, regB) {
        this.alu('DIV', regA, regB);
    }

    /**
     * CALL R
     */
    CALL(reg) {
        // Save the return address on the stack
        this._push(this.reg.PC + 2); // +2 to make the next instruction the return address

        // Address we're going to call to
        const addr = this.reg[reg];
         
        // Set PC so we start executing here
        return addr;
    }

    /**
     * DEC R
     */
    DEC(reg) {
        this.alu('DEC', reg);
    }

    /**
     * HLT
     */
    HLT() {
        this.stopClock();
    }

    /**
     * INC R
     */
    INC(reg) {
        this.alu('INC', reg);
    }

    /**
     * INT R
     */
    INT(reg) {
        // Get interrupt number
        const intNum = this.reg[reg];

        // Unmask this interrupt number
        this.reg[IM] |= intNum;
    }

    /**
     * IRET
     */
    IRET() {
        // Pop registers off stack
        for (let r = 6; r >= 0; r--) {
            this.reg[r] = this._pop();
        }

        // Pop the flags register
        this.reg.FL = this._pop();

        // Pop the return address off the stack and put straight in PC
        const nextPC = this._pop();

        this.interruptsEnabled = true;

        return nextPC;
    }

    /**
     * JEQ R
     */
    JEQ(reg) {
        if (this.getFlag(FLAG_EQ)) {
            // Set PC so we start executing here
            return this.reg[reg];
        }
    }

    /**
     * JGT R
     */
    JGT(reg) {
        if (this.getFlag(FLAG_GT)) {
            // Set PC so we start executing here
            return this.reg[reg];
        }
    }

    /**
     * JLT R
     */
    JLT(reg) {
        if (this.getFlag(FLAG_LT)) {
            // Set PC so we start executing here
            return this.reg[reg];
        }
    }

    /**
     * JMP R
     */
    JMP(reg) {
        // Set PC so we start executing here
        return this.reg[reg];
    }

    /**
     * JNE R
     */
    JNE(reg) {
        if (!this.getFlag(FLAG_EQ)) {
            // Set PC so we start executing here
            return this.reg[reg];
        }
    }

    /**
     * LD R,R
     */
    LD(regA, regB) {
        // Read the value pointed to by regB
        let val = this.ram.read(this.reg[regB]);

        // Then store it in the regA
        this.reg[regA] = val;
    }

    /**
     * LDI R,I
     */
    LDI(reg, val) {
        this.reg[reg] = val;
    }

    /**
     * MUL R,R
     */
    MUL(regA, regB) {
        this.alu('MUL', regA, regB);
    }

    /**
     * NOP
     */
    NOP() {
        // No operation; does nothing.
    }

    /**
     * NOT R
     */
    NOT(reg) {
        this.alu('NOT', reg);
    }

    /**
     * OR R,R
     */
    OR(regA, regB) {
        this.alu('OR', regA, regB);
    }

    /**
     * Internal pop helper, doesn't move PC
     */
    _pop() {
        const val = this.ram.read(this.reg[SP]);

        // Increment SP, stack grows down from address 255
        this.alu('INC', SP);

        return val;
    }

    /**
     * POP R
     */
    POP(reg) {
        this.reg[reg] = this._pop();
    }

    /**
     * PRA R
     */
    PRA(reg) {
        fs.writeSync(process.stdout.fd, String.fromCharCode(this.reg[reg]));
    }

    /**
     * PRN R
     */
    PRN(reg) {
        fs.writeSync(process.stdout.fd, this.reg[reg]);
    }

    /**
     * Internal push helper, doesn't move PC
     */
    _push(val) {
        // Decrement SP, stack grows down from address 0xF7
        this.alu('DEC', SP);

        // Store value at the current SP
        this.ram.write(this.reg[SP], val);
    }

    /**
     * PUSH R
     */
    PUSH(reg) {
        this._push(this.reg[reg]);
    }

    /**
     * RET
     */
    RET() {
        // Pop the return address off the stack and put straight in PC
        const nextPC = this._pop();

        return nextPC;
    }

    /**
     * ST R,R
     */
    ST(regA, regB) {
        // Write val in regB to address in regA
        this.ram.write(this.reg[regA], this.reg[regB]);
    }

    /**
     * SUB R,R
     */
    SUB(regA, regB) {
        this.alu('SUB', regA, regB);
    }

    /**
     * XOR R,R
     */
    XOR(regA, regB) {
        this.alu('XOR', regA, regB);
    }
}

module.exports = CPU;
