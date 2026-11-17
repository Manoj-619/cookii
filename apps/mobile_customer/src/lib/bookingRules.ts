import {Booking} from '../types';
export function canCancel(booking:Booking,now=new Date()){if(booking.status!=='upcoming')return {allowed:false,fee:0};const hours=(new Date(`${booking.date}T${booking.startTime}:00`).getTime()-now.getTime())/3600000;return {allowed:true,fee:hours>2?0:50};}
export function canReschedule(booking:Booking,now=new Date()){return booking.status==='upcoming'&&(new Date(`${booking.date}T${booking.startTime}:00`).getTime()-now.getTime())>6*3600000;}
