const { ethers } = require("ethers");

export const formatEther = (value) => ethers.utils.formatEther(value._hex);
