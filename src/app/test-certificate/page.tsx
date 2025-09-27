'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestCertificatePage() {
	const [enrollmentId, setEnrollmentId] = useState('');
	const [result, setResult] = useState('');

	const checkCompletion = async () => {
		try {
			const response = await fetch(
				`http://localhost:8082/api/test/certificate/check-completion/${enrollmentId}`,
				{
					method: 'POST',
				}
			);

			const result = await response.text();
			setResult(`Check Completion Result: ${result}`);
		} catch (error) {
			setResult(`Error: ${error}`);
		}
	};

	const getStatus = async () => {
		try {
			const response = await fetch(`http://localhost:8082/api/test/certificate/status/${enrollmentId}`);

			const result = await response.text();
			setResult(`Status Result: ${result}`);
		} catch (error) {
			setResult(`Error: ${error}`);
		}
	};

	const generateCertificate = async () => {
		try {
			const response = await fetch(`http://localhost:8082/api/test/certificate/generate/${enrollmentId}`, {
				method: 'POST',
			});

			const result = await response.text();
			setResult(`Generate Certificate Result: ${result}`);
		} catch (error) {
			setResult(`Error: ${error}`);
		}
	};

	return (
		<div className='container mx-auto py-8 max-w-2xl'>
			<h1 className='text-3xl font-bold mb-6'>Test Certificate Generation</h1>

			<Card className='mb-6'>
				<CardHeader>
					<CardTitle>Test Certificate Service</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div>
						<label className='block text-sm font-medium mb-1'>Enrollment ID</label>
						<Input
							type='number'
							value={enrollmentId}
							onChange={(e) => setEnrollmentId(e.target.value)}
							placeholder='Nhập ID enrollment để test'
							required
						/>
					</div>

					<div className='flex gap-4'>
						<Button onClick={checkCompletion} className='flex-1'>
							Kiểm tra hoàn thành
						</Button>
						<Button onClick={getStatus} className='flex-1'>
							Xem trạng thái
						</Button>
						<Button onClick={generateCertificate} className='flex-1'>
							Tạo certificate
						</Button>
					</div>
				</CardContent>
			</Card>

			{result && (
				<Card>
					<CardHeader>
						<CardTitle>Kết quả</CardTitle>
					</CardHeader>
					<CardContent>
						<pre className='whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded'>{result}</pre>
					</CardContent>
				</Card>
			)}

			<Card className='mt-6'>
				<CardHeader>
					<CardTitle>Hướng dẫn sử dụng</CardTitle>
				</CardHeader>
				<CardContent className='space-y-2 text-sm text-gray-600'>
					<p>
						1. <strong>Kiểm tra hoàn thành:</strong> Kiểm tra xem khóa học có hoàn thành không và tự động
						tạo certificate
					</p>
					<p>
						2. <strong>Xem trạng thái:</strong> Kiểm tra trạng thái hoàn thành của khóa học
					</p>
					<p>
						3. <strong>Tạo certificate:</strong> Tạo certificate cho khóa học (bất kể trạng thái)
					</p>
					<p className='text-xs text-gray-500 mt-4'>
						Lưu ý: Cần có enrollment ID hợp lệ trong database để test
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
