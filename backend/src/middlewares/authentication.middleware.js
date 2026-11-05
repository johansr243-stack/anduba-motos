import { verifyToken } from "../helpers/jwt.helper.js";
import { dbGetUserbyUsername } from "../services/user.service.js";

const authenticationUser = async (req, res, next) => {

  // 1.Se obtiene el Token

  const token = req.header('Token')

  if(!token){

    return res.status(400).json({
      msg:'Sin token'
    })

  }

  // 2.Verificar formato del token 

  const tokenParts = token.split( '.' )

  if( tokenParts.length !== 3 ) {
        return res.status(400).json({
            msg: 'Formato del token invalido'
        });
    }

  // 3. Verificar la autenticidad del token
  const payload = verifyToken(token)

  if (!payload ){
    return res.status(400).json({
      msg:'Token invalido o inactivo'
    })
  }

  const userFound = await dbGetUserbyUsername(payload.username)

  if (!userFound){

    return res.status(400).json({
      msg: 'No es posible generar el token',
      
    })

  }

  const userFoundobj = userFound.toObject()

  delete userFoundobj.password
  delete userFoundobj.createdAt
  delete userFoundobj.updatedAt
 
  



  console.log('middleware', userFoundobj);

   req.payload = userFoundobj

   req.user = userFound

  next();
};

export default authenticationUser;
