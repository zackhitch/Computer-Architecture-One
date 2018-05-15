/**
 * LS-8 v2.0 emulator skeleton code
 */
const ADD = 0b10101000;
const MUL = 0b10101010;
const PRN = 0b01000011;
const LDI = 0b10011001;
const CMP = 0b10100000;
const HLT = 0b00000001;
const SUB = 0b10101001;
const DIV = 0b10101011;
const INC = 0b01111000;
const DEC = 0b01111001;
const JMP = 0b01010000;
const LD = 0b10011000;
const PRA = 0b01000010;
const AND = 0b10110011;

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.PC = 0; // Program Counter
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
    this.clock = setInterval(() => {
      this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
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
   * The ALU is responsible for math and comparisons.
   *
   * If you have an instruction that does math, i.e. MUL, the CPU would hand
   * it off to it's internal ALU component to do the actual work.
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB) {
    switch (op) {
      case 'ADD':
        // !!! IMPLEMENT ME
        this.reg[regA] += this.reg[regB];
        break;
      case 'MUL':
        this.reg[regA] *= this.reg[regB];
        break;
      case 'SUB':
        this.reg[regA] -= this.reg[regB];
      case 'DIV':
        if (regB === 0) {
          console.error('Denominator cannot be zero.');
          this.stopClock();
        } else {
          this.reg[regA] /= this.reg[regB];
        }
        break;
      case 'AND':
        this.reg[regA] &= this.reg[regB];
        break;
      default:
        console.log("You've hit the default case of alu()! /shrug");
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the instruction that's about to be executed
    // right now.)
    // !!! IMPLEMENT ME
    let IR = this.ram.read(this.PC);
    // Debugging output
    // console.log(`${this.PC}: ${IR.toString(2)}`);
    // console.log(`IR: ${IR}`);
    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.
    // !!! IMPLEMENT ME
    let operandA = this.ram.read(this.PC + 1);
    let operandB = this.ram.read(this.PC + 2);
    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.
    // !!! IMPLEMENT ME
    switch (IR) {
      case ADD:
        this.alu('ADD', operandA, operandB);
        break;
      case MUL:
        this.alu('MUL', operandA, operandB);
        break;
      case SUB:
        this.alu('SUB', operandA, operandB);
        break;
      case DIV:
        this.alu('DIV', operandA, operandB);
        break;
      case AND:
        this.alu('AND', operandA, operandB);
        break;
      case PRN:
        console.log(this.reg[operandA]);
        break;
      case PRA:
        console.log(String.fromCharCode(this.reg[operandA]));
        break;
      case LDI:
        this.reg[operandA] = operandB;
        break;
      case LD:
        this.reg[operandA] = this.reg[operandB];
        break;
      case INC:
        this.reg[operandA]++;
        break;
      case DEC:
        this.reg[operandA]--;
        break;
      case JMP:
        // this isn't going to work since we increment PC after the switch statement
        this.PC = this.reg[operandA];
        break;
      case HLT:
        this.stopClock();
        break;
      default:
        console.log("You've hit the default case of tick()! /shrug");
        this.stopClock();
    }
    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.
    // !!! IMPLEMENT ME
    this.PC += 1 + (IR >> 6);
  }
}

module.exports = CPU;
