
class Interpreter {
                
    constructor(blocks_list, registers) {
        this.registers = typeof(registers) == "undefined"? {} : registers  // Variables that are stored and/or manipulated
        this.blocks_list = typeof(blocks_list) == 'object'? blocks_list.value : blocks_list  // List of code instruction blocks. Separated by line number
        this.instructions = []
    }

    run() {
        this.fetch()
        this.decode()
        // executes automatically from decode
    }
    fetch() { // Pull instruction from instruction components
        this.blocks_list = this.blocks_list
            .split("\n")        // Each code instruction needs to be on it's own line
            .map(x => x.trim()) // Trim white space from each line
            .filter(x => {
                return x.length > 0 // Make sure empty strings aren't added to list
            })
        console.log(this.blocks_list)
        
    }
    decode() {  // Instruction should be a component with attributes that represent registers
                // and extract the values from them as well as the function being performed
                // Load values into registers


        // Split each code line up into keywords and values by white space
        var kw_vals = this.blocks_list.map( x => {
            if (x.includes("System.out")) { // Marking system out with a keyword for the decoder to read
                return ["print", x]
            }
            
            var arr = x.split(/\s/)     
            return arr
        })
        for (let i in kw_vals) {        // Go through each line given in the problem
            var keyword=kw_vals[i][0]   // Keyword = first word on a line
            var line = kw_vals[i]
            var instruction = {}
            

            // Trying to check if register has a variable already exists and execute accordingly
            // This should also prevent variable initialization errors.
            if (this.registers.hasOwnProperty(keyword)) {
                keyword = "variable"
            
            }
            switch (keyword) {
            
                case "int":     //  LOAD WORD: Copy from memory to register
                    var line = kw_vals[i]
                        if (line.length > 2) {
                            var value = line[line.indexOf("=")+1]
                            
                            instruction = {
                                func: "lw",       // func should represent the function given in the instruction
                                var1: line[(line.indexOf("=")-1)],  // variable name being stored to register
                                value: (this.registers.hasOwnProperty(value)) ? this.registers[value] : value          // value being stored to register
                        
                            }
                        }
                        else if (line.length == 2 && !isNumeric(line[1])) {         // For initializing a variable e.g. int a;
                            instruction = {
                                func: "lw",       // func should represent the function given in the instruction
                                var1: line[1],  // variable name being stored to register
                                value: line[1]      // value being stored to register
                        
                            }

                        }
                    break;
                case "variable":
                    var indexOfOperator = 0
                    line = kw_vals[i]
                    if (line.indexOf("+") > 0) { // check if we need to use add or addi function
                        indexOfOperator = line.indexOf("+")
                        instruction = {
                            func: (!isNumeric(line[indexOfOperator-1]) &&
                                   !isNumeric(line[indexOfOperator+1]))? "add": "addi",
                            reg_val: line[0],   // register that will be added to
                            var1: line[indexOfOperator-1],  // operand 1
                            var2: line[indexOfOperator+1]       // operand 2
                        }
                    }
                    else if (line.indexOf("+=") > 0) {  // Only works if line length == 3; ( num += 2 ) and ( num += num )
                        console.log(this.registers[line[0]])
                        instruction = {
                            func: "addi",
                            reg_val: line[0],
                            var1: line[0],
                            var2: line[2]
                        }
                    }   
                    else if (line.indexOf("-") > 0) {
                        indexOfOperator = line.indexOf("-")
                        instruction = {
                            func: (!isNumeric(line[indexOfOperator-1]) && 
                                   !isNumeric(line[indexOfOperator+1]))? "sub": "subi",
                            reg_val: line[0],   // register that will be hold substracted value
                            var1: line[indexOfOperator-1],  // operand 1
                            var2: line[indexOfOperator+1]       // operand 2
                        }
                    }
                    else if (line.indexOf("*") > 0) {
                        indexOfOperator = line.indexOf("*")
                        instruction = {
                            func: "mult",
                            reg_val: line[0],
                            var1: line[indexOfOperator-1],  // operand 1
                            var2: line[indexOfOperator+1]       // operand 2
                        }
                    }
                    else if (line.indexOf("/") > 0) {
                        indexOfOperator = line.indexOf("/")
                        instruction = {
                            func: "div",
                            reg_val: line[0], 
                            var1: line[indexOfOperator-1],  // operand 1
                            var2: line[indexOfOperator+1]       // operand 2
                        }
                    }
                    
                    else if (line[1] == "=" && line.length == 3) {  // Assigning a single value to a preexisting register (a = 5)
                        console.log(this.registers[line[2]])

                        instruction = {
                            func: "addi",
                            reg_val: line[0],       // Register name

                            // Pretty much just analyzing the value being assigned, whether its a preexisting variable or just a value
                            var1: (this.registers.hasOwnProperty(line[2])) ?
                            (this.registers[line[2]] == line[2] ? 0 : this.registers[line[2]]) : line[2],         
                            var2: 0                 // adding zero in order to set var1 as value
                            
                        }
                        console.log(this.registers.hasOwnProperty(line[2]))
                        console.log(this.registers[line[2]])
                        console.log(line[2])

                        console.log(instruction.var1)
                    }
                    else  {
                        console.log(line)
                    }
                    break;
                case "for":
                    line = line.join(' ')
                    // Getting everything between the parentheses
                    let conditions = line.split("(")[1].split(")")[0].split(";")
                    // Beginning and end of lines being executed by the for loop

                    let block_start = 0
                    let block_end = 0
                    var scope_stack = [];
                    // Support for nested loops
                    for (let i in kw_vals) {
                        if (kw_vals[i].includes("for") && scope_stack.length == 0) {
                            scope_stack.push("{")
                            block_start = parseInt(i)
                            continue
                        }
                        else if(scope_stack.length > 0) {
                            for (let j in  line) {
                                if (kw_vals[i] == "}") {
                                    scope_stack.pop()
                                    if (scope_stack.length == 0) {
                                        block_end = parseInt(i)
                                        break;
                                    }
                                }
                                else if (kw_vals[i] == "{"){
                                    scope_stack.push("{")
                                }
                            }
                        }
                        
                    }

                    // Removes for loop instructions from being added to the main instruction list
                    for (let j = block_end; j >= block_start; j--) {
                        kw_vals.splice(j, 1)
                    }

                    let new_blocks_list = this.blocks_list.splice(block_start+1, block_end).join("\n")
                    instruction = {
                        func: "for",
                        blocks_list: new_blocks_list,
                        conditions: conditions
                    }
                    break;
                case "print":
                    

                    var print_container = line[1].split("(")[1].split(")")[0]
                    console.log("print " + print_container)
                    instruction = {
                        func: "print",       // func should represent the function given in the instruction
                        value: print_container
                    }
                    break
                default:
                    break;
                }
            this.instructions.push(instruction)
            this.execute(instruction)
        }
        
    }

