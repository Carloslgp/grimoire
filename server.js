const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('./supabase');
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("./middlewares/authMiddleware")

const app = express()
app.use(helmet())
app.use(express.json())

app.use(express.static("public"))

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { mensagem: "MUITAS TENTATIVAS. TENTE NOVAMENTE EM 15 MINUTOS." },
    standardHeaders: true,
    legacyHeaders: false,
})

const DUMMY_HASH = bcrypt.hashSync("dummy_password_for_timing_attack_mitigation", 10)

app.post('/api/newRegistry', authMiddleware, async (req, res) => {
    const { category, name, tag } = req.body
    const user_id = req.userId

    if (!category || !name || !tag) {
        return res.status(400).json({ mensagem: "PREENCHA TODOS OS CAMPOS" })
    }

    const { data, error } = await supabase
        .from('registries')
        .insert({ user_id, category, name, tag })
        .select();

    if (error) {
        console.error("Supabase insert error:", error)
        return res.status(500).json({ mensagem: "ERRO INTERNO DO SERVIDOR" })
    }

    return res.status(201).json({ mensagem: "REGISTRO CONCLUIDO.", registry: data[0] })
})

app.delete('/api/removeRegistry', authMiddleware, async (req, res) => {
    const { category, name, tag } = req.body
    const user_id = req.userId

    if (!category || !name || !tag) {
        return res.status(400).json({ mensagem: "PREENCHA TODOS OS CAMPOS" })
    }

    const { data, error } = await supabase
        .from("registries")
        .delete()
        .eq("user_id", user_id)
        .eq("category", category)
        .eq("name", name)
        .eq("tag", tag)
        .select();

    if (error) {
        console.error("Supabase delete error:", error)
        return res.status(500).json({ mensagem: "ERRO INTERNO NO SERVIDOR" })
    }

    if (data.length === 0) {
        return res.status(404).json({ mensagem: "REGISTRO NÃO ENCONTRADO" })
    }

    const mensagem = data.length === 1
        ? "REGISTRO DELETADO"
        : `${data.length} REGISTROS DELETADOS`;

    return res.status(200).json({ mensagem, deleted: data.length })
})


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

app.post("/api/login", loginLimiter, async(req, res) =>{
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

    const hashParaComparar = data ? data.senha_hash : DUMMY_HASH
    const senhaValida = await bcrypt.compare(senha, hashParaComparar)

    if(error || !data || !senhaValida){
        return res.status(401).json({mensagem: "SENHA OU EMAIL INCORRETOS"})
    }

    const token = jwt.sign(
        {id: data.id, email: data.email},
        process.env.JWT_SECRET,
        {expiresIn: "1h"}
    )

    res.json({token})

})


app.post('/api/logout', authMiddleware, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  await supabase.from('token_backlist').insert({ token });

  res.json({ message: 'logged out' });
});




app.get("/api/verify", authMiddleware, (req, res) => {
    res.json({ mensagem: "TOKEN VÁLIDO.", userId: req.userId, email: req.userEmail });
});





app.listen(3000, () => console.log('http://localhost:3000'))




