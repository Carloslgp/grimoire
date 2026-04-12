const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('./supabase');
const jwt = require("jsonwebtoken");

const app = express()
app.use(express.json())

app.use(express.static("public"))


app.post('/api/register', async (req, res) => {
    const {email, senha, senhaConfirm} = req.body

    if (!email || !senha || !senhaConfirm) {
        return res.status(400).json({ mensagem: "PREENCHA TODOS OS CAMPOS." });
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ mensagem: "EMAIL INVÁLIDO." });
    }

    if (senha !== senhaConfirm) {
        return res.status(400).json({ mensagem: "AS SENHAS NÃO COINCIDEM." });
    }

    if (senha.length < 8) {
        return res.status(400).json({ mensagem: "SENHA DEVE TER NO MÍNIMO 8 CARACTERES." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const { data, error } = await supabase
        .from('users')
        .insert({ email: email, senha_hash: senhaHash })
        .select();

    if (error) {
        // Código 23505 = violação de UNIQUE (email já existe)
        if (error.code === '23505') {
        return res.status(409).json({ mensagem: "EMAIL JÁ CADASTRADO." });
        }
        console.error(error);
        return res.status(500).json({ mensagem: "ERRO INTERNO DO SERVIDOR." });
    }

    res.status(201).json({ mensagem: "USUÁRIO REGISTRADO.", userId: data[0].id });

})

app.post("/api/login", async(req, res) =>{
    const {email, senha} = req.body

    if (!email || !senha) {
        return res.status(400).json({ mensagem: "PREENCHA TODOS OS CAMPOS." });
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ mensagem: "EMAIL INVÁLIDO." });
    }

    if(senha.length < 8){
        return res.status(400).json({mensagem: "SENHA DEVE TER NO MÍNIMO 8 CARACTERES."})
    }


    const {data, error} = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if(error || !data){
        return res.status(401).json({mensagem: "USUÁRIO NÃO ENCONTRADO"})
    }

    const senhaValida = await bcrypt.compare(senha, data.senha_hash)

    if(!senhaValida){
        return res.status(401).json({error: "SENHA OU EMAIL INCORRETOS"})
    }

    const token = jwt.sign(
        {id: data.id, email: data.email},
        process.env.JWT_SECRET,
        {expiresIn: "2h"}
    )

    res.json({token})


})

function autenticar(req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json({mensagem : "TOKEN NÃO FORNECIDO"})
    }

    const token = authHeader.split(" ")[1]

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = decoded
        next();
    }catch(error){
        return res.status(401).json({error: "Token Inválido"})
    }



}






app.listen(3000, () => console.log('http://localhost:3000'))




