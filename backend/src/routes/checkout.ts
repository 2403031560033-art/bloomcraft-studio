import { Router, Request, Response } from 'express';
import { Product, Order, Customer, BusinessSettings, Payment } from '../models/index.js';
import { checkoutSchema } from '../lib/validations.js';
import { generateOrderNumber } from '../lib/utils.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid checkout submission', details: parsed.error.issues },
      });
    }

    const { customerName, customerPhone, customerEmail, customerNote, shippingAddress, items, paymentMethod } = parsed.data;

    const settings = await BusinessSettings.findOne();
    const flatShipping = settings?.flatShippingRatePaise ?? 0;
    const freeShippingThreshold = settings?.freeShippingAbovePaise;
    const isCodEnabled = settings?.isCodEnabled ?? false;

    if (paymentMethod === 'COD' && !isCodEnabled) {
      return res.status(400).json({
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Cash on Delivery is currently disabled by store management' },
      });
    }

    let calculatedSubtotalPaise = 0;
    const orderItemsToSnapshot = [];
    let maxPrepDays = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isPublished || product.archivedAt) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: `Product ${item.productId} is not available` },
        });
      }

      let unitPrice = product.basePricePaise;
      let variantSnapshot: any = undefined;

      if (item.variantId) {
        const variant = product.variants.find((v) => v._id?.toString() === item.variantId);
        if (!variant || !variant.isActive) {
          return res.status(404).json({
            error: { code: 'NOT_FOUND', message: `Variant ${item.variantId} is not available` },
          });
        }
        unitPrice += variant.priceDeltaPaise;
        variantSnapshot = {
          name: variant.name,
          sku: variant.sku,
          priceDeltaPaise: variant.priceDeltaPaise,
        };

        if (product.fulfilmentType === 'READY_STOCK') {
          const availableStock = variant.stockQuantity ?? product.stockQuantity ?? 0;
          if (availableStock < item.quantity) {
            return res.status(409).json({
              error: { code: 'OUT_OF_STOCK', message: `Sorry, "${product.name} (${variant.name})" has only ${availableStock} in stock` },
            });
          }
          variant.stockQuantity = availableStock - item.quantity;
        }
      } else if (product.fulfilmentType === 'READY_STOCK') {
        const availableStock = product.stockQuantity ?? 0;
        if (availableStock < item.quantity) {
          return res.status(409).json({
            error: { code: 'OUT_OF_STOCK', message: `Sorry, "${product.name}" has only ${availableStock} in stock` },
          });
        }
        product.stockQuantity = availableStock - item.quantity;
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotalPaise += lineTotal;

      if (product.preparationMaxDays && product.preparationMaxDays > maxPrepDays) {
        maxPrepDays = product.preparationMaxDays;
      }

      orderItemsToSnapshot.push({
        productId: product._id,
        productName: product.name,
        variantName: variantSnapshot?.name,
        sku: variantSnapshot?.sku || product.sku,
        unitPricePaise: unitPrice,
        quantity: item.quantity,
        totalPaise: lineTotal,
        imageUrl: product.images?.[0]?.imageUrl || '',
        personalisation: item.personalisation,
        fulfilmentType: product.fulfilmentType,
      });

      await product.save();
    }

    let shippingPaise = flatShipping;
    if (freeShippingThreshold && calculatedSubtotalPaise >= freeShippingThreshold) {
      shippingPaise = 0;
    }

    const totalPaise = calculatedSubtotalPaise + shippingPaise;

    let customer = await Customer.findOne({ phoneE164: customerPhone });
    if (!customer) {
      customer = await Customer.create({
        fullName: customerName,
        phoneE164: customerPhone,
        email: customerEmail || undefined,
        addresses: [{ ...shippingAddress, isDefault: true }],
      });
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      customerEmail: customerEmail || undefined,
      customerNote,
      shippingAddress,
      items: orderItemsToSnapshot,
      subtotalPaise: calculatedSubtotalPaise,
      shippingFeePaise: shippingPaise,
      discountPaise: 0,
      totalPaise,
      currency: 'INR',
      fulfilmentStatus: 'PLACED',
      paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PENDING',
      orderSource: 'STOREFRONT',
      paymentMethod,
      targetDispatchDate: maxPrepDays > 0 ? new Date(Date.now() + maxPrepDays * 24 * 60 * 60 * 1000) : undefined,
      timeline: [
        {
          status: 'PLACED',
          message: 'Order placed by patron via online storefront.',
          timestamp: new Date(),
        },
      ],
    });

    const payment = await Payment.create({
      orderId: order._id,
      paymentMethod,
      provider: paymentMethod === 'COD' ? 'MANUAL_UPI' : 'RAZORPAY',
      amountPaise: totalPaise,
      currency: 'INR',
      status: paymentMethod === 'COD' ? 'PENDING' : 'INITIATED',
    });

    return res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalPaise: order.totalPaise,
        fulfilmentStatus: order.fulfilmentStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentId: payment._id,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
