const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('./supabase');

const app = express()
app.use(express.json())

app.use(express.static("public"))

app.post('/api/login', async (req, res) => {
    const {email, senha, senhaConfirm} = req.body

    if (!email || !senha || !senhaConfirm) {
        return res.status(400).json({ mensagem: "PREENCHA TODOS OS CAMPOS." });
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






app.listen(3000, () => console.log('http://localhost:3000'))




