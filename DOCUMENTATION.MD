# Socket.io Event Documentation
This file documents every single socket.io event and states its purpose, data attributes, and such.

## Socket Level Events
### login
**Sent by:** Client

**Description:** Sends user data to server upon submitting the login form

**Data:**

    {
        name: "username"
    }

### loginResponse
**Sent by:** Server

**Description:** Returns whether login was successful

**Data:**

    {
        success: bool
    }

### disconnect
**Sent by:** User

**Description:** Sent by user when they close the webpage

**Data:**

    {
        socket: socket
    }

## Gameplay

### newPlayer
**Sent by:** Server

**Description:** Sends  player data initPackage to clients about a player who has joined the board

**Data:**

    {
        name: "username",
        id: "id",
        x: x
        y: y
        color: "#hexcode"
    }

### clientMovementKeyChange
**Sent by:** Client

**Description:** Sends the current state of each key that is relevant for motion of the player or actions the server needs to know about. is sent any time a key is changed

**Data:**

    {
        keycode: boolean
        83: false
        87: false
    }


### playerDisconnect

**Sent by:** Server

**Description:** Sends id of player to other clients upon player disconnecting

**Data:**
    {
        id: "playerID"
    }

### update
**Sent by:** Server

**Description:** Sends  delta game information every tick

**Data:**
    {
        players: playerPack,
        tiles: board.updatePacket()
    }

## Chat

### chatToServer

**Sent by:** Client

**Description:** Sends chat message to server for distribution.
 Note: user is determined by the socket of the sender, not by any data passed

**Data:**

    {
        "chat message"
    }

### addToChat
**Sent by:** Server

**Description:** Sends chat message and sender to each client

**Data:**

    {
        name: "playerName",
        msg: "chat message"
    }

## Debug

### evalServer

**Sent by:** Client

**Description:** Sends a javascript command to be executed on the server.
 Note: DEBUG environment variable must be enabled on server
**Data:**

    {
        "javascript code as string ();"
    }

### evalResponse

**Sent by:** Server

**Description:** Sends the result of evalServer to client's log

**Data:**

    {
        <anything>
    }
