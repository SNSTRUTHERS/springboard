/** Functionality related to chatting. */

// Room is an abstraction of a chat channel
const Room = require('./Room');


const HELP_PAGE_MAP = new Map();
{
    const HELP_PAGES = {
        'help': {
            string: 'list available commands',
            usage: 'help [command]',
            aliases: '?'
        },
        'members': {
            string: 'list members in current room',
            usage: 'members',
            aliases: 'ls'
        },
        'priv': {
            string: 'sent private message to specific user',
            usage: 'priv {username} {message...}',
            aliases: 'pm'
        }
    };
    for (const cmd in HELP_PAGES) {
        const aliases = HELP_PAGES[cmd].aliases;
        HELP_PAGE_MAP.set(cmd, HELP_PAGES[cmd]);

        if (aliases) {
            HELP_PAGES[cmd].aliases = aliases.sort();

            for (const alias of HELP_PAGES[cmd].aliases) {
                HELP_PAGES[alias] = HELP_PAGES[cmd];
                
                HELP_PAGES[alias].aliases = HELP_PAGES[alias].aliases.filter(
                    (value) => value !== alias
                );
                HELP_PAGES[alias].aliases.push(cmd);
                HELP_PAGES[alias].aliases = HELP_PAGES[alias].aliases.sort();

                HELP_PAGE_MAP.set(alias, HELP_PAGES[alias]);
            }
        }
    }
}

/** ChatUser is a individual connection from client -> server to chat. */
class ChatUser {
    /** make chat: store connection-device, rooom */
    constructor(send, roomName) {
        this._send = send; // "send" function for this user

        /** @type {Room} */
        this.room = Room.get(roomName); // room user will be in
        this.name = null; // becomes the username of the visitor

        console.log(`created chat in ${this.room.name}`);
    }

    /** send msgs to this client using underlying connection-send-function */
    send(data) {
        try {
            this._send(data);
        } catch { } // If trying to send to a user fails, ignore it
    }

    /** handle joining: add to room members, announce join */
    handleJoin(name) {
        this.name = name;
        this.room.join(this);
        this.room.broadcast({
            type: 'note',
            text: `${this.name} joined "${this.room.name}".`
        });
    }

    /** handle a chat: broadcast to room. */
    handleChat(text) {
        this.room.broadcast({
            name: this.name,
            type: 'chat',
            text: text
        });
    }

    /** handle a command: command-specific stuff */
    handleCommand(command, args) {
        const SEND = (data, user = this) => user.send(JSON.stringify(data));

        switch (command) {
        // command listing
        case '?':
        case 'help':
            if (!args.length) {
                SEND({
                    type: 'note',
                    text: `</i><b>COMMAND LISTING:</b>
                    <ul>
                        ${Array.from(HELP_PAGE_MAP.entries()).forEach(([ cmd, data ]) => {
                            `<li><code>${cmd}</code> - ${data.string}</li>`
                        }).join()}
                    </ul>
                    <i>`
                });
            } else if (HELP_PAGE_MAP.has(args[0])) {
                SEND({
                    type: 'note',
                    text: `</i>
                    <b><code>${cmd}</code></b>                    
                    <i>`
                });
            } else {
                SEND({
                    type: 'note',
                    text: `</i><b>ERROR:</b> <i>Unknown command.`
                })
            }
            break;

        // member listing
        case 'members':
        case 'ls':
            if (args.length) {
                SEND({
                    type: 'note',
                    text: `</i><b>ERROR:</b> <i>members requires 0 arguments.`
                });
            } else {
                SEND({
                    type: 'note',
                    text: `</i>
                    <ul>
                        ${this.room.members.forEach((member) => {
                            `<li>${member}</li>`
                        }).join()}
                    </ul>
                    <i>`
                });
            }
            break;

        // private message
        case 'priv':
        case 'pm':
            if (args.length < 2) {
                SEND({
                    type: 'note',
                    text: `</i><b>ERROR:</b> <i>priv requires at least 2 arguments.`
                });
            } else if (!Array.from(this.room.members.keys()).includes(args[0])) {
                SEND({
                    type: 'note',
                    text: `</i><b>ERROR:</b> <i>User doesn't exist.`
                });
            } else {
                args[1] = args.slice(1).join(' ');

                SEND({
                    type: 'chat',
                    name: `</b>PM from <b>${this.name}`,
                    text: args[1]
                }, this.room.members.get(args[0]));
                
                args[0] = args[0].replace('<', '&lt;').replace('>', '&gt;');
                args[1] = args[1].replace('<', '&lt;').replace('>', '&gt;');

                SEND({
                    type: 'note',
                    text: `</i> You sent to <b>${args[0]}</b>: <i>${args[1]}`
                });
            }
            break;

        default:
            SEND({
                type: 'note',
                text: `</i><b>ERROR:</b> <i>unknown command name "${command}"`
            });
            break;
        }
    }

    /** Handle messages from client:
     *
     * - {type: "join", name: username }                      : join
     * - {type: "chat", text: msg }                           : chat
     * - {type: "command", command: command, args: string[] } : command
     */
    handleMessage(jsonData) {
        let msg = JSON.parse(jsonData);

        switch (msg.type) {
        case 'join':
            this.handleJoin(msg.name);
            break;

        case 'chat':
            this.handleChat(msg.text);
            break;

        case 'command':
            this.handleCommand(msg.command, msg.args);
            break;

        default:
            throw new Error(`bad message: ${msg.type}`);
        }
    }

    /** Connection was closed: leave room, announce exit to others */
    handleClose() {
        this.room.leave(this);
        this.room.broadcast({
            type: 'note',
            text: `${this.name} left "${this.room.name}".`
        });
    }
}

module.exports = ChatUser;
