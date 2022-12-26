import {useEffect, useMemo, useState} from "react";
import "./Draw.css";

const col_count = 6;

function Draw(props) {
    const [waiting, setWaiting] = useState(false);
    const [users, setUsers] = useState({});
    const [selection, setSelection] = useState(null);
    const [rank, setRank] = useState([]);
    const [rankInput, setRankInput] = useState("");
    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        props.socket.on("update", (data) => {
            console.log(data);
            if (!data.status) {
                return;
            }
            setUsers(data.users);
            setSelection(data.selection);
            setRank(data.rank);
            setWaiting(false);
        });

        props.socket.on("error", (text) => {
            setErrorText(text);
        });

        props.socket.emit("request-update", props.passcode);

        return () => {
            props.socket.off("update");
            props.socket.off("error");
            setSelection(null);
        };
    }, []);

    const results = useMemo(() => {
        if (selection === null) {
            return [];
        }
        const data = [];
        for (const id of rank) {
            if (id < selection.length) {
                data.push(
                    <div className="card card-width border rank-card" key={id}>
                        <img src={require(`./icons/${id}.jpg`)} alt={`Card ${id}`}/>
                        <div className="card-body">
                            <div className="card-title">
                                卡片编号 <span className="text-secondary">#{id}</span>
                            </div>
                            <p className="card-text card-text-font">{
                                selection[id] === ""
                                    ? <span className="text-muted">没有人选择这张卡片</span>
                                    : <span>卡片被 <span
                                        className="text-success">{users[selection[id]]}</span> 选择</span>
                            }</p>
                        </div>
                    </div>
                );
            } else {
                data.push(<div key={id}/>);
            }
        }
        return data;
    }, [users, selection, rank]);

    const cards = useMemo(() => {
        if (selection === null) {
            return [];
        }
        const data = [];
        const rank_set = new Set(rank);

        const row_count = Math.ceil((selection.length - rank.length) / col_count);
        const col_width = Math.floor(12 / col_count);
        let id = 0;
        for (let i = 0; i < row_count; ++i) {
            const current_row = [];
            for (let j = 0; j < col_count; ++j) {
                while (rank_set.has(id)) id++;
                if (id < selection.length) {
                    current_row.push(
                        <div className={`col-${col_width} col`} key={`col-${j}`}>
                            <div className="card card-width border" key={id}>
                                <img src={require(`./icons/${id}.jpg`)} alt={`Card ${id}`}/>
                                <div className="card-body">
                                    <div className="card-title">
                                        卡片编号 <span className="text-secondary">#{id}</span>
                                    </div>
                                    <p className="card-text card-text-font">{
                                        selection[id] === ""
                                            ? <span className="text-muted">没有人选择这张卡片</span>
                                            : <span>卡片被 <span className="text-success">{users[selection[id]]}</span> 选择</span>
                                    }</p>
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    current_row.push(<div key={id}/>);
                }
                id++;
            }
            data.push(<div className="row" key={`row-${i}`}>{current_row}</div>);
        }
        return data;
    }, [users, selection, rank]);

    const handleRankInputChange = (event) => {
        setRankInput(event.target.value);
    };

    const handleNewRank = () => {
        setErrorText("");
        props.socket.emit("new-rank", props.passcode, parseInt(rankInput));
    };

    return (
        <>
            {selection !== null
                ?
                <div>
                    <h3 className="general-font" hidden={rank.length === 0}>中奖列表（{rank.length}）</h3>
                    <div className="paper container rank-list" hidden={rank.length === 0}>
                        <div className="rank-list-container">
                            {results}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-8 col">
                            <div style={{width: "100%"}}>
                                <h4 className="general-font">抽取卡片</h4>
                                <div className="form-group">
                                    <input className="input-block general-font" type="text" placeholder="输入卡片编号"
                                           id="rankInput" value={rankInput} onChange={handleRankInputChange}/>
                                </div>
                                <button className="btn-block btn-primary general-font"
                                        onClick={handleNewRank}>从卡片池抽取上面这张卡片
                                </button>
                                <p className="text-danger general-font" hidden={errorText === ""}>{errorText}</p>
                            </div>
                        </div>
                        <div className="col-4 col all-center">
                            <div>
                                <h4 className="general-font">最近抽取的卡片</h4>
                                {results.findLast(() => true)}
                            </div>
                        </div>
                    </div>
                    <h3 className="general-font"
                        hidden={rank.length === 0}>剩余卡片池（{selection.length - rank.length}）</h3>
                    {cards}
                </div>
                :
                <div className="alert alert-secondary full-width">正在加载卡片列表……</div>
            }
        </>
    );
}

export default Draw;