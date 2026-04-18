async function system(){

    addHelpToTitle()

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
        const resposta = await fetch("/api/newRegistry", {
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
    }


}


async function removeEntry(category, name, tag){

    try{

        const resposta = await fetch("/api/removeRegistry", {
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
        typeUserHelp("Error on our side, try again later")
    }

}

async function listAll(){
    try{

        const resposta = await fetch("/api/listAll", {
            method: "GET",
            headers: {
                'Authorization':  `Bearer ${localStorage.getItem("grimoire_token")}`
            }
        })

        const dados = await resposta.json()

        if(resposta.ok){
            if(dados.registries.length === 0){
                await logTerminal(dados.mensagem, "error");
            }else{
                await logTerminal(dados.mensagem, "success");
                for (const reg of dados.registries) {
                    await showRegistry(`  [${reg.category}] [${reg.name}] [${reg.tag}]`, );
                }
            }

        }else{
            await logTerminal(dados.mensagem || dados.error, "error");
        }

    }catch(error){

        typeUserHelp("Error on our side, try again later")

    }
}

async function listCategories(){

    try{
        const resposta = await fetch("/api/listCategories", {

            method:"GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("grimoire_token")}`
            }

        })

        const dados = await resposta.json()

        if(resposta.ok){
            await logTerminal(dados.mensagem, "success");

            for (const reg of dados.registries) {
                await showRegistry(`  [${reg.category}]` );
            }

        }else{
            await logTerminal(dados.mensagem || dados.error, "error");
        }
        


    }catch(error){

        typeUserHelp("Error on our side, try again later")


    }


    
}

async function listCategoryTag(category, tag) {

    try{
        const params = new URLSearchParams({ category, tag })
        const resposta = await fetch(`/api/listByCategoryTag?${params}`, {

            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("grimoire_token")}`
            }

        })

        const dados = await resposta.json()

        if(resposta.ok){
            if(dados.registries.length === 0){
                await logTerminal(dados.mensagem, "error");
            }else{
                await logTerminal(dados.mensagem, "success");
                for (const reg of dados.registries) {
                    await showRegistry(`  [${reg.category}] [${reg.name}] [${reg.tag}]` );
                }
            }

        }else{
            await logTerminal(dados.mensagem || dados.error, "error");
        }


    }catch(error){

        typeUserHelp("Error on our side, try again later")

    }
    
}


async function listByCategory(category) {

    try{
        const params = new URLSearchParams({ category })
        const resposta = await fetch(`/api/listByCategory?${params}`, {

            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("grimoire_token")}`
            }

        })

        const dados = await resposta.json()

        if(resposta.ok){
            if(dados.registries.length === 0){
                await logTerminal(dados.mensagem, "error");
            }else{
                await logTerminal(dados.mensagem, "success");
                for (const reg of dados.registries) {
                    await showRegistry(`  [${reg.category}] [${reg.name}] [${reg.tag}]` );
                }
            }

        }else{
            await logTerminal(dados.mensagem || dados.error, "error");
        }


    }catch(error){

        typeUserHelp("Error on our side, try again later")

    }
    
}


async function listByTag(tag) {

    try{
        const params = new URLSearchParams({ tag })
        const resposta = await fetch(`/api/listByTag?${params}`, {

            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("grimoire_token")}`
            }

        })

        const dados = await resposta.json()

        if(resposta.ok){
            if(dados.registries.length === 0){
                await logTerminal(dados.mensagem, "error");
            }else{
                await logTerminal(dados.mensagem, "success");
                for (const reg of dados.registries) {
                    await showRegistry(`  [${reg.category}] [${reg.name}] [${reg.tag}]` );
                }
            }

        }else{
            await logTerminal(dados.mensagem || dados.error, "error");
        }


    }catch(error){

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



    }else if(cmd === "list"){

        if(!sub){

            const loading = showLoading("Searching all the registries");    
            await listAll()
            loading.stop()
            resetErrorCount()

        }else if(sub && args && !last){

            const loading = showLoading("Searching all the registries");   
            await listCategoryTag(sub, args)
            loading.stop()
            resetErrorCount()


        }else{

            typeUserHelp("the grimoire couldn't understand, too many words at once. try simplifying your command. ")

        }

    }else if(cmd === "listByCategory"){

        if(sub && !args){
            const loading = showLoading(`Searching registries with ${sub} category`)
            await listByCategory(sub)
            loading.stop()
            resetErrorCount()
        }else if(!sub){
            await typeUserHelp("You are missing the category")
        }else{
            await typeUserHelp("You typed too many categories")
        }

        

    }else if(cmd === "listByTag"){

        if(sub && !args){
            const loading = showLoading(`Searching registries with ${sub} tag`)
            await listByTag(sub)
            loading.stop()
            resetErrorCount()
        }else if(!sub){
            await typeUserHelp("You are missing the tag")
        }else{
            await typeUserHelp("You typed too many tags")
        }    

    }
    else if(cmd === "categories"){
        
        const loading = showLoading("Searching all the categories"); 
        await listCategories()
        loading.stop()

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
















