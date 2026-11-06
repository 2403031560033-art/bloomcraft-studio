import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Product, Order, Customer, BusinessSettings, Payment } from "@/models";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid checkout submission",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { customerName, customerPhone, customerEmail, customerNote, shippingAddress, items, paymentMethod } = parsed.data;

    await dbConnect();

    // Fetch settings for shipping calculations and payment enablement
    const settings = await BusinessSettings.findOne();
    const flatShipping = settings?.flatShippingRatePaise ?? 0;
    const freeShippingThreshold = settings?.freeShippingAbovePaise;
    const isCodEnabled = settings?.isCodEnabled ?? false;

    if (paymentMethod === "COD" && !isCodEnabled) {
      return NextResponse.json(
        {
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "Cash on Delivery is currently disabled by store management",
          },
        },
        { status: 400 }
      );
    }

    // 1. Transactional stock validation & price recalculation
    let calculatedSubtotalPaise = 0;
    const orderItemsToSnapshot = [];
    let maxPrepDays = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isPublished || product.archivedAt) {
        return NextResponse.json(
          {
            error: {
              code: "NOT_FOUND",
              message: `Product ${item.productId} is not available`,
            },
          },
          { status: 404 }
        );
      }

      let unitPrice = product.basePricePaise;
      let variantSnapshot: any = undefined;

      if (item.variantId) {
        const variant = product.variants.find((v) => v._id?.toString() === item.variantId);
        if (!variant || !variant.isActive) {
          return NextResponse.json(
            {
              error: {
                code: "NOT_FOUND",
                message: `Variant ${item.variantId} is not available`,
              },
            },
            { status: 404 }
          );
        }
        unitPrice += variant.priceDeltaPaise;
        variantSnapshot = {
          name: variant.name,
          sku: variant.sku,
          priceDeltaPaise: variant.priceDeltaPaise,
        };

        // If READY_STOCK check stock
        if (product.fulfilmentType === "READY_STOCK") {
          const availableStock = variant.stockQuantity ?? product.stockQuantity ?? 0;
          if (availableStock < item.quantity) {
            return NextResponse.json(
              {
                error: {
                  code: "OUT_OF_STOCK",
                  message: `Sorry, "${product.name} (${variant.name})" has only ${availableStock} in stock`,
                },
              },
              { status: 409 }
            );
          }
        }
      } else {
        if (product.fulfilmentType === "READY_STOCK") {
          const availableStock = product.stockQuantity ?? 0;
          if (availableStock < item.quantity) {
            return NextResponse.json(
              {
                error: {
                  code: "OUT_OF_STOCK",
                  message: `Sorry, "${product.name}" has only ${availableStock} items in stock`,
                },
              },
              { status: 409 }
            );
          }
        }
      }

      if (product.preparationMaxDays && product.preparationMaxDays > maxPrepDays) {
        maxPrepDays = product.preparationMaxDays;
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotalPaise += lineTotal;

      orderItemsToSnapshot.push({
        productId: product._id,
        variantId: item.variantId ? item.variantId : undefined,
        productNameSnapshot: product.name,
        skuSnapshot: item.variantId ? variantSnapshot?.sku : product.sku,
        variantSnapshot,
        unitPricePaise: unitPrice,
        quantity: item.quantity,
        personalisation: item.personalisation,
        lineTotalPaise: lineTotal,
      });

      // Deduct stock for READY_STOCK products
      if (product.fulfilmentType === "READY_STOCK") {
        if (item.variantId) {
          await Product.updateOne(
            { _id: product._id, "variants._id": item.variantId },
            { $inc: { "variants.$.stockQuantity": -item.quantity } }
          );
        } else {
          await Product.updateOne(
            { _id: product._id },
            { $inc: { stockQuantity: -item.quantity } }
          );
        }
      }
    }

    // 2. Shipping calculation
    let calculatedShippingPaise = flatShipping;
    if (freeShippingThreshold && calculatedSubtotalPaise >= freeShippingThreshold) {
      calculatedShippingPaise = 0;
    }

    const calculatedTotalPaise = calculatedSubtotalPaise + calculatedShippingPaise;

    // 3. Customer record update or upsert
    let customer = await Customer.findOne({ phoneE164: customerPhone });
    if (!customer) {
      customer = await Customer.create({
        fullName: customerName,
        email: customerEmail || undefined,
        phoneE164: customerPhone,
        addresses: [
          {
            recipientName: shippingAddress.recipientName,
            phoneE164: shippingAddress.phoneE164,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2,
            landmark: shippingAddress.landmark,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            countryCode: shippingAddress.countryCode,
            isDefault: true,
          },
        ],
      });
    }

    // 4. Create immutable order
    const orderNumber = generateOrderNumber();
    const orderStatus = paymentMethod === "COD" ? "PLACED" : "PENDING_PAYMENT";
    const paymentStatus = paymentMethod === "COD" ? "COD_DUE" : "UNPAID";

    const estimatedDispatchDate = new Date();
    estimatedDispatchDate.setDate(estimatedDispatchDate.getDate() + (maxPrepDays || 2));

    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      source: "WEBSITE",
      orderStatus,
      paymentStatus,
      subtotalPaise: calculatedSubtotalPaise,
      shippingPaise: calculatedShippingPaise,
      discountPaise: 0,
      totalPaise: calculatedTotalPaise,
      currency: "INR",
      shippingAddressSnapshot: shippingAddress,
      customerNameSnapshot: customerName,
      customerPhoneSnapshot: customerPhone,
      customerEmailSnapshot: customerEmail || undefined,
      customerNote,
      estimatedDispatchDate,
      items: orderItemsToSnapshot,
      statusHistory: [
        {
          toStatus: orderStatus,
          note: `Order created via website checkout with ${paymentMethod} payment`,
          createdAt: new Date(),
        },
      ],
    });

    // 5. Create payment record / checkout reference
    const payment = await Payment.create({
      orderId: order._id,
      provider: paymentMethod === "COD" ? "COD" : "RAZORPAY_MOCK",
      amountPaise: calculatedTotalPaise,
      currency: "INR",
      status: paymentMethod === "COD" ? "AUTHORIZED" : "CREATED",
      method: paymentMethod,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          orderNumber: order.orderNumber,
          orderId: order._id,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          totalPaise: order.totalPaise,
          paymentMethod,
          paymentId: payment._id,
          // Provider reference for Razorpay client SDK integration
          paymentCheckoutReference: {
            orderId: `order_sim_${order.orderNumber}`,
            amount: calculatedTotalPaise,
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Checkout failed",
        },
      },
      { status: 500 }
    );
  }
}

