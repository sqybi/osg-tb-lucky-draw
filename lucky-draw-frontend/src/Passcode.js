import {useEffect, useState} from "react";

function Passcode(props) {
    const [passcode, setPasscode] = useState("");
    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
        props.socket.on("userinfo", (user) => {
            setWaiting(false);
            if (user.status) {
                props.setPasscode(user.passcode);
                props.setName(user.name);
            }
        });

        return () => {
            props.socket.off("userinfo");
        };
    }, [props]);

    const handlePasscodeChange = (event) => {
        setPasscode(event.target.value);
    };

    const handleLoginClick = () => {
        setWaiting(true);
        props.socket.emit("login", passcode);
    };

    return (
        <div className="row flex-spaces">
            <input style={{width: "70%"}} type="text" placeholder="请输入10位登录码" id="passcode" onChange={handlePasscodeChange}
                   disabled={waiting} value={passcode}/>
            <button style={{width: "25%"}} className="btn-primary" onClick={handleLoginClick} disabled={waiting}>{waiting ? "登录中……" : "登录"}</button>
        </div>
    );
}

export default Passcode;