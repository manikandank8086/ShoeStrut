const mongoose = require("mongoose");
const { Coupon } = require('../model/coupon')


const CouponGet = async(req,res)=>{
    try{
        let message=''
         if(req.session.coupon){
             message= 'Coupon Code is unique Cannot add multiple time'
            req.session.coupon=null
         }
         res.status(200).render('admin/coupon',{message})
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal Server error'})
    }
}

const couponList = async (req,res)=>{
    try{
        const CouponData  =  await Coupon.find({})
      res.status(200).render('admin/couponList',{CouponData})
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal Server Error'})
    }
}


const addCoupon = async (req, res) => {
    try {
        console.log('working add coupon');
        console.log(req.body);

        const { code, discount, validFrom, validUntil, minimum,maximum,name } = req.body;
        console.log(code, discount, validFrom, validUntil, minimum,name);
    
             const coupon = await Coupon.findOne({code:code})
             if(!coupon){
        const newCoupon = new Coupon({
            code,
            discount,
            validFrom,
            validUntil,
            minimum,
            maximum,
            isActive:true,
            name
        });

        const savedCoupon = await newCoupon.save();
        console.log(savedCoupon);
        res.status(200).redirect('/admin/product/coupon')
    }else{
        req.session.coupon =true
         res.status(200).redirect('/admin/product/coupon')
    }

        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const blockCoupon = async (req, res) => {
    console.log(req.query);
    try {
      const id = req.query.id;
      const data = await Coupon.findById(id);
      const publish = data.isActive === false ? true : false;
      const finded = await Coupon.findByIdAndUpdate(id, {
        $set: {
          isActive: publish,
        },
      });
      console.log(publish)
  
      res.status(200).json({ status: true });
    } catch (error) {
      console.log(error);
    }
  };



module.exports= {
    CouponGet,
    couponList,
    addCoupon,
    blockCoupon

}