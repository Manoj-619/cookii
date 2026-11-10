import {WalletTxn} from '../types';
export const initialCash=11.73;export const initialBonus=0;
export const transactions:WalletTxn[]=['Paid for job extension','Paid for booking','Refund processed','Paid for booking'].map((title,i)=>({id:`txn-${i}`,title,amount:i===2?129:-[50,129,0,169][i],status:'Completed',createdAt:new Date(Date.now()-i*86400000).toISOString()}));
