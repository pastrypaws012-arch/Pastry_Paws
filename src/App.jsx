import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[#FEEDDD] text-[#411C10] selection:bg-[#F7B6A7] selection:text-[#411C10] font-sans antialiased overflow-x-hidden flex flex-col">
        {/* Primary Sticky Header */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {/* Luxury Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
