'use client';

import { Dispatch, SetStateAction } from 'react';
import ActiveLink from './active-link';

interface MainNavProps {
  setOpen?: Dispatch<SetStateAction<boolean>>;
}

const links = [
  {
    page: 'Overview',
    route: '/',
  },
  {
    page: 'Transactions',
    route: '/transactions',
  },
  {
    page: 'Tags',
    route: '/tags',
  },
];

const MainNav = ({
  setOpen,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & MainNavProps) => {
  return (
    <nav className={className} {...props}>
      {links.map(({ page, route }) => (
        <ActiveLink
          key={route}
          href={route}
          onClick={() => setOpen && setOpen(false)}
        >
          {page}
        </ActiveLink>
      ))}
    </nav>
  );
};

export default MainNav;
