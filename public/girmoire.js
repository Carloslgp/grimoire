async function system(){

    addHelpToTitle()

    temrinal = ""

    createInput()


}

async function createInput() {    
    const controller = new AbortController();
    let inputConsole = await criarInputTerminal(">");
    
    inputConsole.addEventListener("keydown", async (e) => {
        if(e.key === "Enter"){

            controller.abort(); 

            let comandoCorreto = await verificarResposta(inputConsole)
            if(comandoCorreto){
                console.log("Comando executado")
            }else{
                console.log("Comando errado!")
            }

            
            await createInput();
        }

        
        
    }, { signal: controller.signal })

}


async function verificarResposta(inputConsole) {
    let entradaDoUsuario = inputConsole.value 
    document.getElementById("paragrafoConsole").innerText = `>${entradaDoUsuario}`
    let span = document.createElement("span")
    terminal.appendChild(span)
    span.innerText = document.getElementById("paragrafoConsole").innerText
    document.getElementById("paragrafoConsole").remove()
    inputConsole.remove()
    if(entradaDoUsuario.trim() === "help"){
        await typeHelp()
        return true
    }else{

    }


}
















