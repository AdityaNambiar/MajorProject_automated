import React from 'react';
import logo from "./logo.svg"
import FormElement from "./components/FormElement"
import './App.css';

function App() { 
  return (
    <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          <h1>This is a Movielibrary App  hosted by Devopschain</h1>
         
        </p>
        <div>
            <FormElement/>
          </div>
    </div>
  );
}

export default App;
