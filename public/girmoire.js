async function system(){

    addHelpToTitle()

    temrinal = ""
    let entradaOk
    
    let inputConsole = await criarInputTerminal(">");
    
    inputConsole.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
            verificarResposta(inputConsole.value)
        }
    })


}


async function verificarResposta(entradaUsuario) {
    if(entradaUsuario.trim() === "/help"){
        typeHelp()
    }


}
















