const Command = require('./Command');

module.exports = class ClearCommand extends Command {
    constructor(client) {
        super(client, 'clear', 'Clear messages');
    }

    execute(argv) {
        console.clear();
    }
};