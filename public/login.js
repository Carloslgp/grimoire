

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
    let console = document.getElementById("console")
    const l1 = document.createElement("p")
    l1.classList = "boot-p"
    console.appendChild(l1)
    await typewrite(l1, "Initializing your Grimore ...")

    const l2 = document.createElement("p")
    l2.classList = "boot-p"
    console.appendChild(l2)
    await typewrite(l2, "Getting the rinnegan ...")

    const l3 = document.createElement("p")
    l3.classList = "boot-p"
    console.appendChild(l3)
    await typewrite(l3, "Loading Mjölnir ...")

        
    const l4 = document.createElement("p")
    l4.classList.add("boot-success", "text-success")
    console.appendChild(l4)
    await typewrite(l4, "MAY THE FORCE BE WITH YOU")
    

}


function login(){

    

    let inputEmail = document.getElementById("email")
    let inputPassword = document.getElementById("password")
    let paragrafoEmail = document.getElementById("paragrafoEmail")
    let paragrafoPassword = document.getElementById("paragrafoPassword")
    let preechendoEmail = true

    inputEmail.focus()

    inputEmail.addEventListener('blur', () => {
        if(preechendoEmail){
            inputEmail.focus()
        }

    })


    inputEmail.addEventListener('keydown', (e) => {
        if(e.key == "Enter"){ 
            preechendoEmail = false  
            document.getElementById("cursorPsw").style.display = "inline-block"
            paragrafoPassword.style.display = "block"
            inputPassword.focus()
            inputEmail.blur()
            document.getElementById("cursorEmail").style.display = "none"
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



}


document.querySelectorAll('.terminal-input').forEach(input => {
    input.addEventListener('input', (e) => {
        input.style.width = Math.max(0, input.value.length * 12) + 'px'

    })
})

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

boot();

login()



