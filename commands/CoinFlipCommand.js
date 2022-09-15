const Command = require('./Command');

module.exports = class CoinFlipCommand extends Command {
    constructor(client) {
        super(client, 'coinflip', 'Flip a coin');
    }

    execute(argv) {
        let r = Math.floor(Math.random() * 2);
        let str = r === 1 ? "Heads" : "Tails";
        this.client.drawLine(str + "\n");
    }
};