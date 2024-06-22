import Decimal from "decimal.js";

/**
 * a + b
 * @param {number} a 
 * @param {number} b 
 * @return {number}
 */
export function plus(a, b) {
  const _a = new Decimal(a);
  const _b = new Decimal(b);
  const res = Number(
    _a.plus(_b)
  )
  return res;
}

/**
 * a - b
 * @param {number} a 
 * @param {number} b 
 * @return {number}
 */
export function minus(a, b) {
  const _a = new Decimal(a);
  const _b = new Decimal(b);
  const res = Number(
    _a.minus(_b)
  )
  return res
}

/**
 * a × b
 * @param {number} a 
 * @param {number} b 
 * @return {number}
 */
export function mul(a, b) {
  if (a === 0 || b === 0) return 0;
  const _a = new Decimal(a);
  const _b = new Decimal(b);
  const res = Number(
    _a.mul(_b)
  )
  return res
}

/**
 * 整除 a ÷ b
 * @param {number} a 
 * @param {number} b 
 * @return {number}
 */
export function div(a, b) {
  if (b === 0 || a === 0) return 0;
  const _a = new Decimal(a);
  const _b = new Decimal(b);
  const res = Number(
    _a.div(_b)
  )
  return res
}

/**
 * 返回 Decimal 实例
 * @param {number} a 
 * @return {object} decimal instance
 */
export default function m(a) {
  return new Decimal(a)
}

/**
 * 
 * @param {number} a 
 * @param {string} op  + - * /
 * @param {number} b 
 * @returns {number}
 */
export function calc(a, op, b) {
  switch(op) {
    case '+':
      return plus(a, b)
    case '-':
      return minus(a, b)
    case '*':
      return mul(a, b)
    case '/':
      return div(a, b)
  }
}