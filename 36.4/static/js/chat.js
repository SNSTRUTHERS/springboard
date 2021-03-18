/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);


const name = prompt("Username?");


/** called when connection opens, sends join info to server. */
ws.onopen = function(evt) {
    console.log("open", evt);

    let data = {type: "join", name};
    ws.send(JSON.stringify(data));
};


/** called when msg received from server; displays it. */
ws.onmessage = function(evt) {
    console.log("message", evt);

    let msg = JSON.parse(evt.data);
    let item;

    if (msg.type === "note")
        item = $(`<li><i>${msg.text}</i></li>`);
    else if (msg.type === "chat")
        item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
    else
        return console.error(`bad message: ${msg}`);

    $('#messages').append(item);
};


/** called on error; logs it. */
ws.onerror = function (evt) {
    console.error(`err ${evt}`);
};


/** called on connection-closed; logs it. */
ws.onclose = function (evt) {
    console.log("close", evt);
};


/** send message when button pushed. */
$('form').submit(function (evt) {
    evt.preventDefault();

    const data = { type: "chat" };

    /** @type {String} */
    const text = $('#m').val();
    if (text.startsWith('/')) {
        data.type = "command";

        const args = [];
        let current = "", firstWord = true, escaped = false, quoted = false;
        for (const char of text.slice(1)) {
            if (escaped) {
                current += char;
                escaped = false;
                continue;
            }

            switch (char) {
            case '"':
                if (firstWord) {
                    ws.onmessage({
                        data: `{
                            "type": "note",
                            "text": "</i><b>ERROR:</b> <i>Invalid command name."
                        }`
                    });
                    return;
                }

                if (quoted || (current.length > 0 && !quoted)) {
                    args.push(current);
                    current = "";
                }
                quoted = !quoted;
                break;
            
            case '\\':
                escaped = true;
                break;

            case ' ':
            case '\t':
                if (current.length > 0) {
                    args.push(current);
                    current = "";
                }
                break;

            default:
                current += char;
                break;
            }
        }

        if (quoted) {
            ws.onmessage({
                data: `{
                    "type": "note",
                    "text": "</i><b>ERROR:</b> <i>Unfinished quoted argument."
                }`
            });
            return;
        } else if (escaped) {
            ws.onmessage({
                data: `{
                    "type": "note",
                    "text": "</i><b>ERROR:</b> <i>Unfinished escaped character."
                }`
            });
            return;
        }

        if (current.length > 0)
            args.push(current);

        if (!args.length) {
            ws.onmessage({
                data: `{
                    "type": "note",
                    "text": "</i><b>ERROR:</b> <i>Invalid command name."
                }`
            });
            return;
        }
        
        data.command = args.shift();
        data.args = args;
    } else {
        data.text = text;
    }

    ws.send(JSON.stringify(data));
    $('#m').val('');
});

