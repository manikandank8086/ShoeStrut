const express = require('express')
 const {User}= require('../model/userModel')
const { use } = require('../router/admin')


const userAuthentication = async(req,res,next)=>{
    if(req.session.userId){
        const user=await User.findOne({_id:req.session.userId})
        if(!user.isblock){
            req.session.userId = null;
            return res.redirect('/')
        }
        next()
    }else{
        res.redirect('/')
    }
}

module.exports={userAuthentication}