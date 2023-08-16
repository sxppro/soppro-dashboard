import { Flex } from '@tremor/react';
import { PropsWithChildren } from 'react';

const Centre = ({ children }: PropsWithChildren) => {
  return (
    <Flex className="h-screen" flexDirection="col" justifyContent="center">
      {children}
    </Flex>
  );
};

export default Centre;
