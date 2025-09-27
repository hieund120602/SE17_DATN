'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Landmark, Wallet } from 'lucide-react';

interface PaymentInfoStepProps {
	onContinue: () => void;
	onBack: () => void;
}

export default function PaymentInfoStep({ onContinue, onBack }: PaymentInfoStepProps) {
	const [paymentMethod, setPaymentMethod] = useState<string>('bank');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onContinue();
	};

	return (
		<div className='p-6 space-y-6'>
			<div className='text-center space-y-2'>
				<h2 className='text-2xl font-bold'>Thông tin thanh toán</h2>
				<p className='text-gray-500'>Vui lòng cung cấp thông tin để nhận thanh toán từ học viên</p>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='space-y-4'>
					<Label>Phương thức thanh toán</Label>
					<RadioGroup
						defaultValue='bank'
						value={paymentMethod}
						onValueChange={setPaymentMethod}
						className='grid grid-cols-1 gap-4'
					>
						<div className='flex items-center space-x-2 border rounded-lg p-4'>
							<RadioGroupItem value='bank' id='bank' />
							<Label htmlFor='bank' className='flex items-center gap-2 cursor-pointer'>
								<Landmark className='h-5 w-5' />
								<span>Tài khoản ngân hàng</span>
							</Label>
						</div>
						<div className='flex items-center space-x-2 border rounded-lg p-4'>
							<RadioGroupItem value='e-wallet' id='e-wallet' />
							<Label htmlFor='e-wallet' className='flex items-center gap-2 cursor-pointer'>
								<Wallet className='h-5 w-5' />
								<span>Ví điện tử</span>
							</Label>
						</div>
						<div className='flex items-center space-x-2 border rounded-lg p-4'>
							<RadioGroupItem value='card' id='card' />
							<Label htmlFor='card' className='flex items-center gap-2 cursor-pointer'>
								<CreditCard className='h-5 w-5' />
								<span>Thẻ tín dụng/ghi nợ</span>
							</Label>
						</div>
					</RadioGroup>
				</div>

				{paymentMethod === 'bank' && (
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='bank-name'>Tên ngân hàng</Label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder='Chọn ngân hàng' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='vietcombank'>Vietcombank</SelectItem>
									<SelectItem value='techcombank'>Techcombank</SelectItem>
									<SelectItem value='vietinbank'>Vietinbank</SelectItem>
									<SelectItem value='bidv'>BIDV</SelectItem>
									<SelectItem value='other'>Khác</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='account-number'>Số tài khoản</Label>
							<Input id='account-number' placeholder='Nhập số tài khoản' required />
						</div>

						<div className='space-y-2'>
							<Label htmlFor='account-name'>Tên chủ tài khoản</Label>
							<Input id='account-name' placeholder='Nhập tên chủ tài khoản' required />
						</div>
					</div>
				)}

				{paymentMethod === 'e-wallet' && (
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='wallet-type'>Loại ví điện tử</Label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder='Chọn ví điện tử' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='momo'>MoMo</SelectItem>
									<SelectItem value='zalopay'>ZaloPay</SelectItem>
									<SelectItem value='vnpay'>VNPay</SelectItem>
									<SelectItem value='other'>Khác</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='wallet-number'>Số điện thoại/ID ví</Label>
							<Input id='wallet-number' placeholder='Nhập số điện thoại hoặc ID ví' required />
						</div>
					</div>
				)}

				{paymentMethod === 'card' && (
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='card-number'>Số thẻ</Label>
							<Input id='card-number' placeholder='XXXX XXXX XXXX XXXX' required />
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='expiry-date'>Ngày hết hạn</Label>
								<Input id='expiry-date' placeholder='MM/YY' required />
							</div>

							<div className='space-y-2'>
								<Label htmlFor='cvv'>CVV</Label>
								<Input id='cvv' placeholder='XXX' required />
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='card-name'>Tên chủ thẻ</Label>
							<Input id='card-name' placeholder='Nhập tên chủ thẻ' required />
						</div>
					</div>
				)}

				<div className='flex gap-3 pt-2'>
					<Button type='button' variant='superOutline' className='flex-1' onClick={onBack}>
						Quay lại
					</Button>
					<Button type='submit' className='flex-1 bg-orange-500 hover:bg-orange-600'>
						Tiếp tục
					</Button>
				</div>
			</form>
		</div>
	);
}
