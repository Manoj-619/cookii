// A future RazorpayPaymentProvider will implement the same interface; the UI will not need changes.
import {MockPaymentProvider,PaymentProvider} from './PaymentProvider';import {PaymentRequest,PaymentResult} from './types';
export const paymentService:PaymentProvider=new MockPaymentProvider();
export async function processPayment(request:PaymentRequest,method:PaymentResult['method'],walletBalance:number,provider:PaymentProvider=paymentService){const walletUsed=method==='wallet'?Math.min(walletBalance,request.amount):0;const remaining=request.amount-walletUsed;if(remaining<=0)return {result:{status:'success',referenceId:`MOCK-WALLET-${Date.now()}`,method:'wallet'} as PaymentResult,walletUsed};const result=await provider.createOrder({...request,amount:remaining},method==='wallet'?'upi':method);return {result,walletUsed:result.status==='success'?walletUsed:0};}
export type {PaymentRequest,PaymentResult};
