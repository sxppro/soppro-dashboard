'use client';

import { useClerk } from '@clerk/nextjs';
import { Button } from '@tremor/react';
import { useState } from 'react';

const SignOut = () => {
  const [loading, setLoading] = useState(false);
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
  };

  return (
    <Button
      className="transition-colors"
      loading={loading}
      onClick={async () => await handleSignOut()}
    >
      Sign out
    </Button>
  );
};

export default SignOut;
