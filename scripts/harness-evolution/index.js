'use strict';

const { classifyFailure, classifyBatch } = require('./failure-classifier');
const { proposeImprovement } = require('./improvement-proposer');

module.exports = { classifyFailure, classifyBatch, proposeImprovement };
