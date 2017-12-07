/**
 * RAM access
 */
class RAM {
    constructor(size) {
        this.mem = new Array(size);
        this.mem.fill(0);
    }

    /**
     * Write (store) MDR at address MAR
     * 
     * @returns MDR
     */
    write(MAR, MDR) {
        return this.access(MAR, MDR, true);
    }

    /**
     * Read (load) MDR from address MAR
     * 
     * @returns MDR
     */
    read(MAR) {
        return this.access(MAR, null, false);
    }

    /**
     * General helper function for accessing RAM
     * @param {Number} MAR Memory Address Register
     * @param {Number} MDR Memory Data Register
     * @param {Boolean} write True if we're writing, false if we're reading
     */
    access(MAR, MDR, write) {
        if (write) {
            this.mem[MAR] = MDR;
        } else {
            // read
            MDR = this.mem[MAR];
        }

        return MDR;
    }

}

module.exports = RAM;