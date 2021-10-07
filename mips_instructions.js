
// MIPS instructions as functions
function add(val1, val2) {
    return parseFloat(val1) + parseFloat(val2)
}
function addi(val1, val2) {
    return parseFloat(val1) + parseFloat(val2)
}
function sub(val1, val2) {
    return parseFloat(val1) - parseFloat(val2)
}
function mult(val1, val2) {
    return parseFloat(val1) * parseFloat(val2)
}
function div(val1, val2) {
    if (val2 == "0") return "Error: division by zero"
        return parseFloat(val1) / parseFloat(val2)
}
function beq(val1, val2) {
    return val1 == val2
}
function bgt(val1, val2) {
    return val1 > val2
}
function blt(val1, val2) {
    return val1 < val2
}
function bgte(val1, val2) {
    return val1 >= val2
}
function blte(val1, val2) {
    return val1 <= val2
}