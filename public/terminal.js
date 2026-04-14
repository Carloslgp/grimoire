function attachCursorTracking(input, cursor) {
    function update() {
        const offset = input.value.length - input.selectionStart;
        cursor.style.transform = `translateX(-${offset}ch)`;
    }
    input.addEventListener('input', update);
    input.addEventListener('keyup', update);
    input.addEventListener('click', update);
    input.addEventListener('select', update);
    input.addEventListener('focus', update);
    update();
}

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

function showLoading(text) {
    const p = document.createElement("p");
    p.classList.add("boot-p");
    terminal.appendChild(p);

    let dots = 0;
    const interval = setInterval(() => {
        dots = (dots + 1) % 4;
        p.textContent = text + ".".repeat(dots);
    }, 400);

    return {
        stop() {
            clearInterval(interval);
            p.remove();
        }
    };
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
            input.style.width = (input.value.length) + 'ch';
        });

        attachCursorTracking(input, cursor);

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


async function criarInputTerminal(texto){
    terminal.innerHTML += `<p id="paragrafoConsole"><input class="terminal-input" id="inputConsole" type="text" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorTerminal" class="cursor"></span></p>`
    paragrafoConsole = document.getElementById("paragrafoConsole")
    inputConsole = document.getElementById("inputConsole")
    const cursorTerminal = document.getElementById("cursorTerminal")
    inputConsole.focus()
    console.log(inputConsole)

    inputConsole.addEventListener('input', () => {
        inputConsole.style.width = (inputConsole.value.length) + 'ch';
    })

    attachCursorTracking(inputConsole, cursorTerminal)

    inputConsole.addEventListener("blur", () => {
        inputConsole.focus()
    })

    const history = [];
    let historyIndex = -1;

    inputConsole.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const cmd = inputConsole.value.trim();
            if (cmd) {
                history.unshift(cmd);
                historyIndex = -1;
            }
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                inputConsole.value = history[historyIndex];
                inputConsole.style.width = inputConsole.value.length + "ch";
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                inputConsole.value = history[historyIndex];
            } else {
                historyIndex = -1;
                inputConsole.value = "";
            }
            inputConsole.style.width = inputConsole.value.length + "ch";
        }
    });

    const labelConsole = document.createElement("span")
    paragrafoConsole.insertBefore(labelConsole, inputConsole)
    await typewrite(labelConsole, ">")

    return inputConsole;

}

async function addHelpToTitle() {
    const l1 = document.createElement("h2")
    l1.classList = "text-important"
    l1.innerText = "You can use /help to see all the commands"
    document.getElementById("divTitle").appendChild(l1)

}

async function typeHelp() {
    const help = [
        "Available commands:",
        " ",
        "  grimoire list                                    — list everything",
        "  grimoire list --category <category>              — filter by category",
        "  grimoire list --tag <tag>                        — filter by tag",
        "  grimoire list --category <category> --tag <tag>  — filter by both",
        "  grimoire add <category> \"<name>\" [<tag>]         — add an entry",
        "  grimoire remove <category> \"<name>\"              — remove an entry",
        "  grimoire categories                              — list all categories",
        " ",
        "  help                                             — show this menu",
        "  cls                                              — clear the terminal",
        "  logout                                           — exit your grimoire",
    ]

    for (const line of help) {
        const p = document.createElement("p")
        p.classList = "boot-p"
        terminal.appendChild(p)
        await typewrite(p, line)
    }

    return
}




