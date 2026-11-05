import jsonwebtoken from "jsonwebtoken";

const generateToken = (payload) => {
 try {
     return jsonwebtoken.sign(payload, process.env.JWT_SEED, { expiresIn: "10h" });
 } catch (error) {
    console.log(error)
    return null
 }
};

const verifyToken = (token)=>{
    try {

        const payload = jsonwebtoken.verify(token, process.env.JWT_SEED)

        return payload

        
    } catch (error) {
        console.log(error)
        return null
        
    }
}
export { generateToken, verifyToken };
