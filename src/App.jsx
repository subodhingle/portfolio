import Background from "./Background";
import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";
import "./App.css";

function App() {
  return (
    <>
      <Background />

      <div className="container">
        <h1 className="title">Subodh Ingle</h1>

        <p className="subtitle">
          Aspiring Full Stack Developer | Tech Enthusiast | Lifelong Learner
        </p>
  

        <div className="social-icons">
          <a href="https://x.com/yourusername" target="_blank">
            <FaXTwitter />
          </a>
          <a href="https://github.com/yourusername" target="_blank">
            <FaGithub />
          </a>
          <a href="https://linkedin.com/in/yourusername" target="_blank">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </>
  );
}

export default App;
