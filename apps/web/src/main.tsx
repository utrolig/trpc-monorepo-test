import ReactDOM from "react-dom";
import "./index.css";
import { Root } from "./Root";

async function main() {
  return ReactDOM.render(<Root />, document.getElementById("root"));
}

main();
