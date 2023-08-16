import Centre from '@/components/layout/Centre';
import { SignIn } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <Centre>
      <SignIn />
    </Centre>
  );
};

export default SignInPage;
