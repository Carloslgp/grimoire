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


async function addEntry(category, name, tag) {


    try{
        const resposta = await fetch("http://localhost:3000/api/newRegistry", {
            method: "POST",
            headers:{
                'Content-Type': "application/json",
                'Authorization': `Bearer ${localStorage.getItem('grimoire_token')}`
            },
            body: JSON.stringify({
                category: category,
                name: name,
                tag: tag
            })
        })

        const dados = await resposta.json()

        if(resposta.ok){
            const sucessoSpan = document.createElement("p")
            sucessoSpan.classList = "text-success"
            terminal.appendChild(sucessoSpan)
            await typewrite(sucessoSpan, `>_SUCESSO ${dados.mensagem}`)
        }else{
            const erroSpan = document.createElement("p")
            terminal.appendChild(erroSpan)
            await typewrite(erroSpan, `>_ERRO: ${dados.mensagem || dados.error}`)
        }

        return


    }catch{

    }


}


async function verificarResposta(inputConsole) {
    let entradaDoUsuario = inputConsole.value
    let [cmd, sub, args, last] = entradaDoUsuario.split(/\s+/)
    document.getElementById("paragrafoConsole").innerText = `>${entradaDoUsuario}`
    let span = document.createElement("span")
    terminal.appendChild(span)
    span.innerText = document.getElementById("paragrafoConsole").innerText
    document.getElementById("paragrafoConsole").remove()
    inputConsole.remove()



    if (cmd === "add") {
        if (!sub)        await typeUserHelp("You are missing the category, name and tag")
        else if (!args)  await typeUserHelp("You are missing the name and tag")
        else if (!last)  await typeUserHelp("You are missing the tag")
        else {
            const loading = showLoading("Creating new registry");
            await addEntry(sub, args, last)
            resetErrorCount()
            loading.stop()
        }



    }else if(cmd === "help"){
        if(sub) await typeUnknown(entradaDoUsuario)
        else{
            await typeHelp()
            resetErrorCount()
        }

    }else if(cmd === "clear"){
        if(sub) await typeUnknown(entradaDoUsuario)
        else{
            clearTerminal()
            resetErrorCount()
        }
    }else if(cmd === "logout"){
        if(sub) await typeUnknown(entradaDoUsuario)
        else{
            const loading = showLoading("Logging out");
            await logout()
            loading.stop()
        }

    }else{
        await typeUnknown(entradaDoUsuario)

    }


}
















