'use client';

import {useRouter} from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // router.push('/user/login');

  return (
    <div>
      <p>this is main layout</p>
    </div>
  );
}
