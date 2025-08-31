const axios = require('axios');
const User = require('../models/User');
const Course = require('../models/Course'); // يشمل الكورس والباكج
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollments');
require('dotenv').config();

// الحصول على Access Token
const getAccessToken = async () => {
  try {
    const credentials = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const res = await axios.post(
      `${process.env.PAYPAL_SANDBOX_URL}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: 'client_credentials' }),
      { headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log('PayPal Access Token:', res.data.access_token.slice(0, 10) + '...');
    return res.data.access_token;
  } catch (err) {
    console.error('Error fetching PayPal token:', JSON.stringify(err.response?.data || err.message, null, 2));
    throw new Error('Failed to fetch PayPal token');
  }
};

// إنشاء Order
exports.createOrder = async (req, res) => {
  try {
    const { userId, itemId, amount, shippingAddress, itemType } = req.body;

    if (!userId || !itemId || !amount || !itemType) {
      return res.status(400).json({ message: 'Missing required fields: userId, itemId, amount, or itemType' });
    }

    let item;
    if (itemType === 'course' || itemType === 'package') {
      item = await Course.findOne({ _id: itemId, type: itemType });
    }

    if (!item) return res.status(404).json({ message: `${itemType} not found` });

    if (amount < 1) {
      return res.status(400).json({ message: 'Amount must be at least $1.00' });
    }

    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${process.env.PAYPAL_SANDBOX_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: `${itemType.toUpperCase()}_${itemId}_${Date.now()}`,
          amount: { currency_code: 'USD', value: amount.toFixed(2) },
          description: `${itemType === 'course' ? 'Course' : 'Package'}: ${item.title}`,
          payee: { email_address: process.env.PAYPAL_SELLER_EMAIL },
          invoice_id: `INV_${userId}_${itemId}_${Date.now()}`,
          ...(shippingAddress && { shipping: { ...shippingAddress } })
        }],
        application_context: {
          brand_name: 'SmartLearn Training',
          user_action: 'PAY_NOW',
          return_url: `http://localhost:4200/payment-success?itemId=${itemId}&itemType=${itemType}`,
          cancel_url: 'http://localhost:4200/payment-cancel'
        }
      },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `REQ_${Date.now()}` } }
    );

    const approvalUrl = response.data.links.find(link => link.rel === 'approve')?.href;
    if (!approvalUrl) return res.status(500).json({ message: 'No approval URL from PayPal' });

    await Payment.create({
      userId,
      itemId,
      itemType,
      amount,
      paypalOrderId: response.data.id,
      status: 'PENDING'
    });

    res.json({ orderID: response.data.id, approvalUrl });

  } catch (error) {
    console.error('PayPal Order Error:', JSON.stringify(error.response?.data || error.message, null, 2));
    res.status(500).json({
      message: 'Error creating PayPal order',
      paypalError: error.response?.data || error.message
    });
  }
};



// Capture Order
exports.captureOrder = async (req, res) => {
  try {
    const orderID = req.query.orderID || req.query.token;
    if (!orderID) return res.status(400).json({ message: 'Missing orderID or token' });

    const accessToken = await getAccessToken();

    // التحقق من حالة الطلب
    const orderCheck = await axios.get(
      `${process.env.PAYPAL_SANDBOX_URL}/v2/checkout/orders/${orderID}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (orderCheck.data.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Order not approved yet', details: orderCheck.data });
    }

    // Capture للطلب
    const response = await axios.post(
      `${process.env.PAYPAL_SANDBOX_URL}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `CAPTURE_${Date.now()}`
        }
      }
    );

    if (response.data.status === 'COMPLETED') {
      const payment = await Payment.findOne({ paypalOrderId: orderID });
      if (!payment) return res.status(404).json({ message: 'Payment not found' });

      payment.status = 'COMPLETED';
      await payment.save();

      // تسجيل المستخدم في الـ Enrollment
      await Enrollment.create({
        userId: payment.userId,
        courseId: payment.itemType === 'course' ? payment.itemId : null,
        packageId: payment.itemType === 'package' ? payment.itemId : null,
        enrollmentDate: new Date(),
        progress: 0
      });

      // تحديث مصفوفة students
      if (payment.itemType === 'course') {
        const course = await Course.findById(payment.itemId);
        if (course) {
          course.students = course.students || [];
          if (!course.students.includes(payment.userId)) {
            course.students.push(payment.userId);
            await course.save();
          }
        }
      } else if (payment.itemType === 'package') {
        const pkg = await Course.findById(payment.itemId);
        if (pkg) {
          pkg.students = pkg.students || [];
          if (!pkg.students.includes(payment.userId)) {
            pkg.students.push(payment.userId);
            await pkg.save();
          }

          // إضافة المستخدم لكل الكورسات داخل الباكج
          if (pkg.package?.length) {
            for (const cId of pkg.package) {
              const course = await Course.findById(cId);
              if (course) {
                course.students = course.students || [];
                if (!course.students.includes(payment.userId)) {
                  course.students.push(payment.userId);
                  await course.save();
                }
              }
            }
          }
        }
      }

      return res.json({
        success: true,
        message: 'Payment completed and user enrolled successfully',
        itemId: payment.itemId,
        details: response.data
      });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not completed', details: response.data });
    }

  } catch (error) {
    console.error(' PayPal Capture Error:', JSON.stringify(error.response?.data || error.message, null, 2));
    return res.status(500).json({
      success: false,
      message: 'Error capturing PayPal order',
      details: error.response?.data || error.message
    });
  }
};
