const jwt = require("jsonwebtoken")
const supabase = require("../supabase")

async function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({mensagem: "TOKEN NÃO FORNECIDO"})
    }

    const token = authHeader.split(" ")[1]

    let decoded
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    }catch(error){
        return res.status(401).json({error: "Token Inválido"})
    }

    const { data: revogado } = await supabase
        .from("token_backlist")
        .select("token")
        .eq("token", token)
        .maybeSingle()

    if (revogado) {
        return res.status(401).json({ error: "Token revogado" })
    }

    req.userId = decoded.id
    req.userEmail = decoded.email
    next()
}


module.exports = authMiddleware;
