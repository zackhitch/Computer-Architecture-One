class Keyboard {
    /**
     * Construct a new Keyboard
     * @param {CPU} cpu The CPU this keyboard will attach to
     */
    constructor(cpu) {
        this.cpu = cpu;

        cpu.addPeripheral(this);

        this.start();

        this.keyHandler = null;
    }

    /**
     * Shutdown the keyboard peripheral
     */
    stop() {
    }

    /**
     * Start up the keyboard peripheral
     */
    start() {
    }
}

module.exports = Keyboard;