'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UpdatePasswordForm from '@/app/auth/update-password-form';

export default function Page() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // The token is in the hash as #access_token=xxx&type=recovery
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // remove the leading '#'
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
      }
    }
  }, []);

  if (!accessToken) {
    // If we don't have a token, redirect to sign-in
    router.push('/auth/sign-in');
    return null;
  }

  return <UpdatePasswordForm accessToken={accessToken} />;
}