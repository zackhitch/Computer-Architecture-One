
const cpu = {
  process: (input) => {
    //console.log(input);
    //console.log(this.registers);
    //console.log(this.activeRegister);
    saveRegister = (data) => {
      this.registers[this.activeRegister] = data;
    };
    if(this.SAVE) {
      this.SAVE = false;
      saveRegister(input);
      return;
    }
    if(this.SET) {
      this.SET = false;
      this.activeRegister = input;
      return;
    }
    if(this.MUL) {
      this.MUL2 = true;
      this.MUL = false;
      this.multiplyRegister = input;
      return;
    }
    if(this.MUL2) {
      this.MUL2 = false;
      this.registers[this.activeRegister] = this.registers[this.multiplyRegister] * this.registers[input];
      return;
    }
    switch(input) {
      case 1:
        this.registers = [0,0,0];
        break;
      case 2:
        this.SET = true;
        break;
      case 4:
        this.SAVE = true;
        break;
      case 5:
        this.MUL = true;
        break;
      case 6: // PRINT_NUMERIC
        console.log(this.registers[this.activeRegister]);
        break;
      case 7: // PRINT_ALPHA
        console.log(String.fromCharCode(this.registers[this.activeRegister]));
        break;
    }
  }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (text) {
  if (text === 'quit\n') {
    done();
  }
  if(text.indexOf('\n')) {
    const lines = text.split('\n');
    lines.forEach((line) => {
      // prep variable
      const inputBinary = line.split('#')[0].trim();
      const inputDecimal = Number('0b' + inputBinary);
      //console.log('decimal' + inputDecimal);
      //console.log('binary' + inputBinary);
      if(!isNaN(inputDecimal)) {
        cpu.process(inputDecimal);
      }
    });
  }  
});

function done() {
  process.exit();
}

