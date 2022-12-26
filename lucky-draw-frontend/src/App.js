import './App.css';
import './paper.min.css';
import Content from "./Content";

function App() {
    return (
        <div className="App">
            <div className="row">
                <div className="col-1 col"/>
                <div className="col-10 col"><Content/></div>
                <div className="col-1 col"/>
            </div>
        </div>
    );
}

export default App;