    // Instructions execute after each instruction is decoded, so it reads and executes code from top to bottom.
    execute(instruction) {
        let key = instruction
        if (key.func == "lw") {         // Loading value to registers
                this.registers[key.var1] = key.value
            }
        else if (key.func == "add") {   // Used for adding VARIABLES ONLY 
            let register_name = key.reg_val
            let val1 = this.registers[key.var1]
            let val2 = this.registers[key.var2]
            let new_val = add(val1, val2)
            this.registers[register_name] = new_val
        }
        else if (key.func == "addi") {  // Flexible addition for both integer vals and variables
            let register_name = key.reg_val
            // Next 2 lines checks which code entries are integers vs a preexisting register value (variable)
            let val1 = !isNumeric(this.registers[key.var1]) ? key.var1 : this.registers[key.var1]  
            let val2 = !isNumeric(this.registers[key.var2]) ? key.var2 : this.registers[key.var2] 
            let new_val = add(val1, val2)                            
            this.registers[register_name] = new_val
        }
        else if (key.func == "sub") {   // Used for subtracting VARIABLES ONLY
            let register_name = key.reg_val
            let val1 = this.registers[key.var1]
            let val2 = this.registers[key.var2] 
            let new_val = sub(val1, val2)                
            this.registers[register_name] = new_val
        }
        else if (key.func == "subi") {  // Flexible subtraction for both integer vals and variables
            let register_name = key.reg_val
            let val1 = !isNumeric(this.registers[key.var1]) ? key.var1 : this.registers[key.var1]
            let val2 = !isNumeric(this.registers[key.var2]) ? key.var2 : this.registers[key.var2] 
            let new_val = sub(val1, val2)                
            this.registers[register_name] = new_val
        }
        else if (key.func == "mult") {  // Flexible multiplication
            let register_name = key.reg_val
            let val1 = !isNumeric(this.registers[key.var1]) ? key.var1 : this.registers[key.var1]
            let val2 = !isNumeric(this.registers[key.var2]) ? key.var2 : this.registers[key.var2] 
            let new_val = mult(val1, val2)                
            this.registers[register_name] = new_val
        }
        else if (key.func == "div") {   // Flexible divison
            let register_name = key.reg_val
            let val1 = !isNumeric(this.registers[key.var1]) ? key.var1 : this.registers[key.var1]
            let val2 = !isNumeric(this.registers[key.var2]) ? key.var2 : this.registers[key.var2]
            let new_val = div(val1, val2)                
            this.registers[register_name] = new_val
        }
        else if (key.func == "for") {
            var for_interpreter = new Interpreter(key.blocks_list, this.registers)
            for_interpreter['conditions'] = key.conditions
            var loop_variable = key.conditions[0].split(" ");
            // console.log("INSIDE FOR LOOP")
            
            // Decode for loop conditions and assign value to register
            instruction = {
                func: "lw",       // func should represent the function given in the instruction
                var1: loop_variable[loop_variable.indexOf("=")-1],  // variable name being stored to register
                value: loop_variable[loop_variable.indexOf("=")+1]
            }
            for_interpreter.execute(instruction) // Loading looping variable to a register

            // Determine when to branch and what comparison to make
            let branch = () => {
                let line = key.conditions[1].trim().split(" ")
                let register = (for_interpreter.registers.hasOwnProperty(line[0])) ? for_interpreter.registers[line[0]] : line[0]  // variable assigned to register ('i' in most cases)
                let operator = line[1]  // Should be a comparison operator
                let comparator = (for_interpreter.registers.hasOwnProperty(line[2])) ? for_interpreter.registers[line[2]] : line[2]// Operand 2
                for_interpreter.hasOwnProperty(line[2])
                switch(operator) {
                    case "<":
                        return blt(register, comparator)
                    case ">":
                        return bgt(register, comparator)
                    case "<=":
                        return blte(register, comparator)
                    case ">=":
                        return bgte(register, comparator)       
                    case "==":
                        return beq(register, comparator)
                    default:
                        console.log("for loop operator default")
                        break;

                }
            }

            console.log(for_interpreter.registers)
            
            // Decode the incrementer portion of condition and save it as a function to run in the while loop
            let incrementer = () => {
                if (key.conditions[2].includes("++")) {
                    let line = key.conditions[2]
                        .trim()
                        .split("++")
                        .filter(x => {      // Making sure no empty elements are added to the instruction line
                            return x.length > 0
                        })
                    if (line.length != 1) {
                        console.log("Error with incrementer in for loop")
                    }
                    var loop_var = line[0]
                    for_interpreter.registers[loop_var] = add(for_interpreter.registers[loop_var], 1)
                }
                else if (key.conditions[2].includes("--")) {
                    let line = key.conditions[2]
                        .trim()
                        .split("--")
                        .filter(x => {      // Making sure no empty elements are added to the instruction line
                            return x.length > 0
                        })
                    if (line.length != 1) {
                        console.log("Error with incrementer in for loop")
                    }
                    var loop_var = line[0]
                    for_interpreter.registers[loop_var] = sub(for_interpreter.registers[loop_var], 1)
                }
                else if (key.conditions[2].includes("+=")) {
                    let line = key.conditions[2]
                        .trim()
                        .split("+=")
                        .filter(x => {      // Making sure no empty elements are added to the instruction line
                            return x.length > 0
                        })
                    if (line.length != 2) {
                        console.log("Error with incrementer in for loop")
                    }
                    var loop_var = line[0]
                    var inc_value = line[1]
                   
                    // Check if we're incrementing by a number or by another variables value
                    if (!isNumeric(inc_value) && for_interpreter.registers.hasOwnProperty(inc_value)) {
                        inc_value = for_interpreter.registers[inc_value]
                    }

                    for_interpreter.registers[loop_var] = add(for_interpreter.registers[loop_var], inc_value) // Incrementing conditional value
                }
                else if (key.conditions[2].includes("-=")) {
                    let line = key.conditions[2]
                        .trim()
                        .split("-=")
                        .filter(x => {      // Making sure no empty elements are added to the instruction line
                            return x.length > 0
                        })
                    if (line.length != 2) {
                        console.log("Error with incrementer in for loop")
                    }
                    var loop_var = line[0]
                    var inc_value = line[1]

                    console.log(loop_var + "   " + inc_value)
                    // Check if we're incrementing by a number or by another variables value
                    if (!isNumeric(inc_value) &&  for_interpreter.registers.hasOwnProperty(inc_value)) {
                        inc_value = for_interpreter.registers[inc_value]
                    }

                    console.log(loop_var + "   " + inc_value)
                    for_interpreter.registers[loop_var] = sub(for_interpreter.registers[loop_var], inc_value)
                }
            }

            // Running the for loop here
            while (true) {
                
                for_interpreter = new Interpreter(key.blocks_list, this.registers)
                for_interpreter.run()

                incrementer()
                if (!branch()) {
                    break;
                }
            }
            console.log("END FOR LOOP")

        }
        else if (key.func == "print") { // Print function on to stdout, acts as println

            if (isNumeric(key.value)) {
                display(key.value)
            }
            else if (this.registers.hasOwnProperty(key.value)) {
                display(this.registers[key.value])
            }
            else if (key.value.split(" ").length > 1) { // Decode parameters in print function
                
            }
        }
        
    }
}

    // Other helper functions
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function display(result) {
    ptag = Object.assign(document.createElement('P'),{id:'result',innerText: result})
    document.body.append(ptag)
    
}
