const  numeral = require('numeral');
export const moneyMask = (value) => {
    return numeral(value).format(`$0,0.00`);
}