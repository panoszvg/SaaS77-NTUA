module.exports = (today, past) => Math.round(Math.abs(today - past) / (1000 * 60 * 60 * 24)) + 1;