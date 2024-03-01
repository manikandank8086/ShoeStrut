const express = require('express')
 const {adminModel}= require('../model/adminModel')



const adminAuthentication = async(req,res,next)=>{
    if(req.session.adminId){
        const admin=await adminModel.findOne({_id:req.session.adminId})

           next()
    }else{
        res.redirect('/admin')
    }
}

module.exports={adminAuthentication}