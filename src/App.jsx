import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[#FEEDDD] text-[#411C10] selection:bg-[#F7B6A7] selection:text-[#411C10] font-sans antialiased overflow-x-hidden flex flex-col">
        {/* Dynamic Route Pages */}
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <HomePage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/menu"
              element={
                <>
                  <Navbar />
                  <MenuPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/order"
              element={
                <>
                  <Navbar />
                  <MenuPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/track-order"
              element={
                <>
                  <Navbar />
                  <TrackOrderPage />
                  <Footer />
                </>
              }
            />
            <Route
              path="/order-status"
              element={
                <>
                  <Navbar />
                  <TrackOrderPage />
                  <Footer />
                </>
              }
            />
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <HomePage />
                  <Footer />
                </>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
