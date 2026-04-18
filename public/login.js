let terminal = document.getElementById("console")

let users = []
let sessionToken = null;



async function boot() {
    terminal.textContent = ""
    const l1 = document.createElement("p")
    l1.classList = "boot-p"
    terminal.appendChild(l1)
    await typewrite(l1, "Initializing your Grimore ...")

    const l2 = document.createElement("p")
    l2.classList = "boot-p"
    terminal.appendChild(l2)
    await typewrite(l2, "Getting the rinnegan ...")

    const l3 = document.createElement("p")
    l3.classList = "boot-p"
    terminal.appendChild(l3)
    await typewrite(l3, "Loading Mjölnir ...")

    const l4 = document.createElement("p")
    l4.classList.add("boot-success", "text-success")
    terminal.appendChild(l4)
    await typewrite(l4, "SUCCESS! MAY THE FORCE BE WITH YOU")

    return
}



async function sign() {

    let resposta = await receberRespostas();

    if (resposta == 1) {
        const logged = await login();

        if (!logged) {
            terminal.innerHTML = ""
            return await sign()
        } else {
            terminal.innerHTML = ""
            return true
        }

    } else if (resposta == 2) {
        terminal.innerHTML += `          
            <p id="paragrafoEmail"><input class="terminal-input" id="3mail" type="text" name="grimoire_x7q" autocomplete="new-password" data-form-type="other"/><span id="cursorEmail" class="cursor"></span></p>
            <p id="paragrafoPassword" style="display: none;"><input class="terminal-input" id="password" type="password" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorPsw" class="cursor"></span></p>  
            <p id="paragrafoPasswordConfirm" style="display: none;"><input class="terminal-input" id="passwordConfirm" type="password" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorPswconfirm" class="cursor"></span></p>
            `

        document.querySelectorAll('.terminal-input').forEach(input => {
            input.addEventListener('input', () => {
                input.style.width = (input.value.length) + 'ch';
            })
        })

        attachCursorTracking(document.getElementById("3mail"), document.getElementById("cursorEmail"))
        attachCursorTracking(document.getElementById("password"), document.getElementById("cursorPsw"))
        attachCursorTracking(document.getElementById("passwordConfirm"), document.getElementById("cursorPswconfirm"))

        let inputEmail = document.getElementById("3mail")
        let paragrafoEmail = document.getElementById("paragrafoEmail")
        let preechendoEmail = true

        const labelEmail = document.createElement("span")
        paragrafoEmail.insertBefore(labelEmail, inputEmail)
        await typewrite(labelEmail, ">_ email: ")
        inputEmail.focus()

        inputEmail.addEventListener("blur", (e) => {
            if (preechendoEmail) inputEmail.focus()
        })

        const emailValido = await esperarEmailValido(inputEmail)
        preechendoEmail = false

        if (!emailValido) {
            terminal.innerHTML = ""
            return await sign()
        }

        let count = 0
        let user

        do {
            if (count >= 1) {
                let paragrafoPasswordConfirm = document.getElementById("paragrafoPasswordConfirm")
                paragrafoPasswordConfirm.style.display = "none"
                document.querySelectorAll("span").forEach(span => {
                    span.innerText = ""
                })
                document.querySelectorAll('.terminal-input').forEach(input => {
                    input.style.width = '0px'
                })
            }

            user = await receberSenhas()

            if (user === null) {
                terminal.innerHTML = ""
                return await sign()
            }

            count++

        } while (user.length == 0)

        user.unshift(emailValido)
        const loading = showLoading("Creating new grimoire");
        try{
            const resposta = await fetch("/api/register", {
                method: "POST",
                headers: {
                    'Content-Type':"application/json"
                },
                body: JSON.stringify({
                    email: user[0],
                    senha: user[1],
                    senhaConfirm: user[2]
                })
            })
            loading.stop();
            const dados = await resposta.json()
            
            if(!resposta.ok){
                const erroSpan = document.createElement("span")
                terminal.appendChild(erroSpan)
                await typewrite(erroSpan, `>_ERRO ${dados.mensagem}`)

                await new Promise(r => setTimeout(r, 2000));

                terminal.textContent = "";
                return await sign();
            }

            terminal.textContent = "";
            return await sign();

        }catch{
            loading.stop();
            const erroSpan = document.createElement("span");
            terminal.appendChild(erroSpan);
            await typewrite(erroSpan, ">_ ERRO DE CONEXÃO. TENTE NOVAMENTE.");
            
            await new Promise(r => setTimeout(r, 2000));
            terminal.textContent = "";
            return await sign();

        }   

    }
}


