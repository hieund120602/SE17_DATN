'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TestEmailPage() {
	const [email, setEmail] = useState('');
	const [fullName, setFullName] = useState('');
	const [status, setStatus] = useState('approved');
	const [reason, setReason] = useState('');
	const [result, setResult] = useState('');

	const testWelcomeEmail = async () => {
		try {
			const response = await fetch(
				`http://localhost:8082/api/test/send-tutor-welcome?email=${encodeURIComponent(
					email
				)}&fullName=${encodeURIComponent(fullName)}`,
				{
					method: 'POST',
				}
			);

			const result = await response.text();
			setResult(`Welcome Email Result: ${result}`);
		} catch (error) {
			setResult(`Error: ${error}`);
		}
	};

	const testStatusEmail = async () => {
		try {
			const params = new URLSearchParams({
				email: email,
				fullName: fullName,
				status: status,
			});

			if (reason) {
				params.append('reason', reason);
			}

			const response = await fetch(`http://localhost:8082/api/test/send-tutor-status?${params.toString()}`, {
				method: 'POST',
			});

			const result = await response.text();
			setResult(`Status Email Result: ${result}`);
		} catch (error) {
			setResult(`Error: ${error}`);
		}
	};

	return (
		<div className='container mx-auto py-8 max-w-2xl'>
			<h1 className='text-3xl font-bold mb-6'>Test Email Service</h1>

			<div className='space-y-6'>
				<div>
					<label className='block text-sm font-medium mb-1'>Email</label>
					<Input
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='tutor@example.com'
						required
					/>
				</div>

				<div>
					<label className='block text-sm font-medium mb-1'>Full Name</label>
					<Input
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						placeholder='Nguyễn Văn A'
						required
					/>
				</div>

				<div>
					<label className='block text-sm font-medium mb-1'>Status (for status email)</label>
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className='w-full p-2 border border-gray-300 rounded-md'
					>
						<option value='approved'>Approved</option>
						<option value='rejected'>Rejected</option>
					</select>
				</div>

				<div>
					<label className='block text-sm font-medium mb-1'>Reason (for rejection)</label>
					<Textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder='Lý do từ chối (nếu có)'
						rows={3}
					/>
				</div>

				<div className='flex gap-4'>
					<Button onClick={testWelcomeEmail} className='flex-1'>
						Test Welcome Email
					</Button>
					<Button onClick={testStatusEmail} className='flex-1'>
						Test Status Email
					</Button>
				</div>

				{result && (
					<div className='p-4 bg-gray-100 rounded-md'>
						<h3 className='font-medium mb-2'>Result:</h3>
						<pre className='whitespace-pre-wrap text-sm'>{result}</pre>
					</div>
				)}
			</div>
		</div>
	);
}

