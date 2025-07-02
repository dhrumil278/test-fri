const express = require("express");

const { Sequelize, DataTypes, Op: OPERATOR } = require("sequelize");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const JoiBase = require("joi");

const { v4: UUID } = require("uuid");

const cors = require("cors");

const FS = require("fs");

const PATH = require("path");

const HANDLEBARS = require("handlebars");

const NODEMAILER = require("nodemailer");

const Crypto = require("crypto-js");

const MULTER = require("multer");

const MULTER_UPLOAD = MULTER();

const STREAM = require("stream");

const PUPPETEER = require("puppeteer");

module.exports = {
  express,
  bcrypt,
  jwt,
  JoiBase,
  Sequelize,
  DataTypes,
  UUID,
  cors,
  OPERATOR,
  FS,
  PATH,
  HANDLEBARS,
  NODEMAILER,
  Crypto,
  MULTER,
  MULTER_UPLOAD,
  STREAM,
  PUPPETEER,
};
