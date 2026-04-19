const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('./supabase');
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("./middlewares/authMiddleware")

const app = express()
app.set('trust proxy', 1)
app.use(helmet())
app.use(express.json())

app.use(express.static("public"))

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { mensagem: "TOO MANY ATTEMPTS. TRY AGAIN IN 15 MINUTES." },
    standardHeaders: true,
    legacyHeaders: false,
})

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { mensagem: "TOO MANY REGISTRATION ATTEMPTS. TRY AGAIN IN 1 HOUR." },
    standardHeaders: true,
    legacyHeaders: false,
})

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { mensagem: "TOO MANY REQUESTS. WAIT A MOMENT." },
    standardHeaders: true,
    legacyHeaders: false,
})

const DUMMY_HASH = bcrypt.hashSync("dummy_password_for_timing_attack_mitigation", 10)

const LIMITES = { category: 50, name: 100, tag: 50, email: 254, senha: 72 }

function validarCampos(category, name, tag) {
    if (typeof category !== "string" || typeof name !== "string" || typeof tag !== "string") {
        return "FIELDS MUST BE TEXT"
    }
    if (category.length > LIMITES.category) return `CATEGORY EXCEEDS ${LIMITES.category} CHARACTERS`
    if (name.length > LIMITES.name) return `NAME EXCEEDS ${LIMITES.name} CHARACTERS`
    if (tag.length > LIMITES.tag) return `TAG EXCEEDS ${LIMITES.tag} CHARACTERS`
    return null
}

app.post('/api/newRegistry', apiLimiter, authMiddleware, async (req, res) => {
    const { category, name, tag } = req.body
    const user_id = req.userId

    if (!category || !name || !tag) {
        return res.status(400).json({ mensagem: "FILL OUT ALL FIELDS" })
    }

    const erroValidacao = validarCampos(category, name, tag)
    if (erroValidacao) {
        return res.status(400).json({ mensagem: erroValidacao })
    }

    const { data, error } = await supabase
        .from('registries')
        .insert({ user_id, category, name, tag })
        .select();

    if (error) {
        console.error("Supabase insert error:", error)
        return res.status(500).json({ mensagem: "INTERNAL SERVER ERROR" })
    }

    return res.status(201).json({ mensagem: "REGISTRY COMPLETED.", registry: data[0] })
})

app.get('/api/listAll', apiLimiter, authMiddleware, async(req, res) => {
    const user_id = req.userId

    const {data, error} = await supabase
    .from("registries")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", {ascending: false})


    if(error){
        return res.status(500).json({ mensagem: "INTERNAL SERVER ERROR" })
    }

    if(data.length === 0){
        return res.status(200).json({ mensagem: "LOOKS LIKE YOU HAVE NO REGISTRIES :(", registries: [] })
    }

    return res.status(200).json({
        mensagem: `${data.length} REGISTR${data.length > 1 ? "IES" : "Y"} FOUND`,
        registries: data
    })


})

app.get("/api/listByCategoryTag", apiLimiter, authMiddleware, async(req, res) =>{
    const category = req.query.category
    const tag = req.query.tag
    const user_id = req.userId

    if (!category || !tag) {
        return res.status(400).json({ mensagem: "FILL OUT ALL FIELDS" })
    }

    const {data, error} = await supabase
    .from("registries")
    .select("*")
    .eq("user_id", user_id)
    .eq("category", category)
    .eq("tag", tag)
    .order("created_at", {ascending: false})

    if(error){
        return res.status(500).json({ mensagem: "INTERNAL SERVER ERROR" })
    }

    if(data.length === 0){
        return res.status(200).json({ mensagem: `LOOKS LIKE YOU HAVE NO REGISTRIES WITH ${category} AND ${tag} :(`, registries: [] })
    }

    return res.status(200).json({
        mensagem: `${data.length} REGISTR${data.length > 1 ? "IES" : "Y"} FOUND`,
        registries: data
    })

})

app.get("/api/listByCategory", apiLimiter, authMiddleware, async(req, res) =>{
    const category = req.query.category
    const user_id = req.userId

    if (!category) {
        return res.status(400).json({ mensagem: "FILL OUT ALL FIELDS" })
    }

    const {data, error} = await supabase
    .from("registries")
    .select("*")
    .eq("user_id", user_id)
    .eq("category", category)
    .order("created_at", {ascending: false})

    if(error){
        return res.status(500).json({ mensagem: "INTERNAL SERVER ERROR" })
    }

    if(data.length === 0){
        return res.status(200).json({ mensagem: `LOOKS LIKE YOU HAVE NO REGISTRIES WITH ${category} :(`, registries: [] })
    }

    return res.status(200).json({
        mensagem: `${data.length} REGISTR${data.length > 1 ? "IES" : "Y"} FOUND`,
        registries: data
    })

})


app.get("/api/listByTag", apiLimiter, authMiddleware, async(req, res) =>{
    const tag = req.query.tag
    const user_id = req.userId

    if (!tag) {
        return res.status(400).json({ mensagem: "FILL OUT ALL FIELDS" })
    }

    const {data, error} = await supabase
    .from("registries")
    .select("*")
    .eq("user_id", user_id)
    .eq("tag", tag)
    .order("created_at", {ascending: false})

    if(error){
        return res.status(500).json({ mensagem: "INTERNAL SERVER ERROR" })
    }

    if(data.length === 0){
        return res.status(200).json({ mensagem: `LOOKS LIKE YOU HAVE NO REGISTRIES WITH ${tag} :(`, registries: [] })
    }

    return res.status(200).json({
        mensagem: `${data.length} REGISTR${data.length > 1 ? "IES" : "Y"} FOUND`,
        registries: data
    })

})

