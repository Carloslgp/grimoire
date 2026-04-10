
let terminal = document.getElementById("console")
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

        input.addEventListener("blur", (e)=> {
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


async function login(){


    const l1 = document.createElement("p")
    terminal.appendChild(l1)
    await typewrite(l1, ">_ [1] enter grimoire")

        

    const l2 = document.createElement("p")
    terminal.appendChild(l2)
    await typewrite(l2, ">_ [2] create grimoire")

    const resposta = await waitInput(['1', '2']);

    if(resposta == 1){
        terminal.innerHTML += `          
            <p id="paragrafoEmail"><input class="terminal-input" id="email" type="text" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorEmail" class="cursor"></span></p>
            <p id="paragrafoPassword" style="display: none;"><input class="terminal-input" id="password" type="password" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorPsw" class="cursor"></span></p>  `

        


        document.querySelectorAll('.terminal-input').forEach(input => {
            input.addEventListener('input', () => {
                input.style.width = Math.max(0, input.value.length * 12) + 'px'
            })
        })

        let inputEmail = document.getElementById("email")
        let inputPassword = document.getElementById("password")
        let paragrafoEmail = document.getElementById("paragrafoEmail")
        let paragrafoPassword = document.getElementById("paragrafoPassword")
        let preechendoEmail = true

        const labelEmail = document.createElement("span")
        paragrafoEmail.insertBefore(labelEmail, inputEmail)
        await typewrite(labelEmail, ">_ email: ")
        inputEmail.focus()



        inputEmail.addEventListener('blur', (e) => {
            if(preechendoEmail){
                inputEmail.focus()
            }

        })


        inputEmail.addEventListener('keydown', async (e) => {
            if(e.key == "Enter"){ 
                    preechendoEmail = false
                    paragrafoEmail.style.display = "none"

                    document.getElementById("cursorEmail").style.display = "none"
                    inputEmail.blur()

                    paragrafoPassword.style.display = "block"
                    const labelPassword = document.createElement("span")
                    paragrafoPassword.insertBefore(labelPassword, inputPassword)
                    await typewrite(labelPassword, ">_ password: ")

                    document.getElementById("cursorPsw").style.display = "inline-block"
                    inputPassword.focus()
            }
        })

        let preechendoSenha = true
        inputPassword.addEventListener('blur', () => {
            if(preechendoSenha){
                inputPassword.focus()
            }

        })

        inputPassword.addEventListener('keydown', (e) => {
            if(e.key == "Enter"){ 
                console.log(inputPassword.value)
                console.log(inputEmail.value)
            }
        })
    }else if(resposta == 2){
        terminal.innerHTML += `          
            <p id="paragrafoEmail"><input class="terminal-input" id="3mail" type="text" name="grimoire_x7q" autocomplete="new-password" data-form-type="other"/><span id="cursorEmail" class="cursor"></span></p>
            <p id="paragrafoPassword" style="display: none;"><input class="terminal-input" id="password" type="password" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorPsw" class="cursor"></span></p>  
            <p id="paragrafoPasswordConfirm" style="display: none;"><input class="terminal-input" id="passwordConfirm" type="password" name="grimoire_x7q" autocomplete="off" data-form-type="other"/><span id="cursorPswconfirm" class="cursor"></span></p>
            `

        document.querySelectorAll('.terminal-input').forEach(input => {
            input.addEventListener('input', () => {
                input.style.width = Math.max(0, input.value.length * 12) + 'px'
            })
        })

        
        let inputEmail = document.getElementById("3mail")
        let paragrafoEmail = document.getElementById("paragrafoEmail")
        let preechendoEmail = true

        const labelEmail = document.createElement("span")
        paragrafoEmail.insertBefore(labelEmail, inputEmail)
        await typewrite(labelEmail, ">_ email: ")
        inputEmail.focus()

        inputEmail.addEventListener("blur", (e) =>{
            if(preechendoEmail){
                inputEmail.focus()
            }
        })

        inputEmail.addEventListener("keydown", async (e) => {
            if(e.key == "Enter"){
                let senhasIguais
                
                do{
                    senhasIguais = await receberSenhas();
                }while(!senhasIguais)
                console.log("sai do loop")
            }
        })



        







    }





}




async function receberSenhas(){

    let inputPassword = document.getElementById("password")
    let inputPasswordConfirm = document.getElementById("passwordConfirm")
    let paragrafoEmail = document.getElementById("paragrafoEmail")
    let paragrafoPassword = document.getElementById("paragrafoPassword")
    let paragrafoPasswordConfirm = document.getElementById("paragrafoPasswordConfirm")
    let preechendoEmail = true
    let preechendosenha = false
    let preechendoSenhaConfirm = false

    let senhasIguais = false;
    paragrafoEmail.style.display = "none"
    preechendoEmail = false
    preechendosenha = true
    


    paragrafoPassword.style.display = "block"
    const labelPassword = document.createElement("span")
    paragrafoPassword.insertBefore(labelPassword, inputPassword)
    inputPassword.focus()
    await typewrite(labelPassword, ">_password: ")



    inputPassword.addEventListener("blur", (e) =>{
        if(preechendosenha){
            inputPassword.focus()
        }
    })


    const senha = await new Promise(resolve => {
        inputPassword.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                resolve(inputPassword.value)
            }
        })
    })

    paragrafoPassword.style.display = "none"
    preechendosenha = false
    preechendoSenhaConfirm = true

    paragrafoPasswordConfirm.style.display = "block"
    const labelPasswordConfirm = document.createElement("span")
    paragrafoPasswordConfirm.insertBefore(labelPasswordConfirm, inputPasswordConfirm)
    inputPasswordConfirm.focus()
    await typewrite(labelPasswordConfirm, "Confirm your password: ")

    inputPasswordConfirm.addEventListener("blur", (e) =>{
        if(preechendoSenhaConfirm){
            inputPasswordConfirm.focus()
        }
    })

    const confirmacao = await new Promise(resolve => {
        inputPasswordConfirm.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                resolve(inputPasswordConfirm.value)
            }
        })
    })

    console.log(inputPassword.value)
    console.log(inputPasswordConfirm.value)
    if (senha === confirmacao) {
        return true
    } else {
        // senhas diferentes — pode chamar de novo ou mostrar erro
        return false
    }
        




  
}





const hour = document.getElementById("hour")

function getHour(){
    const now = new Date();
    return now.toTimeString().slice(0,8)
}

function updateHour(){
    hour.textContent = getHour();
}





updateHour();
setInterval(updateHour, 1000)

async function init() {
    await boot();
    await login();
}

init();


