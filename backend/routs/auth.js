
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split('')[1];

    if(user==null){
        return res.status(401).json({message: 'Authentacation token required'});
    }
    jwt.verify(token, 'tcmTM', (err, user)=>{
  if(err){
    return res.status(400).json(err);
  }
  req.user = user;
  next();
    });
}
module.exports(authenticateToken);