app.get('/api/listCategories', apiLimiter, authMiddleware, async(req, res) => {
    const user_id = req.userId

    const {data, error} = await supabase
    .from("registries")
    .select("category")
    .eq("user_id", user_id)
    .order("created_at", {ascending: false})

    

    if(error){
        return res.status(500).json({ mensagem: "INTERNAL SERVER ERROR" })
    }

    const categorias = [...new Set(data.map(r => r.category))]

    if(data.length === 0){
        return res.status(200).json({ mensagem: "NO CATEGORIES FOUND", registries: [] })
    }

    return res.status(200).json({
        mensagem: `${categorias.length} CATEGOR${categorias.length > 1 ? "IES" : "Y"} FOUND`,
        registries: categorias.map(c => ({ category: c }))
    })

})


app.delete('/api/removeRegistry', apiLimiter, authMiddleware, async (req, res) => {
    const { category, name, tag } = req.body
    const user_id = req.userId

    if (!category || !name || !tag) {
        return res.status(400).json({ mensagem: "FILL OUT ALL FIELDS" })
    }

    const erroValidacao = validarCampos(category, name, tag)
    if (erroValidacao) {
        return res.status(400).json({ mensagem: erroValidacao })
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
        return res.status(500).json({ mensagem: "INTERNAL SERVER ERROR" })
    }

    if (data.length === 0) {
        return res.status(404).json({ mensagem: "REGISTRY NOT FOUND" })
    }

    const mensagem = data.length === 1
        ? "REGISTRY DELETED"
        : `${data.length} REGISTRIES DELETED`;

    return res.status(200).json({ mensagem, deleted: data.length })
})


app.post('/api/register', registerLimiter, async (req, res) => {
    const {email, senha, senhaConfirm} = req.body

    if (!email || !senha || !senhaConfirm) {
        return res.status(400).json({ mensagem: "FILL OUT ALL FIELDS." });
    }

    if (typeof email !== "string" || typeof senha !== "string" || typeof senhaConfirm !== "string") {
        return res.status(400).json({ mensagem: "FIELDS MUST BE TEXT." });
    }

    if (email.length > LIMITES.email) {
        return res.status(400).json({ mensagem: `EMAIL EXCEEDS ${LIMITES.email} CHARACTERS.` });
    }

    if (senha.length > LIMITES.senha) {
        return res.status(400).json({ mensagem: `PASSWORD EXCEEDS ${LIMITES.senha} CHARACTERS.` });
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ mensagem: "INVALID EMAIL." });
    }

    if (senha !== senhaConfirm) {
        return res.status(400).json({ mensagem: "PASSWORDS DO NOT MATCH." });
    }

    if (senha.length < 8) {
        return res.status(400).json({ mensagem: "PASSWORD MUST BE AT LEAST 8 CHARACTERS." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const { error } = await supabase
        .from('users')
        .insert({ email: email, senha_hash: senhaHash })
        .select();

    // Swallow UNIQUE violation (code 23505) to prevent user enumeration —
    // a duplicate email returns the same response as a fresh registration.
    if (error && error.code !== '23505') {
        console.error(error);
        return res.status(500).json({ mensagem: "INTERNAL SERVER ERROR." });
    }

    res.status(201).json({ mensagem: "USER REGISTERED." });

})

app.post("/api/login", loginLimiter, async(req, res) =>{
    const {email, senha} = req.body

    if (!email || !senha) {
        return res.status(400).json({ mensagem: "FILL OUT ALL FIELDS." });
    }

    if (typeof email !== "string" || typeof senha !== "string") {
        return res.status(400).json({ mensagem: "FIELDS MUST BE TEXT." });
    }

    if (email.length > LIMITES.email || senha.length > LIMITES.senha) {
        return res.status(401).json({ mensagem: "INCORRECT EMAIL OR PASSWORD" })
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ mensagem: "INVALID EMAIL." });
    }

    if(senha.length < 8){
        return res.status(400).json({mensagem: "PASSWORD MUST BE AT LEAST 8 CHARACTERS."})
    }


    const {data, error} = await supabase
        .from("users")
        .select("id, email, senha_hash")
        .eq("email", email)
        .single();

    const hashParaComparar = data ? data.senha_hash : DUMMY_HASH
    const senhaValida = await bcrypt.compare(senha, hashParaComparar)

    if(error || !data || !senhaValida){
        return res.status(401).json({mensagem: "INCORRECT EMAIL OR PASSWORD"})
    }

    const token = jwt.sign(
        {id: data.id, email: data.email},
        process.env.JWT_SECRET,
        {expiresIn: "1h"}
    )

    res.json({token})

})


app.post('/api/logout', apiLimiter, authMiddleware, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  await supabase.from('token_backlist').insert({ token });

  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  await supabase.from('token_backlist').delete().lt('invalidated_at', umaHoraAtras);

  res.json({ message: 'logged out' });
});




app.get("/api/verify", apiLimiter, authMiddleware, (req, res) => {
    res.json({ mensagem: "TOKEN VALID.", userId: req.userId, email: req.userEmail });
});





const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => console.log(`http://localhost:${PORT}`))




