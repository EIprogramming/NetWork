//import { useState } from 'react'
import { preload } from 'react-dom';
import './App.css'
import Home from './home/Home.tsx'
import Schedule from './schedule/Schedule.tsx'
import { BrowserRouter, Link, Route, Routes } from 'react-router'

function App() {
  preload("./fonts/JetBrainsMono/JetBrainsMono-Italic-VariableFont_wght.ttf", {as: "font"});
  preload("./fonts/JetBrainsMono/JetBrainsMono-VariableFont_wght.ttf", {as: "font"});
  preload("index.css", {as: "style"});

  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
            <nav className="header-nav">
              <Link to="/">NetWork</Link>
              <span className="header-divider"></span>
            </nav>
          </header>
        <main className="content">
          <Routes>
            <Route path="/schedule/*" element={<Schedule />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <footer className="footer"></footer>
      </div>
    </BrowserRouter>
  );
}

export default App
