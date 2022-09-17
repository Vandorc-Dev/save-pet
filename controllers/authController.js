const AppError = require("../utils/appError");
// const { validationResult, matchedData } = require('express-validator')
const catchAsync = require("../utils/catchAsync");
// const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const {check, validationResult } = require('express-validator')
// const { promisify } = require("util");
const User = require('../models/User');

// // criar JWT
// const signToken = (id) => {
//   return (
//     jwt.sign({ id }, process.env.JWT_SECRET),
//     {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     }
//   );
// };

// // enviar JWT
// const createSendToken = (user, statusCode, req, res) => {
//   const token = signToken(user.id); // colocar a id que identifica o usuário no banco de dados

//   // configurar cookie
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//   };

//   // inserir cookie na resposta
//   res.cookie("jwt", token, cookieOptions);

//   // remover a senha do usuário do corpo do request
//   user.password = undefined;

//   // preparar resposta, extrair dados do objeto user
//   const resUser = {
//     name: user.name,
//     email: user.email,
//   };

//   // enviar resposta
//   res.status(statusCode).json({
//     status: "success",
//     token,
//     data: { resUser },
//   });
// };

// exports.auth = ([
//   check('email', 'e-mail is required').exists(),
//   check('password', 'senha is required').exists()
// ], async (req, res, next) => {
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() })
//   }
//   const { email, password } = req.body

//   try {
//       const user = await User.findOne({
//         where: {
//         email,
//         password
//       }
//       },)
//       if(!user){ 
//           return res.status(401).send({ error: 'Usuário não encontrado' })    
//   }else{
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//           return res.status(400).json({ errors: [{ msg: 'Senha Incorreta' }] });
//       }else{
//           if (user.is_active == false){
//               return res.status(403).json({ errors: [{ msg: 'Esse usuário não está ativo' }] });
//           }
//           const payload = {
//               user: {
//                   id: user.id,
//                   name: user.name
//               }
//           }

//           jwt.sign( payload, config.get('jwtSecret'), { expiresIn: '5 days' },
//               (err, token) => {
//                   if (err) throw err;
//                   payload.token = token
//                   res.json(payload);
//               }
//           )
//       }
//   }

// }catch (err) {
//   console.error(err.message)
//   res.status(500).send('Server error')
// }

// })


exports.signup = ( [
  check('name', 'Insira seu nome, por favor').not().isEmpty(),
  check('email', 'Esse e-mail não é válido').isEmail(),
  check('passwordHash', 'A senha deve ter entre 6 e 8 caracteres').isLength({min:6}),
  check('contato', 'Insira um contato válido, por favor').not().isEmpty(),
  ], async (req, res, next) => {
  
  try {
      let { name, email, passwordHash, contato } = req.body
      const errors = validationResult(req)
      console.error(errors)
      if(!errors.isEmpty()){
          return res.status(400).json({errors: errors.array()})
      }else{
          let user = new User( {name, email, passwordHash, contato })
          const payload = {
              user: {
                  id: user.id
              }
          }
          const token = await bcrypt.hash(payload, 10);
          user.passwordHash = await bcrypt.hash(passwordHash, token)
          await user.save()
          if(user.id){
              res.json(user)
          }
      }
  } catch (error) {
      console.error(error.message)
      res.status(500).send({"error" : "Server Error"})
  }
})

//////////////////////////////////////////////////////////
// login
exports.login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.json({error: errors.mapped()});
            return;
        }
        const data = matchedData(req);
        console.log(data)
        // Validando o e-mail
        const user = await User.findOne({email: data.email});
        if(!user) {
            res.json({error: 'E-mail e/ou senha errados!'});
            return;
        }

        // Validando a senha
        const match = await bcrypt.compare(data.password, user.passwordHash);
        if(!match) {
          console.log(match)
            res.json({error: 'E-mail e/ou senha errados!'});
            return;
        }

        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        user.token = token;
        await user.save();

        res.json({token, email: data.email});

      })

// );

// logout
exports.logout = (_, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 1),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};



