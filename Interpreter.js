

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
        console.log("End of fetch:")
        console.log(this.blocks_list)
        
        
    }
    decode() {  // Instruction should be a component with attributes that represent registers
                // and extract the values from them as well as the function being performed
                // Load values into registers

        // Split each code line up into keywords and values by white space
        var kw_vals = this.blocks_list.map( x => {
            var arr = x.split(/\s/)     
            return arr
        })
        console.log(kw_vals)

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
                                // This only works for declarative statements STRICTLY as follows: int a = 5
                    var line = kw_vals[i]
                    instruction = {
                        func: "lw",       // func should represent the function given in the instruction
                        var1: line[(line.indexOf("=")-1)],  // variable name being stored to register
                        value: line[line.length-1]          // value being stored to register
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
                    else if (line.indexOf("-") > 0) {
                        indexOfOperator = line.indexOf("-")
                        instruction = {
                            func: (!isNumeric(line[indexOfOperator-1]) && 
                                   !isNumeric(line[indexOfOperator+1]))? "sub": "subi",
                            reg_val: line[0],   // register that will be hold substracted value
                            var1: line[indexOfOperator-1],  // operand 1
                            var2: line[line.length-1]       // operand 2
                        }
                    }
                    else if (line.indexOf("*") > 0) {
                        indexOfOperator = line.indexOf("*")
                        instruction = {
                            func: "mult",
                            reg_val: line[0],
                            var1: line[indexOfOperator-1],  // operand 1
                            var2: line[line.length-1]       // operand 2
                        }
                    }
                    else if (line.indexOf("/") > 0) {
                        indexOfOperator = line.indexOf("/")
                        instruction = {
                            func: "div",
                            reg_val: line[0], 
                            var1: line[indexOfOperator-1],  // operand 1
                            var2: line[line.length-1]       // operand 2
                        }
                    }
                    break;
                case "for":
                    line = line.join(' ')
                    // Getting everything between the parentheses
                    let conditions = line.split("(")[1].split(")")[0].split(";")
                    // Extract lines to be computed in forloop between the brackets
                    let block_start = 0
                    let block_end = 0
                    for (let i in kw_vals) {
                        if (kw_vals[i].includes("for")){
                            block_start = parseInt(i)
                            continue
                        }
                        else if (kw_vals[i].includes("}")) {
                            block_end = i
                        }
                    }
                    for (let j = block_end; j >= block_start; j--) {
                        console.log(kw_vals.splice(j, 1))
                    }
                    let new_blocks_list = this.blocks_list.slice(block_start+1, block_end).join("\n")
                
                    console.log(this.blocks_list)
                    instruction = {
                        func: "for",
                        blocks_list: new_blocks_list,
                        conditions: conditions
                    }
                    break;
                default:
                    break;
                }
            this.instructions.push(instruction)
            this.execute(instruction)
        }
        console.log("End of decoded:")
        console.log(this.instructions)
        
    }

    // Instructions execute after each instruction is decoded, so it reads and executes code from top to bottom.
    execute(instruction) {
        let key = instruction
        if (key.func == "lw") {     // Loading value to registers
                this.registers[key.var1] = key.value
            }
        else if (key.func == "add") {   // used for adding two integer variables 
            let register_name = key.reg_val
            let val1 = this.registers[key.var1]
            let val2 = this.registers[key.var2]
            let new_val = add(val1, val2)
            this.registers[register_name] = new_val
            var p = document.createElement("P")
            p.innerText = register_name + " = " +this.registers[register_name] 
            document.body.append(p)
        }
        else if (key.func == "addi") { // add i(mmediate data) and assigning it to variable
            let register_name = key.reg_val
            // Next 2 lines checks which entries are integers vs a preexisting register value (variable)
            let val1 = !isNumeric(this.registers[key.var1]) ? key.var1 : this.registers[key.var1]  
            let val2 = !isNumeric(this.registers[key.var2]) ? key.var2 : this.registers[key.var2] 
            let new_val = addi(val1, val2)                            
            this.registers[register_name] = new_val
            var p = document.createElement("P")
            p.innerText = register_name + " = " +this.registers[register_name]
            document.body.append(p)
        }
        else if (key.func == "sub") { 
            let register_name = key.reg_val
            let val1 = this.registers[key.var1]
            let val2 = this.registers[key.var2] 
            let new_val = sub(val1, val2)                
            this.registers[register_name] = new_val
            var p = document.createElement("P")
            p.innerText = register_name + " = " +this.registers[register_name]
            document.body.append(p)
        }
        else if (key.func == "subi") { // Subtracting with actually numbers instead of variables
            let register_name = key.reg_val
            let val1 = !isNumeric(this.registers[key.var1]) ? key.var1 : this.registers[key.var1]
            let val2 = !isNumeric(this.registers[key.var2]) ? key.var2 : this.registers[key.var2] 
            let new_val = sub(val1, val2)                
            this.registers[register_name] = new_val
            var p = document.createElement("P")
            p.innerText = register_name + " = " +this.registers[register_name]
            document.body.append(p)
        }
        else if (key.func == "mult") {
            let register_name = key.reg_val
            let val1 = !isNumeric(this.registers[key.var1]) ? key.var1 : this.registers[key.var1]
            let val2 = !isNumeric(this.registers[key.var2]) ? key.var2 : this.registers[key.var2] 
            let new_val = mult(val1, val2)                
            this.registers[register_name] = new_val
            var p = document.createElement("P")
            p.innerText = register_name + " = " +this.registers[register_name]
            document.body.append(p)
        }
        else if (key.func == "div") {
            let register_name = key.reg_val
            let val1 = !isNumeric(this.registers[key.var1]) ? key.var1 : this.registers[key.var1]
            let val2 = !isNumeric(this.registers[key.var2]) ? key.var2 : this.registers[key.var2]
            let new_val = div(val1, val2)                
            this.registers[register_name] = new_val
            var p = document.createElement("P")
            p.innerText = register_name + " = " +this.registers[register_name]
            document.body.append(p)
        }
        else if (key.func == "for") {
            
            
            var for_interpreter = new Interpreter(key.blocks_list, this.registers)
            for_interpreter['conditions'] = key.conditions
            console.log("INSIDE FOR LOOP")
           // console.log(for_interpreter)
            
            let iVal = key.conditions[0].split(' ')[key.conditions.length]
            let iEnd = key.conditions[1].split(' ')[key.conditions.length]

            console.log(iVal+ " " + iEnd)
            while (true) {
                
                for_interpreter = new Interpreter(key.blocks_list, this.registers)
                for_interpreter.run()
                //iVal += 1   // Need to change for 'i++/--'
                iVal = parseInt(iVal) + 1
                if (iVal >= iEnd) {
                    break
                }

            }
            console.log("END FOR LOOP")

        }
    }
}
