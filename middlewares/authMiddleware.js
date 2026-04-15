const jwt = require("jsonwebtoken")
const supabase = require("../supabase")

async function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({mensagem : "TOKEN NÃO FORNECIDO"})
    }

    const token = authHeader.split(" ")[1]


    const { data: revogado } = await supabase
        .from("token_blacklist")
        .select("token")
        .eq("token", token)
        .single();

    if (revogado) {
        return res.status(401).json({ error: "Token revogado" });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const{data: usuario, error} = await supabase
            .from("users")
            .select("id")
            .eq("id", decoded.id)
            .single()
            
        if(error || !usuario){
            return res.status(401).json({error: "Usuário não encontrado"})
        }

        req.userId = decoded.id
        req.userEmail = decoded.email
        next();
    }catch(error){
        return res.status(401).json({error: "Token Inválido"})
    }
}


module.exports = authMiddleware;


