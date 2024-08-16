"use client"
import Homepage from '@/components/Homepage';
import LoadingSpinner from '@/components/LoadingSpinner';
import React, { useEffect, useState } from 'react';

function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingSpinner />;
  }
  return (<Homepage />);
}

export default Home;
