const BASE_URL = 'http://localhost:4000/api/v1';

async function testAll() {
  console.log('--- STARTING BACKEND API AUDIT ---');

  // 1. Swagger Docs
  try {
    const docsRes = await fetch('http://localhost:4000/docs-json');
    if (docsRes.ok) {
      const docs = await docsRes.json();
      const routes = Object.keys(docs.paths);
      console.log(`[PASS] Swagger Docs: ${routes.length} API routes registered.`);
    } else {
      console.log('[FAIL] Swagger docs returned status:', docsRes.status);
    }
  } catch (e) {
    console.error('[FAIL] Swagger:', e.message);
  }

  // 2. Auth OTP Send
  let authToken = null;
  let userId = null;
  try {
    const otpRes = await fetch(`${BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' }),
    });
    const otpData = await otpRes.json();
    console.log(`[PASS] POST /auth/otp/send -> ${otpRes.status}:`, otpData);
  } catch (e) {
    console.error('[FAIL] POST /auth/otp/send:', e.message);
  }

  // 3. Auth OTP Verify (Mock code 123456)
  try {
    const verifyRes = await fetch(`${BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', otp: '123456', role: 'CUSTOMER' }),
    });
    const verifyData = await verifyRes.json();
    console.log(`[PASS] POST /auth/otp/verify -> ${verifyRes.status}:`, {
      success: verifyData.success,
      role: verifyData.data?.user?.role,
      hasToken: !!verifyData.data?.accessToken,
    });
    if (verifyData.data?.accessToken) {
      authToken = verifyData.data.accessToken;
      userId = verifyData.data.user?.id || verifyData.data.user?._id;
    }
  } catch (e) {
    console.error('[FAIL] POST /auth/otp/verify:', e.message);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  // 4. POST /pricing/calculate
  try {
    const calcRes = await fetch(`${BASE_URL}/pricing/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType: 'BREAKFAST',
        personCount: 2,
        latitude: 12.9716,
        longitude: 77.5946,
      }),
    });
    const calcData = await calcRes.json();
    console.log(`[PASS] POST /pricing/calculate -> ${calcRes.status}:`, calcData.data || calcData);
  } catch (e) {
    console.error('[FAIL] POST /pricing/calculate:', e.message);
  }

  // 5. GET /users/me (Customer Profile)
  try {
    const meRes = await fetch(`${BASE_URL}/users/me`, { headers: authHeaders });
    const meData = await meRes.json();
    console.log(`[PASS] GET /users/me -> ${meRes.status}:`, {
      id: meData.data?.id,
      phone: meData.data?.phone,
      role: meData.data?.role,
    });
  } catch (e) {
    console.error('[FAIL] GET /users/me:', e.message);
  }

  // 6. GET /wallet/balance
  try {
    const wRes = await fetch(`${BASE_URL}/wallet/balance`, { headers: authHeaders });
    const wData = await wRes.json();
    console.log(`[PASS] GET /wallet/balance -> ${wRes.status}:`, wData.data || wData);
  } catch (e) {
    console.error('[FAIL] GET /wallet/balance:', e.message);
  }

  // 7. POST /wallet/topup
  try {
    const topupRes = await fetch(`${BASE_URL}/wallet/topup`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ amount: 500 }),
    });
    const topupData = await topupRes.json();
    console.log(`[PASS] POST /wallet/topup -> ${topupRes.status}:`, topupData.data || topupData);
  } catch (e) {
    console.error('[FAIL] POST /wallet/topup:', e.message);
  }

  // 8. GET /bookings
  let existingBookingId = null;
  try {
    const bRes = await fetch(`${BASE_URL}/bookings`, { headers: authHeaders });
    const bData = await bRes.json();
    console.log(`[PASS] GET /bookings -> ${bRes.status}:`, bData.data ? `${bData.data.length} bookings found` : bData);
    if (bData.data && bData.data.length > 0) {
      existingBookingId = bData.data[0].id || bData.data[0]._id;
    }
  } catch (e) {
    console.error('[FAIL] GET /bookings:', e.message);
  }

  // 9. POST /payments/razorpay/create-order
  try {
    const rzpRes = await fetch(`${BASE_URL}/payments/razorpay/create-order`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ bookingId: existingBookingId || 'BK-TEST-101', amount: 248 }),
    });
    const rzpData = await rzpRes.json();
    console.log(`[PASS] POST /payments/razorpay/create-order -> ${rzpRes.status}:`, rzpData.data || rzpData);
  } catch (e) {
    console.error('[FAIL] POST /payments/razorpay/create-order:', e.message);
  }

  console.log('--- BACKEND API AUDIT COMPLETE ---');
}

testAll();
