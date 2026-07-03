const service =
require("../services/systemMenuItemService");

exports.search =
async(req,res)=>{

res.json(

await service.search(

req.query.q||""

)

);

};