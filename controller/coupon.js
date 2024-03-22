const mongoose = require("mongoose");
const { Coupon } = require("../model/coupon");
const { Order } = require("../model/orderModel");

// Coupon

const applyCoupon = async (req, res) => {
  try {
    console.log("working aply coupon");
    const userId = req.session.userId;
    const code = req.body.code;
    req.session.code = code;
    console.log(code);
    let total = parseInt(req.body.total);
    req.session.total = total;
    console.log(total);
    console.log(typeof total);

    const coupon = await Coupon.findOne({ code: code });
    console.log(coupon);

    const discount = coupon.discount;
    console.log(discount);

    if (!coupon) {
      return res.status(200).json({ status: "Not" });
    }

    if (total > coupon.minimum && total < coupon.maximum) {
      const discountValue = (total * discount) / 100;
      console.log(discountValue);
      const discountTotal = total - discountValue;
      console.log("after discount");
      console.log(discountTotal);
      return res
        .status(200)
        .json({ status: "success", discountTotal, discountValue });
    } else {
      return res.status(200).json({ status: "valueMatch" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const RemoveCoupon = async (req, res) => {
  try {
    const total = parseInt(req.body.total);
    console.log(total);
    console.log("remove coupon workinng");
    const code = req.session.code;
    const totalAmount = req.session.total;
    req.session.code = null;
    req.session.total = null;
    console.log(code);
    console.log(totalAmount);
    console.log(code);
    if (code) {
      console.log("how");
      const coupon = await Coupon.findOne({ code: code });
      console.log(coupon);

      console.log("total");
      const RmDiscountTotaltal = totalAmount;
      console.log(RmDiscountTotaltal);

      return res.status(200).json({ status: "success", RmDiscountTotaltal });
    } else {
      console.log("fksdfs");
      return res.status(200).json({ status: "notApply" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};

module.exports = {
  applyCoupon,
  RemoveCoupon,
};
