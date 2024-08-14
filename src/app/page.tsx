"use client"
import Homepage from '@/components/Homepage';
import LoadingSpinner from '@/components/LoadingSpinner';
import React, { useEffect, useState } from 'react';
import { HomepageProvider } from '../hooks/HomepageContext';

function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingSpinner />;
  }
  return (
    <HomepageProvider>
      {/* <Chat /> */}
      <Homepage/>
    </HomepageProvider>
  );
}

export default Home;
