import http from "node:http";
import {Server} from "socket.io";
import {LowSync} from "lowdb";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {JSONFileSync} from "lowdb/node";

// Socket.io server
const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// LowDB database
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, "data.json");
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter);


// Data
db.read();

const {admins, users, selection, rank} = db.data;
const passcodes = {...admins, ...users};

// Socket.io connections
io.on("connection", (socket) => {
    socket.on("login", (passcode) => {
        const status = passcode in passcodes;
        socket.emit("userinfo", {
            status: status,
            name: status ? passcodes[passcode] : "",
            passcode: passcode,
        });
    });

    socket.on("request-update", (passcode) => {
        const status = passcode in passcodes;
        socket.emit("update", {
            status: status,
            users: status ? users : null,
            selection: status ? selection : null,
            rank: status ? rank : null,
        });
    });

    socket.on("select", (passcode, id) => {
        const status = passcode in passcodes;
        if (status) {
            if (selection[id] !== "") {
                socket.emit("error", "卡片已被其他人选择，请重新选择卡片！");
                io.emit("update", {
                    status: status,
                    users: users,
                    selection: selection,
                    rank: rank,
                });
                return;
            }
            for (const i in selection) {
                if (selection[i] === passcode) {
                    selection[i] = "";
                }
            }
            selection[id] = passcode;
            db.write();
            io.emit("update", {
                status: true,
                users: users,
                selection: selection,
                rank: rank,
            });
        }
    });

    socket.on("new-rank", (passcode, id) => {
        const status = passcode in admins;
        if (status && !isNaN(id) && id !== null) {
            if (id < 0 || id >= selection.length) {
                socket.emit("error", `卡片 ${id} 的编号不在合法范围 [0, ${selection.length - 1}]！`)
            } else if (rank.includes(id)) {
                socket.emit("error", `卡片 ${id} 已经被抽取过了！`)
            } else {
                rank.push(id);
                db.write();
                io.emit("update", {
                    status: true,
                    users: users,
                    selection: selection,
                    rank: rank,
                });
            }
        }
    });
});

// Start HTTP server
server.listen("28476", () => {
    console.log('Listening on *:28476...');
});  // OSGTB ==> 67482 ==reverse=> 28476
