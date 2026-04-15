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

            await verificarResposta(inputConsole)

            
            await createInput();
        }

        
        
    }, { signal: controller.signal })

}


async function logout() {
    await fetch('/api/logout', {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem('grimoire_token')}` }
    })
    localStorage.removeItem("grimoire_token")
    window.location.reload();
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
        resetErrorCount()
        return
    }else if(entradaDoUsuario.trim() === "clear"){
        clearTerminal()
        resetErrorCount()
    }else if(entradaDoUsuario.trim() === "logout"){
        const loading = showLoading("Logging out");
        await logout()
        loading.stop()

    }else{
        await typeUnknown(entradaDoUsuario)

        return
    }


}
















