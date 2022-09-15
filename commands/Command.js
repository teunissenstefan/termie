module.exports = class Command {
    constructor(client, name, description) {
        this.client = client;
        this.name = name;
        this.description = description;
    }

    execute(argv) {
        this.client.drawLine("Command executed\n");
    }
};