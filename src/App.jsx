import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { STUDY_CONFIG } from './config/studyConfig';
import WelcomePage from './components/WelcomePage';
import Randomizor from './components/Randomizor';
import Survey from './components/Survey';
import EndPage from './components/EndPage';
import './App.css';

function App() {
  const welcomeEnabled = STUDY_CONFIG.welcomePage?.enabled ?? true;

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={
            welcomeEnabled ? <WelcomePage /> : <Navigate to="/study" replace />
          } 
        />
        <Route path="/study" element={<Randomizor />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/end" element={<EndPage />} />
      </Routes>
    </div>
  );
}

export default App;
