import {useEffect, useMemo, useState} from "react";
import "./Register.css";

const col_count = 6;

function Register(props) {
    const [waiting, setWaiting] = useState(false);
    const [users, setUsers] = useState({});
    const [selection, setSelection] = useState(null);

    useEffect(() => {
        props.socket.on("update", (data) => {
            if (!data.status) {
                return;
            }
            setUsers(data.users);
            setSelection(data.selection);
            setWaiting(false);
        });

        props.socket.emit("request-update", props.passcode);

        return () => {
            props.socket.off("update");
            setSelection(null);
        };
    }, []);

    const selected = useMemo(() => {
        for (const pos in selection) {
            if (selection[pos] === props.passcode) {
                return pos;
            }
        }
        return -1;
    }, [selection, props]);

    const handleSelection = (id) => {
        setWaiting(true);
        props.socket.emit("select", props.passcode, id);
    };

    const items = useMemo(() => {
        if (selection === null) {
            return [];
        }
        const data = [];
        data.push(
            <div className="row">
                <div className="col-fill col">
                    {selected === -1
                        ? `请 ${props.name} 选择一张属于你自己的卡片：`
                        : `${props.name} 已经选择卡片 #${selected}：`}
                </div>
            </div>
        );

        const row_count = Math.ceil(selection.length / col_count);
        const col_width = Math.floor(12 / col_count);
        for (let i = 0; i < row_count; ++i) {
            const current_row = [];
            for (let j = 0; j < col_count; ++j) {
                const id = i * col_count + j;
                if (id < selection.length) {
                    current_row.push(
                        <div className={`col-${col_width} col`} key={`col-${j}`}>
                            <div className="card card-width border" key={id}>
                                <img src={require(`./icons/${id}.jpg`)} alt={`Card ${id}`}/>
                                <div className="card-body">
                                    <div className="card-title">
                                        卡片编号 <span className="text-secondary">#{id}</span>
                                    </div>
                                    {
                                        selection[id] === ""
                                            ? <button className="btn-success btn-font" disabled={waiting}
                                                      onClick={() => handleSelection(id)}>选择这张卡片！</button>
                                            : (selection[id] === props.passcode
                                                ? <button className="btn-secondary btn-font"
                                                          disabled={true}>这是你选择的卡片</button>
                                                : <button className="btn-font btn-primary"
                                                          disabled={true}>卡片被 {users[selection[id]]} 选择</button>)
                                    }
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    current_row.push(<div/>);
                }
            }
            data.push(<div className="row" key={`row-${i}`}>{current_row}</div>);
        }
        return data;
    }, [users, selection, waiting, selected, props]);

    return (
        <>
            {selection !== null
                ?
                items
                :
                <div className="alert alert-secondary full-width">正在加载卡片列表……</div>
            }
        </>
    );
}

export default Register;
