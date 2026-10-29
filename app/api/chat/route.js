export async function POST(req){
  try{
    return Response.json({reply: "TEST: I am running compound-beta version 3"})
  }catch(err){
    return Response.json({reply: "Eva crash: " + err.message})
  }
}
