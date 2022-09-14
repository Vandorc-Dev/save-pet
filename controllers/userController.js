// const AppError = require("../utils/appError");
const express = require('express');
const catchAsync = require("../utils/catchAsync");
const db = require('../models/index');
const User = require("../models/usuarioPessoa");

//consultar todos os usuários
exports.allUsers = catchAsync('/', async(req, res) => {
  let users = await User.allUsers();
  console.log("usuários: ", JSON.stringify(users));
})
// exports.getAll = (async (req,res, next) => {
//   try {
//       const users = await User.findAll();
//       console.log(users)
//       res.json(users)
//       } catch (err) {
//       console.error(err.message)
//       res.status(500).send({ "error": 'Erro!' })
//       }
//   });

// ver meu perfil
exports.getMe = catchAsync(async (req, res, next) => {
  // pegar dados do usuário baseado na ID do request
  // const user = dados do usuário
  let user;

  // retornar erro caso o usuário não seja encontrado
  if (!user) {
    return next(new AppError("Usuário não encontrado!", 404));
  }

  // criar objeto usuário para resposta
  const userRes = {
    name: user.name,
    email: user.email,
    telephone: user.telephone,
  };

  // resposta
  res.status(200).json({
    status: "success",
    data: {
      user: userRes,
    },
  });
});

//////////////////////////////////////////////////////////
// editar perfil
exports.editProfile = catchAsync(async (req, res, next) => {
  const { name, email, telephone } = req.body;

  // fazer alterações no usuário no banco de dados

  // se erro, responder com erro

  // se sucesso, responder com sucesso
  let updatedUser;

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});