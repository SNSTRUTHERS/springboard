/** Chat rooms that can be joined/left/broadcast to. */

// in-memory storage of roomNames -> room

const ROOMS = new Map();

/** Room is a collection of listening members; this becomes a "chat room"
 *   where individual users can join/leave/broadcast to.
 */
class Room {
    /** get room by that name, creating if nonexistent
     *
     * This uses a programming pattern often called a "registry" ---
     * users of this class only need to .get to find a room; they don't
     * need to know about the ROOMS variable that holds the rooms. To
     * them, the Room class manages all of this stuff for them.
     **/
    static get(roomName) {
        if (!ROOMS.has(roomName))
            ROOMS.set(roomName, new Room(roomName));

        return ROOMS.get(roomName);
    }

    /** make a new room, starting with empty set of listeners */
    constructor(roomName) {
        this.name = roomName;
        this.members = new Map();
    }

    /** member joining a room. */
    join(member) {
        this.members.set(member.name, member);
    }

    /** member leaving a room. */
    leave(member) {
        this.members.delete(member.name);
    }

    /** send message to all members in a room. */
    broadcast(data) {
        for (const [, member ] of this.members)
            member.send(JSON.stringify(data));
    }
}

module.exports = Room;
