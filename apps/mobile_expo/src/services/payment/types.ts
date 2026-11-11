export type PaymentRequest={amount:number;currency:'INR';bookingDraftId:string;customer:{phone:string|null;name:string}};
export type PaymentResult={status:'success'|'failed'|'cancelled';referenceId:string;method:'wallet'|'upi'|'card'|'netbanking'|'cash_on_delivery'};
