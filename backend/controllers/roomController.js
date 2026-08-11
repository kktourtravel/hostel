const db = require("../config/db");

exports.getRooms = (req, res) => {
    db.query("SELECT * FROM rooms", (err, rooms) => {
        if (err) return res.json({ error: err });

        rooms.forEach(room => room.beds = []);

        db.query("SELECT * FROM beds", (err, beds) => {
            beds.forEach(b => {
                const room = rooms.find(r => r.id === b.room_id);
                if (room) room.beds.push(b);
            });

            res.json({ rooms });
        });
    });
};
