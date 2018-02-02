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
const JLT  = 0b01010011; // JGT R
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
    (0x1 << 1), // reserved
    (0x1 << 2), // reserved
    (0x1 << 3), // reserved
    (0x1 << 4), // reserved
    (0x1 << 5), // reserved
    (0x1 << 6), // reserved
    (0x1 << 7), // reserved
];

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        // CPU flags
        this.flags = {
            equal: false,
            interruptsEnabled: true
        };

        this.reg = new Array(8).fill(0); // General-purpose registers
        
        this.reg[IM] = 0; // All interrupts masked
        this.reg[IS] = 0; // No interrupts active
        this.reg[SP] = 0xf8; // Stack empty

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

		bt[ADD] = this.ADD;
		bt[CALL] = this.CALL;
		bt[CMP] = this.CMP;
		bt[DEC] = this.DEC;
		bt[DIV] = this.DIV;
		bt[HLT] = this.HLT;
		bt[INC] = this.INC;
		bt[INT] = this.INT;
		bt[IRET] = this.IRET;
		bt[JEQ] = this.JEQ;
		bt[JMP] = this.JMP;
		bt[JNE] = this.JNE;
		bt[LD] = this.LD;
		bt[LDI] = this.LDI;
		bt[MUL] = this.MUL;
		bt[NOP] = this.NOP;
		bt[POP] = this.POP;
		bt[PRA] = this.PRA;
		bt[PRN] = this.PRN;
		bt[PUSH] = this.PUSH;
		bt[RET] = this.RET;
		bt[ST] = this.ST;
		bt[SUB] = this.SUB;

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
                this.flags.equal = valA === valB;
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

                    // Only handle one interrupt at a time
                    this.flags.interruptsEnabled = false;

                    // Clear this interrupt in the status register
                    this.reg[IS] &= ~intMask[i];

                    // Push return address
                    this._push(this.reg.PC);

                    // Push registers R0-R7
                    for (let r = 0; r <= 7; r++) {
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

		// We need to use call() so we can set the "this" value inside
		// the handler (otherwise it will be undefined in the handler)
		handler.call(this);
    }

    // INSTRUCTION HANDLER CODE:

    /**
     * ADD R,R
     */
    ADD() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('ADD', regA, regB);

        this.alu('ADD', 'PC', null, 3); // Next instruction
    }

    /**
     * CMP R R
     */
    CMP() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('CMP', regA, regB);

        this.alu('ADD', 'PC', null, 3); // Next instruction
    }

    /**
     * DIV R,R
     */
    DIV() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('DIV', regA, regB);

        this.alu('ADD', 'PC', null, 3); // Next instruction
    }

    /**
     * CALL R
     */
    CALL() {
        const reg = this.ram.read(this.reg.PC + 1);

        // Save the return address on the stack
        this._push(this.reg.PC + 2); // +2 to make the next instruction the return address

        // Address we're going to call to
        const addr = this.reg[reg];
         
        // Set PC so we start executing here
        this.reg.PC = addr;
    }

    /**
     * DEC
     */
    DEC() {
        const reg = this.ram.read(this.reg.PC + 1);

        this.alu('DEC', reg);

        this.alu('ADD', 'PC', null, 2); // Next instruction
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
    INC() {
        const reg = this.ram.read(this.reg.PC + 1);

        this.alu('INC', reg);

        this.alu('ADD', 'PC', null, 2); // Next instruction
    }

    /**
     * INT R
     */
    INT() {
        const reg = this.ram.read(this.reg.PC + 1);

        // Get interrupt number
        const intNum = this.reg[reg];

        // Unmask this interrupt number
        this.reg[IM] |= intNum;

        this.alu('ADD', 'PC', null, 2); // Next instruction
    }

    /**
     * IRET
     */
    IRET() {
        // Pop registers off stack
        for (let r = 7; r >= 0; r--) {
            this.reg[r] = this._pop();
        }

        // Pop the return address off the stack and put straight in PC
        this.reg.PC = this._pop();

        this.flags.interruptsEnabled = true;
    }

    /**
     * JEQ R
     */
    JEQ() {
        if (this.flags.equal) {
            // Set PC so we start executing here
            const reg = this.ram.read(this.reg.PC + 1);
            this.reg.PC = this.reg[reg];
        } else {
            this.alu('ADD', 'PC', null, 2); // Next instruction
        }
    }

    /**
     * JMP R
     */
    JMP() {
        const reg = this.ram.read(this.reg.PC + 1);

        // Set PC so we start executing here
        this.reg.PC = this.reg[reg];
    }

    /**
     * JNE R
     */
    JNE() {
        if (!this.flags.equal) {
            // Set PC so we start executing here
            const reg = this.ram.read(this.reg.PC + 1);
            this.reg.PC = this.reg[reg];
        } else {
            this.alu('ADD', 'PC', null, 2); // Next instruction
        }
    }

    /**
     * LD R,R
     */
    LD() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        // Read the value pointed to by regB
        let val = this.ram.read(this.reg[regB]);

        // Then store it in the regA
        this.reg[regA] = val;

        this.alu('ADD', 'PC', null, 3); // Next instruction
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
     * NOP
     */
    NOP() {
        this.alu('INC', 'PC'); // Next instruction
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
    POP() {
        const reg = this.ram.read(this.reg.PC + 1);

        this.reg[reg] = this._pop();

        this.alu('ADD', 'PC', null, 2); // Next instruction
    }

    /**
     * PRA R
     */
    PRA() {
        const reg = this.ram.read(this.reg.PC + 1);

        fs.writeSync(process.stdout.fd, String.fromCharCode(this.reg[reg]));

        this.alu('ADD', 'PC', null, 2); // Next instruction
    }

    /**
     * PRN R
     */
    PRN() {
        const reg = this.ram.read(this.reg.PC + 1);

        fs.writeSync(process.stdout.fd, this.reg[reg]);

        this.alu('ADD', 'PC', null, 2); // Next instruction
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
    PUSH() {
        const reg = this.ram.read(this.reg.PC + 1);

        this._push(this.reg[reg]);

        this.alu('ADD', 'PC', null, 2); // Next instruction
    }

    /**
     * RET
     */
    RET() {
        // Pop the return address off the stack and put straight in PC
        this.reg.PC = this._pop();
    }

    /**
     * ST R,R
     */
    ST() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        // Write val in regB to address in regA
        this.ram.write(this.reg[regA], this.reg[regB]);

        this.alu('ADD', 'PC', null, 3); // Next instruction
    }

    /**
     * SUB R,R
     */
    SUB() {
        const regA = this.ram.read(this.reg.PC + 1);
        const regB = this.ram.read(this.reg.PC + 2);

        this.alu('SUB', regA, regB);

        this.alu('ADD', 'PC', null, 3); // Next instruction
    }
}

module.exports = CPU;
