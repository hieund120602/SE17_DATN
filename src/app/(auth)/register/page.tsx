import AccountCreationFlow from '@/app/(auth)/components/account-creation-flow';
import React from 'react';

const Register = () => {
	return (
		<div className='w-full'>
			<div className='py-2'>
				<AccountCreationFlow />
			</div>
		</div>
	);
};

export default Register;
