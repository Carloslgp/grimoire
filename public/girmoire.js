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
            await logTerminal(dados.mensagem, "success");
        }else{
            await logTerminal(dados.mensagem || dados.error, "error");
        }

        return


    }catch (error){
        typeUserHelp("Error on our side, try again later")
        console.log(error)
    }


}


async function removeEntry(category, name, tag){

    try{

        const resposta = await fetch("http://localhost:3000/api/removeRegistry", {
            method: "DELETE",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("grimoire_token")}`
            },
            body:JSON.stringify({
                category: category,
                name: name,
                tag:tag
            })
        })

        const dados = await resposta.json()
        if(resposta.ok){
            await logTerminal(dados.mensagem, "success");
        }else{
            await logTerminal(dados.mensagem || dados.error, "error");
        }



    }catch(error){
        console.log(error)
        typeUserHelp("Error on our side, try again later")
    }

}


async function verificarResposta(inputConsole) {
    let entradaDoUsuario = inputConsole.value
    const tokens = entradaDoUsuario.match(/"[^"]+"|\S+/g) || []
    let [cmd, sub, args, last] = tokens.map(t => t.replace(/^"|"$/g, ""))
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
    }else if(cmd === "remove"){
        if (!sub)        await typeUserHelp("You are missing the category, name and tag")
        else if (!args)  await typeUserHelp("You are missing the name and tag")
        else if (!last)  await typeUserHelp("You are missing the tag")
        else {
            const loading = showLoading("Deleting registry");
            await removeEntry(sub, args, last)
            resetErrorCount()
            loading.stop()
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
















