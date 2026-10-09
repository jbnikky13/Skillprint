export default function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 const url=process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return res.status(503).json({error:"Supabase authentication is not configured."});
 res.setHeader("Cache-Control","no-store");
 return res.status(200).json({supabaseUrl:url,supabasePublishableKey:key});
}
