const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';export function generateBookingId(){return 'CKI-'+Array.from({length:6},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join('');}
