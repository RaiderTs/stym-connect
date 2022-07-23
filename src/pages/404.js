import Link from 'next/link';

export default function Custom404() {
  return (
    <div className='absolute left-0 right-0 z-20 h-screen bg-white grid-404 items'>
      <div className='relative'>
        404 - Page Not Found
        <Link href={'/'}>
          <a className='absolute left-0 right-0 flex justify-center p-4 text-xl border rounded-lg top-12 border-my-orange text-my-orange'>
            Home
          </a>
        </Link>
      </div>
    </div>
  );
}
