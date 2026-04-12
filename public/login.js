let terminal = document.getElementById("console")

let users = []
let sessionToken = null;


function typewrite(element, text, speed = 28) {
    return new Promise(resolve => {
        let i = 0;
        function next() {
            if (i < text.length) {
                element.textContent += text[i++];
                setTimeout(next, speed + (Math.random() * 12 - 6));
            } else {
                resolve();
            }
        }
        next();
    });
}

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

function waitInput(validValues = null) {
    return new Promise(resolve => {
        const p = document.createElement("p");
        terminal.appendChild(p);

        const span = document.createElement("span");
        span.textContent = ">_ ";
        p.appendChild(span);

        const input = document.createElement("input");
        input.classList.add("terminal-input");
        input.style.width = "0px";
        p.appendChild(input);

        const cursor = document.createElement("span");
        cursor.classList.add("cursor");
        p.appendChild(cursor);

        input.focus();

        input.addEventListener('input', () => {
            input.style.width = Math.max(0, input.value.length * 12) + 'px';
        });

        input.addEventListener("blur", (e) => {
            input.focus()
        })

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = input.value.trim();
                if (!validValues || validValues.includes(val)) {
                    cursor.style.display = 'none';

                    const typed = document.createElement("span");
                    typed.textContent = val;
                    p.replaceChild(typed, input);

                    resolve(val);
                } else {
                    input.value = '';
                    input.style.width = '0px';
                }
            }
        });
    });
}


function waitEnter(input) {
    return new Promise(resolve => {
        function handler(e) {
            if (e.key === "Enter") {
                input.removeEventListener("keydown", handler)
                resolve(input.value.trim())
            }
        }
        input.addEventListener("keydown", handler)
    })
}

async function receberRespostas() {
    const l1 = document.createElement("p")
    terminal.appendChild(l1)
    await typewrite(l1, ">_ [1] enter grimoire")

    const l2 = document.createElement("p")
    terminal.appendChild(l2)
    await typewrite(l2, ">_ [2] create grimoire")

    return await waitInput(['1', '2']);
}

async function esperarEmailValido(inputEmail) {
    const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    while (true) {
        const valor = await waitEnter(inputEmail)

        if (valor.toLowerCase() === "/quit") return null
        if (pattern.test(valor)) return valor

        const erroAnterior = document.querySelector(".text-error")
        if (erroAnterior) erroAnterior.remove()

        const errorMsg = document.createElement("p")
        errorMsg.classList.add("text-error")
        inputEmail.parentNode.parentNode.insertBefore(errorMsg, inputEmail.parentNode.nextSibling)
        inputEmail.value = ""
        inputEmail.style.width = "0px"
        inputEmail.focus()
        await typewrite(errorMsg, "Grimoire doesn't think this email is valid.")
        setTimeout(() => errorMsg.remove(), 2000)
    }
}

async function sign() {

    let resposta = await receberRespostas();

    if (resposta == 1) {
        const logged = await login();

        if (!logged) {
            terminal.innerHTML = ""
            await sign()
        } else {
            console.log("logou!")
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
                input.style.width = Math.max(0, input.value.length * 11) + 'px'
            })
        })

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

        console.log("sai do loop")
        user.unshift(emailValido)
        try{
            const resposta = await fetch("http://localhost:3000/api/register", {
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
            const dados = await resposta.json()
            
            if(!resposta.ok){
                const erroSpan = document.createElement("span")
                terminal.appendChild(erroSpan)
                await typewrite(erroSpan, `>_ERRO ${dados.mensagem}`)

                await new Promise(r => setTimeout(r, 2000));

                terminal.textContent = "";
                return await sign();
            }

            console.log("Registrado!", dados);
            terminal.textContent = "";
            return await sign();

        }catch{
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
        <p id="paragrafoEmail"><input class="terminal-input" id="email" type="text" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorEmail" class="cursor"></span></p>
        <p id="paragrafoPassword" style="display: none;"><input class="terminal-input" id="password" type="password" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorPsw" class="cursor"></span></p>`

    document.querySelectorAll('.terminal-input').forEach(input => {
        input.addEventListener('input', () => {
            input.style.width = Math.max(0, input.value.length * 11) + 'px'
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

    try {
        const resposta = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

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
        console.log("logou!");
        return true;

    } catch {
        const erroSpan = document.createElement("span");
        terminal.appendChild(erroSpan);
        await typewrite(erroSpan, ">_ ERRO DE CONEXÃO. TENTE NOVAMENTE.");
        await new Promise(r => setTimeout(r, 2000));
        terminal.innerHTML = "";
        return false;
    }
}


async function receberSenhas() {

    let inputPassword = document.getElementById("password")
    let inputPasswordConfirm = document.getElementById("passwordConfirm")
    let paragrafoEmail = document.getElementById("paragrafoEmail")
    let paragrafoPassword = document.getElementById("paragrafoPassword")
    let paragrafoPasswordConfirm = document.getElementById("paragrafoPasswordConfirm")
    let preechendosenha = false
    let preechendoSenhaConfirm = false

    inputPassword.value = ""
    inputPasswordConfirm.value = ""

    paragrafoEmail.style.display = "none"
    preechendosenha = true

    paragrafoPassword.style.display = "block"
    const labelPassword = document.createElement("span")
    paragrafoPassword.insertBefore(labelPassword, inputPassword)
    inputPassword.focus()
    await typewrite(labelPassword, ">_password: ")

    inputPassword.addEventListener("blur", (e) => {
        if (preechendosenha) inputPassword.focus()
    })

    const senha = await waitEnter(inputPassword)
    preechendosenha = false

    if (senha.toLowerCase() === "/quit") return null

    if (senha.length < 8) {
        const errorMsg = document.createElement("p")
        errorMsg.classList.add("text-error")
        terminal.appendChild(errorMsg)
        await typewrite(errorMsg, "Password must be at least 8 characters.")
        setTimeout(() => errorMsg.remove(), 2000)
        return []
    }

    paragrafoPassword.style.display = "none"
    preechendoSenhaConfirm = true

    paragrafoPasswordConfirm.style.display = "block"
    const labelPasswordConfirm = document.createElement("span")
    paragrafoPasswordConfirm.insertBefore(labelPasswordConfirm, inputPasswordConfirm)
    inputPasswordConfirm.focus()
    await typewrite(labelPasswordConfirm, "Confirm your password: ")

    inputPasswordConfirm.addEventListener("blur", (e) => {
        if (preechendoSenhaConfirm) inputPasswordConfirm.focus()
    })

    const confirmacao = await waitEnter(inputPasswordConfirm)
    preechendoSenhaConfirm = false

    if (confirmacao.toLowerCase() === "/quit") return null

    if (senha === confirmacao) {
        return [senha, confirmacao]
    } else {
        const errorMsg = document.createElement("p")
        errorMsg.classList.add("text-error")
        terminal.appendChild(errorMsg)
        await typewrite(errorMsg, "Passwords don't match. Try again.")
        setTimeout(() => errorMsg.remove(), 2000)

        return []
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

async function init() {
    await boot();
    await sign();
}

init();