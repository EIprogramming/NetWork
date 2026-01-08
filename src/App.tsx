//import { useState } from 'react'
import './App.css'
import Home from './home/Home.tsx'
import Schedule from './schedule/Schedule.tsx'
import { BrowserRouter, Link, Route, Routes } from 'react-router'

function App() {

  return (
    <>
    <BrowserRouter>
      <div className="app">
        <header className="header">
            <nav className="header-nav">
              <Link to="/">NetWork</Link>
              <span className="header-divider"></span>
              <Link to="/schedule">Schedule</Link>
            </nav>
          </header>
        <main className="content">
          <Routes>
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <footer className="footer"></footer>
      </div>
    </BrowserRouter>
    </>
  )
}

export default App
