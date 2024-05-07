/*
 Navicat Premium Data Transfer

 Source Server         : dzy521
 Source Server Type    : MySQL
 Source Server Version : 80032
 Source Host           : localhost:3306
 Source Schema         : fileencode

 Target Server Type    : MySQL
 Target Server Version : 80032
 File Encoding         : 65001

 Date: 06/05/2024 23:31:36
*/


-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `username` varchar(255) NOT NULL PRIMARY KEY,
  `email` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL
);

INSERT INTO `users` VALUES ('admin', '', 'eaa5c84a6c43301d0eebb96ba9d99cba', '381dd7a62fb29e2a5e9d62f2e8b1aa5f4f312b164c9956a857671fa0e823f101', 'admin');