async function login() {
    terminal.innerHTML += `          
        <p id="paragrafoEmail"><input class="terminal-input" id="email" type="text" name="grimoire_x7q" autocomplete="new-password" data-form-type="other" inputmode="email"/><span id="cursorEmail" class="cursor"></span></p>
        <p id="paragrafoPassword" style="display: none;"><input class="terminal-input" id="password" type="password" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorPsw" class="cursor"></span></p>`

    document.querySelectorAll('.terminal-input').forEach(input => {
        input.addEventListener('input', () => {
            input.style.width = (input.value.length) + 'ch';
        })
    })

    let inputEmail = document.getElementById("email")
    let inputPassword = document.getElementById("password")
    let paragrafoEmail = document.getElementById("paragrafoEmail")
    let paragrafoPassword = document.getElementById("paragrafoPassword")
    let preechendoEmail = true

    const labelEmail = document.createElement("span")
    const cursorEmail = document.createElement("span")
    cursorEmail.id = "cursorEmail"
    cursorEmail.className = "cursor"

    paragrafoEmail.textContent = ""
    paragrafoEmail.appendChild(labelEmail)
    paragrafoEmail.appendChild(inputEmail)
    paragrafoEmail.appendChild(cursorEmail)

    attachCursorTracking(inputEmail, cursorEmail)

    await typewrite(labelEmail, ">_ email: ")
    inputEmail.focus()

    inputEmail.addEventListener('blur', () => {
        if (preechendoEmail) inputEmail.focus()
    })

    const email = await esperarEmailValido(inputEmail)
    preechendoEmail = false

    if (!email) {
        terminal.innerHTML = ""
        return false
    }

    paragrafoEmail.style.display = "none"

    const labelPassword = document.createElement("span")
    const cursorPassword = document.createElement("span")
    cursorPassword.id = "cursorPsw"
    cursorPassword.className = "cursor"

    paragrafoPassword.textContent = ""
    paragrafoPassword.appendChild(labelPassword)
    paragrafoPassword.appendChild(inputPassword)
    paragrafoPassword.appendChild(cursorPassword)
    paragrafoPassword.style.display = "block"

    attachCursorTracking(inputPassword, cursorPassword)

    await typewrite(labelPassword, ">_ password: ")
    inputPassword.focus()

    let preechendoSenha = true
    inputPassword.addEventListener('blur', () => {
        if (preechendoSenha) inputPassword.focus()
    })

    const senha = await waitEnter(inputPassword)
    preechendoSenha = false

    if (senha.toLowerCase() === "/quit") {
        terminal.innerHTML = ""
        return false
    }

    if (senha.length < 8) {
        const errorMsg = document.createElement("p")
        errorMsg.classList.add("text-error")
        terminal.appendChild(errorMsg)
        await typewrite(errorMsg, "Password must be at least 8 characters.")
        setTimeout(() => errorMsg.remove(), 2000)
        terminal.innerHTML = ""
        return false
    }
    const loading = showLoading("Logging in");
    try {
        const resposta = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });
        loading.stop();

        const dados = await resposta.json();

        if (!resposta.ok) {
            const errorMsg = document.createElement("p");
            errorMsg.classList.add("text-error");
            terminal.appendChild(errorMsg);
            await typewrite(errorMsg, `>_ ERRO: ${dados.mensagem}`);
            await new Promise(r => setTimeout(r, 2000));
            terminal.innerHTML = "";
            return false;
        }

        sessionToken = dados.token;
        localStorage.setItem("grimoire_token", dados.token);
        return true;

    } catch {
        loading.stop();
        const erroSpan = document.createElement("span");
        terminal.appendChild(erroSpan);
        await typewrite(erroSpan, ">_ ERRO DE CONEXÃO. TENTE NOVAMENTE.");
        await new Promise(r => setTimeout(r, 2000));
        terminal.innerHTML = "";
        return false;
    }
}




const hour = document.getElementById("hour")

function getHour() {
    const now = new Date();
    return now.toTimeString().slice(0, 8)
}

function updateHour() {
    hour.textContent = getHour();
}

updateHour();
setInterval(updateHour, 1000)


async function checkSession() {
    const savedToken = localStorage.getItem("grimoire_token")

    if(!savedToken){
        await boot();
        if(await sign()){
            await grimoire()
        }
        return
    }

    try{

        const loading = showLoading("Checking Token");
        const response = await fetch("/api/verify", {
            headers: {"Authorization": `Bearer ${savedToken}`}
        })
        loading.stop()
        

        if(response.ok){
            sessionToken  = savedToken
            await grimoire()
        }else if(response.status === 401){
            localStorage.removeItem("grimoire_token")
            await boot();
            if(await sign()){
                await grimoire()
            }
        }else{
            // Erro de servidor (500, 429, etc) — token pode ser válido, não deletar
            await boot();
            if(await sign()){
                await grimoire()
            }
        }


    }catch(error){
        // Erro de rede — token pode ser válido, não deletar
        await boot();
        if(await sign()){
            await grimoire()
        }
    }



}





async function grimoire() {
    terminal.innerHTML = ""
    const msg = document.createElement("p")
    msg.classList.add("boot-p")
    terminal.appendChild(msg)
    await typewrite(msg, "Welcome back, traveler.")
    await system()
}








async function init() {
    await checkSession();
}

init();