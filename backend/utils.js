import jwt from 'jsonwebtoken';
import mg from 'mailgun-js';
import {spawn} from 'child_process';
import Recommend from './models/recommendModel.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token generated' });
  }
};

export const isSeller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Seller Token generated' });
  }
};

export const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin/Seller Token generated' });
  }
};

export const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

export const notifyEmailTemplate = () => {
  return '<h1> Hey you, Go check easybuy.com. Your favorite product is back in stock</h1>';
};

// Function for calling python code
export const triggerContent = (productId, userId) => {
  const process =  spawn('python', ['/Users/ananyaannadatha/Documents/GitHub/full-stack/recommendations/contentBased.py',productId]);
  var parts = [];
  
  var res;
   process.stdout.on('data', (data) => {
  res = data.toString();
});
process.stderr.on('data', (data) => {
  console.log('err results: %j', data.toString('utf8'))
});
process.stdout.on('end', async function(){
  parts = res.split("\n");
  parts.splice(5,5);
  let existContent = await Recommend.findOne({user: userId});
  if(existContent.length === 0){
  const newContent = new Recommend({
    user: userId,
    contentProducts: parts
  })
  await newContent.save();
} else {
  existContent.contentProducts = parts;
  await existContent.save();
}
});
};

export const triggerCollab = (productId, userId) => {
  console.log("productId",productId);
  console.log("userId",userId);

  const process =  spawn('python', ['/Users/ananyaannadatha/Documents/GitHub/full-stack/recommendations/collabBased.py',productId,userId]);
  var parts = [];
  var res;
   process.stdout.on('data', (data) => {
  res = data.toString();
});
process.stderr.on('data', (data) => {
  console.log('err results: %j', data.toString('utf8'))
});
process.stdout.on('end', async function(){
  parts = res.split("\n");
  parts.splice(0,2);
  parts.splice(5,5);
  console.log("parts",parts);
  let existCollab = await Recommend.findOne({user: userId});
  if(!existCollab){
  const newCollab = new Recommend({
    user: userId,
    collabProducts: parts
  })
  await newCollab.save();
} else {
  existCollab.collabProducts = parts;
  await existCollab.save();
}
});
};
