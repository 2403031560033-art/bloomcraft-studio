import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import Papa from 'papaparse';
import { AdminUser, Order, CustomOrderRequest, Product, Category, BusinessSettings, Customer } from '../models/index.js';
import { verifyAdminAuth, createAdminToken, ADMIN_COOKIE_NAME, AuthenticatedRequest } from '../middleware/auth.js';
import { generateOrderNumber, isValidTransition, VALID_ORDER_TRANSITIONS } from '../lib/utils.js';

const router = Router();

// 1. Admin Authentication
router.post('/auth/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password required' } });
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials or inactive account' } });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = await createAdminToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    res.cookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      success: true,
      data: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.post('/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie(ADMIN_COOKIE_NAME);
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', verifyAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, data: req.admin });
});

// 2. Admin Orders Management
router.get('/orders', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, source, search } = req.query;
    const query: any = {};

    if (status && status !== 'ALL') query.fulfilmentStatus = status;
    if (source && source !== 'ALL') query.orderSource = source;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search as string, $options: 'i' } },
        { customerEmail: { $regex: search as string, $options: 'i' } },
        { 'shippingAddress.recipientName': { $regex: search as string, $options: 'i' } },
        { 'shippingAddress.phoneE164': { $regex: search as string, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.post('/orders', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientName, phoneE164, addressLine1, city, state, postalCode, items, paymentMethod, orderSource, customerNote } = req.body;

    const orderNumber = generateOrderNumber();
    let subtotalPaise = 0;
    const itemsSnapshot = [];

    for (const item of items) {
      const lineTotal = item.unitPricePaise * item.quantity;
      subtotalPaise += lineTotal;
      itemsSnapshot.push({
        productName: item.productName,
        unitPricePaise: item.unitPricePaise,
        quantity: item.quantity,
        totalPaise: lineTotal,
        fulfilmentType: item.fulfilmentType || 'MADE_TO_ORDER',
      });
    }

    const newOrder = await Order.create({
      orderNumber,
      orderSource: orderSource || 'INSTAGRAM_DM',
      customerNote,
      shippingAddress: {
        recipientName,
        phoneE164,
        addressLine1,
        city,
        state,
        postalCode,
        countryCode: 'IN',
      },
      items: itemsSnapshot,
      subtotalPaise,
      shippingFeePaise: 0,
      totalPaise: subtotalPaise,
      fulfilmentStatus: 'CONFIRMED',
      paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PAID',
      paymentMethod: paymentMethod || 'MANUAL_UPI',
      timeline: [
        {
          status: 'CONFIRMED',
          message: `Manual order created via ${orderSource || 'Social DM'} by ${req.admin?.name}`,
          timestamp: new Date(),
        },
      ],
    });

    return res.status(201).json({ success: true, data: newOrder });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.get('/orders/:id', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.patch('/orders/:id', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fulfilmentStatus, trackingCarrier, trackingNumber, trackingUrl, internalNote } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });

    if (fulfilmentStatus && fulfilmentStatus !== order.fulfilmentStatus) {
      if (!isValidTransition(order.fulfilmentStatus, fulfilmentStatus, VALID_ORDER_TRANSITIONS)) {
        return res.status(400).json({
          error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${order.fulfilmentStatus} to ${fulfilmentStatus}` },
        });
      }
      order.fulfilmentStatus = fulfilmentStatus;
      order.timeline.push({
        status: fulfilmentStatus,
        message: `Status transitioned to ${fulfilmentStatus} by ${req.admin?.name}`,
        timestamp: new Date(),
      });
    }

    if (trackingCarrier !== undefined) order.trackingCarrier = trackingCarrier;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;

    if (internalNote) {
      order.timeline.push({
        status: order.fulfilmentStatus,
        message: `Internal note: ${internalNote}`,
        isCustomerVisible: false,
        timestamp: new Date(),
      });
    }

    await order.save();
    return res.json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// 3. Custom Requests Management
router.get('/custom-requests', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await CustomOrderRequest.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: requests });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.patch('/custom-requests/:id', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, quotedPricePaise, internalNotes } = req.body;
    const reqDoc = await CustomOrderRequest.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Custom request not found' } });

    if (status) reqDoc.status = status;
    if (quotedPricePaise !== undefined) reqDoc.quotedPricePaise = quotedPricePaise;
    if (internalNotes !== undefined) reqDoc.internalNotes = internalNotes;

    reqDoc.auditHistory.push({
      action: status || 'UPDATED',
      actor: 'STUDIO_OWNER',
      note: `Updated by ${req.admin?.name}`,
      timestamp: new Date(),
    });

    await reqDoc.save();
    return res.json({ success: true, data: reqDoc });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.post('/custom-requests/:id/convert-to-order', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customReq = await CustomOrderRequest.findById(req.params.id);
    if (!customReq) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Request not found' } });

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      orderSource: 'CUSTOM_PORTAL',
      customerNote: `Converted from bespoke commission #${customReq.requestNumber}: ${customReq.description}`,
      shippingAddress: {
        recipientName: customReq.customerName,
        phoneE164: customReq.phoneE164,
        addressLine1: 'To be confirmed with patron on WhatsApp',
        city: 'Jhansi',
        state: 'Uttar Pradesh',
        postalCode: '284001',
        countryCode: 'IN',
      },
      items: [
        {
          productName: `Bespoke Floral Commission (${customReq.occasion || 'Custom'})`,
          unitPricePaise: customReq.quotedPricePaise || 0,
          quantity: 1,
          totalPaise: customReq.quotedPricePaise || 0,
          fulfilmentType: 'CUSTOM_ONLY',
          personalisation: {
            colours: customReq.preferredColours,
            occasion: customReq.occasion,
            details: customReq.description,
          },
        },
      ],
      subtotalPaise: customReq.quotedPricePaise || 0,
      totalPaise: customReq.quotedPricePaise || 0,
      fulfilmentStatus: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      paymentMethod: 'MANUAL_UPI',
      timeline: [
        {
          status: 'CONFIRMED',
          message: `Converted from custom inquiry #${customReq.requestNumber} by ${req.admin?.name}`,
          timestamp: new Date(),
        },
      ],
    });

    customReq.status = 'CONVERTED';
    customReq.convertedOrderId = order._id;
    await customReq.save();

    return res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// 4. Products Management
router.get('/products', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await Product.find({ archivedAt: null }).populate('categoryId').sort({ createdAt: -1 });
    return res.json({ success: true, data: products });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.post('/products', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.patch('/products/:id', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    return res.json({ success: true, data: product });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// 5. Reports & Summary
router.get('/reports/summary', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [orders, customInquiries, lowStock] = await Promise.all([
      Order.find(),
      CustomOrderRequest.countDocuments({ status: 'SUBMITTED' }),
      Product.countDocuments({ fulfilmentType: 'READY_STOCK', stockQuantity: { $lte: 5 } }),
    ]);

    const grossRevenuePaise = orders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.totalPaise, 0);

    const activeInProduction = orders.filter((o) =>
      ['CONFIRMED', 'IN_PRODUCTION', 'READY_TO_DISPATCH'].includes(o.fulfilmentStatus)
    ).length;

    return res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        grossRevenuePaise,
        activeInProduction,
        pendingCustomInquiries: customInquiries,
        lowStockItems: lowStock,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.get('/reports/orders.csv', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const rows = orders.map((o) => ({
      OrderNumber: o.orderNumber,
      Date: o.createdAt.toISOString().split('T')[0],
      Customer: o.shippingAddress.recipientName,
      Phone: o.shippingAddress.phoneE164,
      City: o.shippingAddress.city,
      TotalINR: (o.totalPaise / 100).toFixed(2),
      FulfilmentStatus: o.fulfilmentStatus,
      PaymentStatus: o.paymentStatus,
      PaymentMethod: o.paymentMethod,
      Source: o.orderSource,
      TrackingCarrier: o.trackingCarrier || '',
      TrackingNumber: o.trackingNumber || '',
    }));

    const csv = Papa.unparse(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bloomcraft-orders.csv"');
    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// 6. Settings
router.get('/settings', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) settings = await BusinessSettings.create({});
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.patch('/settings', verifyAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) settings = new BusinessSettings();
    Object.assign(settings, req.body);
    await settings.save();
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
