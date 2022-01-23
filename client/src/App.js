import './App.css';

const LOGIN_URI = process.env.NODE_ENV !== 'production' ? "http://localhost:8888/login" : "";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <a href={LOGIN_URI}>login here</a>
      </header>
    </div>
  );
}

export default App;
