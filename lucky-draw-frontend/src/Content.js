import io from 'socket.io-client';
import {useEffect, useState} from "react";
import Passcode from "./Passcode";
import Draw from "./Draw";
import Register from "./Register";
import "./Content.css";

const socket = io(window.location.hostname + ":28476");

function Content() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [name, setName] = useState("");
    const [passcode, setPasscode] = useState("");

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    return (
        <>
            <div className="content">
                {isConnected
                    ? (name === ""
                        ? <Passcode socket={socket} setPasscode={setPasscode} setName={setName}/>
                        : (name === "admin"
                            ? <Draw socket={socket} passcode={passcode}/>
                            : <Register socket={socket} passcode={passcode} name={name}/>))
                    : <div className="alert alert-secondary full-width">正在连接服务器……</div>}
            </div>
        </>
    );
}

export default Content;