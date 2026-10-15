import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './sections/Hero';
import { Creations } from './sections/Creations';
import { OurStory } from './sections/OurStory';
import { Specialties } from './sections/Specialties';
import { Testimonials } from './sections/Testimonials';
import { InstagramGallery } from './sections/InstagramGallery';
import { Contact } from './sections/Contact';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#FEEDDD] text-[#411C10] selection:bg-[#F7B6A7] selection:text-[#411C10] font-sans antialiased overflow-x-hidden flex flex-col">
      {/* Primary Sticky Header (Includes top announcement banner & navigation) */}
      <Navbar />

      {/* Main Content Landmarks */}
      <main className="flex-grow">
        <Hero />
        <Creations />
        <OurStory />
        <Specialties />
        <Testimonials />
        <InstagramGallery />
        <Contact />
      </main>

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}

export default App;
